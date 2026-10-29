// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { normalizedTarballDigest, verifyJsrManifest } from '../release-artifacts.mjs';
import { createHash } from 'node:crypto';

test('JSR recovery rejects changed content and unsafe paths', t => {
  const dir = mkdtempSync(join(tmpdir(), 'hygiene-jsr-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'index.ts'), 'export const value = 1;');
  const checksum = `sha256-${createHash('sha256').update('export const value = 1;').digest('hex')}`;
  verifyJsrManifest({ '/index.ts': { checksum } }, dir);
  assert.throws(
    () => verifyJsrManifest({ '/index.ts': { checksum: 'different' } }, dir),
    /differs/,
  );
  assert.throws(
    () => verifyJsrManifest({ '/../outside': { checksum } }, dir),
    /Invalid JSR file path/,
  );
  assert.throws(() => verifyJsrManifest({}, dir), /Empty JSR manifest/);
});

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'hygiene-release-check-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'scripts'));
  copyFileSync(
    resolve(import.meta.dirname, '../release-artifacts.mjs'),
    join(dir, 'scripts/release-artifacts.mjs'),
  );
  const json = (file, data) => writeFileSync(join(dir, file), JSON.stringify(data));
  json('package.json', { version: '0.5.0' });
  for (const name of ['core', 'cli']) {
    mkdirSync(join(dir, 'packages', name), { recursive: true });
    json(`packages/${name}/package.json`, { name, version: '0.5.0', dependencies: {} });
    json(`packages/${name}/jsr.json`, { name, version: '0.5.0', imports: {} });
  }
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: dir,
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_AUTHOR_NAME: 'Test',
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_COMMITTER_NAME: 'Test',
        GIT_COMMITTER_EMAIL: 'test@example.com',
      },
    });
  git('init', '--quiet');
  git('commit', '--allow-empty', '-m', 'chore: initial');
  const check = (tag = 'v0.5.0') =>
    spawnSync(process.execPath, ['scripts/release-artifacts.mjs', 'check'], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, RELEASE_TAG: tag },
    });
  return { json, git, check };
}

test('accepts matching versions and a new release tag', t => {
  const { check } = fixture(t);
  const result = check();
  assert.equal(result.status, 0, result.stderr);
});
test('accepts an existing tag only at the checked-out commit', t => {
  const { git, check } = fixture(t);
  git('tag', 'v0.5.0');
  assert.equal(check().status, 0);
  git('commit', '--allow-empty', '-m', 'fix: next commit');
  const result = check();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Existing tag points at another commit/);
});
test('rejects a tag that does not match the package version', t => {
  const { check } = fixture(t);
  const result = check('v0.6.0');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Tag must match manifests/);
});
test('rejects JSR version drift', t => {
  const { json, check } = fixture(t);
  json('packages/core/jsr.json', { version: '0.4.12', imports: {} });
  const result = check();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JSR and npm versions must agree/);
});
test('rejects JSR dependency drift', t => {
  const { json, check } = fixture(t);
  json('packages/core/package.json', { version: '0.5.0', dependencies: { example: '^2.0.0' } });
  json('packages/core/jsr.json', { version: '0.5.0', imports: { example: 'npm:example@^1.0.0' } });
  const result = check();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JSR dependency mismatch/);
});

test('compares tarball contents instead of unstable gzip metadata', t => {
  const dir = mkdtempSync(join(tmpdir(), 'hygiene-tarball-digest-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'package'));
  writeFileSync(join(dir, 'package', 'package.json'), '{"name":"fixture","version":"1.0.0"}');
  execFileSync('tar', ['-czf', join(dir, 'first.tgz'), 'package'], { cwd: dir });
  const changedHeader = readFileSync(join(dir, 'first.tgz'));
  changedHeader.writeUInt32LE(123456789, 4);
  writeFileSync(join(dir, 'second.tgz'), changedHeader);
  assert.notDeepEqual(readFileSync(join(dir, 'first.tgz')), readFileSync(join(dir, 'second.tgz')));
  assert.equal(
    normalizedTarballDigest(join(dir, 'first.tgz')),
    normalizedTarballDigest(join(dir, 'second.tgz')),
  );
  writeFileSync(join(dir, 'package', 'package.json'), '{"name":"changed","version":"1.0.0"}');
  execFileSync('tar', ['-czf', join(dir, 'changed.tgz'), 'package'], { cwd: dir });
  assert.notEqual(
    normalizedTarballDigest(join(dir, 'first.tgz')),
    normalizedTarballDigest(join(dir, 'changed.tgz')),
  );
});

test('release workflow isolates registries and exposes targeted recovery', () => {
  const workflow = readFileSync(
    resolve(import.meta.dirname, '../../.github/workflows/release-finalize.yml'),
    'utf8',
  );
  const prepareWorkflow = readFileSync(
    resolve(import.meta.dirname, '../../.github/workflows/release-prepare.yml'),
    'utf8',
  );
  assert.match(workflow, /pull_request:\n {4}types: \[closed\]/);
  assert.match(workflow, /workflow_dispatch:\n {4}inputs:/);
  assert.match(workflow, /github\.event\.pull_request\.merged == true/);
  assert.match(workflow, /contains\(github\.event\.pull_request\.labels\.\*\.name, 'release'\)/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /github\.actor == 'chitrank2050'/);
  assert.match(workflow, /RELEASE_TAG="\$\{INPUT_VERSION:-\$\{BRANCH_NAME#chore\/release-\}\}"/);
  assert.match(prepareWorkflow, /labels: \|\n\s+chore\n\s+release/);
  assert.match(
    prepareWorkflow,
    /branch: 'chore\/release-\$\{\{ steps\.vars\.outputs\.tag_name \}\}'/,
  );
  assert.match(workflow, /options: \[all, npm, jsr, github-release\]/);
  assert.match(workflow, /retention-days: 10/);
  assert.match(workflow, /publish-npm:[\s\S]*needs: \[build, tag\]/);
  assert.match(workflow, /publish-jsr:[\s\S]*needs: \[build, tag\]/);
  assert.match(workflow, /for package in core cli/);
  assert.match(
    workflow,
    /ref: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.version \|\| github\.sha \}\}/,
  );
  assert.match(workflow, /sha: \$\{\{ steps\.release\.outputs\.sha \}\}/);
  assert.match(workflow, /echo "sha=\$\(git rev-parse HEAD\)"/);
  assert.match(workflow, /RELEASE_SHA: \$\{\{ needs\.build\.outputs\.sha \}\}/);
  assert.doesNotMatch(workflow, /git\/ref\/tags\/\$RELEASE_TAG[^\n]*\|\| true/);
  assert.match(workflow, /Use \*\*Re-run failed jobs\*\*/);
  assert.doesNotMatch(
    workflow,
    /^ {4}env:\n(?: {6}.*\n)* {6}RELEASE_ARTIFACTS:.*runner\.temp/m,
    'runner context is unavailable in job-level env',
  );
});

test('workflows default deny and bot tokens request explicit permissions', () => {
  const workflowDirectory = resolve(import.meta.dirname, '../../.github/workflows');
  for (const filename of readdirSync(workflowDirectory).filter(file => file.endsWith('.yml'))) {
    const workflow = readFileSync(join(workflowDirectory, filename), 'utf8');
    assert.match(
      workflow,
      /\npermissions: (?:\{\}|read-all)|\npermissions:\n(?=[\s\S]*\njobs:)/,
      `${filename} must declare top-level permissions`,
    );
  }

  const setupBot = readFileSync(
    resolve(import.meta.dirname, '../../.github/actions/setup-bot/action.yml'),
    'utf8',
  );
  assert.match(setupBot, /permission-contents:\n[\s\S]*required: true/);
  assert.match(setupBot, /repositories: \$\{\{ github\.event\.repository\.name \}\}/);

  for (const filename of readdirSync(workflowDirectory).filter(file => file.endsWith('.yml'))) {
    const workflow = readFileSync(join(workflowDirectory, filename), 'utf8');
    const callers = workflow.match(/uses: (?:|\.|\$)\/\.github\/actions\/setup-bot/g) ?? [];
    const explicitPermissions = workflow.match(/permission-contents: (?:read|write)/g) ?? [];
    assert.equal(
      explicitPermissions.length,
      callers.length,
      `${filename} must scope every setup-bot token`,
    );
  }
});

test('git-cliff filters mechanical release commits', () => {
  const config = readFileSync(resolve(import.meta.dirname, '../../cliff.toml'), 'utf8');
  assert.match(config, /\^chore\\\\\(release\\\\\): \(prepare for\|bump version to\).*skip = true/);
});

test('registry verification bypasses stale CDN responses', () => {
  const script = readFileSync(resolve(import.meta.dirname, '../release-artifacts.mjs'), 'utf8');
  assert.match(script, /cache: 'no-store'/);
  assert.match(script, /searchParams\.set\('_'/);
  assert.match(script, /attempt < 10/);
});
