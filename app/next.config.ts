import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
  transpilePackages: ['@chitrank2050/monoline-ui'],
  poweredByHeader: false,
  compress: true,
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      '@chitrank2050/monoline-ui',
      '@radix-ui/react-slot',
      'prismjs',
      'clsx',
      'tailwind-merge',
    ],
  },
};

export default nextConfig;
