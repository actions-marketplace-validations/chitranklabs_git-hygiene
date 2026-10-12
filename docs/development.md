---
title: Contributing
description: Build the CLI, Core package and website locally and verify changes before contributing.
---

This repository contains two published packages and a private website. Its
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

## Work on the website or handbook

```bash
pnpm --filter git-hygiene-app dev
```

This starts the landing-page development server on port `3005`. To inspect the
handbook and website together, build and serve the production output:

```bash
pnpm --filter git-hygiene-app build
pnpm --filter git-hygiene-app start
```

Open `http://127.0.0.1:3005/docs/` for the handbook. Rebuild after changing Markdown,
configuration, theme tokens or fonts. This path intentionally verifies the same
Next.js build served on Vercel.

## Keep the visual identity shared

`app/src/styles/theme-tokens.css` owns the website's light and dark color values.
The website imports it directly. The docs build derives `light-dark()` tokens
from that file and reuses the website's compiled Geist and JetBrains Mono fonts.
Change tokens there; do not maintain a second palette in `docs/`.

## Verify changes

```bash
pnpm build
pnpm test
pnpm lint
pnpm --filter git-hygiene-app test:seo
```

The repository build includes the action bundle. Tests and linting should match
the files affected by your change. Website SEO checks use the production Next.js server and verify the handbook's discovery assets, links and metadata.

## Preserve changelog inputs

The website's prebuild step generates its release dataset using git-cliff when
available. It retains the checked-in dataset when git-cliff is unavailable.
Maintainers updating release history need git-cliff, Git history and tags; a
successful website build alone does not prove the history was regenerated.

See [Website deployment](deployment.md) for production settings and cutover steps.
