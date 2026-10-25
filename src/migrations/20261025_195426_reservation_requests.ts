import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."reservation_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar NOT NULL,
  	"time" varchar,
  	"guests" numeric NOT NULL,
  	"occasion" varchar,
  	"locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "reservation_requests_id" integer;
  CREATE INDEX "reservation_requests_updated_at_idx" ON "payload"."reservation_requests" USING btree ("updated_at");
  CREATE INDEX "reservation_requests_created_at_idx" ON "payload"."reservation_requests" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reservation_requests_fk" FOREIGN KEY ("reservation_requests_id") REFERENCES "payload"."reservation_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reservation_requests_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("reservation_requests_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."reservation_requests" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."reservation_requests" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reservation_requests_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_reservation_requests_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "reservation_requests_id";`)
}
