---
title: Configuration
navTitle: Configuration
seoTitle: Configure commit validation and branch naming rules
description: Configure allowed metadata and commitlint behavior through package.json.
---

Add a `git-hygiene` object to the `package.json` in the directory where you run
the check. Keep the rest of your package manifest intact.

## A starting configuration

```json
{
  "git-hygiene": {
    "types": ["feat", "fix", "docs", "chore", "ci"],
    "ignoreBranches": ["main", "develop"],
    "maxHeaderLength": 100,
    "allowEmptyScope": true,
    "subjectFullStop": "never"
  }
}
```

`types` and `ignoreBranches` replace their defaults rather than appending to them.
Include every branch type and base branch your team needs.

## Defaults and scope

| Option            | Default                                                                                                     | Used by                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `types`           | `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `maintenance` | Branches, titles, commits               |
| `ignoreBranches`  | `main`, `master`, `development`, `gh-pages`                                                                 | Branches                                |
| `maxHeaderLength` | `100`                                                                                                       | Commit first line                       |
| `maxBodyLength`   | `1000`                                                                                                      | Maximum characters per commit body line |
| `minBodyLength`   | `0`                                                                                                         | Minimum commit body length              |
| `typeCase`        | `lower-case`                                                                                                | Commit type                             |
| `scopeCase`       | `lower-case`                                                                                                | Commit scope                            |
| `allowEmptyScope` | `true`                                                                                                      | Titles and commits                      |
| `subjectFullStop` | `never`                                                                                                     | Commit subject; `always` also supported |
| `extends`         | `[]`                                                                                                        | Imported preset configuration           |
| `rules`           | `{}`                                                                                                        | Commitlint rule overrides               |
| `parserPreset`    | Unset                                                                                                       | Commit parsing and bump analysis        |

Despite its name, `maxBodyLength` maps to commitlint's `body-max-line-length`,
not the total body size. PR titles receive a format check and do not inherit all
commit rules. See the [command reference](cli.md) for these distinctions.

## Read configuration from the correct directory

The loader reads `./package.json` relative to `process.cwd()`. It does not search
parent directories. A missing or unreadable manifest falls back to defaults;
therefore a passing check alone does not prove your custom configuration loaded.

In a monorepo, run hooks and CI from the manifest that owns your policy. The Core
API caches loaded configuration within a process; use `clearConfigCache()` after
changing repositories, or pass an explicit resolved configuration.

## Override commitlint rules

```json
{
  "git-hygiene": {
    "rules": {
      "header-max-length": [2, "always", 72],
      "subject-case": [0]
    }
  }
}
```

Rules are applied after git-hygiene generates its defaults, so a raw rule can
override a convenience setting. Severity `2` rejects a violation. Severity `0`
disables that rule. These overrides do not change the branch or PR title patterns.

## Extend a preset

Install the preset in the repository that runs the validator:

```bash
npm install --save-dev @commitlint/config-conventional
```

```json
{
  "git-hygiene": {
    "extends": ["@commitlint/config-conventional"]
  }
}
```

The current conventional-config integration unions its allowed types into your
configured list, and imports header length and parser preset when not explicitly
configured. It is not a complete merge of every rule from that package; configure
additional rules explicitly with `rules`. Omit this extension when a strict,
smaller type list is required.
Other named extensions are handled through the conventional-changelog preset
loader. Missing extensions can warn and fall back rather than fail the check.

For embedded configuration, use `resolveConfig()` from the
[Core API](core-api.md). JSON manifests cannot contain JavaScript functions or RegExp
instances; supply those through the programmatic API when required.
