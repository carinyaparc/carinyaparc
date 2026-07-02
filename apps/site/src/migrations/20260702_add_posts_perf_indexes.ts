import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Composite indexes for the posts query used by getBlogPosts.
 *
 * The homepage and blog index run:
 *   SELECT … FROM posts WHERE _status = 'published' ORDER BY date DESC, created_at DESC
 *
 * Without these indexes the planner performs a sequential scan on every cache
 * miss. With them the query resolves via a single index seek + sort-order scan.
 *
 * - posts_status_date_idx: (_status, date DESC) — covers the equality filter on
 *   _status and the primary ORDER BY in one pass.
 * - posts_created_at_idx: (created_at DESC) — covers the tie-breaking secondary
 *   sort column.
 *
 * Related: Sentry WEBSITE-F (Slow DB Query, 1 144 occurrences, 20 users).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS posts_status_date_idx ON posts (_status, date DESC)`,
  );
  await db.execute(
    sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC)`,
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS posts_status_date_idx`);
  await db.execute(sql`DROP INDEX IF EXISTS posts_created_at_idx`);
}
