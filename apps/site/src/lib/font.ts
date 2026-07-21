import { Hanken_Grotesk, Marcellus } from 'next/font/google';

/** Display / headings / wordmark — Marcellus at weight 400 only. */
export const marcellus = Marcellus({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marcellus',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

/** Body + UI — Hanken Grotesk. */
export const hanken = Hanken_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

export const fontClassNames = `${marcellus.variable} ${hanken.variable} font-sans`;
