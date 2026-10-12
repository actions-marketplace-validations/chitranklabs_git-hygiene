<div align="center">
  <h1>@chitrank2050/git-hygiene-core 🧠</h1>

**The standalone validation engine behind `git-hygiene`.**

[![NPM Version](https://img.shields.io/npm/v/@chitrank2050/git-hygiene-core?color=blue&label=npm)](https://www.npmjs.com/package/@chitrank2050/git-hygiene-core)
[![JSR Version](https://jsr.io/badges/@chitrank2050/git-hygiene-core)](https://jsr.io/@chitrank2050/git-hygiene-core)
[![License](https://img.shields.io/github/license/chitranklabs/git-hygiene)](./LICENSE)

  <a href="https://ko-fi.com/D1D71U581P" target="_blank">
      <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Buy me a coffee at ko-fi.com">
    </a>
</div>

<br />

`@chitrank2050/git-hygiene-core` is the published programmatic engine used by the CLI. Use it to integrate validation into Node.js tools without invoking a CLI process.

## Documentation

Read the [handbook](../../docs/content/index.md) or the [published documentation](https://githygiene.chitrankagnihotri.com/docs/) for setup, integration guides and reference.

## Technical Specification

- Requires Node.js 24+; npm exports ESM JavaScript and TypeScript declarations.
- Uses commitlint and conventional-changelog dependencies; it is not dependency-free or a browser library.
- Reads and caches configuration from the current working directory's `package.json`. Use `resolveConfig` and an explicit override for independent configurations.
- `getRecommendedBump` reads the current Git repository and needs its relevant history/tags. No qualifying commits may produce no `releaseType`; handle that before automating releases.
- Ignored branches are exact names, not globs. Custom bump presets must supply a `whatBump` function.

See the [contribution guide](https://github.com/chitranklabs/git-hygiene/blob/main/CONTRIBUTING.md) for workspace builds, tests, and Changesets.

---

### 🧩 Ecosystem

| Package                            | Role              | Status                                                                                                                                                                                                                                                                   |
| :--------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **@chitrank2050/git-hygiene**      | CLI & Action      | [![npm](https://img.shields.io/npm/v/@chitrank2050/git-hygiene?color=blue&label=npm)](https://www.npmjs.com/package/@chitrank2050/git-hygiene) [![jsr](https://jsr.io/badges/@chitrank2050/git-hygiene)](https://jsr.io/@chitrank2050/git-hygiene)                       |
| **@chitrank2050/git-hygiene-core** | Standalone Engine | [![npm](https://img.shields.io/npm/v/@chitrank2050/git-hygiene-core?color=orange&label=npm)](https://www.npmjs.com/package/@chitrank2050/git-hygiene-core) [![jsr](https://jsr.io/badges/@chitrank2050/git-hygiene-core)](https://jsr.io/@chitrank2050/git-hygiene-core) |

---

## Features ✨

- **Conventional Commits**: Full support for standard conventional commit validation.
- **Branch Names**: Powerful regex-based branch name enforcement.
- **PR Titles**: Validates pull request metadata for clean repository history.
- **Context Aware**: Automatically detects rules from your `package.json`.

## 📦 Installation

```bash
# Using pnpm
pnpm add @chitrank2050/git-hygiene-core

# Using JSR
npx jsr add @chitrank2050/git-hygiene-core

# Using npm
npm install @chitrank2050/git-hygiene-core
```

## 🛠️ Usage

```typescript
import {
  validateBranch,
  validateTitle,
  validateCommit,
  resolveConfig,
  getRecommendedBump,
} from '@chitrank2050/git-hygiene-core';

// 1. Validate a branch name
const branchResult = await validateBranch('feat/add-login');
if (!branchResult.valid) {
  console.error(`Invalid branch: ${branchResult.message}`);
}

// 2. Validate a PR title
const titleResult = await validateTitle('feat: implement oauth2');
console.log(`Title valid: ${titleResult.valid}`);

// 3. Validate a commit message (Async)
// Returns a detailed report including commitlint warnings/errors
const commitResult = await validateCommit('fix: resolve memory leak');
if (commitResult.valid) {
  console.log('✅ Commit follows standards');
} else {
  console.log('❌ Commit validation failed:');
  commitResult.errors?.forEach(err => console.log(`- ${err.message}`));
}

// 4. Suggest a semantic version bump
const bump = await getRecommendedBump();
console.log(`Recommended bump: ${bump.releaseType} (Reason: ${bump.reason})`);

// 5. Programmatic usage with config override
const customConfig = await resolveConfig({ types: ['feat', 'fix'], allowEmptyScope: false });
const result = await validateCommit('feat(core): manual override', customConfig);
```

## ⚙️ Configuration

`git-hygiene` is designed to be zero-config, but you can easily customize the engine by adding a `git-hygiene` block to your root `package.json`.

| Property          | Description                            | Default                                     | Possible Values                  |
| ----------------- | -------------------------------------- | ------------------------------------------- | -------------------------------- |
| `types`           | Allowed commit types                   | `feat`, `fix`, `chore`, etc.                | `string[]`                       |
| `ignoreBranches`  | Branches to skip validation            | `main`, `master`, `development`, `gh-pages` | `string[]`                       |
| `maxHeaderLength` | Max length of the commit header        | `100`                                       | `number`                         |
| `maxBodyLength`   | Max length of a single body line       | `1000`                                      | `number`                         |
| `minBodyLength`   | Min length of the commit body          | `0`                                         | `number`                         |
| `typeCase`        | Case requirement for types             | `lower-case`                                | `lower-case`, `upper-case`, etc. |
| `scopeCase`       | Case requirement for scopes            | `lower-case`                                | `lower-case`, `upper-case`, etc. |
| `allowEmptyScope` | Whether scope is optional              | `true`                                      | `boolean`                        |
| `subjectFullStop` | Whether subject can end with a period  | `never`                                     | `always`, `never`                |
| `extends`         | Standard configs to extend from        | `[]`                                        | `string[]`                       |
| `rules`           | Raw commitlint rules to merge/override | `{}`                                        | `Record<string, unknown>`        |

```json
{
  "git-hygiene": {
    "extends": ["@commitlint/config-conventional"],
    "types": ["feat", "fix", "chore", "docs", "refactor", "test", "renovate"],
    "ignoreBranches": ["main", "develop"],
    "maxHeaderLength": 100,
    "allowEmptyScope": false,
    "rules": {
      "subject-case": [2, "always", "sentence-case"]
    }
  }
}
```

## 📜 License

MIT - see [LICENSE](./LICENSE) for details.
