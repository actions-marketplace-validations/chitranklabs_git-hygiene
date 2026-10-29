import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { execSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '../../..');
const BUNDLE_PATH = resolve(ROOT_DIR, 'dist/action.js');

function runBundle(args: string): { stdout: string; stderr: string; status: number | null } {
  try {
    const stdout = execSync(`node ${BUNDLE_PATH} ${args}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: ROOT_DIR,
    });
    return { stdout, stderr: '', status: 0 };
  } catch (err: unknown) {
    const execError = err as { stdout?: string; stderr?: string; status?: number | null };
    return {
      stdout: execError.stdout ? String(execError.stdout) : '',
      stderr: execError.stderr ? String(execError.stderr) : '',
      status: execError.status ?? null,
    };
  }
}

describe('Standalone Action Bundle', () => {
  before(() => {
    // Ensure bundle exists before testing
    if (!fs.existsSync(BUNDLE_PATH)) {
      execSync('pnpm build:action', { cwd: ROOT_DIR, stdio: 'pipe' });
    }
  });

  it('should print help text when no arguments are passed', () => {
    const res = runBundle('');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /git-hygiene/);
    assert.match(res.stdout, /Usage:/);
  });

  it('should validate branch name', () => {
    const res = runBundle('branch "feat/standalone-action"');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /is valid/);
  });

  it('should validate PR title', () => {
    const res = runBundle('title "feat(action): add standalone bundle"');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /is valid/);
  });

  it('should reject invalid PR title', () => {
    const res = runBundle('title "invalid title without type"');
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr, /Invalid PR title/);
  });

  it('should validate conventional commit message', () => {
    const res = runBundle('commit "feat(action): add standalone bundle"');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Commit message is valid/);
  });

  it('should reject invalid commit message', () => {
    const res = runBundle('commit "bad commit message"');
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr, /Invalid commit message/);
  });

  it('should compute recommended bump as JSON', t => {
    // CI may only have a merge commit. Test known history, not the checkout's history.
    const cwd = fs.mkdtempSync(resolve(tmpdir(), 'git-hygiene-bump-'));
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    const git = (...args: string[]) =>
      execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
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
    git('init', '--quiet', '--initial-branch=main');
    git(
      '-c',
      'core.hooksPath=/dev/null',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'chore: initial',
    );
    git('tag', 'v1.0.0');
    git(
      '-c',
      'core.hooksPath=/dev/null',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'feat: add example',
    );

    const stdout = execFileSync(process.execPath, [BUNDLE_PATH, 'bump', '--json'], {
      cwd,
      encoding: 'utf8',
    });
    const parsed = JSON.parse(stdout.trim());
    assert.strictEqual(parsed.releaseType, 'minor');
    assert.ok(parsed.reason);
  });
});
