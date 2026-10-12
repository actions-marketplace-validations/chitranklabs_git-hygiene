---
title: Troubleshooting
description: Diagnose hook, configuration, branch and release-history failures.
---

Start by running the failing check directly from your repository root. Keep the
exact input and exit status; that distinguishes a validation failure from an
installation or Git failure.

## The command cannot be found

Confirm Node.js is at least version 24, then reinstall from the repository lockfile:

```bash
node --version
npm ci
npx --no-install git-hygiene --help
```

For pnpm, use `pnpm install --frozen-lockfile` and `pnpm exec git-hygiene --help`.
The dependency must be installed in the workspace running the command. CI jobs
that omit development dependencies will not have a locally installed CLI.

## My configuration is ignored

Run from the directory containing the intended `package.json`. Check that the
property is named `git-hygiene`, the manifest is valid JSON and arrays include
all required types. The loader does not search upwards and falls back to defaults
if it cannot read the file.

A long-running Core consumer caches configuration. Call `clearConfigCache()`
after switching directories, or use `resolveConfig()` and pass its result directly.

## The commit hook is not running

Reinstall or initialize your chosen hook manager using the
[Git hooks guide](guides/git-hooks.md). Confirm the `commit-msg` hook receives
`"$1"` (Husky) or `"{1}"` (Lefthook); it needs the message-file path. Keep it quoted.
A `pre-commit` hook alone cannot validate the message that has not yet been written.

## A branch fails only in CI

Detached checkout state can report `HEAD`. Pass the actual pull-request head branch
instead. For the GitHub Action, automatic mode uses `github.head_ref` when present.

If a base branch fails locally, add its exact name to `ignoreBranches`. The default
is `development`, not `develop`. Custom lists replace defaults.

## A PR title passes but a commit fails

These checks have different scope. Titles check their format; commits run the
configured commitlint rules. Header length, casing and custom rule overrides can
reject a commit even when a similarly worded title passes.

## A preset does not load

Install it where the check runs and verify its package name. Some missing extensions
produce warnings and fallback behavior. Do not assume a successful check proves
that every extended rule was loaded; test a message that should violate your policy.

## Version recommendations look wrong

Fetch history and tags, especially in GitHub Actions:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

Pin the action to a reviewed SHA in your production workflow. Check that commit
messages follow the parser preset you selected. `bump` recommends a change; it
never edits files or publishes on your behalf.

## Report a reproducible issue

Include the installed package version, Node.js version, command, working-directory
layout, relevant configuration and a minimal input. Remove secrets and private
repository information before posting to
[GitHub issues](https://github.com/chitranklabs/git-hygiene/issues).
