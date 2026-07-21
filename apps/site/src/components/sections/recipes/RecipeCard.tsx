import Image from 'next/image';
import Link from 'next/link';

import type { RecipeListItem } from '@/lib/payload/map-content';
import { formatIsoDuration } from '@/lib/recipes/format-duration';

interface RecipeCardProps {
  recipe: RecipeListItem;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const meta = [
    recipe.servings ? `Serves ${recipe.servings}` : null,
    recipe.totalTime ? formatIsoDuration(recipe.totalTime) : null,
  ].filter(Boolean);

  return (
    <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-eucalypt-600 px-8 pt-80 pb-8 sm:pt-48 lg:pt-80">
      <Image
        alt={recipe.title}
        src={recipe.imageUrl}
        fill
        loading="lazy"
        className="absolute inset-0 -z-10 object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        quality={80}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-eucalypt-600 via-eucalypt-600/40" />
      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-eucalypt-600/10 ring-inset" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 overflow-hidden text-sm/6 text-eucalypt-200">
        <time dateTime={recipe.datetime}>{recipe.formattedDate}</time>
        {meta.length > 0 && <span>{meta.join(' • ')}</span>}
      </div>
      <h3 className="mt-3 text-lg/6 font-semibold text-white">
        <Link href={recipe.href}>
          <span>
            <span className="absolute inset-0" />
            {recipe.title}
          </span>
        </Link>
      </h3>
      {recipe.description && (
        <p className="mt-2 line-clamp-2 text-sm/6 text-eucalypt-100">{recipe.description}</p>
      )}
    </article>
  );
}
