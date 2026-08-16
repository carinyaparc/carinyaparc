import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Authors } from './collections/Authors';
import { Categories } from './collections/Categories';
import { EventRegistrations } from './collections/EventRegistrations';
import { Events } from './collections/Events';
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
  collections: [Users, Authors, Categories, Tags, Posts, Recipes, Events, EventRegistrations],
  editor: lexicalEditor(),
  secret: getPayloadSecret(),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getNeonDatabaseUrl(),
      // Neon serverless: limit concurrent connections per Lambda instance and
      // set explicit timeouts so cold-start connection resets don't linger.
      // connectionTimeoutMillis covers both the pg client TCP handshake and the
      // pg-pool queue wait; 30 s gives Neon's auto-suspended compute enough time
      // to wake up (typically < 4 s but can spike under load) and prevents the
      // "cannot connect to Postgres: Connection terminated due to connection
      // timeout" error that was surfacing in Sentry (WEBSITE-R).
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 30_000,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [],
});
