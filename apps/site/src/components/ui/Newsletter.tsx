'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Newsletter() {
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
        console.error('Subscription failed:', data.error);
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again later.');
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div id="stay" className="bg-paperbark py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <div className="relative isolate grid gap-10 overflow-hidden rounded-xl bg-eucalypt-600 px-7 py-11 shadow-lg sm:px-16 sm:py-[72px] lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-heading text-4xl font-normal tracking-tight text-balance text-fleece sm:text-5xl">
              Stay connected to the land
            </h2>
            <p className="mt-4 text-lg text-[#CFDAC7]">
              Progress reports, planting days and produce news from Carinya Parc. We respect your
              inbox.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            {status === 'success' ? (
              <div className="w-full max-w-md rounded-[18px] border border-fleece/30 bg-fleece/12 px-[26px] py-6">
                <p className="font-heading text-[22px] text-fleece">Thanks for joining us</p>
                <p className="mt-2 text-[15px] text-[#CFDAC7]">
                  You&apos;re on the list. We&apos;ll be in touch soon with news from the paddock.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-md" suppressHydrationWarning>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-x-3" suppressHydrationWarning>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className="min-w-0 flex-auto rounded-pill border border-fleece/35 bg-fleece/10 px-5 py-3.5 text-base text-fleece outline-none placeholder:text-fleece/60 focus:border-fleece/70 disabled:opacity-70 sm:text-sm"
                    suppressHydrationWarning
                  />
                  <Button type="submit" variant="secondary" disabled={status === 'loading'} size="md">
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>

                {status === 'error' && (
                  <p className="mt-3 text-sm font-medium text-bracken-200">{errorMessage}</p>
                )}

                <p className="mt-4 text-sm/6 text-[#B7C9B0]">
                  Join a growing community of supporters. Unsubscribe anytime. Read our{' '}
                  <Link href="/legal/privacy-policy" className="font-semibold text-fleece hover:opacity-70">
                    privacy&nbsp;policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
