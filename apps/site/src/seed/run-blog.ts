import { getPayload } from 'payload';

import config from '@payload-config';

import { seedBlog } from './blog';

async function main() {
  const payload = await getPayload({ config });
  const result = await seedBlog(payload);

  if (result.created) {
    console.log(`Created seed post: ${result.slug}`);
  } else {
    console.log(`Seed post already exists: ${result.slug}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
