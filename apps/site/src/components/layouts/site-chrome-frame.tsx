'use client';

import { navigation } from '@/app/navigation';
import { Header } from '@/src/components/sections/header';
import Newsletter from '@/src/components/ui/Newsletter';
import { Footer } from '@/src/components/sections/footer';
import { Toaster } from '@/components/ui/Toaster';
import { ConsentGate } from '@/components/consent/ConsentGate';
import { useSiteChromeState } from '@/providers/SiteChromeProvider';

import { SpeedInsights } from '@vercel/speed-insights/next';

export function SiteChromeFrame({ children }: { children: React.ReactNode }) {
  const { minimal } = useSiteChromeState();

  return (
    <>
      <Header navigation={navigation} overlay={minimal} />
      <main className="flex-1">{children}</main>
      {!minimal && <Newsletter />}
      {!minimal && <Footer />}
      <ConsentGate />
      <Toaster />
      <SpeedInsights />
    </>
  );
}
