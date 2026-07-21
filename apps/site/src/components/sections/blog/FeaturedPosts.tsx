/**
 * FeaturedPosts organism - Refactored with PostCard molecule
 * Maps to: * Task: T4.6
 */

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

import { getCachedBlogPosts } from '@/lib/payload/cache';
import type { Post } from '@/lib/posts';

interface FeaturedPostsProps {
  limit?: number;
}

export default async function FeaturedPosts({ limit = 1 }: FeaturedPostsProps) {
  let featuredPosts: Post[];
  try {
    featuredPosts = await getCachedBlogPosts({ featured: true, limit });
  } catch {
    return null;
  }

  if (!featuredPosts || featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {featuredPosts.map((featuredPost) => (
          <div key={featuredPost.id}>
            <Card className="overflow-hidden border-eucalyptus-100 shadow-lg">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-full">
                  <Image
                    src={featuredPost.imageUrl}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                    quality={80}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-amber-600 hover:bg-amber-700">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-8 lg:p-12">
                  <div className="flex items-center space-x-4 text-sm text-charcoal-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {featuredPost.formattedDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />5 min read
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-green-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-eucalyptus-600 text-lg mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <Button
                    render={<Link href={featuredPost.href} />}
                    className="bg-eucalyptus-600 hover:bg-eucalyptus-400"
                  >
                    <span className="flex items-center">
                      Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
