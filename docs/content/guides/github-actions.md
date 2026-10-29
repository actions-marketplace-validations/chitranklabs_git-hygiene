---
title: GitHub Actions
navTitle: GitHub Actions
seoTitle: Validate pull request metadata with GitHub Actions
description: Use the bundled action to check pull request metadata and recommend release bumps.
---

The repository includes a composite action that runs its committed JavaScript
bundle. It does not install the CLI from npm during a workflow run. Choose an
explicit command for a focused check, or use its default `omni` mode.

The composite action needs Node.js 24 or newer, Bash and `jq` on the runner.
The Ubuntu example below supplies Node through setup-node; Bash and `jq` are
available on that runner. Provision all three when using a self-hosted runner.

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
    timeout-minutes: 5
    permissions:
      contents: read
    steps:
      - uses: step-security/harden-runner@e14015d583714f6e62063499dc959a02595150a1
        with:
          egress-policy: audit
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020
        with:
          node-version: '24'
      - uses: chitranklabs/git-hygiene@dc37236d02c55f7cf29bfed8050b7a9801db9063
```

The examples pin a reviewed revision containing the committed action bundle.
Review and update these SHAs when adopting a newer revision; they do not assume
a `v1` tag. The checkout and Node setup pins match this repository's CI.

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
  uses: chitranklabs/git-hygiene@dc37236d02c55f7cf29bfed8050b7a9801db9063
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

A title check validates format, not the complete policy for a future squash
commit. If that final message must satisfy commitlint rules, validate it with
`command: commit` as a separate check too. `bump` and `omni` require usable history
and tags; handle repositories without a qualifying recommendation explicitly
in your release process rather than assuming a version change always exists.

## Configuration and failures

Check out the repository containing your `package.json` before running the
action. Its configuration is read from the working directory. Validation errors
fail the step; do not use `continue-on-error` when this is a required policy check.

For missing tags, branch failures and configuration mismatches, see
[Troubleshooting](../troubleshooting.md).
