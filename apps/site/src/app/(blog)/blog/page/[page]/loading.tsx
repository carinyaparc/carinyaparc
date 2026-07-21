import { PaginatedPostsSkeleton } from '@/src/components/sections/blog';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Instant loading UI for /blog/page/[page] client navigations.
 * Kept under this segment so /blog/[slug] is not affected.
 */
export default function BlogPageNumberLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-4 w-48" />
      </div>
      <Skeleton className="my-8 h-64 w-full rounded-none" />
      <section className="bg-white py-20">
        <PaginatedPostsSkeleton
          title="Articles"
          subtitle="Explore our insights and updates from the farm"
        />
      </section>
    </div>
  );
}
