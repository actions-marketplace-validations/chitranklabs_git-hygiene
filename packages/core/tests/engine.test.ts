import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  validateBranch,
  validateTitle,
  validateCommit,
  getRecommendedBump,
} from '../src/engine.ts';
import { clearConfigCache, resolveConfig } from '../src/config.ts';

describe('Validation Engine', () => {
  afterEach(() => {
    clearConfigCache();
  });

  describe('validateBranch', () => {
    it('should accept valid branch names', async () => {
      assert.strictEqual((await validateBranch('feat/login-screen')).valid, true);
    });

    it('should accept ignored base branches natively', async () => {
      assert.strictEqual((await validateBranch('main')).valid, true);
      assert.strictEqual((await validateBranch('master')).valid, true);
      assert.strictEqual((await validateBranch('development')).valid, true);
    });

    it('should reject invalid branch names', async () => {
      assert.strictEqual((await validateBranch('wrong-name')).valid, false);
      assert.strictEqual((await validateBranch('feat-login')).valid, false);
      assert.strictEqual((await validateBranch('unknown/branch')).valid, false);
      assert.strictEqual((await validateBranch('feat/')).valid, false);
    });
  });

  describe('validateTitle', () => {
    it('should accept valid PR titles', async () => {
      assert.strictEqual((await validateTitle('feat: add auth')).valid, true);
      assert.strictEqual((await validateTitle('fix(core): resolve memory leak')).valid, true);
    });

    it('should reject invalid PR titles', async () => {
      assert.strictEqual((await validateTitle('just a title')).valid, false);
      assert.strictEqual((await validateTitle('feat:missing-space')).valid, false);
      assert.strictEqual((await validateTitle('unknown: type')).valid, false);
    });

    it('should respect allowEmptyScope setting in title pattern', async () => {
      assert.strictEqual((await validateTitle('feat: title')).valid, true);
      assert.strictEqual((await validateTitle('feat(scope): title')).valid, true);
    });

    it('should reject titles with invalid casing', async () => {
      assert.strictEqual((await validateTitle('FEAT: title')).valid, false);
      assert.strictEqual((await validateTitle('feat(Scope): title')).valid, false);
    });

    it('should accept breaking change with scope (feat(scope)!: msg)', async () => {
      assert.strictEqual((await validateTitle('feat(scope)!: breaking change')).valid, true);
      assert.strictEqual((await validateTitle('fix(core)!: remove deprecated api')).valid, true);
    });

    it('should accept breaking change without scope (feat!: msg)', async () => {
      assert.strictEqual((await validateTitle('feat!: breaking change')).valid, true);
    });

    it('should reject wrong order (feat!(scope): msg)', async () => {
      assert.strictEqual((await validateTitle('feat!(scope): breaking change')).valid, false);
    });
  });

  describe('validateCommit', async () => {
    it('should accept valid commits', async () => {
      const res = await validateCommit('feat: working commit');
      assert.strictEqual(res.valid, true);
    });

    it('should accept commits with scopes', async () => {
      const res = await validateCommit('feat(ui): add button');
      assert.strictEqual(res.valid, true);
    });

    it('should accept multi-line bodies', async () => {
      const message = 'feat: subject\n\nFirst line of body\nSecond line of body';
      const res = await validateCommit(message);
      assert.strictEqual(res.valid, true);
    });

    it('should accept footers', async () => {
      const message = 'feat: subject\n\nbody\n\nBREAKING CHANGE: this is breaking';
      const res = await validateCommit(message);
      assert.strictEqual(res.valid, true);
    });

    it('should reject invalid types', async () => {
      const res = await validateCommit('unknown: message');
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors?.some(e => e.name === 'type-enum'));
    });

    it('should reject too long headers', async () => {
      const longHeader = 'feat: ' + 'a'.repeat(100);
      const res = await validateCommit(longHeader);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors?.some(e => e.name === 'header-max-length'));
    });

    it('should enforce subject rules', async () => {
      const res = await validateCommit('feat: Subject with period.');
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors?.some(e => e.name === 'subject-full-stop'));
    });

    it('should enforce body line length rules', async () => {
      // body-max-line-length is 1000 by default
      const longLine = 'a'.repeat(1001);
      const message = `feat: subject\n\n${longLine}`;
      const res = await validateCommit(message);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors?.some(e => e.name === 'body-max-line-length'));
    });
  });

  describe('getRecommendedBump', () => {
    it('should return a recommended bump result', async () => {
      const tempDir = path.resolve(process.cwd(), `temp-git-test-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      const originalCwd = process.cwd();
      try {
        execSync('git init', { cwd: tempDir, stdio: 'ignore' });
        execSync('git config user.name "Test"', { cwd: tempDir, stdio: 'ignore' });
        execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: 'ignore' });
        fs.writeFileSync(path.join(tempDir, 'file.txt'), 'hello');
        execSync('git add file.txt', { cwd: tempDir, stdio: 'ignore' });
        execSync('git commit -m "feat: initial commit"', { cwd: tempDir, stdio: 'ignore' });

        // Temporarily change cwd to tempDir so getRecommendedBump runs there
        process.chdir(tempDir);

        const res = await getRecommendedBump();
        assert.strictEqual(res.releaseType, 'minor');
        assert.ok(res.reason);
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('validateCommit error resilience', () => {
    it('should throw a descriptive error when a string parserPreset module does not exist', async () => {
      const config = await resolveConfig({
        parserPreset: 'non-existent-preset-module-xyz-abc',
      });
      await assert.rejects(
        () => validateCommit('feat: test', config),
        (err: unknown) => {
          assert.ok(err instanceof Error);
          assert.ok(
            err.message.startsWith('Failed to load parser preset'),
            `Expected wrapped error message, got: ${err.message}`,
          );
          assert.ok(
            err.message.includes('non-existent-preset-module-xyz-abc'),
            `Expected error to include the preset name, got: ${err.message}`,
          );
          return true;
        },
      );
    });
  });

  describe('validateCommit with custom parser', () => {
    it('should support function-based parserPreset', async () => {
      // Create a mock preset function
      const mockPreset = async () => ({
        headerPattern: /^(\w*): (.*)$/,
        headerCorrespondence: ['type', 'subject'],
      });

      // We test resolveConfig to ensure it preserves the function
      const config = await resolveConfig({
        parserPreset: mockPreset,
      });
      assert.strictEqual(config.parserPreset, mockPreset);

      // Verify it actually works in validateCommit
      // We pass the resolved config directly as an override
      const res = await validateCommit('feat: test commit', config);
      assert.strictEqual(res.valid, true);
    });
  });
});
