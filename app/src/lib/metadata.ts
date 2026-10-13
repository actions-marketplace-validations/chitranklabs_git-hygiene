import type { Metadata } from 'next';

import { siteUrl } from './seo';

export const socialImage = {
  url: new URL('/git-hygiene-og.png', `${siteUrl}/`).toString(),
  width: 1024,
  height: 800,
  alt: 'git-hygiene commit, branch and pull request title validator',
} as const;

interface PageMetadataInput {
  title: string;
  description: string;
  path: `/${string}`;
  absoluteTitle?: boolean;
}

function absoluteUrl(path: `/${string}`) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    openGraph: {
      type: 'website',
      url,
      siteName: 'git-hygiene',
      title,
      description,
      locale: 'en_US',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
