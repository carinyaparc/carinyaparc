'use client';

import { useEffect, useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';

export interface ShareBarProps {
  /** Absolute canonical URL for the post (clipboard + Web Share). */
  url: string;
  /** Post title used as the Web Share payload title/text. */
  title: string;
  className?: string;
}

/**
 * End-of-article share controls: copy the canonical URL (with confirmation)
 * and native share where `navigator.share` is available.
 */
export function ShareBar({ url, title, className }: ShareBarProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) {
      return;
    }
    try {
      await navigator.share({ title, text: title, url });
    } catch (error) {
      // User dismissing the sheet is not an error worth surfacing.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      toast.error('Could not share');
    }
  };

  return (
    <aside
      className={cn(
        'mx-auto mt-10 flex max-w-[720px] flex-col items-center gap-3 border-t border-line px-6 pt-8 sm:flex-row sm:justify-between',
        className,
      )}
      aria-label="Share this article"
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
        Share
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        {canNativeShare ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNativeShare}
            aria-label="Share"
          >
            <Share2 aria-hidden="true" />
            Share
          </Button>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? 'Link copied to clipboard' : ''}
      </p>
    </aside>
  );
}
