/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Author } from '@/payload-types';

vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const author: Author = {
  id: 1,
  name: 'Jonathan Daddia',
  slug: 'jonathan-daddia',
  imageUrl: '/images/placeholder.jpg',
  bio: 'Strategic leader turned regenerative farmer.',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('AuthorBlock', () => {
  let container: HTMLDivElement;
  let root: Root;
  let AuthorBlock: typeof import('@/features/blog/components/AuthorBlock').AuthorBlock;

  beforeEach(async () => {
    vi.resetModules();
    ({ AuthorBlock } = await import('@/features/blog/components/AuthorBlock'));

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders name, photo, one-line bio, and about links', async () => {
    await act(async () => {
      root.render(<AuthorBlock author={author} />);
    });

    expect(container.textContent).toContain('Jonathan Daddia');
    expect(container.textContent).toContain('Strategic leader turned regenerative farmer.');

    const photo = container.querySelector('img');
    expect(photo?.getAttribute('src')).toBe('/images/placeholder.jpg');

    const links = Array.from(container.querySelectorAll('a')).map((el) => el.getAttribute('href'));
    expect(links).toContain('/about/jonathan/');
    expect(links).toContain('/about/the-property/');
  });

  it('falls back to initials when no author image is available', async () => {
    await act(async () => {
      root.render(<AuthorBlock author={{ ...author, imageUrl: null }} />);
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('JD');
  });
});
