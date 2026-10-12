---
title: GitHub Actions
description: Use the bundled action to check pull request metadata and recommend release bumps.
---

The repository includes a composite action that runs its committed JavaScript
bundle. It does not install the CLI from npm during a workflow run. Choose an
explicit command for a focused check, or use its default `omni` mode.

## Check pull request metadata

```yaml
name: Git metadata
on:
  pull_request:
    types: [opened, synchronize, reopened, edited]
permissions:
  contents: read
jobs:
  metadata:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - uses: chitranklabs/git-hygiene@main
```

This readable example uses refs. Before adopting it in a protected repository,
pin every action to a reviewed commit SHA. Select the git-hygiene revision from
[its releases](https://github.com/chitranklabs/git-hygiene/releases), rather than
following `main` indefinitely. The example is not a claim that `@v1` exists.

The `edited` event matters: changing only a PR title should rerun title validation.
Full Git history and tags are needed for meaningful version-bump recommendations.

## Understand automatic mode

The default `command: omni`:

1. Validates the PR title when the pull-request event supplies one.
2. Validates `github.head_ref` when it is present.
3. Recommends a version bump from checked-out Git history.

On a push event, PR metadata may be absent. Use an explicit command when your
workflow should validate a particular value instead of relying on event detection.

## Validate an explicit value

```yaml
- name: Validate title
  uses: chitranklabs/git-hygiene@main
  with:
    command: title
    value: ${{ github.event.pull_request.title }}
```

The action passes input through environment variables and invokes the bundled
CLI with quoted arguments. Do not interpolate untrusted PR titles into your own
shell commands.

## Inputs and outputs

| Input     | Default | Meaning                                                |
| --------- | ------- | ------------------------------------------------------ |
| `command` | `omni`  | `omni`, `branch`, `title`, `commit` or `bump`          |
| `value`   | Empty   | Branch, title, commit text or commit-message file path |

| Output        | Available for  | Meaning                                       |
| ------------- | -------------- | --------------------------------------------- |
| `releaseType` | `omni`, `bump` | Recommended semantic version change           |
| `reason`      | `omni`, `bump` | Explanation derived from the history analysis |

Give the step an `id` to consume its outputs using
`${{ steps.your_step_id.outputs.releaseType }}`. A recommendation does not publish
or tag a release. Keep release decisions in your own workflow.

## Configuration and failures

Check out the repository containing your `package.json` before running the
action. Its configuration is read from the working directory. Validation errors
fail the step; do not use `continue-on-error` when this is a required policy check.

For missing tags, branch failures and configuration mismatches, see
[Troubleshooting](../troubleshooting.md).
