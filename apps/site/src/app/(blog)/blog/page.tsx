export { metadata } from './metadata';

import { PageIntro } from '@/components/sections/page';
import { BlogIndexPosts, FeaturedPosts } from '@/features/blog/components';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';

export const revalidate = 86_400;

// Inline posts (no Suspense) so the prerendered HTML includes content — Suspense
// shells were getting CDN-cached while RSC streams failed under bot mitigation.
export default function BlogPage() {
  return (
    <>
      <SchemaMarkup type="page" />

      <div className="min-h-screen bg-paperbark">
        <PageIntro
          eyebrow="Life on pasture · The Branch, NSW"
          title="Field notes from a farm coming back to life"
          description="Follow the regeneration of 42 hectares in real time — the plantings, the setbacks, the soil results and the seasons. Read along, then come get your hands dirty."
          titleAs="h1"
          className="pb-12 pt-16"
          titleClassName="mx-auto max-w-[880px] text-[40px] leading-[1.06] sm:text-[58px]"
          descriptionClassName="mx-auto mt-[18px] max-w-[620px] text-stone leading-[1.6]"
        />

        <FeaturedPosts limit={1} />
        <BlogIndexPosts />
      </div>
    </>
  );
}
