import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { releaseSection, renderReleaseNotes } from '../release-notes.mjs';

function source({
  cli = '',
  core = '',
  root = '## [1.2.3] - 2026-01-01\n\n- Fix validation.\n',
} = {}) {
  const files = {
    'package.json': JSON.stringify({ repository: { url: 'https://github.com/example/hygiene' } }),
    'CHANGELOG.md': root,
  };
  for (const directory of ['cli', 'core']) {
    files[`packages/${directory}/package.json`] = JSON.stringify({
      name: `@example/${directory}`,
      version: '1.2.3',
      engines: { node: '>=24.0.0' },
    });
    files[`packages/${directory}/CHANGELOG.md`] = directory === 'cli' ? cli : core;
  }
  return files;
}
const render = files => renderReleaseNotes('v1.2.3', path => files[path]);

test('selects the exact version, independent of newest and unreleased entries', () => {
  assert.equal(
    releaseSection(
      '## [Unreleased]\n\n- Future.\n\n## [1.2.3] - date\n\n- Selected.\n\n## 1.2.2\n\n- Old.',
      '1.2.3',
    ),
    '- Selected.',
  );
  assert.equal(
    releaseSection('## 1.2.3\n\n- Fix exports for unreleased changes.', '1.2.3'),
    '- Fix exports for unreleased changes.',
  );
  assert.equal(releaseSection('## 1.2.30\n\n- Other.', '1.2.3'), null);
  for (const content of ['### Fixes', '<!-- pending -->', '- Unreleased']) {
    assert.throws(() => releaseSection(`## 1.2.3\n\n${content}`, '1.2.3'), /empty or unreleased/);
  }
  assert.throws(() => releaseSection('## 1.2.3\n- One.\n## [1.2.3]\n- Two.', '1.2.3'), /Duplicate/);
});

test('prefers package Changesets summaries and includes versioned install context', () => {
  const notes = render(
    source({ cli: '## 1.2.3\n\n### Patch Changes\n\n- CLI fix.', core: '## 1.2.3\n\n- Core fix.' }),
  );
  assert.match(notes, /### CLI\n\n#### Patch Changes/);
  assert.match(notes, /### Core\n\n- Core fix/);
  assert.doesNotMatch(notes, /Fix validation/);
  assert.match(notes, /npm install @example\/cli@1\.2\.3/);
  assert.match(notes, /npm install @example\/core@1\.2\.3/);
  assert.match(notes, /Core: Node.js >=24.0.0/);
  assert.match(notes, /blob\/v1\.2\.3\/CHANGELOG.md/);
});

test('falls back explicitly to exact root summary and rejects missing or inconsistent sources', () => {
  assert.match(render(source()), /Package-specific summaries were not recorded/);
  assert.match(
    render(source({ cli: '## 1.2.3\n\n- CLI change.' })),
    /Core: no package-specific summary/,
  );
  assert.throws(() => render(source({ root: '## 1.2.2\n\n- Older.' })), /Missing changelog/);
  assert.throws(
    () => render(source({ cli: '## 1.2.3\n\n### Patch Changes' })),
    /empty or unreleased/,
  );
  const files = source();
  files['packages/core/package.json'] = JSON.stringify({ version: '1.2.4' });
  assert.throws(() => render(files), /does not match/);
  assert.throws(() => renderReleaseNotes('v1.2.3-beta.1', () => ''), /stable/);
});

test('CLI reads tagged committed content rather than changed working files', t => {
  const dir = mkdtempSync(join(tmpdir(), 'hygiene-notes-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' });
  git('init');
  for (const [path, content] of Object.entries(source())) {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  git('add', '.');
  git(
    '-c',
    'commit.gpgsign=false',
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.com',
    'commit',
    '-m',
    'test: fixture',
  );
  git('tag', 'v1.2.3');
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 1.2.3\n\n- Wrong working tree.');
  execFileSync(
    process.execPath,
    [resolve(import.meta.dirname, '../release-notes.mjs'), 'v1.2.3', join(dir, 'notes.md')],
    { cwd: dir },
  );
  assert.match(readFileSync(join(dir, 'notes.md'), 'utf8'), /Fix validation/);
  assert.doesNotMatch(readFileSync(join(dir, 'notes.md'), 'utf8'), /Wrong working tree/);
});

test('workflow uses its own immutable generator for older tagged releases', () => {
  const workflow = readFileSync(
    resolve(import.meta.dirname, '../../.github/workflows/release-finalize.yml'),
    'utf8',
  );
  assert.match(workflow, /WORKFLOW_SHA: \$\{\{ github\.workflow_sha \}\}/);
  assert.match(workflow, /git show "\$WORKFLOW_SHA:scripts\/release-notes\.mjs"/);
  assert.match(workflow, /--notes-file "\$RUNNER_TEMP\/release-notes\.md"/);
  assert.doesNotMatch(workflow, /git-cliff-action|--latest --strip/);
});
