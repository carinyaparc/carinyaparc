import { getCachedRecipes } from '@/lib/payload/cache';

import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  title: string;
  subtitle: string;
}

export async function RecipeGrid({ title, subtitle }: RecipeGridProps) {
  let recipes;
  try {
    recipes = await getCachedRecipes();
  } catch {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-eucalyptus-600 sm:text-5xl">
          {title}
        </h2>
        <p className="mt-2 text-lg/8 text-eucalyptus-300">{subtitle}</p>
      </div>

      {recipes.length > 0 ? (
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-lg text-charcoal-400">
          Recipes from the hearth are on their way — check back soon.
        </p>
      )}
    </div>
  );
}
