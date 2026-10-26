import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { applyHeroTriptych } from '../seed/heroTriptych'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."home" DROP CONSTRAINT "home_hero_intro_video_id_media_id_fk";
  
  ALTER TABLE "payload"."home" DROP CONSTRAINT "home_hero_loop_video_id_media_id_fk";
  
  DROP INDEX "payload"."home_hero_hero_intro_video_idx";
  DROP INDEX "payload"."home_hero_hero_loop_video_idx";
  ALTER TABLE "payload"."settings" ALTER COLUMN "social_instagram" SET DEFAULT 'https://www.instagram.com/fogodechao.bo/';
  ALTER TABLE "payload"."settings" ALTER COLUMN "social_facebook" SET DEFAULT 'https://www.facebook.com/FogoBolivia/';
  ALTER TABLE "payload"."home_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload"."home_rels" ADD CONSTRAINT "home_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_rels_media_id_idx" ON "payload"."home_rels" USING btree ("media_id");
  ALTER TABLE "payload"."home" DROP COLUMN "hero_intro_video_id";
  ALTER TABLE "payload"."home" DROP COLUMN "hero_loop_video_id";
  ALTER TABLE "payload"."home_locales" DROP COLUMN "hero_subtitle";
  ALTER TABLE "payload"."home_locales" DROP COLUMN "hero_secondary_label";`)

  // Content: the live site gets the three hero reels and the shared social accounts.
  await applyHeroTriptych(payload, req)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."home_rels" DROP CONSTRAINT "home_rels_media_fk";
  
  DROP INDEX "payload"."home_rels_media_id_idx";
  ALTER TABLE "payload"."settings" ALTER COLUMN "social_instagram" DROP DEFAULT;
  ALTER TABLE "payload"."settings" ALTER COLUMN "social_facebook" DROP DEFAULT;
  ALTER TABLE "payload"."home" ADD COLUMN "hero_intro_video_id" integer;
  ALTER TABLE "payload"."home" ADD COLUMN "hero_loop_video_id" integer;
  ALTER TABLE "payload"."home_locales" ADD COLUMN "hero_subtitle" varchar;
  ALTER TABLE "payload"."home_locales" ADD COLUMN "hero_secondary_label" varchar;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_hero_intro_video_id_media_id_fk" FOREIGN KEY ("hero_intro_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_hero_loop_video_id_media_id_fk" FOREIGN KEY ("hero_loop_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_hero_hero_intro_video_idx" ON "payload"."home" USING btree ("hero_intro_video_id");
  CREATE INDEX "home_hero_hero_loop_video_idx" ON "payload"."home" USING btree ("hero_loop_video_id");
  ALTER TABLE "payload"."home_rels" DROP COLUMN "media_id";`)
}
