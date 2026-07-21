import '@/src/styles/globals.css';

import { Providers } from '@/providers/Providers';
import { SiteChromeFrame } from '@/components/layouts/site-chrome-frame';
import { SiteStaticShell } from '@/components/layouts/site-static-shell';

export default function SiteRootLayout({
  children,
  showNewsletter = true,
}: Readonly<{
  children: React.ReactNode;
  /**
   * Render the global Newsletter band. Disabled on Journal (blog) routes,
   * which supply their own JournalSubscribeBand and must not stack a second,
   * near-identical email-capture band before the footer.
   */
  showNewsletter?: boolean;
}>) {
  return (
    <SiteStaticShell>
      <Providers>
        <SiteChromeFrame showNewsletter={showNewsletter}>{children}</SiteChromeFrame>
      </Providers>
    </SiteStaticShell>
  );
}
