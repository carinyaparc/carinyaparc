import Link from 'next/link';

import { cn } from '@/lib/cn';
import { categoryUrl } from '@/lib/payload/urls';

export type BlogTopic = {
  name: string;
  slug: string;
};

type BlogTopicNavProps = {
  categories: BlogTopic[];
  activeSlug?: string;
};

export function BlogTopicNav({ categories, activeSlug }: BlogTopicNavProps) {
  if (categories.length === 0) {
    return null;
  }

  const chips: Array<{ name: string; slug?: string }> = [
    { name: 'All' },
    ...categories.map((category) => ({ name: category.name, slug: category.slug })),
  ];

  return (
    <nav aria-label="Blog categories" className="py-4 pb-1">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2.5 px-6 lg:px-14">
        <span className="mr-1.5 text-[13px] font-semibold text-charcoal">Browse:</span>
        {chips.map((chip) => {
          const isActive = chip.slug ? activeSlug === chip.slug : !activeSlug;
          const href = chip.slug ? categoryUrl(chip.slug) : '/blog/';

          return (
            <Link
              key={chip.slug ?? 'all'}
              href={href}
              aria-current={isActive ? 'page' : undefined}
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
    </nav>
  );
}
