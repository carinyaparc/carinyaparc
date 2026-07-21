import '@/src/styles/globals.css';

import { navigation } from '@/app/navigation';
import { Header } from '@/src/components/sections/header';
import Newsletter from '@/src/components/ui/Newsletter';
import { Footer } from '@/src/components/sections/footer';
import { Toaster } from '@/components/ui/Toaster';
import { Providers } from '@/providers/Providers';
import { ConsentGate } from '@/components/consent/ConsentGate';
import { SiteStaticShell } from '@/components/layouts/site-static-shell';

import { SpeedInsights } from '@vercel/speed-insights/next';

export default function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteStaticShell>
      <Providers>
        <Header navigation={navigation} />
        <main className="flex-1">{children}</main>
        <Newsletter />
        <Footer />
        <ConsentGate />
        <Toaster />
        <SpeedInsights />
      </Providers>
    </SiteStaticShell>
  );
}
