---
title: Introduction
description: Use one configuration to validate Git branches, commit messages and pull request titles.
---

git-hygiene checks repository metadata before it reaches your shared history.
Use the CLI in local hooks, the GitHub Action in pull requests, or the Core
package inside your own tooling. All three use the `git-hygiene` configuration
in your repository's `package.json`.

## Start with one check

Follow the [Quickstart](getting-started.md) to install the CLI and validate your
first commit. Then choose the integration that matches your workflow:

| Task                                        | Guide                                       |
| ------------------------------------------- | ------------------------------------------- |
| Catch problems before committing or pushing | [Git hooks](guides/git-hooks.md)            |
| Enforce metadata on pull requests           | [GitHub Actions](guides/github-actions.md)  |
| Run individual checks or read JSON output   | [Commands](reference/cli.md)                |
| Change allowed types and validation rules   | [Configuration](reference/configuration.md) |
| Embed validation in a Node.js application   | [Core API](reference/core-api.md)           |

## What each check does

- **Branches:** accept configured base branches or an allowed type followed by
  `/` and a non-empty description, such as `feat/add-search`.
- **PR titles:** check the `type(scope?): description` shape, including an optional
  breaking-change marker. This is a format check; it does not run every commitlint rule.
- **Commits:** validate the message with commitlint rules derived from your configuration.
- **Release bumps:** recommend a version change from Git history. This does not
  change package versions, publish packages or create releases.

The published CLI and Core packages have runtime dependencies. The bundled
GitHub Action runs without an npm install; that is different from a dependency-free CLI.

## Find help and project information

For errors, start with [Troubleshooting](troubleshooting.md). The
website includes an interactive sandbox (use the Website link in the header);
use the real CLI to verify behavior against your repository's configuration.

Release history (linked in the footer) and
[GitHub issues](https://github.com/chitranklabs/git-hygiene/issues) live outside
this handbook. Maintainers can use the [development guide](development.md) and
[website deployment guide](deployment.md).

## Reading with an AI agent

Give an agent a relevant guide URL or its **Copy Page** content. Generated
[llms.txt](https://githygiene.chitrankagnihotri.com/docs/llms.txt) lists the guides;
[llms-full.txt](https://githygiene.chitrankagnihotri.com/docs/llms-full.txt) contains
all published reading content. Treat examples as reference, and verify commands
against the installed git-hygiene version before executing them.
