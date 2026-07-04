import Link from 'next/link';

import { cn } from '@/lib/cn';

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
}

function pageHref(page: number): string {
  return page <= 1 ? '/blog/' : `/blog/page/${page}/`;
}

export default function PaginationNav({ currentPage, totalPages }: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Blog pages" className="mt-16 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          rel="prev"
          className="rounded-md px-3 py-2 text-sm font-semibold text-eucalyptus-600 hover:bg-eucalyptus-100"
        >
          ← Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'rounded-md px-3.5 py-2 text-sm font-semibold',
            page === currentPage
              ? 'bg-eucalyptus-600 text-white'
              : 'text-eucalyptus-600 hover:bg-eucalyptus-100',
          )}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          rel="next"
          className="rounded-md px-3 py-2 text-sm font-semibold text-eucalyptus-600 hover:bg-eucalyptus-100"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
