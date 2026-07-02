import { ORGANIZATION_SCHEMA_JSON } from '@/lib/schema/organization-json';

export function SiteOrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: ORGANIZATION_SCHEMA_JSON }}
      suppressHydrationWarning
    />
  );
}
