/**
 * Client-side providers for application-wide state management
 */

'use client';

import { SiteChromeProvider } from './SiteChromeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SiteChromeProvider>{children}</SiteChromeProvider>;
}
