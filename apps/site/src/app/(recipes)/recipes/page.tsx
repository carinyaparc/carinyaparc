import type { Metadata } from 'next';

import { PageHeader } from '@/src/components/sections/page-header';
import { RecipeGrid } from '@/src/components/sections/recipes';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';
import { generatePageMetadata } from '@/src/lib/metadata';

const pageHeaderProps = {
  variant: 'dark' as const,
  align: 'center' as const,
  title: 'From the Hearth',
  subtitle: 'Our Recipes',
  description:
    'Seasonal recipes from the Carinya Parc kitchen — simple, honest cooking built around what the land provides.',
  backgroundImage: '/images/farm-dam-trees.jpg',
  backgroundImageAlt: 'Farm dam and trees at Carinya Parc',
};

export const metadata: Metadata = generatePageMetadata({
  title: 'Recipes',
  description:
    'Seasonal recipes from the Carinya Parc kitchen — simple, honest cooking built around what the land provides.',
  path: '/recipes',
  keywords: ['farm recipes', 'seasonal cooking', 'regenerative produce'],
});

export const revalidate = 86_400;

export default async function RecipesPage() {
  return (
    <>
      <SchemaMarkup type="page" />

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb />
        </div>

        <section>
          <PageHeader {...pageHeaderProps} />
        </section>

        <section className="py-20 bg-white">
          <RecipeGrid
            title="Latest Recipes"
            subtitle="Cooking from the paddock to the plate, one season at a time"
          />
        </section>
      </div>
    </>
  );
}
