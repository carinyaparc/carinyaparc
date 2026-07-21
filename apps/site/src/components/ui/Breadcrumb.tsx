'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { generateBreadcrumbsFromPath } from '@/lib/schema/breadcrumb';
import { cn } from '@/lib/cn';

interface BreadcrumbProps {
  /** Custom breadcrumb items to override automatic generation */
  items?: Array<{ name: string; url: string }>;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show on home page (default: false) */
  showOnHome?: boolean;
}

export function Breadcrumb({ items, className, showOnHome = false }: BreadcrumbProps) {
  const pathname = usePathname();

  // Don't show on home unless explicitly requested
  if (pathname === '/' && !showOnHome) {
    return null;
  }

  // Use provided items or generate from pathname
  const breadcrumbItems =
    items || generateBreadcrumbsFromPath(pathname).map(({ name, url }) => ({ name, url }));

  // Don't render if only home
  if (breadcrumbItems.length <= 1 && !showOnHome) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-6', className)}>
      <ol className="flex items-center space-x-2 text-sm text-stone">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.url} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-2 h-4 w-4 text-stone" aria-hidden="true" />}
              {isLast ? (
                <span className="font-medium text-bark" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url.replace(/^https?:\/\/[^/]+/, '')} // Convert absolute to relative
                  className="hover:text-bark transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
