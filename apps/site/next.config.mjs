import { withSentryConfig } from '@sentry/nextjs';
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  trailingSlash: true,
  transpilePackages: ['@repo/ui'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization settings
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24, // 1 day
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

// Configure MDX options
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Merge MDX config with Next.js config
const mdxConfig = withMDX(nextConfig);

// Only apply Sentry wrapper in production
const finalConfig =
  process.env.NODE_ENV === 'production'
    ? withSentryConfig(mdxConfig, {
        org: 'carinya-parc-pty-ltd',
        project: 'javascript-nextjs',
        silent: !process.env.CI,
        widenClientFileUpload: true,
        tunnelRoute: '/monitoring',
        webpack: {
          treeshake: {
            removeDebugLogging: true,
          },
          automaticVercelMonitors: true,
        },
      })
    : mdxConfig;

export default finalConfig;
