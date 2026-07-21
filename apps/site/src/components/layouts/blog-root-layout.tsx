import SiteRootLayout from '@/components/layouts/site-root-layout';

/**
 * Root layout for the Journal (blog) route group.
 *
 * Identical to the site root layout but suppresses the global Newsletter band:
 * blog listing pages render their own JournalSubscribeBand ("Never miss a field
 * note"), and single-post pages intentionally end on related posts — matching
 * the Journal design references. Without this, the global Newsletter stacked a
 * second, near-identical email-capture band before the footer.
 */
export default function BlogRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteRootLayout showNewsletter={false}>{children}</SiteRootLayout>;
}
