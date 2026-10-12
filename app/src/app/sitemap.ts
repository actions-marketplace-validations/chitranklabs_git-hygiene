import type { MetadataRoute } from 'next';

import { siteRoutes, siteUrl } from '@/src/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map(route => ({
    url: new URL(route, `${siteUrl}/`).toString(),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  }));
}
