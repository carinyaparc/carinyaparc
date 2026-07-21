import { fontClassNames } from '@/lib/font';

import { SiteOrganizationSchema } from '@/components/layouts/site-organization-schema';

const criticalCSS = `
  /* Essential design tokens for critical styles (design-system) */
  :root {
    --font-sans: var(--font-hanken), system-ui, -apple-system, sans-serif;
    --font-heading: var(--font-marcellus), Georgia, serif;
    --radius: 1rem;

    /* Essential colors for above-the-fold */
    --color-background: #efe6d2;
    --color-foreground: #241f18;
    --color-primary: #2e5d45;
    --color-border: #e4d9c4;
    --color-muted-foreground: #8b8272;
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

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-heading);
    font-weight: 400;
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
