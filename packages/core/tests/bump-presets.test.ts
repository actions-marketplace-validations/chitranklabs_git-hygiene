import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import conventionalPreset from 'conventional-changelog-conventionalcommits';
import { resolveConfig } from '../src/config.ts';
import { getRecommendedBump, validateCommit } from '../src/engine.ts';

// This test file runs in its own Node test process; cwd changes cannot affect other files.
describe('Release recommendations with parser presets', { concurrency: false }, () => {
  const originalCwd = process.cwd();
  let directory: string;

  before(() => {
    directory = mkdtempSync(join(tmpdir(), 'hygiene-presets-'));
    const git = (...args: string[]) =>
      execFileSync('git', args, {
        cwd: directory,
        env: {
          ...process.env,
          GIT_CONFIG_NOSYSTEM: '1',
          GIT_CONFIG_GLOBAL: '/dev/null',
          GIT_AUTHOR_NAME: 'Test',
          GIT_AUTHOR_EMAIL: 'test@example.com',
          GIT_COMMITTER_NAME: 'Test',
          GIT_COMMITTER_EMAIL: 'test@example.com',
        },
        stdio: 'pipe',
      });
    git('init', '--quiet', '--initial-branch=main');
    git('commit', '--allow-empty', '-m', 'chore: initial');
    git('tag', 'v1.0.0');
    git('commit', '--allow-empty', '-m', 'feat: add example');
    process.chdir(directory);
  });

  after(() => {
    process.chdir(originalCwd);
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  for (const parserPreset of [
    'conventionalcommits',
    'conventional-changelog-conventionalcommits',
  ]) {
    it(`supports the bundled ${parserPreset} preset`, async () => {
      const result = await getRecommendedBump(await resolveConfig({ parserPreset }));
      assert.equal(result.releaseType, 'minor');
      assert.equal(result.level, 1);
    });
  }

  for (const form of ['object', 'function'] as const) {
    it(`uses a ${form} preset's release policy`, async () => {
      const preset = {
        ...conventionalPreset(),
        whatBump: (commits: unknown[]) => {
          assert.equal(commits.length, 1, 'only commits since the tag should be evaluated');
          return { level: 0, reason: 'Custom release policy' };
        },
      };
      const parserPreset = form === 'function' ? async () => preset : preset;
      const result = await getRecommendedBump(await resolveConfig({ parserPreset }));
      assert.equal(result.releaseType, 'major');
      assert.equal(result.reason, 'Custom release policy');
    });

    it(`rejects a ${form} preset without a release policy`, async () => {
      const parserPreset = form === 'function' ? async () => ({}) : {};
      await assert.rejects(
        getRecommendedBump(await resolveConfig({ parserPreset })),
        /whatBump.*must be a function/,
      );
    });
  }

  it('validates commits using the bundled named parser', async () => {
    const config = await resolveConfig({
      parserPreset: 'conventional-changelog-conventionalcommits',
    });
    assert.equal((await validateCommit('feat: add example', config)).valid, true);
    assert.equal((await validateCommit('unknown: add example', config)).valid, false);
  });
});
