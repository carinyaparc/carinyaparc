import '@/src/styles/globals.css';

import { draftMode } from 'next/headers';
import { cookies, headers } from 'next/headers';
import { fontClassNames } from '@/lib/font';
import { CONSENT_COOKIE_NAME } from '@/lib/constants';

import { navigation } from '@/app/navigation';
import Banner from '@/src/components/ui/Banner';
import { Header } from '@/src/components/sections/header';
import Newsletter from '@/src/components/ui/Newsletter';
import { Footer } from '@/src/components/sections/footer';
import CookiePolicy from '@/src/components/ui/Policy';
import { Toaster } from '@repo/ui/toaster';
import { Providers } from '@/providers/Providers';

import { GoogleTagManager } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { generateOrganizationSchema } from '@/lib/schema/organization';
import { SITE_TITLE, BASE_URL, ORG_LOGO_URL, ORG_SOCIAL_PROFILES } from '@/lib/constants';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const criticalCSS = `
  /* Essential design tokens for critical styles */
  :root {
    --font-sans: var(--font-raleway), sans-serif;
    --radius: 0.5rem;

    /* Essential colors for above-the-fold */
    --color-background: #ffffff;
    --color-foreground: #3a3a3a;
    --color-primary: #5a9975;
    --color-border: #e6e6e6;
    --color-muted-foreground: #737373;
  }

  /* Base reset and font loading */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: var(--font-sans);
    color: var(--color-foreground);
    background-color: var(--color-background);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Prevent layout shift */
  html {
    scroll-behavior: smooth;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;

export default async function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await draftMode();

  const cookieStore = await cookies();
  const cookieConsent = cookieStore.get(CONSENT_COOKIE_NAME);
  const hasConsentChoice =
    cookieConsent?.value === 'accepted' || cookieConsent?.value === 'rejected';
  const hasConsentedToAnalytics = cookieConsent?.value === 'accepted';

  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';

  const organizationSchema = generateOrganizationSchema({
    name: SITE_TITLE,
    url: BASE_URL,
    logoUrl: ORG_LOGO_URL,
    sameAs: ORG_SOCIAL_PROFILES,
  });

  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: criticalCSS }}
          suppressHydrationWarning
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          suppressHydrationWarning
        />
      </head>
      {hasConsentedToAnalytics && <GoogleTagManager gtmId={GTM_ID || ''} />}
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Banner />
          <Header navigation={navigation} />
          <main className="flex-1">{children}</main>
          <Newsletter />
          <Footer />
          <CookiePolicy showBanner={!hasConsentChoice} />
          <Toaster />
          {hasConsentedToAnalytics && <Analytics />}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
