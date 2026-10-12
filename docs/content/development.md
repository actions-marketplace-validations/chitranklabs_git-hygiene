---
title: Contributing
description: Build the CLI, Core package and website locally and verify changes before contributing.
---

This repository contains two published packages, a private website and a separate handbook. Its
Markdown handbook is built with the published Monoline Docs package.

## Set up the workspace

Use Node.js **24.14 or newer** and the pnpm version in root `package.json`'s
`packageManager` field. Clone the repository and install its recorded dependencies:

```bash
git clone https://github.com/chitranklabs/git-hygiene.git
cd git-hygiene
pnpm install --frozen-lockfile
```

The prepare hook installs Lefthook. Contributor behavior and review expectations
are documented in [CONTRIBUTING.md](https://github.com/chitranklabs/git-hygiene/blob/main/CONTRIBUTING.md).

## Workspace ownership

| Location                       | Owns                                             |
| ------------------------------ | ------------------------------------------------ |
| `packages/core`                | Configuration resolution and validation engine   |
| `packages/cli`                 | Command-line arguments and process exit behavior |
| `action.yml`, `dist/action.js` | Composite action and bundled runtime             |
| `app`                          | Next.js landing page, sandbox and changelog      |
| `docs`                         | Monoline Docs handbook sources and navigation    |

The website and handbook are private application output, not files shipped in
the CLI or Core npm tarballs.

## Work on the website

```bash
pnpm --filter git-hygiene-app dev
```

The Next.js development server runs on port `3005`. Its build and routes belong
to `app/`; it does not generate or serve the handbook.

## Work on the handbook

```bash
pnpm --filter git-hygiene-docs build
pnpm --filter git-hygiene-docs dev
```

Monoline Docs owns preview, rendering, search and exports. Open the URL printed
by its preview command. It needs no Next.js build or Vercel output directory.

## Keep the visual identity shared

`assets/theme-tokens.css` owns the light and dark website color values.
The website imports it directly. Monoline Docs loads `assets/docs.css`, which
imports those same tokens and adapts the muted-text token for the docs shell.
Change the shared token source rather than maintaining a second palette.
The handbook's typography is configured through Monoline Docs' appearance settings.

## Verify changes

```bash
pnpm build
pnpm test
pnpm lint
pnpm --filter git-hygiene-app test:seo
```

The repository build includes the action bundle. Tests and linting should match
the files affected by your change. Website SEO checks use the production Next.js server. The independent handbook build validates its content, links and configuration.

## Preserve changelog inputs

The website's prebuild step generates its release dataset using git-cliff when
available. It retains the checked-in dataset when git-cliff is unavailable.
Maintainers updating release history need git-cliff, Git history and tags; a
successful website build alone does not prove the history was regenerated.

See [Website deployment](deployment.md) for independent deployment settings.
