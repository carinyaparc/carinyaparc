import '@/src/styles/globals.css';

import { navigation } from '@/app/navigation';
import { Header } from '@/src/components/sections/header';
import { Toaster } from '@/components/ui/Toaster';
import { Providers } from '@/providers/Providers';
import { ConsentGate } from '@/components/consent/ConsentGate';
import { SiteStaticShell } from '@/components/layouts/site-static-shell';

import { SpeedInsights } from '@vercel/speed-insights/next';

export default function NotFoundShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteStaticShell>
      <Providers>
        <Header navigation={navigation} overlay />
        <main className="flex-1">{children}</main>
        <ConsentGate />
        <Toaster />
        <SpeedInsights />
      </Providers>
    </SiteStaticShell>
  );
}
