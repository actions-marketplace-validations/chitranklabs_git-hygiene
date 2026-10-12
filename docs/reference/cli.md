---
title: Commands
description: CLI arguments, exit status and JSON output for branch, title, commit and bump checks.
---

Run the locally installed binary with `pnpm exec git-hygiene` or
`npx --no-install git-hygiene`. Examples below use pnpm.

## Command summary

| Command                 | Input                      | Behavior                                                    |
| ----------------------- | -------------------------- | ----------------------------------------------------------- |
| `branch [name]`         | Optional name              | Checks the supplied branch, or reads the current Git branch |
| `title <text>`          | Required text              | Checks PR title format                                      |
| `commit <text-or-file>` | Required text or file path | Runs commit-message validation                              |
| `bump`                  | Git history                | Recommends a semantic version change                        |

## Branches

```bash
pnpm exec git-hygiene branch
pnpm exec git-hygiene branch "fix/handle-empty-input"
```

Configured base branches pass without a prefix. Other branches need a type from
`types`, a slash and a non-empty suffix. The current validator does **not** require
that suffix to be lowercase or kebab-case; teams can still choose those conventions.
Detached checkouts can return `HEAD` rather than a feature branch. In CI, pass
the event's actual branch name explicitly.

## Pull request titles

```bash
pnpm exec git-hygiene title "feat(api): add validation"
pnpm exec git-hygiene title "feat(api)!: change result format"
```

Titles use an allowed type and optional lowercase alphanumeric/hyphen scope.
Set `allowEmptyScope: false` to require a scope. The title check uses its format
pattern; commit-only rules such as `header-max-length` and custom `rules` do not
apply to this check.

## Commit messages

```bash
pnpm exec git-hygiene commit "fix: reject empty input"
pnpm exec git-hygiene commit .git/COMMIT_EDITMSG
```

If the argument points to an existing regular file, the CLI reads its contents.
Otherwise it validates the argument as text. Quote messages with spaces and pass
only trusted file paths. There is no `--message` option; the message is positional.

## Version recommendations

```bash
pnpm exec git-hygiene bump
pnpm exec git-hygiene bump --json
```

The recommendation comes from commit history and the configured parser preset.
The default uses Conventional Commits. Fetch tags and sufficient history in CI.
This command does not edit versions, generate a changelog or publish a package.

## Machine-readable output

```bash
pnpm exec git-hygiene commit "feat: add validation" --json
```

Validation commands emit a `ValidationResult` object:

```json
{
  "valid": true,
  "message": "Commit message is valid."
}
```

Failures can also include `actual`, `expected` or `errors`, depending on the check.
Use `valid` and the exit status rather than parsing message wording. Bump output
contains `releaseType`, `reason` and `level`; it is a different result shape.

## Exit status and help

Validation success exits `0`; invalid input, missing arguments and command failures
exit `1`. JSON validation failures still exit `1`.

```bash
pnpm exec git-hygiene --help
```

The current CLI advertises a `--version` flag but does not implement a version
response. Inspect the installed package with `npm ls @chitrank2050/git-hygiene`
or `pnpm list @chitrank2050/git-hygiene` instead.
