import { getPayload } from 'payload';

import config from '@payload-config';

import { seedRecipes } from './recipes';

async function main() {
  const payload = await getPayload({ config });
  const result = await seedRecipes(payload);

  if (result.created) {
    console.log(`Created seed recipe: ${result.slug}`);
  } else {
    console.log(`Seed recipe already exists: ${result.slug}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
