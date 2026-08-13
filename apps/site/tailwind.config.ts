import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/**
 * Font families live here; color/radius/shadow tokens live in @carinya/theme.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
    './mdx-components.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-hanken)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-marcellus)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
