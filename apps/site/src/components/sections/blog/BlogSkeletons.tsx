import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostCardSkeleton() {
  return (
    <div className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-charcoal-100 px-8 pt-80 pb-8 sm:pt-48 lg:pt-80">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 bg-charcoal-200" />
        <Skeleton className="h-5 w-3/4 bg-charcoal-200" />
        <Skeleton className="h-4 w-full bg-charcoal-200" />
      </div>
    </div>
  );
}

export function FeaturedPostsSkeleton() {
  return (
    <section className="bg-white py-12" aria-busy="true" aria-label="Loading featured post">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-eucalyptus-100 shadow-lg">
          <div className="grid gap-0 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-none lg:min-h-[20rem]" />
            <CardContent className="space-y-4 p-8 lg:p-12">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="mt-2 h-10 w-40" />
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}

interface PaginatedPostsSkeletonProps {
  title?: string;
  subtitle?: string;
  count?: number;
}

export function PaginatedPostsSkeleton({
  title = 'Recent Articles',
  subtitle = 'Explore our latest insights and updates from the farm',
  count = 6,
}: PaginatedPostsSkeletonProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8" aria-busy="true" aria-label="Loading articles">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-eucalyptus-600 sm:text-5xl">
          {title}
        </h2>
        <p className="mt-2 text-lg/8 text-eucalyptus-300">{subtitle}</p>
      </div>
      <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
