export { metadata } from './metadata';

import { PageHeader } from '@/src/components/sections/page-header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LatestPosts, FeaturedPosts } from '@/src/components/sections/blog';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';

// Page header configuration
const pageHeaderProps = {
  variant: 'dark' as const,
  align: 'center' as const,
  title: 'Life on Pasture',
  subtitle: 'Our Blog',
  description:
    'Follow our regeneration journey through detailed updates, insights, and lessons learned as we transform Carinya Parc into a thriving ecosystem.',
  backgroundImage: '/images/farm-track-gate.jpg',
  backgroundImageAlt: 'Carinya Parc landscape',
};

// Available post categories
const categories = ['All', 'Soil Health', 'Biodiversity', 'Water Systems', 'Education', 'Wildlife'];

export const revalidate = 86_400;

export default async function BlogPage() {
  return (
    <>
      {/* Schema markup for blog listing */}
      <SchemaMarkup type="page" />

      <div className="min-h-screen">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb navigation */}
          <Breadcrumb />

          <Button
            render={<Link href="/" />}
            variant="ghost"
            className="text-green-600 hover:text-green-700"
          >
            <span className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </span>
          </Button>
        </div>

        {/* Page Header */}
        <section>
          <PageHeader {...pageHeaderProps} />
        </section>

        {/* Featured Post Section */}
        <FeaturedPosts limit={1} />

        {/* Category Filter */}
        <section className="py-8 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <div key={category}>
                  <Button
                    variant={category === 'All' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      category === 'All'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'border-green-600 text-green-600 hover:bg-green-50'
                    }
                  >
                    {category}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20 bg-white">
          <LatestPosts
            title="Recent Articles"
            subtitle="Explore our latest insights and updates from the farm"
            limit={6}
            featured={false}
            viewAllLink=""
          />
        </section>
      </div>
    </>
  );
}
