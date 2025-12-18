import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

const sharedConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      // More specific aliases first
      '@/src/app': resolve(__dirname, './src/app'),
      '@/src/components': resolve(__dirname, './src/components'),
      '@/src/lib': resolve(__dirname, './src/lib'),
      '@/src/types': resolve(__dirname, './src/types'),
      '@/src/hooks': resolve(__dirname, './src/hooks'),
      '@/src/utils': resolve(__dirname, './src/utils'),
      '@/src/styles': resolve(__dirname, './src/styles'),
      '@/src': resolve(__dirname, './src'),
      // Then general aliases
      '@/app': resolve(__dirname, './src/app'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/types': resolve(__dirname, './src/types'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/styles': resolve(__dirname, './src/styles'),
      '@': resolve(__dirname, './src'),
      // Test utilities
      'test-utils': resolve(__dirname, './__tests__/helpers/renderWithProviders.tsx'),
      // Mock server-only package for tests
      'server-only': resolve(__dirname, './__tests__/mocks/server-only.js'),
    },
  },
  define: {
    'process.env': process.env,
  },
};

export default defineConfig({
  ...sharedConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup/vitest.setup.ts'],
    include: [
      './src/**/*.test.{ts,tsx}', // Colocated unit tests
      './__tests__/integration/**/*.test.{ts,tsx}',
      './__tests__/smoke/**/*.test.{ts,tsx}',
      './__tests__/security/**/*.test.{ts,tsx}',
    ],
    css: true, // Enable CSS but with simplified processing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/setup/',
        '__tests__/mocks/',
        '__tests__/fixtures/',
        '__tests__/helpers/',
        '.next/',
        '.turbo/',
        'coverage/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/instrumentation*.ts',
        'sentry.*.config.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
    deps: {
      external: ['@sentry/nextjs'],
    },
  },
});
