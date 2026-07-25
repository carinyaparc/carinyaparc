'use client';

import type { Post } from '@/lib/posts';

import { JournalPostGrid } from './JournalPostGrid';

interface BlogIndexPostsClientProps {
  initialPosts: Post[];
  initialTotalPages: number;
}

export function BlogIndexPostsClient({
  initialPosts,
  initialTotalPages,
}: BlogIndexPostsClientProps) {
  return <JournalPostGrid posts={initialPosts} totalPages={initialTotalPages} />;
}
