import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Authors } from './collections/Authors';
import { Categories } from './collections/Categories';
import { Posts } from './collections/Posts';
import { Recipes } from './collections/Recipes';
import { Tags } from './collections/Tags';
import { Users } from './collections/Users';
import { getNeonDatabaseUrl, getPayloadSecret } from './lib/payload/env';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Authors, Categories, Tags, Posts, Recipes],
  editor: lexicalEditor(),
  secret: getPayloadSecret(),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getNeonDatabaseUrl(),
    },
  }),
  sharp,
  plugins: [],
});
