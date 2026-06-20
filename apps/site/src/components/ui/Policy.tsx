'use client';

import Link from 'next/link';

interface ConsentBannerProps {
  onAccept: () => void;
  onReject: () => void;
}

export function ConsentBanner({ onAccept, onReject }: ConsentBannerProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-50">
      <div className="pointer-events-auto ml-auto max-w-xl rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
        <p className="text-sm/6 text-charcoal-600">
          This website uses cookies to supplement a balanced diet and provide a much deserved reward
          to the senses after consuming bland but nutritious meals. Accepting our cookies is
          optional but recommended, as they are delicious. See our{' '}
          <Link href="/legal/privacy-policy" className="font-semibold text-eucalyptus-600">
            cookie policy
          </Link>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <button
            type="button"
            onClick={onAccept}
            className="rounded-md bg-charcoal-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-charcoal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal-600"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={onReject}
            className="text-sm/6 font-semibold text-charcoal-600"
          >
            Reject all
          </button>
        </div>
      </div>
    </div>
  );
}
