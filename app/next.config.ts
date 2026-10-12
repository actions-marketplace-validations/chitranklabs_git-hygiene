import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return {
      afterFiles: [
        { source: '/docs/', destination: '/docs/index.html' },
        { source: '/docs/:path*', destination: '/docs/:path*/index.html' },
        { source: '/llms-full.txt', destination: '/docs/llms-full.txt' },
      ],
    };
  },
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
