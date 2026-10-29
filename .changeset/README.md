# Changesets

Welcome to Changesets! This directory stores pending release intent for packages in the `git-hygiene` monorepo.

## When to add a changeset

When you submit a Pull Request that modifies the public APIs, features, fixes, or runtime behavior of:

- `@chitrank2050/git-hygiene` (`packages/cli`)
- `@chitrank2050/git-hygiene-core` (`packages/core`)

Run:

```bash
pnpm changeset
```

Follow the interactive prompts to choose the bump type (`patch`, `minor`, or `major`) and describe the impact of your change.

## When NOT to add a changeset

- Changes solely targeting the web showcase (`app/`)
- Documentation updates or internal CI workflows
- Refactors or maintenance work with zero impact on library consumers

An empty changeset can be explicitly recorded if needed via:

```bash
pnpm changeset --empty
```
