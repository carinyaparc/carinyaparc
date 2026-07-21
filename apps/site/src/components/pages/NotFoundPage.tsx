import { SetMinimalChrome } from '@/providers/SiteChromeProvider';

import { NotFoundContent } from './NotFoundContent';

export function NotFoundPage() {
  return (
    <>
      <SetMinimalChrome />
      <NotFoundContent />
    </>
  );
}
