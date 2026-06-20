import { headers } from 'next/headers';

import { generateOrganizationSchema } from '@/lib/schema/organization';
import { BASE_URL, ORG_LOGO_URL, ORG_SOCIAL_PROFILES, SITE_TITLE } from '@/lib/constants';

/**
 * Reads the per-request CSP nonce for inline scripts in `<head>`.
 * Isolated here so the public root layout stays free of dynamic request APIs.
 */
export async function SiteHeadNonceScripts() {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? '';

  const organizationSchema = generateOrganizationSchema({
    name: SITE_TITLE,
    url: BASE_URL,
    logoUrl: ORG_LOGO_URL,
    sameAs: ORG_SOCIAL_PROFILES,
  });

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      suppressHydrationWarning
    />
  );
}
