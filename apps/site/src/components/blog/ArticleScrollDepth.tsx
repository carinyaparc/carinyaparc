'use client';

import { useEffect, useRef } from 'react';

import {
  SCROLL_DEPTH_THRESHOLDS,
  trackArticleScrollDepth,
  type ScrollDepth,
} from '@/lib/analytics';

/**
 * Fires `article_scroll_depth` at 25/50/75/100% of the enclosing `<article>`,
 * once per threshold per mount. Consent-gated via analytics helpers.
 */
export function ArticleScrollDepth() {
  const firedRef = useRef<Set<ScrollDepth>>(new Set());

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) {
      return;
    }

    const onScrollOrResize = () => {
      const percent = getArticleScrollPercent(article);

      for (const threshold of SCROLL_DEPTH_THRESHOLDS) {
        if (percent >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold);
          trackArticleScrollDepth({ depth: threshold });
        }
      }
    };

    onScrollOrResize();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return null;
}

/** Viewport-bottom progress through the article (0–100). */
export function getArticleScrollPercent(article: HTMLElement): number {
  const rect = article.getBoundingClientRect();
  const articleTop = window.scrollY + rect.top;
  const articleHeight = article.offsetHeight;

  if (articleHeight <= 0) {
    return 0;
  }

  const viewportBottom = window.scrollY + window.innerHeight;
  const scrolled = viewportBottom - articleTop;
  return Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
}
