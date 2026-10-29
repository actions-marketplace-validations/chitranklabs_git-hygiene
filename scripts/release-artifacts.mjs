import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  createWriteStream,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const output = resolve(process.env.RELEASE_ARTIFACTS || join(root, 'release-artifacts'));
const read = file => JSON.parse(readFileSync(join(root, file), 'utf8'));
const packages = ['core', 'cli'].map(dir => ({ dir, ...read(`packages/${dir}/package.json`) }));
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const capture = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();
const version = packages[0].version;

function validateWorkspace() {
  assert.match(version, /^\d+\.\d+\.\d+$/u, 'Only stable releases are supported by this workflow');
  for (const pkg of packages) {
    const jsr = read(`packages/${pkg.dir}/jsr.json`);
    assert.equal(pkg.version, version, 'Package versions must agree');
    assert.equal(jsr.version, version, 'JSR and npm versions must agree');
    for (const [name, range] of Object.entries(pkg.dependencies ?? {})) {
      const expected = range.startsWith('workspace:')
        ? `jsr:${name}@^${version}`
        : `npm:${name}@${range}`;
      assert.equal(jsr.imports[name], expected, `JSR dependency mismatch: ${name}`);
    }
  }
  assert.equal(read('package.json').version, version, 'Root version must agree');
  if (process.env.RELEASE_TAG)
    assert.equal(process.env.RELEASE_TAG, `v${version}`, 'Tag must match manifests');
}

function tarballName(pkg) {
  return `${pkg.name.replace('@', '').replace('/', '-')}-${version}.tgz`;
}

export function normalizedTarballDigest(file) {
  const entries = capture('tar', ['-tzf', file])
    .split('\n')
    .filter(name => name && !name.endsWith('/'))
    .sort();
  const hash = createHash('sha256');
  for (const entry of entries) {
    hash.update(entry);
    hash.update('\0');
    hash.update(execFileSync('tar', ['-xOzf', file, entry]));
    hash.update('\0');
  }
  return hash.digest('hex');
}

async function registryJson(url) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let response;
    try {
      const requestUrl = new URL(url);
      requestUrl.searchParams.set('_', `${Date.now()}-${attempt}`);
      response = await fetch(requestUrl, {
        cache: 'no-store',
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      lastError = error;
    }
    if (response?.status === 404) return null;
    if (response?.ok) return response.json();
    if (response && response.status !== 429 && response.status < 500)
      throw new Error(`Registry lookup failed: ${response.status}`);
    if (response) lastError = new Error(`Transient registry response: ${response.status}`);
    const delay = 250 * 2 ** attempt + Math.floor(Math.random() * 100);
    await new Promise(resolveDelay => setTimeout(resolveDelay, delay));
  }
  throw lastError;
}

async function download(url, destination) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  assert(response.ok && response.body, `Artifact download failed: ${response.status}`);
  await finished(Readable.fromWeb(response.body).pipe(createWriteStream(destination)));
}

async function npmStatus(pkg) {
  return registryJson(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${version}`);
}

async function waitForPublished(status, label) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const result = await status();
    if (result) return result;
    if (attempt < 9) {
      const delay = Math.min(1_000 * 2 ** attempt, 10_000) + Math.floor(Math.random() * 200);
      await new Promise(resolveDelay => setTimeout(resolveDelay, delay));
    }
  }
  assert.fail(`Registry did not expose ${label} after publishing`);
}

async function verifyExistingNpm(pkg, metadata) {
  const temporary = mkdtempSync(join(tmpdir(), 'hygiene-registry-artifact-'));
  try {
    const published = join(temporary, tarballName(pkg));
    await download(metadata.dist.tarball, published);
    assert.equal(
      normalizedTarballDigest(published),
      normalizedTarballDigest(join(output, tarballName(pkg))),
      `Published artifact differs: ${pkg.name}. Refusing to overwrite or skip.`,
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

async function jsrStatus(pkg) {
  const packagePath = pkg.name.replace(/^@/, '');
  const metadata = await registryJson(`https://jsr.io/@${packagePath}/meta.json`);
  if (!metadata?.versions?.[version]) return false;
  const published = await registryJson(`https://jsr.io/@${packagePath}/${version}_meta.json`);
  assert(published?.manifest, 'JSR version manifest is unavailable');
  verifyJsrManifest(published.manifest, join(root, 'packages', pkg.dir));
  return true;
}

export function verifyJsrManifest(manifest, directory) {
  assert(Object.keys(manifest).length > 0, 'Empty JSR manifest');
  for (const [name, entry] of Object.entries(manifest)) {
    const file = resolve(directory, `.${name}`);
    assert(
      name.startsWith('/') && file.startsWith(`${resolve(directory)}/`),
      'Invalid JSR file path',
    );
    const checksum = `sha256-${createHash('sha256').update(readFileSync(file)).digest('hex')}`;
    assert.equal(checksum, entry.checksum, `Published JSR file differs: ${name}`);
  }
}

async function main(command, argument) {
  validateWorkspace();

  if (command === 'check') {
    const changesets = join(root, '.changeset');
    assert(
      !existsSync(changesets) ||
        !readdirSync(changesets).some(file => file.endsWith('.md') && file !== 'README.md'),
      'Unconsumed changesets remain; prepare the release before publishing',
    );
    const refs = capture('git', ['tag', '--list', `v${version}`]);
    if (refs)
      assert.equal(
        capture('git', ['rev-list', '-n', '1', `v${version}`]),
        capture('git', ['rev-parse', 'HEAD']),
        'Existing tag points at another commit',
      );
    console.log(`Validated v${version}`);
    return;
  }

  if (command === 'pack') {
    mkdirSync(output, { recursive: true });
    assert.equal(readdirSync(output).length, 0, 'Use a fresh artifact directory');
    for (const pkg of packages)
      run('pnpm', ['pack', '--pack-destination', output], join(root, 'packages', pkg.dir));
    const tarballs = readdirSync(output)
      .filter(file => file.endsWith('.tgz'))
      .sort();
    assert.equal(tarballs.length, 2);
    for (const filename of tarballs) {
      const file = join(output, filename);
      const entries = capture('tar', ['-tzf', file]).split('\n');
      for (const name of ['README.md', 'LICENSE', 'package.json'])
        assert(entries.includes(`package/${name}`), `Missing ${name}`);
      assert(
        entries.some(name => name.startsWith('package/dist/')),
        'Missing build output',
      );
      assert(
        !entries.some(name => /package\/(src|tests|node_modules)\//u.test(name)),
        'Unexpected package contents',
      );
      const manifest = JSON.parse(capture('tar', ['-xOf', file, 'package/package.json']));
      assert.equal(manifest.version, version);
      assert(
        !JSON.stringify(manifest.dependencies).includes('workspace:'),
        'Unresolved workspace dependency',
      );
    }

    const consumer = mkdtempSync(join(tmpdir(), 'hygiene-release-consumer-'));
    try {
      run(
        'npm',
        [
          'install',
          '--ignore-scripts',
          '--no-audit',
          '--no-fund',
          '--package-lock=false',
          ...tarballs.map(file => join(output, file)),
        ],
        consumer,
      );
      run(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
            import assert from 'node:assert/strict';
            import { validateCommit, validateBranch } from '@chitrank2050/git-hygiene-core';
            assert.equal((await validateCommit('feat: example')).valid, true);
            assert.equal((await validateCommit('invalid')).valid, false);
            assert.equal((await validateBranch('feat/example')).valid, true);
          `,
        ],
        consumer,
      );
      run(
        process.execPath,
        [
          join(consumer, 'node_modules/@chitrank2050/git-hygiene/dist/cli.js'),
          'title',
          'feat: example',
        ],
        consumer,
      );
    } finally {
      rmSync(consumer, { recursive: true, force: true });
    }

    copyFileSync(join(root, 'dist/action.js'), join(output, 'action.js'));
    const artifacts = [...tarballs, 'action.js'];
    const checksums = artifacts.map(file => {
      const digest = createHash('sha256')
        .update(readFileSync(join(output, file)))
        .digest('hex');
      return `${digest}  ${file}`;
    });
    writeFileSync(join(output, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
    return;
  }

  if (command === 'publish-npm' || command === 'verify-npm') {
    if (command === 'publish-npm')
      assert(process.env.NODE_AUTH_TOKEN, 'Missing npm publishing credentials');
    for (const pkg of packages) {
      let metadata = await npmStatus(pkg);
      if (!metadata && command === 'publish-npm') {
        run('npm', [
          'publish',
          join(output, tarballName(pkg)),
          '--access',
          'public',
          '--provenance',
          '--ignore-scripts',
        ]);
        metadata = await waitForPublished(() => npmStatus(pkg), `${pkg.name}@${version}`);
      }
      assert(metadata, `Missing npm release: ${pkg.name}@${version}`);
      await verifyExistingNpm(pkg, metadata);
      console.log(`Verified npm: ${pkg.name}@${version}`);
    }
    return;
  }

  if (command === 'jsr-exists') {
    const pkg = packages.find(candidate => candidate.dir === argument);
    assert(pkg, 'Expected JSR package name: core or cli');
    if (!(await jsrStatus(pkg))) process.exitCode = 1;
    else console.log(`Verified JSR: ${pkg.name}@${version}`);
    return;
  }

  if (command === 'verify-jsr') {
    for (const pkg of packages)
      await waitForPublished(
        async () => ((await jsrStatus(pkg)) ? true : null),
        `${pkg.name}@${version}`,
      );
    console.log(`Verified both JSR packages at ${version}`);
    return;
  }

  throw new Error('Expected check, pack, publish-npm, verify-npm, jsr-exists, or verify-jsr');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  try {
    await main(process.argv[2], process.argv[3]);
  } catch (error) {
    console.error(error);
    // Exit 1 is reserved for a confirmed absent JSR version.
    process.exitCode = 2;
  }
