import Image from 'next/image';
import Link from 'next/link';

import { resolveAuthorImageUrl, resolveAuthorName } from '@/lib/payload/map-content';
import type { Post as PayloadPost } from '@/payload-types';

const AUTHOR_BIO_HREF = '/about/jonathan/';
const PROPERTY_HREF = '/about/the-property/';

const DEFAULT_BIO = 'Strategic leader turned regenerative farmer, and the founder of Carinya Parc.';

function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function resolveBio(author: PayloadPost['author']): string {
  if (author && typeof author === 'object' && author.bio) {
    return author.bio;
  }

  return DEFAULT_BIO;
}

export interface AuthorBlockProps {
  author: PayloadPost['author'];
}

/**
 * End-of-article credibility block: photo, one-line bio, and links to the
 * author and property pages.
 */
export function AuthorBlock({ author }: AuthorBlockProps) {
  const authorName = resolveAuthorName(author);
  const authorImageUrl = resolveAuthorImageUrl(author);
  const bio = resolveBio(author);

  return (
    <aside
      className="mx-auto mt-12 flex max-w-[720px] gap-5 rounded-lg border border-line bg-fleece p-7 shadow-md"
      aria-labelledby="author-block-name"
    >
      <span className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-pill bg-eucalypt-100 font-heading text-[22px] text-eucalypt-700">
        {authorImageUrl ? (
          <Image src={authorImageUrl} alt="" fill className="object-cover" sizes="60px" />
        ) : (
          authorInitials(authorName)
        )}
      </span>
      <div className="min-w-0">
        <p id="author-block-name" className="font-heading text-xl text-bark">
          {authorName}
        </p>
        <p className="mt-1 truncate text-[14.5px] leading-relaxed text-stone">{bio}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
          <Link
            href={AUTHOR_BIO_HREF}
            className="font-semibold text-bracken-500 transition-opacity hover:opacity-70"
          >
            About {authorName.split(/\s+/)[0] ?? authorName}
          </Link>
          <Link
            href={PROPERTY_HREF}
            className="font-semibold text-bracken-500 transition-opacity hover:opacity-70"
          >
            The property
          </Link>
        </p>
      </div>
    </aside>
  );
}
