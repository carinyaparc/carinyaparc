import type { SanitizedConfig } from 'payload';
import { getPayload } from 'payload';

import { seedRecipes } from '@/seed/recipes';

export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config });

  try {
    const result = await seedRecipes(payload);

    if (result.created) {
      console.log(`Created seed recipe: ${result.slug}`);
    } else {
      console.log(`Seed recipe already exists: ${result.slug}`);
    }
  } finally {
    await payload.destroy();
  }
}
