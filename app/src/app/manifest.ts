import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'git-hygiene | Zero-Dependency Git Metadata Validator',
    short_name: 'git-hygiene',
    description: 'The ultimate zero-dependency metadata validator for modern Git workflows.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      {
        src: '/icon.png',
        sizes: '460x460',
        type: 'image/png',
      },
    ],
  };
}
