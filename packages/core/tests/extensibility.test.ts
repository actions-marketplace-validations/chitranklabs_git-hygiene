import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveConfig } from '../src/config.ts';

describe('Configuration Extensibility', () => {
  it('should merge user-defined types with defaults', async () => {
    const config = await resolveConfig({
      types: ['feat', 'fix', 'custom'],
    });

    assert.ok(config.types.includes('custom'));
    assert.ok(config.types.includes('feat'));
    assert.strictEqual(config.types.length, 3);
  });

  it('should load types from @commitlint/config-conventional when extended', async () => {
    const config = await resolveConfig({
      extends: ['@commitlint/config-conventional'],
    });

    // Conventional config includes 'chore', 'revert', 'style', etc.
    assert.ok(config.types.includes('feat'));
    assert.ok(config.types.includes('chore'));
    assert.ok(config.types.includes('revert'));
    assert.ok(config.types.length >= 10);
  });

  it('should load parserPreset from conventional config', async () => {
    const config = await resolveConfig({
      extends: ['@commitlint/config-conventional'],
    });

    assert.ok(config.parserPreset);
    assert.strictEqual(typeof config.parserPreset, 'string');
  });

  it('should override maxHeaderLength from conventional config', async () => {
    const config = await resolveConfig({
      extends: ['@commitlint/config-conventional'],
    });

    // Conventional config defines header-max-length as 100
    assert.strictEqual(config.maxHeaderLength, 100);

    const customConfig = await resolveConfig({
      extends: ['@commitlint/config-conventional'],
      maxHeaderLength: 50,
    });
    assert.strictEqual(customConfig.maxHeaderLength, 50);
  });

  it('should support raw commitlint rules', async () => {
    const config = await resolveConfig({
      rules: {
        'subject-case': [2, 'always', 'sentence-case'],
      },
    });

    assert.deepStrictEqual(config.rules?.['subject-case'], [2, 'always', 'sentence-case']);
  });

  it('should compile regex patterns with extended types', async () => {
    const config = await resolveConfig({
      types: ['extra'],
    });

    assert.ok(config.patterns.title.test('extra: some title'));
    assert.ok(config.patterns.branch.test('extra/some-branch'));
  });

  it('should handle missing extensions gracefully', async () => {
    const config = await resolveConfig({
      extends: ['non-existent-config'],
    });
    assert.ok(config.types.includes('feat')); // Should still have defaults
  });

  it('should escape regex special characters in user-defined types', async () => {
    const config = await resolveConfig({
      types: ['fix.*'],
    });
    // 'fix.' should NOT match because '.' is literal, not a wildcard
    assert.strictEqual(config.patterns.title.test('fix.: bad type'), false);
    // The literal type 'fix.*' should not match 'fixabc: msg' via wildcard
    assert.strictEqual(config.patterns.title.test('fixabc: wildcard match'), false);
  });

  it('should escape regex special characters in ignoreBranches', async () => {
    const config = await resolveConfig({
      ignoreBranches: ['main', 'release+'],
    });
    // 'release+' as literal should NOT match 'releaseee' via + quantifier
    assert.strictEqual(config.patterns.branch.test('releaseee'), false);
  });

  it('should respect explicit zero values and not override with defaults', async () => {
    const config = await resolveConfig({
      minBodyLength: 0,
      maxBodyLength: 0,
    });
    assert.strictEqual(config.minBodyLength, 0);
    assert.strictEqual(config.maxBodyLength, 0);
  });

  it('should support parserPreset as an object', async () => {
    const customPreset = {
      parserOpts: {
        headerPattern: /^(\w*): (.*)$/,
      },
    };
    const config = await resolveConfig({
      parserPreset: customPreset,
    });
    assert.deepStrictEqual(config.parserPreset, customPreset);
  });
});
