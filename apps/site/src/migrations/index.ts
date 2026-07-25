import * as migration_20260702_add_posts_perf_indexes from './20260702_add_posts_perf_indexes';
import * as migration_20260725_add_events_tables from './20260725_add_events_tables';

export const migrations = [
  {
    up: migration_20260702_add_posts_perf_indexes.up,
    down: migration_20260702_add_posts_perf_indexes.down,
    name: '20260702_add_posts_perf_indexes',
  },
  {
    up: migration_20260725_add_events_tables.up,
    down: migration_20260725_add_events_tables.down,
    name: '20260725_add_events_tables',
  },
];
