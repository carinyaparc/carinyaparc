/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const trackArticleScrollDepth = vi.fn();

vi.mock('@/lib/analytics', () => ({
  SCROLL_DEPTH_THRESHOLDS: [25, 50, 75, 100],
  trackArticleScrollDepth: (...args: unknown[]) => trackArticleScrollDepth(...args),
}));

function stubArticle(height: number, top: number): HTMLElement {
  const article = document.createElement('article');
  Object.defineProperty(article, 'offsetHeight', { value: height });
  article.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      height,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(article);
  return article;
}

describe('ArticleScrollDepth', () => {
  let container: HTMLDivElement;
  let root: Root;
  let article: HTMLElement | null = null;
  let ArticleScrollDepth: typeof import('@/features/blog/components/ArticleScrollDepth').ArticleScrollDepth;
  let getArticleScrollPercent: typeof import('@/features/blog/components/ArticleScrollDepth').getArticleScrollPercent;

  beforeEach(async () => {
    vi.resetModules();
    trackArticleScrollDepth.mockReset();

    const mod = await import('@/features/blog/components/ArticleScrollDepth');
    ArticleScrollDepth = mod.ArticleScrollDepth;
    getArticleScrollPercent = mod.getArticleScrollPercent;

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    article?.remove();
    article = null;
  });

  it('computes scroll percent from article bounds', () => {
    article = stubArticle(2000, 0);
    expect(getArticleScrollPercent(article)).toBe(25);

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1500, writable: true });
    article.getBoundingClientRect = () =>
      ({
        top: -1500,
        bottom: 500,
        height: 2000,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: -1500,
        toJSON: () => ({}),
      }) as DOMRect;
    expect(getArticleScrollPercent(article)).toBe(100);
  });

  it('fires each depth threshold once while scrolling', async () => {
    article = stubArticle(2000, 0);

    await act(async () => {
      root.render(<ArticleScrollDepth />);
    });

    await vi.waitFor(() => {
      expect(trackArticleScrollDepth).toHaveBeenCalledWith({ depth: 25 });
    });

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500, writable: true });
    article.getBoundingClientRect = () =>
      ({
        top: -500,
        bottom: 1500,
        height: 2000,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: -500,
        toJSON: () => ({}),
      }) as DOMRect;

    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });

    await vi.waitFor(() => {
      expect(trackArticleScrollDepth).toHaveBeenCalledWith({ depth: 50 });
    });

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000, writable: true });
    article.getBoundingClientRect = () =>
      ({
        top: -1000,
        bottom: 1000,
        height: 2000,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: -1000,
        toJSON: () => ({}),
      }) as DOMRect;

    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });

    await vi.waitFor(() => {
      expect(trackArticleScrollDepth).toHaveBeenCalledWith({ depth: 75 });
    });

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1500, writable: true });
    article.getBoundingClientRect = () =>
      ({
        top: -1500,
        bottom: 500,
        height: 2000,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: -1500,
        toJSON: () => ({}),
      }) as DOMRect;

    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
    });

    await vi.waitFor(() => {
      expect(trackArticleScrollDepth).toHaveBeenCalledWith({ depth: 100 });
    });

    expect(trackArticleScrollDepth).toHaveBeenCalledTimes(4);
  });
});
