import '@/src/styles/pages/recipes.css';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';
import { getCachedRecipeBySlug, getCachedRecipeSlugs } from '@/lib/payload/cache';
import { mapPayloadRecipeToDetail, resolveAuthorName } from '@/lib/payload/map-content';
import { formatIsoDuration } from '@/lib/recipes/format-duration';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getCachedRecipeBySlug(slug);

  if (!recipe) {
    return {
      title: 'Recipe Not Found - Carinya Parc',
      description: 'The requested recipe could not be found.',
    };
  }

  const description = recipe.description ?? recipe.excerpt;
  const author = resolveAuthorName(recipe.author);

  return {
    title: `${recipe.title} - Recipe - Carinya Parc`,
    description,
    openGraph: {
      title: recipe.title,
      description,
      type: 'article',
      publishedTime: recipe.date,
      authors: author ? [author] : undefined,
    },
  };
}

export const revalidate = 86_400;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getCachedRecipeSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payloadRecipe = await getCachedRecipeBySlug(slug);
  const recipe = payloadRecipe ? mapPayloadRecipeToDetail(payloadRecipe) : null;

  if (!recipe) {
    notFound();
  }

  const recipeData = {
    name: recipe.title,
    description: recipe.description,
    author: recipe.author,
    datePublished: recipe.date,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.servings?.toString(),
    recipeIngredient: recipe.ingredients,
  };

  return (
    <>
      <SchemaMarkup
        type="recipe"
        data={{
          recipe: recipeData,
        }}
      />

      <main className="isolate min-h-screen">
        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          <div className="container mx-auto max-w-4xl px-4">
            <Breadcrumb />

            <article className="recipe-prose">
              <h1>{recipe.title}</h1>

              <div className="recipe-meta">
                {recipe.servings && (
                  <div className="recipe-meta-item">
                    <span className="recipe-meta-label">Servings</span>
                    <span className="recipe-meta-value">{recipe.servings}</span>
                  </div>
                )}
                {recipe.prepTime && (
                  <div className="recipe-meta-item">
                    <span className="recipe-meta-label">Prep Time</span>
                    <span className="recipe-meta-value">{formatIsoDuration(recipe.prepTime)}</span>
                  </div>
                )}
                {recipe.cookTime && (
                  <div className="recipe-meta-item">
                    <span className="recipe-meta-label">Cook Time</span>
                    <span className="recipe-meta-value">{formatIsoDuration(recipe.cookTime)}</span>
                  </div>
                )}
                {recipe.totalTime && (
                  <div className="recipe-meta-item">
                    <span className="recipe-meta-label">Total Time</span>
                    <span className="recipe-meta-value">{formatIsoDuration(recipe.totalTime)}</span>
                  </div>
                )}
              </div>

              {recipe.ingredients.length > 0 && (
                <div className="recipe-ingredients">
                  <h2>Ingredients</h2>
                  <ul>
                    {recipe.ingredients.map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.instructions.length > 0 && (
                <div className="recipe-instructions">
                  <h2>Instructions</h2>
                  <ol>
                    {recipe.instructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="blog-tags">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="blog-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
