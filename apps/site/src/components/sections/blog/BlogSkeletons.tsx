import { Skeleton } from '@/components/ui/Skeleton';

export function PostCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-white shadow-md"
      aria-hidden
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function FeaturedPostsSkeleton() {
  return (
    <section className="pb-10 pt-4" aria-busy="true" aria-label="Loading featured post">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <div className="grid gap-8 overflow-hidden rounded-xl border border-line bg-fleece p-[22px] shadow-md lg:grid-cols-[1.15fr_0.85fr] lg:gap-11">
          <Skeleton className="aspect-[16/11] rounded-[20px]" />
          <div className="space-y-4 px-1 py-2 lg:px-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-9 w-48" />
          </div>
        </div>
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
  title,
  subtitle,
  count = 6,
}: PaginatedPostsSkeletonProps) {
  return (
    <div
      className="mx-auto max-w-[1240px] px-6 lg:px-14"
      aria-busy="true"
      aria-label="Loading articles"
    >
      {(title || subtitle) && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {title && <Skeleton className="mx-auto h-10 w-64" />}
          {subtitle && <Skeleton className="mx-auto mt-3 h-5 w-80" />}
        </div>
      )}
      <div className="grid grid-cols-1 gap-[30px] lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
