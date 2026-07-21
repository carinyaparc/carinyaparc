import '@/src/styles/globals.css';

import { Providers } from '@/providers/Providers';
import { SiteChromeFrame } from '@/components/layouts/site-chrome-frame';
import { SiteStaticShell } from '@/components/layouts/site-static-shell';

export default function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteStaticShell>
      <Providers>
        <SiteChromeFrame>{children}</SiteChromeFrame>
      </Providers>
    </SiteStaticShell>
  );
}
