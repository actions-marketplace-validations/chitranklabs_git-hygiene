---
title: Quickstart
navTitle: Quickstart
seoTitle: Install git-hygiene and validate your first commit
description: Install the CLI, validate a commit and branch, then connect checks to your workflow.
---

This guide gets one working validation check into an existing Node.js repository.
Run commands from the repository root so git-hygiene reads the intended `package.json`.

## Requirements

- Node.js **24 or newer** for the published CLI and Core packages.
- Git for checking the current branch and recommending version bumps.
- An existing `package.json`; create one with `npm init -y` if your project needs it.

Building this repository's documentation requires Node.js **24.14 or newer**
because it uses Monoline Docs. Consumers of the CLI do not need Monoline Docs.

## Install locally

```bash
npm install --save-dev @chitrank2050/git-hygiene
```

For pnpm, use `pnpm add -D @chitrank2050/git-hygiene` instead. A local development
dependency keeps team members and CI on the version recorded in your lockfile.

## Validate a commit message

```bash
npx --no-install git-hygiene commit "feat: add search"
```

A valid input prints a success message and exits with status `0`. Try an invalid
message to see the failure path:

```bash
npx --no-install git-hygiene commit "added search"
```

This exits with status `1` and reports the violated rules. With pnpm, replace
`npx --no-install` with `pnpm exec`.

## Check a branch and title

```bash
npx --no-install git-hygiene branch "feat/add-search"
npx --no-install git-hygiene title "feat(search): add filters"
```

Omit the branch argument to check your current Git branch. The defaults accept
`main`, `master`, `development` and `gh-pages` without a type prefix.

## Use your team's rules

Add this property to your existing `package.json`; retain its other fields:

```json
{
  "git-hygiene": {
    "types": ["feat", "fix", "docs", "chore"],
    "ignoreBranches": ["main", "develop"],
    "maxHeaderLength": 100,
    "allowEmptyScope": true
  }
}
```

`types` and `ignoreBranches` replace their default lists. Read the
[configuration reference](reference/configuration.md) before enabling stricter rules.

## Connect it to everyday work

Use [Git hooks](guides/git-hooks.md) for local feedback and
[GitHub Actions](guides/github-actions.md) for shared enforcement. Local hooks
can be bypassed, so use CI checks when repository policy must be enforced.
