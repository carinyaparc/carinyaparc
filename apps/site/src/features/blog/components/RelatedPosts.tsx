import type { Post } from '../types';

import PostCard from './PostCard';

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-line bg-fleece py-20" aria-labelledby="related-posts">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <h2 id="related-posts" className="font-heading text-[32px] font-normal text-eucalypt-600">
          Keep reading
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="related" />
          ))}
        </div>
      </div>
    </section>
  );
}
