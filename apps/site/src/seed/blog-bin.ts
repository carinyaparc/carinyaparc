import type { SanitizedConfig } from 'payload';
import { getPayload } from 'payload';

import { seedBlog } from '@/seed/blog';

export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config });

  try {
    const result = await seedBlog(payload);

    if (result.created) {
      console.log(`Created seed post: ${result.slug}`);
    } else {
      console.log(`Seed post already exists: ${result.slug}`);
    }
  } finally {
    await payload.destroy();
  }
}
