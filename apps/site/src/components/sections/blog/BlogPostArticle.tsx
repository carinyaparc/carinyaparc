import Link from 'next/link';
import Image from 'next/image';

import DateComponent from '@/components/ui/Date';
import {
  resolveAuthorImageUrl,
  resolveAuthorName,
  resolveCategoryName,
} from '@/lib/payload/map-content';
import type { Post as PayloadPost } from '@/payload-types';

function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface BlogPostHeaderProps {
  post: PayloadPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const authorName = resolveAuthorName(post.author);
  const category = resolveCategoryName(post.category) ?? 'Journal';

  return (
    <header className="mx-auto max-w-[720px] px-6 pt-14 text-center lg:px-0">
      <Link
        href="/blog/"
        className="text-sm font-semibold text-bracken-500 transition-opacity hover:opacity-70"
      >
        ← Life on pasture
      </Link>
      <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
        {category}
      </p>
      <h1 className="mt-3.5 font-heading text-[40px] font-normal leading-[1.08] text-balance text-eucalypt-600 sm:text-[50px]">
        {post.title}
      </h1>
      <div className="mt-6 flex items-center justify-center gap-3 text-[14.5px] text-stone">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-eucalypt-100 font-heading text-base text-eucalypt-700">
          {authorInitials(authorName)}
        </span>
        <span>
          {authorName} · <DateComponent dateString={post.date} />
        </span>
      </div>
    </header>
  );
}

interface BlogAuthorCardProps {
  author: PayloadPost['author'];
}

export function BlogAuthorCard({ author }: BlogAuthorCardProps) {
  const authorName = resolveAuthorName(author);
  const authorImageUrl = resolveAuthorImageUrl(author);
  const bio =
    author && typeof author === 'object' && author.bio
      ? author.bio
      : 'Strategic leader turned regenerative farmer, and the founder of Carinya Parc.';

  return (
    <aside className="mx-auto mt-12 flex max-w-[720px] gap-5 rounded-lg border border-line bg-fleece p-7 shadow-md">
      <span className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-pill bg-eucalypt-100 font-heading text-[22px] text-eucalypt-700">
        {authorImageUrl ? (
          <Image src={authorImageUrl} alt="" fill className="object-cover" sizes="60px" />
        ) : (
          authorInitials(authorName)
        )}
      </span>
      <div>
        <p className="font-heading text-xl text-bark">{authorName}</p>
        <p className="mt-1 text-[14.5px] leading-relaxed text-stone">{bio}</p>
      </div>
    </aside>
  );
}
