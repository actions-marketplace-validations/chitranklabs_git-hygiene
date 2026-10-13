---
title: Deployment
navTitle: Deployment
seoTitle: Deploy the git-hygiene website and documentation
description: Deploy the Next.js website and the independent Monoline Docs handbook separately.
---

The website and handbook are separate applications. Each has its own build,
output and deployment. Neither build needs the other application's artifacts.

## Website on Vercel

Keep the existing Vercel project and `githygiene.chitrankagnihotri.com` domain.
Use `app` as the root directory and the existing Next.js framework preset.

```bash
pnpm --filter git-hygiene-app build
pnpm --filter git-hygiene-app start
```

`app/vercel.json` defines its build and production-only change detection.
Next.js owns website routes, sitemap, metadata, security headers and revalidation.

## Documentation site

Monoline Docs owns the handbook under `docs/`. Its CLI reads
`docs/monoline-docs.config.mjs`, which loads the content settings from
`docs/monoline-docs.yml`, builds `docs/content` and writes `docs/dist`.

```bash
pnpm --filter git-hygiene-docs build
pnpm --filter git-hygiene-docs dev
```

Publish the complete `docs/dist` directory as a separate static site at
`docs.githygiene.chitrankagnihotri.com`. Monoline Docs generates the handbook's
HTML, assets, search index, sitemap, robots file, Markdown exports and AI indexes.
There are no Next.js rewrites or post-build output modifications.

For a separate Vercel project, use `docs` as the root directory, the Other
framework preset and the settings in `docs/vercel.json`. Configure the custom
domain for this new project; do not move the website's existing domain.
The production Vercel alias and the former documentation hostname redirect to
`docs.githygiene.chitrankagnihotri.com` through project domain settings. Canonical
URLs and the documentation sitemap use this hostname.

## Cloudflare Web Analytics

Set `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` in the website Vercel project's
Production environment to the public beacon token registered for
`githygiene.chitrankagnihotri.com`, then redeploy. There is no token fallback in
source code. Without this variable the beacon is not loaded. Preview and local
builds do not load its beacon.
Cloudflare supplies pageviews and real-user performance measurements while
hosting stays on Vercel.

Register `docs.githygiene.chitrankagnihotri.com` as a separate Cloudflare Web
Analytics site. Set its public token as `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` in the
**docs** Vercel project's Production environment, then redeploy. The supported
Monoline Docs configuration passes it to `integrations.scripts` only in production.
There is no hardcoded token, custom builder or generated-HTML rewriting. Without
the variable, docs analytics stays off.

After deployment, verify a single beacon loads on the website and check its
Cloudflare dashboard. Browser privacy settings can block measurement. Remove
obsolete Umami environment variables after the replacement has been verified.

## Acceptance checks

Verify each deployment independently: HTTPS, canonical URLs, navigation, assets,
a real missing-page response, and its own sitemap and robots file. For the
handbook, also verify search, Copy Page and Markdown exports.

```bash
pnpm --filter git-hygiene-app test:seo
pnpm --filter git-hygiene-docs build
```
