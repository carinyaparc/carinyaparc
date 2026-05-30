import type { SanitizedConfig } from 'payload';
import { getPayload } from 'payload';

import { formatMigrationSummary, migrateMdxContent } from '@/seed/migrate-mdx';

export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config });

  try {
    const summary = await migrateMdxContent(payload);
    console.log(formatMigrationSummary(summary));
  } finally {
    await payload.destroy();
  }
}
