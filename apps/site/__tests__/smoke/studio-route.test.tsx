/**
 * Smoke tests for Sanity Studio route
 * Validates file structure, imports, and client component directive
 *
 * @module __tests__/smoke
 */

import { describe, it, expect } from 'vitest';
import { readFile, access } from 'fs/promises';
import { join } from 'node:path';

const STUDIO_ROUTE_PATH = join(process.cwd(), 'src/app/studio/[[...tool]]/page.tsx');

describe('Studio route smoke tests', () => {
  describe('File Structure', () => {
    it('route file exists at correct path (AC-001)', async () => {
      await expect(access(STUDIO_ROUTE_PATH)).resolves.not.toThrow();
    });

    it('route uses catch-all dynamic segments (AC-003)', () => {
      expect(STUDIO_ROUTE_PATH).toContain('[[...tool]]');
    });
  });

  describe('File Contents', () => {
    it('marks route as client component (FR-003)', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain("'use client'");
    });

    it('imports NextStudio from correct package (FR-004)', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('next-sanity/studio');
      expect(content).toContain('NextStudio');
    });

    it('imports configuration from sanity.config (FR-005)', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('sanity.config');
    });

    it('exports dynamic route config (FR-006)', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain("export const dynamic = 'force-dynamic'");
    });

    it('exports metadata (FR-007)', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('export const metadata');
      expect(content).toContain('Metadata');
    });

    it('exports viewport (FR-008)', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('export const viewport');
      expect(content).toContain('Viewport');
    });

    it('exports default StudioPage component', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('export default function StudioPage');
    });

    it('renders NextStudio with config', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('<NextStudio config={config}');
    });
  });

  describe('Documentation', () => {
    it('includes JSDoc comments', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('/**');
      expect(content).toContain('@module');
    });

    it('documents requirement traceability', async () => {
      const content = await readFile(STUDIO_ROUTE_PATH, 'utf-8');
      expect(content).toContain('@implements FR-');
    });
  });
});
