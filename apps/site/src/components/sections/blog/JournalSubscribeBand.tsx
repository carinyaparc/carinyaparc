'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

interface JournalSubscribeBandProps {
  className?: string;
}

export function JournalSubscribeBand({ className }: JournalSubscribeBandProps) {
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
        body: JSON.stringify({ email }),
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

  return (
    <section className={className}>
      <div className="mx-auto max-w-[1240px] px-6 pb-[90px] lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-10 rounded-xl bg-eucalypt-600 px-8 py-12 shadow-lg sm:px-14 sm:py-14 lg:px-14 lg:py-14">
          <div className="max-w-md">
            <h2 className="font-heading text-[32px] font-normal leading-[1.14] text-fleece">
              Never miss a field note
            </h2>
            <p className="mt-2.5 text-base leading-relaxed text-inverse-muted">
              New posts, planting days and visit dates — straight to your inbox.
            </p>
          </div>
          {status === 'success' ? (
            <div className="min-w-[280px] max-w-[460px] flex-1 rounded-[18px] border border-fleece/30 bg-fleece/12 px-6 py-5">
              <p className="font-heading text-[22px] text-fleece">Thanks for joining us</p>
              <p className="mt-2 text-[15px] text-inverse-muted">
                You&apos;re on the list. We&apos;ll be in touch with news from the paddock.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex min-w-[280px] max-w-[460px] flex-1 flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="journal-email" className="sr-only">
                Email address
              </label>
              <input
                id="journal-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                placeholder="Your email address"
                autoComplete="email"
                className="min-w-0 flex-1 rounded-pill border border-fleece/35 bg-fleece/10 px-5 py-3.5 text-[15px] text-fleece outline-none placeholder:text-fleece/60 focus:border-fleece/70 disabled:opacity-70"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={status === 'loading'}
                className="shrink-0"
              >
                {status === 'loading' ? 'Joining…' : 'Subscribe'}
              </Button>
              {status === 'error' && (
                <p className="w-full text-sm text-fleece/90 sm:col-span-2">{errorMessage}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
