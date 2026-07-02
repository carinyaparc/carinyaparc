import { fontClassNames } from '@/lib/font';

import { SiteOrganizationSchema } from '@/components/layouts/site-organization-schema';

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

export function SiteStaticShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} suppressHydrationWarning />
        <SiteOrganizationSchema />
      </head>
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
