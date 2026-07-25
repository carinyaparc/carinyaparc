import Link from 'next/link';

import { cn } from '@/lib/cn';

interface SubscribePrivacyNoteProps {
  className?: string;
}

/** Privacy/consent line shared with the standalone `/subscribe/` page. */
export function SubscribePrivacyNote({ className }: SubscribePrivacyNoteProps) {
  return (
    <p className={cn('text-sm/6 text-stone', className)}>
      We promise to respect your privacy and your inbox. Read our{' '}
      <Link
        href="/legal/privacy-policy"
        className="font-semibold text-eucalypt-600 hover:opacity-70"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
