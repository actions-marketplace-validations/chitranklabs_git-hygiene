---
title: Git hooks
navTitle: Git hooks
seoTitle: Validate commits and branches with Lefthook or Husky
description: Validate commit-message files and branch names using Lefthook or Husky.
---

Hooks provide feedback before a commit or push. Install the CLI first using the
[Quickstart](../getting-started.md), then choose the hook manager your repository
already uses. You do not need both Lefthook and Husky.

## Lefthook

Install Lefthook alongside the CLI:

```bash
npm install --save-dev lefthook @chitrank2050/git-hygiene
```

Create or extend `lefthook.yml`:

```yaml
commit-msg:
  commands:
    metadata:
      run: npx --no-install git-hygiene commit "{1}"
pre-push:
  commands:
    branch-name:
      run: npx --no-install git-hygiene branch
```

Activate the hooks:

```bash
npx --no-install lefthook install
```

For pnpm repositories, install with `pnpm add -D` and use `pnpm exec` in the hook
commands. Preserve existing hook checks when merging the configuration.

## Husky

If your repository uses Husky, add the checks to its existing hook files.
For a new setup, install Husky and initialize it:

```bash
npm install --save-dev husky @chitrank2050/git-hygiene
npx husky init
```

Add this command to `.husky/commit-msg`:

```bash
npx --no-install git-hygiene commit "$1"
```

Add this command to `.husky/pre-push`:

```bash
npx --no-install git-hygiene branch
```

The commit hook passes a file path, rather than a message string. The CLI reads
that file and validates the complete message, including body and footer.

## Verify before committing

You can exercise the same path without making a commit:

```bash
printf '%s\n' 'feat: add search' > /tmp/git-hygiene-message.txt
npx --no-install git-hygiene commit /tmp/git-hygiene-message.txt
```

Change the file content to an invalid message and confirm that the command exits
with status `1`. Delete the temporary file when finished.

## Enforce rules on the server too

Hooks only affect machines where they were installed. Add a
[pull-request check](github-actions.md) to catch bypassed hooks and PR titles.
See [Troubleshooting](../troubleshooting.md) if hooks are not firing or the binary
cannot be found.
