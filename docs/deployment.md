---
title: Website deployment
description: Build the website and handbook on Vercel and configure Cloudflare Web Analytics.
---

Hosting remains on Vercel. Cloudflare provides Web Analytics, including pageviews
and real-user performance measurements; it does not host this website.

## Build and preview

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter git-hygiene-app build
pnpm --filter git-hygiene-app start
```

The normal Next.js build runs first. Monoline Docs generates the handbook in
`app/public/docs`, reusing compiled website fonts and shared theme tokens.
Next.js rewrites serve handbook pages at `/docs/` and its nested paths.
Generated handbook files are ignored by Git and recreated during deployment.

## Vercel configuration

Keep the existing Vercel project and custom domain. Use `app` as its root,
the Next.js framework preset and the build command in `app/vercel.json`.
Production deployment remains restricted to `main`; no DNS cutover is needed.

Identity and release fetching keep their existing Next.js revalidation behavior.
Security headers remain configured in `app/next.config.ts`.

## Cloudflare Web Analytics

The website and handbook use the public beacon token registered for
`githygiene.chitrankagnihotri.com`. Override it with
`NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` if the registered site changes.
Use the public beacon token, not a private Cloudflare API token.

The beacon loads in Vercel production deployments. Preview and local builds do
not record analytics. Cloudflare collects pageviews and performance measurements
without the former Umami tracker or its custom Web Vitals events. Remove obsolete
Umami variables from Vercel after the production beacon has been verified.

Verify a single beacon loads on the homepage and a handbook page, then check
Cloudflare Web Analytics. Browser privacy settings can block measurement.

## Discovery and verification

The root sitemap includes website and handbook pages. `robots.txt` references it.
Root `llms.txt` links to generated handbook indexes and Markdown exports.
The complete export is also available at `/llms-full.txt`.

```bash
pnpm --filter git-hygiene-app test:seo
```

Verify the homepage, changelog, nested handbook pages, theme persistence, search,
Copy Page and a missing URL before accepting a production deployment.
