import Link from 'next/link';

import { cn } from '@/lib/cn';

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  categorySlug?: string;
}

function pageHref(page: number, categorySlug?: string): string {
  const base = page <= 1 ? '/blog/' : `/blog/page/${page}/`;
  if (!categorySlug) {
    return base;
  }

  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}category=${encodeURIComponent(categorySlug)}`;
}

export default function PaginationNav({ currentPage, totalPages, categorySlug }: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Blog pages" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1, categorySlug)}
          rel="prev"
          className="rounded-pill px-4 py-2 text-sm font-semibold text-eucalypt-600 transition-colors hover:bg-eucalypt-50"
        >
          ← Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page, categorySlug)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'rounded-pill px-3.5 py-2 text-sm font-semibold transition-colors',
            page === currentPage
              ? 'bg-eucalypt-600 text-primary-foreground'
              : 'text-eucalypt-600 hover:bg-eucalypt-50',
          )}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1, categorySlug)}
          rel="next"
          className="rounded-pill px-4 py-2 text-sm font-semibold text-eucalypt-600 transition-colors hover:bg-eucalypt-50"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
