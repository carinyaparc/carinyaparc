'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

export type JournalCategory = {
  name: string;
  slug: string;
};

interface JournalCategoryFilterProps {
  categories: JournalCategory[];
  activeSlug?: string;
  basePath?: string;
}

function categoryHref(basePath: string, slug?: string): string {
  if (!slug) {
    return basePath;
  }

  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}category=${encodeURIComponent(slug)}`;
}

export function JournalCategoryFilter({
  categories,
  activeSlug,
  basePath = '/blog/',
}: JournalCategoryFilterProps) {
  const pathname = usePathname();
  const hrefBase = pathname.startsWith('/blog/page/') ? pathname : basePath;

  if (categories.length === 0) {
    return null;
  }

  const chips = [{ name: 'All', slug: undefined }, ...categories.map((c) => ({ ...c, slug: c.slug }))];

  return (
    <section className="pb-1 pt-4">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2.5 px-6 lg:px-14">
        <span className="mr-1.5 text-[13px] font-semibold text-stone">Browse:</span>
        {chips.map((chip) => {
          const isActive = chip.slug ? activeSlug === chip.slug : !activeSlug;

          return (
            <Link
              key={chip.slug ?? 'all'}
              href={categoryHref(hrefBase, chip.slug)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'rounded-pill border px-[18px] py-2 text-[13.5px] font-semibold transition-colors',
                isActive
                  ? 'border-eucalypt-600 bg-eucalypt-600 text-primary-foreground'
                  : 'border-line bg-fleece text-charcoal hover:border-eucalypt-300 hover:text-eucalypt-700',
              )}
            >
              {chip.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
