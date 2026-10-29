---
title: Core API
navTitle: Core API
seoTitle: git-hygiene Core API for Node.js tooling
description: Embed asynchronous validation and configuration resolution in Node.js tooling.
---

Use `@chitrank2050/git-hygiene-core` when building a bot, CI integration or custom
validator. The CLI depends on this same engine. Node.js 24 or newer is required.

## Install and validate

```bash
npm install @chitrank2050/git-hygiene-core
```

```typescript
import { validateBranch, validateCommit, validateTitle } from '@chitrank2050/git-hygiene-core';

const results = await Promise.all([
  validateBranch('feat/add-search'),
  validateCommit('feat: add search'),
  validateTitle('feat(search): add filters'),
]);

if (results.some(result => !result.valid)) {
  console.error(results.filter(result => !result.valid));
  process.exitCode = 1;
}
```

Without an override, validation loads the `git-hygiene` object from
`process.cwd()`'s `package.json`. See [Configuration](configuration.md).

## Resolve an explicit configuration

```typescript
import { resolveConfig, validateCommit } from '@chitrank2050/git-hygiene-core';

const config = await resolveConfig({
  types: ['feat', 'fix'],
  maxHeaderLength: 72,
});
const result = await validateCommit('fix: handle missing input', config);
```

Resolve once and reuse the resulting `ResolvedConfig`. `resolveConfig()` accepts
a partial `GitHygieneConfig` and generates the branch/title patterns. Validation
functions take the resolved configuration as an optional second argument.

## Public functions

| Function                           | Returns                                       | Purpose                                        |
| ---------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `validateBranch(name, config?)`    | `Promise<ValidationResult>`                   | Check branch format                            |
| `validateTitle(title, config?)`    | `Promise<ValidationResult>`                   | Check PR title format                          |
| `validateCommit(message, config?)` | `Promise<ValidationResult>`                   | Run commitlint validation                      |
| `getRecommendedBump(config?)`      | Promise with `releaseType`, `reason`, `level` | Analyze repository history                     |
| `resolveConfig(partial)`           | `Promise<ResolvedConfig>`                     | Merge defaults and compile patterns            |
| `loadConfig()`                     | `Promise<ResolvedConfig>`                     | Load and cache working-directory configuration |
| `clearConfigCache()`               | `void`                                        | Clear that process's loaded configuration      |

`DEFAULT_CONFIG` and configuration/result types are also exported. There is no
`analyzeReleaseBump()` export and validation results do not expose a parsed `type` field.

## Result and error handling

```typescript
interface ValidationResult {
  valid: boolean;
  message: string;
  actual?: string;
  expected?: string;
  errors?: Array<{ message: string; name: string }>;
}
```

Invalid metadata normally returns `valid: false`. Configuration, parser and I/O
failures can throw; handle rejected promises at your integration boundary.
Use error names and `valid` for decisions, and treat message text as human-readable
feedback rather than a stable machine protocol.

## History-based recommendations

```typescript
import { getRecommendedBump } from '@chitrank2050/git-hygiene-core';

const recommendation = await getRecommendedBump();
console.log(recommendation.releaseType, recommendation.reason);
```

This reads the Git repository at the working directory. It does not accept an
array of messages, update package manifests or publish. Provide repository history
and tags when embedding it in CI. A history without qualifying changes may
produce no `releaseType`; check for that before using the result to prepare a
release. Custom conventional-changelog presets used for bump analysis must
supply a `whatBump` function.
