import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SITE_ROOT = path.resolve(import.meta.dirname, '../../..');
const SRC_ROOT = path.join(SITE_ROOT, 'src');

const HERO = path.join(SRC_ROOT, 'components/sections/hero/Hero.tsx');
const HERO_BACKGROUND_IMAGE = path.join(
  SRC_ROOT,
  'components/sections/hero/HeroBackgroundImage.tsx',
);
const SITE_ROOT_LAYOUT = path.join(SRC_ROOT, 'components/layouts/site-root-layout.tsx');
const PROVIDERS = path.join(SRC_ROOT, 'providers/Providers.tsx');
const CONTACT_FORM_SECTION = path.join(
  SRC_ROOT,
  'components/sections/forms/ContactFormSection.tsx',
);
const SITE_STATIC_SHELL = path.join(SRC_ROOT, 'components/layouts/site-static-shell.tsx');
const PAGE_HEADER = path.join(SRC_ROOT, 'components/sections/page-header/PageHeader.tsx');
const HEADER = path.join(SRC_ROOT, 'components/sections/header/Header.tsx');

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

function hasUseClientDirective(source: string): boolean {
  return /^\s*['"]use client['"]\s*;?/m.test(source);
}

describe('client JavaScript diet', () => {
  it('renders hero copy in the initial HTML shell', () => {
    const source = readSource(HERO);

    expect(source).not.toMatch(/HeroContentMotion/);
  });

  it('renders the hero background image from a server module', () => {
    const source = readSource(HERO_BACKGROUND_IMAGE);

    expect(hasUseClientDirective(source)).toBe(false);
    expect(source).not.toMatch(/framer-motion/);
    expect(source).toMatch(/next\/image/);
  });

  it('does not mount QueryClientProvider globally in the site root layout', () => {
    const layoutSource = readSource(SITE_ROOT_LAYOUT);
    const providersSource = readSource(PROVIDERS);

    expect(layoutSource).not.toMatch(/QueryClientProvider/);
    expect(providersSource).not.toMatch(/QueryClientProvider/);
  });

  it('scopes QueryClientProvider to form components that use React Query', () => {
    const contactFormSource = readSource(CONTACT_FORM_SECTION);

    expect(contactFormSource).toMatch(/FormQueryProvider/);
    expect(contactFormSource).toMatch(/useMutation/);
  });

  it('does not preconnect to Google Fonts CDN in the public layout shell', () => {
    const source = readSource(SITE_STATIC_SHELL);

    expect(source).not.toMatch(/https:\/\/fonts\.googleapis\.com/);
    expect(source).not.toMatch(/https:\/\/fonts\.gstatic\.com/);
  });

  it('renders PageHeader as a server shell without framer-motion', () => {
    const source = readSource(PAGE_HEADER);

    expect(hasUseClientDirective(source)).toBe(false);
    expect(source).not.toMatch(/framer-motion/);
  });

  it('renders the site header logo without entry animations on first paint', () => {
    const source = readSource(HEADER);

    expect(source).not.toMatch(/initial=\{\{\s*opacity:\s*0/);
    expect(source).not.toMatch(/animate=\{\{\s*opacity:\s*1/);
  });
});
