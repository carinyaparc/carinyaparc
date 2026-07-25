'use client';

import type { Post } from '@/features/blog/types';

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
