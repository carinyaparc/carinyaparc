import { withPayload } from '@payloadcms/next/withPayload';
import { withSentryConfig } from '@sentry/nextjs';
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  trailingSlash: true,

  async redirects() {
    return [{ source: '/favicon.ico', destination: '/favicon/favicon.ico', permanent: true }];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    remotePatterns: [],
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/api/media/file/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    return webpackConfig;
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const mdxConfig = withMDX(nextConfig);
const payloadConfig = withPayload(mdxConfig, { devBundleServerPackages: false });

const finalConfig =
  process.env.NODE_ENV === 'production'
    ? withSentryConfig(payloadConfig, {
        org: process.env.SENTRY_ORG || 'carinya-parc',
        project: process.env.SENTRY_PROJECT || 'carinyaparc',
        authToken: process.env.SENTRY_AUTH_TOKEN,
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
    : payloadConfig;

export default finalConfig;
