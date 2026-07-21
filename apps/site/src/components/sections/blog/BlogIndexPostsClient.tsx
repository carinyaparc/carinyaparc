'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import type { Post } from '@/lib/posts';

import { fetchBlogIndexPosts } from './blog-index-actions';
import { JournalCategoryFilter, type JournalCategory } from './JournalCategoryFilter';
import { JournalPostGrid } from './JournalPostGrid';

interface BlogIndexPostsClientProps {
  categories: JournalCategory[];
  initialPosts: Post[];
  initialTotalPages: number;
}

export function BlogIndexPostsClient({
  categories,
  initialPosts,
  initialTotalPages,
}: BlogIndexPostsClientProps) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category') ?? undefined;
  const [posts, setPosts] = useState(initialPosts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  useEffect(() => {
    if (!categorySlug) {
      setPosts(initialPosts);
      setTotalPages(initialTotalPages);
      return;
    }

    let cancelled = false;

    void fetchBlogIndexPosts(categorySlug).then((result) => {
      if (!cancelled) {
        setPosts(result.posts);
        setTotalPages(result.totalPages);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, initialPosts, initialTotalPages]);

  return (
    <>
      <JournalCategoryFilter categories={categories} activeSlug={categorySlug} />
      <JournalPostGrid posts={posts} totalPages={totalPages} categorySlug={categorySlug} />
    </>
  );
}
