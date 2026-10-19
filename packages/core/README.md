<div align="center">
  <h1>@chitrank2050/git-hygiene-core 🧠</h1>

**The standalone validation engine behind `git-hygiene`.**

[Website](https://githygiene.chitrankagnihotri.com/) · [Docs](https://docs.githygiene.chitrankagnihotri.com/) · [API](https://docs.githygiene.chitrankagnihotri.com/reference/core-api/) · [npm](https://www.npmjs.com/package/@chitrank2050/git-hygiene-core)

[![NPM Version](https://img.shields.io/npm/v/@chitrank2050/git-hygiene-core?color=blue&label=npm)](https://www.npmjs.com/package/@chitrank2050/git-hygiene-core) [![JSR Version](https://jsr.io/badges/@chitrank2050/git-hygiene-core)](https://jsr.io/@chitrank2050/git-hygiene-core) [![License](https://img.shields.io/github/license/chitranklabs/git-hygiene)](https://github.com/chitranklabs/git-hygiene/blob/main/LICENSE)

</div>

`@chitrank2050/git-hygiene-core` is the asynchronous Node.js validation engine
used by the CLI and bundled Action. Use it to embed validation in your own tooling
without invoking a CLI process. For hooks and terminal use, install
[the CLI](https://www.npmjs.com/package/@chitrank2050/git-hygiene).

## Installation

<a id="-installation"></a>

Use Node.js 24 or newer:

```bash
npm install @chitrank2050/git-hygiene-core
```

For pnpm, use `pnpm add @chitrank2050/git-hygiene-core`.
The package is also [published on JSR](https://jsr.io/@chitrank2050/git-hygiene-core).

## Usage

<a id="️-usage"></a>

```typescript
import { resolveConfig, validateCommit } from '@chitrank2050/git-hygiene-core';

const config = await resolveConfig({ types: ['feat', 'fix'] });
const result = await validateCommit('feat: add search', config);

if (!result.valid) {
  console.error(result.message);
  process.exitCode = 1;
}
```

With this configuration, the example returns `valid: true`. Validation reports
invalid metadata through `valid: false`; configuration or I/O failures can throw.
Handle rejected promises at your application boundary.

## Configuration

<a id="️-configuration"></a>

Without an explicit resolved configuration, validation loads and caches the
`git-hygiene` object from the current directory's `package.json`. Resolve once and
reuse the resulting config for independent policies. See
[configuration](https://docs.githygiene.chitrankagnihotri.com/reference/configuration/)
for defaults, preset inheritance and commitlint overrides.

## Technical Specification

- npm exports ESM JavaScript and TypeScript declarations.
- Uses commitlint and conventional-changelog dependencies; it is not a browser library.
- `validateBranch`, `validateTitle` and `validateCommit` return promises with a
  `valid` result. Title checks do not run every commitlint rule.
- `getRecommendedBump` reads Git history and tags at the working directory. No
  qualifying history may yield no `releaseType`; handle that before automating releases.
- Ignored branches are exact names, not globs. Custom bump presets must supply a
  `whatBump` function.

## Documentation

<a id="-license"></a>

<a id="features-"></a>

<a id="-ecosystem"></a>

[Core API and result types](https://docs.githygiene.chitrankagnihotri.com/reference/core-api/) ·
[Configuration](https://docs.githygiene.chitrankagnihotri.com/reference/configuration/) ·
[Troubleshooting](https://docs.githygiene.chitrankagnihotri.com/troubleshooting/) ·
[Contributor guide](https://github.com/chitranklabs/git-hygiene/blob/main/CONTRIBUTING.md)

Licensed under [MIT](https://github.com/chitranklabs/git-hygiene/blob/main/LICENSE).

<p align="center">❤️ Developed by <a href="https://chitrankagnihotri.com">Chitrank Agnihotri</a></p>
