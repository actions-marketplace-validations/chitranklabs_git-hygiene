import type { MetadataRoute } from 'next';

import { siteRoutes, siteUrl } from '@/src/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...siteRoutes,
    '/docs/',
    '/docs/getting-started/',
    '/docs/guides/git-hooks/',
    '/docs/guides/github-actions/',
    '/docs/reference/cli/',
    '/docs/reference/configuration/',
    '/docs/reference/core-api/',
    '/docs/troubleshooting/',
    '/docs/development/',
    '/docs/deployment/',
  ].map(route => ({
    url: new URL(route, `${siteUrl}/`).toString(),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  }));
}
