import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Add performance indexes to the posts table.
 *
 * The homepage runs `SELECT … FROM posts ORDER BY date DESC, created_at DESC LIMIT n`
 * with Payload appending `WHERE _status = 'published'` for anonymous reads.
 * Without indexes this is a full table scan on every page load.
 *
 * A composite index on (_status, date DESC) covers the WHERE filter and the primary
 * sort key in one pass. A separate index on created_at covers the tie-breaking sort
 * without needing to be part of the composite.
 *
 * Related Sentry issue: WEBSITE-F (Slow DB Query, 1 144 occurrences, 20 users)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "posts_status_date_idx" ON "posts" ("_status", "date" DESC)`,
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" ("created_at" DESC)`,
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "posts_status_date_idx"`);
  await db.execute(sql`DROP INDEX IF EXISTS "posts_created_at_idx"`);
}
