import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Add Payload Events + EventRegistrations tables (CP09-09 / CP09-12).
 *
 * Incremental only — the existing schema already has posts/recipes/users/etc.
 * Also adds locked-document relation columns for the new collections.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_event_registrations_status" AS ENUM('registered', 'waitlisted');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "events" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "slug" varchar,
      "starts_at" timestamp(3) with time zone,
      "location" varchar,
      "capacity" numeric,
      "is_full" boolean DEFAULT false,
      "signup_target" varchar,
      "description" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_events_status" DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "_events_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_slug" varchar,
      "version_starts_at" timestamp(3) with time zone,
      "version_location" varchar,
      "version_capacity" numeric,
      "version_is_full" boolean DEFAULT false,
      "version_signup_target" varchar,
      "version_description" jsonb,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__events_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    CREATE TABLE IF NOT EXISTS "event_registrations" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_id" integer NOT NULL,
      "name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "status" "enum_event_registrations_status" DEFAULT 'registered' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "events_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "event_registrations_id" integer;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_events_v"
        ADD CONSTRAINT "_events_v_parent_id_events_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "event_registrations"
        ADD CONSTRAINT "event_registrations_event_id_events_id_fk"
        FOREIGN KEY ("event_id") REFERENCES "public"."events"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_events_fk"
        FOREIGN KEY ("events_id") REFERENCES "public"."events"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_event_registrations_fk"
        FOREIGN KEY ("event_registrations_id") REFERENCES "public"."event_registrations"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "events_starts_at_idx" ON "events" USING btree ("starts_at");
    CREATE INDEX IF NOT EXISTS "events_is_full_idx" ON "events" USING btree ("is_full");
    CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "events__status_idx" ON "events" USING btree ("_status");

    CREATE INDEX IF NOT EXISTS "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
    CREATE INDEX IF NOT EXISTS "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
    CREATE INDEX IF NOT EXISTS "_events_v_version_version_is_full_idx" ON "_events_v" USING btree ("version_is_full");
    CREATE INDEX IF NOT EXISTS "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");

    CREATE INDEX IF NOT EXISTS "event_registrations_event_idx" ON "event_registrations" USING btree ("event_id");
    CREATE INDEX IF NOT EXISTS "event_registrations_email_idx" ON "event_registrations" USING btree ("email");
    CREATE INDEX IF NOT EXISTS "event_registrations_updated_at_idx" ON "event_registrations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "event_registrations_created_at_idx" ON "event_registrations" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx"
      ON "payload_locked_documents_rels" USING btree ("events_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_event_registrations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("event_registrations_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_event_registrations_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_events_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_event_registrations_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_events_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "event_registrations_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "events_id";

    DROP TABLE IF EXISTS "event_registrations" CASCADE;
    DROP TABLE IF EXISTS "_events_v" CASCADE;
    DROP TABLE IF EXISTS "events" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_event_registrations_status";
    DROP TYPE IF EXISTS "public"."enum__events_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_events_status";
  `);
}
