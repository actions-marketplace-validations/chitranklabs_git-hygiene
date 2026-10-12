# git-hygiene website

The private Next.js application contains the landing page, interactive sandbox
and changelog. Its production build also renders the `docs/` handbook using the
published Monoline Docs package. Hosting remains on Vercel with the normal Next.js build.
Neither application output nor Monoline Docs ships in the CLI/Core npm packages.

## Local development

Use Node.js 24.14+ and the pnpm version in the root package manifest.

```bash
pnpm install --frozen-lockfile
pnpm --filter git-hygiene-app dev
```

The development server runs on port `3005`. For the complete website and handbook:

```bash
pnpm --filter git-hygiene-app build
pnpm --filter git-hygiene-app start
```

## Guides

- [Contributor workflow](../docs/development.md): workspace ownership, shared tokens, fonts and checks.
- [Deployment](../docs/deployment.md): Vercel hosting and Cloudflare Web Analytics.
- [Handbook](../docs/index.md): product documentation sources and navigation.

The prebuild step runs `scripts/generate-web-changelog.mjs` and
`app/scripts/sync-identity.mjs`. Changelog generation requires git-cliff and Git
history/tags; otherwise it preserves the existing dataset. Identity sync retains
its local fallback if the remote source is unavailable. Do not edit generated
changelog data to change release history.
