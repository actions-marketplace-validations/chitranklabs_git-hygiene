import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_PATH = resolve(__dirname, '../src/cli.ts');

// Helper to run the CLI
function runCli(args: string): { stdout: string; stderr: string; status: number | null } {
  try {
    const stdout = execSync(`node --experimental-strip-types ${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
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

describe('CLI Tool', () => {
  it('should print help text when no arguments are passed', () => {
    const res = runCli('');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Usage:/);
    assert.match(res.stdout, /Commands:/);
  });

  it('should validate a correct title', () => {
    const res = runCli('title "feat: add testing"');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /is valid/);
  });

  it('should fail on an incorrect title', () => {
    const res = runCli('title "just a title"');
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr, /Invalid PR title/);
  });

  it('should validate a correct commit', () => {
    const res = runCli('commit "fix: resolve timeout issue"');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Commit message is valid/);
  });

  it('should fail on an incorrect commit', () => {
    const res = runCli('commit "fixed timeout"');
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr, /Invalid commit message/);
  });

  it('should fail if command is unknown', () => {
    const res = runCli('unknown');
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr, /Unknown command: unknown/);
  });
});
