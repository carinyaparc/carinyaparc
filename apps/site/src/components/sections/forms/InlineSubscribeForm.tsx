'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';

interface InlineSubscribeFormProps {
  className?: string;
}

export function InlineSubscribeForm({ className }: InlineSubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, submissionTime: 5000 }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again later.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div
        className={`max-w-[520px] rounded-[18px] border border-eucalypt-200 bg-eucalypt-50 px-6 py-[22px] ${className ?? ''}`}
      >
        <p className="font-heading text-[22px] text-eucalypt-700">You&apos;re in — thank you!</p>
        <p className="mt-1.5 text-[15px] text-charcoal">
          We&apos;ll be in touch soon with the next chance to get your hands dirty.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="max-w-[520px]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="regenerate-email" className="sr-only">
            Email address
          </label>
          <input
            id="regenerate-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            placeholder="Enter your email address"
            autoComplete="email"
            className="min-w-0 flex-1 rounded-pill border border-line bg-fleece px-[22px] py-[15px] text-[15px] text-bark outline-none placeholder:text-stone focus:border-eucalypt-500 disabled:opacity-70"
          />
          <Button type="submit" disabled={status === 'loading'} className="shrink-0">
            {status === 'loading' ? 'Joining…' : 'Join the list'}
          </Button>
        </div>
        {status === 'error' && (
          <p className="mt-3 text-sm font-medium text-destructive">{errorMessage}</p>
        )}
      </form>

      <div className="mt-[22px] flex flex-wrap gap-2.5">
        <Tag tone="eucalypt">Planting days</Tag>
        <Tag tone="kangaroo">Farm tours</Tag>
        <Tag tone="branch">Eco-stays</Tag>
      </div>

      <p className="mt-4 text-sm text-stone">
        Read our{' '}
        <Link
          href="/legal/privacy-policy"
          className="font-semibold text-eucalypt-600 hover:opacity-70"
        >
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
