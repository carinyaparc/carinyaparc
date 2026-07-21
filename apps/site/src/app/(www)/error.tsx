'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md">
        <p className="text-base font-semibold text-eucalypt-600">500</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-charcoal-700">
          Something went wrong
        </h1>
        <p className="mt-4 text-charcoal-500">
          We ran into an unexpected error. Please try again or return to the home page.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-eucalypt-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eucalypt-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalypt-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-eucalypt-200 px-4 py-2 text-sm font-semibold text-eucalypt-600 hover:bg-eucalypt-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalypt-600"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
