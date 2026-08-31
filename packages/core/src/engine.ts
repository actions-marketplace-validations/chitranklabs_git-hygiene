import lint from '@commitlint/lint';
import { loadConfig } from './config.ts';
import type { ValidationResult, ResolvedConfig } from './types.ts';
import { Bumper } from 'conventional-recommended-bump';

/**
 * @description
 * Validates a Git branch name against the loaded configuration.
 * Automatically accepts configured base branches (e.g., 'main').
 *
 * @param branchName - The raw string name of the branch to validate
 * @returns {Promise<ValidationResult>} The status and messaging of the validation
 */
export async function validateBranch(
  branchName: string,
  configOverride?: ResolvedConfig,
): Promise<ValidationResult> {
  const config = configOverride || (await loadConfig());
  const isValid = config.patterns.branch.test(branchName);

  if (isValid) return { valid: true, message: `Branch name "${branchName}" is valid.` };

  return {
    valid: false,
    message: `Invalid branch name: "${branchName}"`,
    actual: branchName,
    expected: `Base branch (${config.ignoreBranches.join('|')}) OR <type>/<description> (Types: ${config.types.join(', ')})`,
  };
}

/**
 * @description
 * Validates a Pull Request title against the loaded configuration.
 *
 * @param title - The PR title to validate (e.g., 'feat: add login')
 * @returns {Promise<ValidationResult>} The status and messaging of the validation
 */
export async function validateTitle(
  title: string,
  configOverride?: ResolvedConfig,
): Promise<ValidationResult> {
  const config = configOverride || (await loadConfig());
  const isValid = config.patterns.title.test(title);

  if (isValid) return { valid: true, message: `PR title "${title}" is valid.` };

  return {
    valid: false,
    message: `Invalid PR title: "${title}"`,
    actual: title,
    expected: `type(scope?): description (Types: ${config.types.join(', ')})`,
  };
}

/**
 * @description
 * Validates a commit message using the underlying @commitlint/lint engine
 * configured with the dynamic types from our loaded config.
 *
 * @param message - The multi-line commit message
 * @returns {Promise<ValidationResult>} The status and messaging of the validation
 */
export async function validateCommit(
  message: string,
  configOverride?: ResolvedConfig,
): Promise<ValidationResult> {
  const config = configOverride || (await loadConfig());

  const rules: Record<string, unknown> = {
    'type-enum': [2, 'always', config.types],
    'type-case': [2, 'always', config.typeCase],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', config.scopeCase],
    'scope-empty': [config.allowEmptyScope ? 0 : 2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, config.subjectFullStop, '.'],
    'header-max-length': [2, 'always', config.maxHeaderLength],
    'body-max-line-length': [2, 'always', config.maxBodyLength],
    'body-min-length': [2, 'always', config.minBodyLength],
    ...config.rules,
  };

  const lintOpts: { parserOpts?: unknown } = {};
  if (config.parserPreset) {
    const preset = await loadParserPreset(config.parserPreset);
    // Handle presets that are functions (like conventional-changelog-conventionalcommits)
    if (typeof preset === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resolved = await (preset as any)();
      lintOpts.parserOpts = resolved.parserOpts || resolved.parser || resolved;
    } else {
      // Normalize parserOpts from various preset formats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = preset as any;
      lintOpts.parserOpts = p.parserOpts || p.parser || p;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const report = await lint(message, rules as any, lintOpts as any);
  if (report.valid) return { valid: true, message: 'Commit message is valid.' };

  const errors = (report.errors ?? []).map((err: { message: string; name: string }) => ({
    message: err.message,
    name: err.name,
  }));

  const messageSummary = errors.map((err: { message: string }) => ` - ${err.message}`).join('\n');
  return {
    valid: false,
    message: `Invalid commit message:\n${messageSummary}`,
    errors,
  };
}

/**
 * @description
 * Suggests the next semantic version bump based on the commit history
 * since the last tag.
 *
 * @returns {Promise<{ releaseType: string; reason: string; level: number }>} The recommended bump info
 */
export async function getRecommendedBump(configOverride?: ResolvedConfig): Promise<{
  releaseType: string;
  reason: string;
  level: number;
}> {
  const config = configOverride || (await loadConfig());
  const bumper = new Bumper(process.cwd());

  if (config.parserPreset) {
    // If it's a function (dynamic preset), execute it and use the resulting config
    if (typeof config.parserPreset === 'function') {
      const preset = await config.parserPreset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bumper.config(preset as any);
    }
    // If it's already a resolved object, use it
    else if (typeof config.parserPreset === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bumper.config(config.parserPreset as any);
    }
    // If it's a string, load it as a named preset
    else {
      await bumper.loadPreset(config.parserPreset);
    }
  } else {
    // Fallback to conventionalcommits if no preset is provided
    await bumper.loadPreset('conventionalcommits');
  }

  return (await bumper.bump()) as { releaseType: string; reason: string; level: number };
}

/**
 * @internal
 * Helper to load a parser preset dynamically.
 * Isolated to avoid "Slow Types" warnings in JSR public API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadParserPreset(preset: string | unknown): Promise<any> {
  if (typeof preset === 'string') {
    // Dynamic import of arbitrary strings is unanalyzable by JSR,
    // but moving it to a private helper helps avoid score penalties.
    try {
      const mod = await import(preset);
      return mod.default ?? mod;
    } catch (err) {
      throw new Error(
        `Failed to load parser preset "${preset}": ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }
  }
  return preset;
}
