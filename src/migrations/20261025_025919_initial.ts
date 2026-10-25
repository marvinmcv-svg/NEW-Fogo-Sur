import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."_locales" AS ENUM('es', 'en', 'pt', 'fr', 'de', 'zh');
  CREATE TYPE "payload"."enum_pages_blocks_cta_action" AS ENUM('whatsapp', 'link');
  CREATE TYPE "payload"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pages_v_blocks_cta_action" AS ENUM('whatsapp', 'link');
  CREATE TYPE "payload"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pages_v_published_locale" AS ENUM('es', 'en', 'pt', 'fr', 'de', 'zh');
  CREATE TYPE "payload"."enum_menu_items_tags" AS ENUM('signature', 'vegetarian', 'gluten-free', 'new', 'sharing');
  CREATE TYPE "payload"."enum_promotions_days" AS ENUM('daily', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "payload"."enum_promotions_service" AS ENUM('lunch', 'dinner', 'both', 'bar');
  CREATE TYPE "payload"."enum_inquiries_status" AS ENUM('new', 'contacted', 'confirmed', 'closed');
  CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "payload"."enum_settings_status" AS ENUM('coming-soon', 'open');
  CREATE TYPE "payload"."enum_settings_fonts_display" AS ENUM('Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'DM Serif Display', 'Fraunces', 'Libre Caslon Display');
  CREATE TYPE "payload"."enum_settings_fonts_body" AS ENUM('Inter', 'Manrope', 'DM Sans', 'Figtree', 'Work Sans', 'Montserrat');
  CREATE TABLE "payload"."pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_rich_text_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"reverse" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_image_text_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payload"."pages_blocks_gallery_items_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_gallery_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"action" "payload"."enum_pages_blocks_cta_action" DEFAULT 'whatsapp',
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_cta_locales" (
  	"title" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_quote_locales" (
  	"quote" varchar,
  	"author" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"show_in_nav" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."pages_locales" (
  	"title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_rich_text_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"reverse" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_image_text_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_gallery_items_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_gallery_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "payload"."enum__pages_v_blocks_cta_action" DEFAULT 'whatsapp',
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_cta_locales" (
  	"title" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_quote_locales" (
  	"quote" varchar,
  	"author" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_show_in_nav" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_pages_v_locales" (
  	"version_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."cuts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portuguese_name" varchar,
  	"slug" varchar,
  	"order" numeric DEFAULT 10,
  	"featured" boolean DEFAULT true,
  	"image_id" integer NOT NULL,
  	"video_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."cuts_locales" (
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"description" varchar,
  	"tasting_notes" varchar,
  	"doneness" varchar,
  	"origin" varchar,
  	"pairing" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."menu_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"key" varchar NOT NULL,
  	"order" numeric DEFAULT 10,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."menu_categories_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."menu_items_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "payload"."enum_menu_items_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."menu_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer NOT NULL,
  	"price" numeric,
  	"image_id" integer,
  	"order" numeric DEFAULT 10,
  	"available" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."menu_items_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."promotions_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "payload"."enum_promotions_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"start_time" varchar,
  	"end_time" varchar,
  	"service" "payload"."enum_promotions_service",
  	"image_id" integer,
  	"video_id" integer,
  	"order" numeric DEFAULT 10,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."promotions_locales" (
  	"title" varchar NOT NULL,
  	"highlight" varchar,
  	"description" varchar,
  	"conditions" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."event_packages_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."event_packages_features_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."event_packages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"price_from" numeric,
  	"image_id" integer,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."event_packages_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"capacity" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"poster_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_full_url" varchar,
  	"sizes_full_width" numeric,
  	"sizes_full_height" numeric,
  	"sizes_full_mime_type" varchar,
  	"sizes_full_filesize" numeric,
  	"sizes_full_filename" varchar
  );
  
  CREATE TABLE "payload"."media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"date" timestamp(3) with time zone,
  	"guests" numeric,
  	"event_type" varchar,
  	"message" varchar,
  	"locale" varchar,
  	"status" "payload"."enum_inquiries_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "payload"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"cuts_id" integer,
  	"menu_categories_id" integer,
  	"menu_items_id" integer,
  	"promotions_id" integer,
  	"event_packages_id" integer,
  	"media_id" integer,
  	"inquiries_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."home_ritual_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer
  );
  
  CREATE TABLE "payload"."home_ritual_beats_locales" (
  	"kicker" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."home_market_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "payload"."home_market_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."home_bar_clips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payload"."home_bar_clips_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_intro_video_id" integer,
  	"hero_loop_video_id" integer,
  	"ritual_enabled" boolean DEFAULT true,
  	"cuts_enabled" boolean DEFAULT true,
  	"market_enabled" boolean DEFAULT true,
  	"market_hero_image_id" integer,
  	"market_video_id" integer,
  	"card_enabled" boolean DEFAULT true,
  	"card_video_id" integer,
  	"bar_enabled" boolean DEFAULT true,
  	"week_enabled" boolean DEFAULT true,
  	"visit_enabled" boolean DEFAULT true,
  	"visit_media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."home_locales" (
  	"hero_eyebrow" varchar,
  	"hero_title" varchar NOT NULL,
  	"hero_subtitle" varchar,
  	"hero_cta_label" varchar,
  	"hero_secondary_label" varchar,
  	"ritual_heading" varchar,
  	"cuts_eyebrow" varchar,
  	"cuts_heading" varchar,
  	"cuts_intro" varchar,
  	"cuts_hint" varchar,
  	"cuts_link_label" varchar,
  	"market_eyebrow" varchar,
  	"market_heading" varchar,
  	"market_text" varchar,
  	"market_link_label" varchar,
  	"card_eyebrow" varchar,
  	"card_heading" varchar,
  	"card_text" varchar,
  	"card_yes_label" varchar,
  	"card_yes_sub" varchar,
  	"card_yes_text" varchar,
  	"card_no_label" varchar,
  	"card_no_sub" varchar,
  	"card_no_text" varchar,
  	"bar_eyebrow" varchar,
  	"bar_heading" varchar,
  	"bar_text" varchar,
  	"week_eyebrow" varchar,
  	"week_heading" varchar,
  	"week_intro" varchar,
  	"visit_eyebrow" varchar,
  	"visit_heading" varchar,
  	"visit_text" varchar,
  	"visit_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cuts_id" integer,
  	"menu_items_id" integer
  );
  
  CREATE TABLE "payload"."menu_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."menu_page_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"meta_description" varchar,
  	"prices_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."cuts_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."cuts_page_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."week_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."week_page_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."events_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."events_page_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"meta_description" varchar,
  	"form_title" varchar,
  	"form_intro" varchar,
  	"form_success" varchar,
  	"form_labels_name" varchar,
  	"form_labels_phone" varchar,
  	"form_labels_email" varchar,
  	"form_labels_date" varchar,
  	"form_labels_guests" varchar,
  	"form_labels_event_type" varchar,
  	"form_labels_message" varchar,
  	"form_labels_submit" varchar,
  	"form_labels_error" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."visit_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."visit_page_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."reserve_page_occasions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."reserve_page_occasions_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."reserve_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"times" varchar DEFAULT '12:00,12:30,13:00,13:30,14:00,19:00,19:30,20:00,20:30,21:00,21:30,22:00',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."reserve_page_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"meta_description" varchar,
  	"labels_name" varchar,
  	"labels_date" varchar,
  	"labels_time" varchar,
  	"labels_guests" varchar,
  	"labels_occasion" varchar,
  	"labels_notes" varchar,
  	"labels_submit" varchar,
  	"labels_note" varchar,
  	"message_template" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."settings_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."settings_hours_locales" (
  	"days" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"restaurant_name" varchar DEFAULT 'Fogo de Chão',
  	"status" "payload"."enum_settings_status" DEFAULT 'coming-soon',
  	"opening_date" timestamp(3) with time zone,
  	"map_query" varchar DEFAULT 'Mall Ventura Sur, Doble Vía a La Guardia, Santa Cruz de la Sierra, Bolivia',
  	"whatsapp" varchar DEFAULT '+59177165787' NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"social_instagram" varchar,
  	"social_facebook" varchar,
  	"social_tiktok" varchar,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"colors_charcoal" varchar DEFAULT '#0E0B09',
  	"colors_ember" varchar DEFAULT '#E2571E',
  	"colors_gold" varchar DEFAULT '#C9A24A',
  	"colors_bone" varchar DEFAULT '#EFE6D8',
  	"colors_paper" varchar DEFAULT '#F4EDE2',
  	"colors_ink" varchar DEFAULT '#1B1512',
  	"colors_card_yes" varchar DEFAULT '#3E9B57',
  	"colors_card_no" varchar DEFAULT '#C8433B',
  	"fonts_display" "payload"."enum_settings_fonts_display" DEFAULT 'Cormorant Garamond',
  	"fonts_body" "payload"."enum_settings_fonts_body" DEFAULT 'Manrope',
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."settings_locales" (
  	"branch_name" varchar DEFAULT 'Ventura Sur · Santa Cruz',
  	"address" varchar DEFAULT 'Mall Ventura Sur · 5to anillo, Doble Vía a La Guardia
  Santa Cruz de la Sierra, Bolivia',
  	"parking_note" varchar,
  	"whatsapp_greeting" varchar DEFAULT 'Hola Fogo de Chão Ventura Sur, quisiera hacer una reserva.',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."navigation_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."navigation_locales" (
  	"ui_reserve" varchar,
  	"ui_reserve_whatsapp" varchar,
  	"ui_menu" varchar,
  	"ui_close" varchar,
  	"ui_language" varchar,
  	"ui_scroll" varchar,
  	"ui_consult" varchar,
  	"ui_per_person" varchar,
  	"ui_today" varchar,
  	"ui_directions" varchar,
  	"ui_hours_tbd" varchar,
  	"ui_opening_in" varchar,
  	"ui_days" varchar,
  	"ui_hours" varchar,
  	"ui_minutes" varchar,
  	"ui_seconds" varchar,
  	"ui_now_open" varchar,
  	"ui_see_all" varchar,
  	"ui_back" varchar,
  	"ui_flip" varchar,
  	"ui_tasting_notes" varchar,
  	"ui_doneness" varchar,
  	"ui_origin" varchar,
  	"ui_pairing" varchar,
  	"ui_sound_off" varchar,
  	"ui_skip" varchar,
  	"ui_all_rights" varchar,
  	"footer_tagline" varchar,
  	"footer_legal" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_rich_text_locales" ADD CONSTRAINT "pages_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_text_locales" ADD CONSTRAINT "pages_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_gallery_items_locales" ADD CONSTRAINT "pages_blocks_gallery_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_gallery_locales" ADD CONSTRAINT "pages_blocks_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_cta_locales" ADD CONSTRAINT "pages_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_quote_locales" ADD CONSTRAINT "pages_blocks_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_quote"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_hero_locales" ADD CONSTRAINT "_pages_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_rich_text_locales" ADD CONSTRAINT "_pages_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_image_text_locales" ADD CONSTRAINT "_pages_v_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_gallery_items_locales" ADD CONSTRAINT "_pages_v_blocks_gallery_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_gallery_locales" ADD CONSTRAINT "_pages_v_blocks_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_cta_locales" ADD CONSTRAINT "_pages_v_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_quote" ADD CONSTRAINT "_pages_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_quote_locales" ADD CONSTRAINT "_pages_v_blocks_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v_blocks_quote"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."cuts" ADD CONSTRAINT "cuts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."cuts" ADD CONSTRAINT "cuts_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."cuts_locales" ADD CONSTRAINT "cuts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."cuts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."menu_categories" ADD CONSTRAINT "menu_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."menu_categories_locales" ADD CONSTRAINT "menu_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."menu_items_tags" ADD CONSTRAINT "menu_items_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "payload"."menu_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."menu_items" ADD CONSTRAINT "menu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."menu_items_locales" ADD CONSTRAINT "menu_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."promotions_days" ADD CONSTRAINT "promotions_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."promotions" ADD CONSTRAINT "promotions_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."promotions" ADD CONSTRAINT "promotions_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."promotions_locales" ADD CONSTRAINT "promotions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."event_packages_features" ADD CONSTRAINT "event_packages_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."event_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."event_packages_features_locales" ADD CONSTRAINT "event_packages_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."event_packages_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."event_packages" ADD CONSTRAINT "event_packages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."event_packages_locales" ADD CONSTRAINT "event_packages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."event_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media" ADD CONSTRAINT "media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cuts_fk" FOREIGN KEY ("cuts_id") REFERENCES "payload"."cuts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_categories_fk" FOREIGN KEY ("menu_categories_id") REFERENCES "payload"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "payload"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "payload"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_packages_fk" FOREIGN KEY ("event_packages_id") REFERENCES "payload"."event_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "payload"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_ritual_beats" ADD CONSTRAINT "home_ritual_beats_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home_ritual_beats" ADD CONSTRAINT "home_ritual_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_ritual_beats_locales" ADD CONSTRAINT "home_ritual_beats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home_ritual_beats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_market_gallery" ADD CONSTRAINT "home_market_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home_market_gallery" ADD CONSTRAINT "home_market_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_market_gallery_locales" ADD CONSTRAINT "home_market_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home_market_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_bar_clips" ADD CONSTRAINT "home_bar_clips_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home_bar_clips" ADD CONSTRAINT "home_bar_clips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_bar_clips_locales" ADD CONSTRAINT "home_bar_clips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home_bar_clips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_hero_intro_video_id_media_id_fk" FOREIGN KEY ("hero_intro_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_hero_loop_video_id_media_id_fk" FOREIGN KEY ("hero_loop_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_market_hero_image_id_media_id_fk" FOREIGN KEY ("market_hero_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_market_video_id_media_id_fk" FOREIGN KEY ("market_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_card_video_id_media_id_fk" FOREIGN KEY ("card_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home" ADD CONSTRAINT "home_visit_media_id_media_id_fk" FOREIGN KEY ("visit_media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_rels" ADD CONSTRAINT "home_rels_cuts_fk" FOREIGN KEY ("cuts_id") REFERENCES "payload"."cuts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_rels" ADD CONSTRAINT "home_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "payload"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."menu_page" ADD CONSTRAINT "menu_page_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."menu_page_locales" ADD CONSTRAINT "menu_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."menu_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."cuts_page" ADD CONSTRAINT "cuts_page_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."cuts_page_locales" ADD CONSTRAINT "cuts_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."cuts_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."week_page" ADD CONSTRAINT "week_page_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."week_page_locales" ADD CONSTRAINT "week_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."week_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."events_page" ADD CONSTRAINT "events_page_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."events_page_locales" ADD CONSTRAINT "events_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."events_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."visit_page" ADD CONSTRAINT "visit_page_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."visit_page_locales" ADD CONSTRAINT "visit_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."visit_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."reserve_page_occasions" ADD CONSTRAINT "reserve_page_occasions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."reserve_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."reserve_page_occasions_locales" ADD CONSTRAINT "reserve_page_occasions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."reserve_page_occasions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."reserve_page" ADD CONSTRAINT "reserve_page_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."reserve_page_locales" ADD CONSTRAINT "reserve_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."reserve_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."settings_hours" ADD CONSTRAINT "settings_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."settings_hours_locales" ADD CONSTRAINT "settings_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."settings_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."settings" ADD CONSTRAINT "settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."settings" ADD CONSTRAINT "settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."settings" ADD CONSTRAINT "settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_links" ADD CONSTRAINT "navigation_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_links_locales" ADD CONSTRAINT "navigation_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_order_idx" ON "payload"."pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "payload"."pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "payload"."pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_media_idx" ON "payload"."pages_blocks_hero" USING btree ("media_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "payload"."pages_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_locales_parent_id_idx" ON "payload"."pages_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_rich_text_locales_locale_parent_id_unique" ON "payload"."pages_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_rich_text_locales_parent_id_idx" ON "payload"."pages_blocks_rich_text_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "payload"."pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "payload"."pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "payload"."pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_media_idx" ON "payload"."pages_blocks_image_text" USING btree ("media_id");
  CREATE UNIQUE INDEX "pages_blocks_image_text_locales_locale_parent_id_unique" ON "payload"."pages_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_image_text_locales_parent_id_idx" ON "payload"."pages_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "payload"."pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "payload"."pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_media_idx" ON "payload"."pages_blocks_gallery_items" USING btree ("media_id");
  CREATE UNIQUE INDEX "pages_blocks_gallery_items_locales_locale_parent_id_unique" ON "payload"."pages_blocks_gallery_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_locales_parent_id_idx" ON "payload"."pages_blocks_gallery_items_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "payload"."pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "payload"."pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "payload"."pages_blocks_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_gallery_locales_locale_parent_id_unique" ON "payload"."pages_blocks_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_gallery_locales_parent_id_idx" ON "payload"."pages_blocks_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "payload"."pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "payload"."pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "payload"."pages_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_cta_locales_locale_parent_id_unique" ON "payload"."pages_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_locales_parent_id_idx" ON "payload"."pages_blocks_cta_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_order_idx" ON "payload"."pages_blocks_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_parent_id_idx" ON "payload"."pages_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_path_idx" ON "payload"."pages_blocks_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_quote_locales_locale_parent_id_unique" ON "payload"."pages_blocks_quote_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_quote_locales_parent_id_idx" ON "payload"."pages_blocks_quote_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "payload"."pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "payload"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "payload"."pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "payload"."pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "payload"."pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "payload"."pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_media_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("media_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_locales_locale_parent_id_unique" ON "payload"."_pages_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_locales_parent_id_idx" ON "payload"."_pages_v_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_rich_text_locales_locale_parent_id_unique" ON "payload"."_pages_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_locales_parent_id_idx" ON "payload"."_pages_v_blocks_rich_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "payload"."_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "payload"."_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "payload"."_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_media_idx" ON "payload"."_pages_v_blocks_image_text" USING btree ("media_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_image_text_locales_locale_parent_id_unique" ON "payload"."_pages_v_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_locales_parent_id_idx" ON "payload"."_pages_v_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "payload"."_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "payload"."_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_media_idx" ON "payload"."_pages_v_blocks_gallery_items" USING btree ("media_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_gallery_items_locales_locale_parent_id_uniqu" ON "payload"."_pages_v_blocks_gallery_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_locales_parent_id_idx" ON "payload"."_pages_v_blocks_gallery_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "payload"."_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "payload"."_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "payload"."_pages_v_blocks_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_gallery_locales_locale_parent_id_unique" ON "payload"."_pages_v_blocks_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_locales_parent_id_idx" ON "payload"."_pages_v_blocks_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "payload"."_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "payload"."_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "payload"."_pages_v_blocks_cta" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_locales_locale_parent_id_unique" ON "payload"."_pages_v_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_locales_parent_id_idx" ON "payload"."_pages_v_blocks_cta_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_order_idx" ON "payload"."_pages_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quote_parent_id_idx" ON "payload"."_pages_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_path_idx" ON "payload"."_pages_v_blocks_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_quote_locales_locale_parent_id_unique" ON "payload"."_pages_v_blocks_quote_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_locales_parent_id_idx" ON "payload"."_pages_v_blocks_quote_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "payload"."_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "payload"."_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "payload"."_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "payload"."_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "payload"."_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "payload"."_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "payload"."_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "payload"."_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "payload"."_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "payload"."_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "payload"."_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "payload"."_pages_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cuts_slug_idx" ON "payload"."cuts" USING btree ("slug");
  CREATE INDEX "cuts_image_idx" ON "payload"."cuts" USING btree ("image_id");
  CREATE INDEX "cuts_video_idx" ON "payload"."cuts" USING btree ("video_id");
  CREATE INDEX "cuts_updated_at_idx" ON "payload"."cuts" USING btree ("updated_at");
  CREATE INDEX "cuts_created_at_idx" ON "payload"."cuts" USING btree ("created_at");
  CREATE UNIQUE INDEX "cuts_locales_locale_parent_id_unique" ON "payload"."cuts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cuts_locales_parent_id_idx" ON "payload"."cuts_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "menu_categories_slug_idx" ON "payload"."menu_categories" USING btree ("slug");
  CREATE INDEX "menu_categories_image_idx" ON "payload"."menu_categories" USING btree ("image_id");
  CREATE INDEX "menu_categories_updated_at_idx" ON "payload"."menu_categories" USING btree ("updated_at");
  CREATE INDEX "menu_categories_created_at_idx" ON "payload"."menu_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "menu_categories_locales_locale_parent_id_unique" ON "payload"."menu_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menu_categories_locales_parent_id_idx" ON "payload"."menu_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "menu_items_tags_order_idx" ON "payload"."menu_items_tags" USING btree ("order");
  CREATE INDEX "menu_items_tags_parent_idx" ON "payload"."menu_items_tags" USING btree ("parent_id");
  CREATE INDEX "menu_items_category_idx" ON "payload"."menu_items" USING btree ("category_id");
  CREATE INDEX "menu_items_image_idx" ON "payload"."menu_items" USING btree ("image_id");
  CREATE INDEX "menu_items_updated_at_idx" ON "payload"."menu_items" USING btree ("updated_at");
  CREATE INDEX "menu_items_created_at_idx" ON "payload"."menu_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "menu_items_locales_locale_parent_id_unique" ON "payload"."menu_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menu_items_locales_parent_id_idx" ON "payload"."menu_items_locales" USING btree ("_parent_id");
  CREATE INDEX "promotions_days_order_idx" ON "payload"."promotions_days" USING btree ("order");
  CREATE INDEX "promotions_days_parent_idx" ON "payload"."promotions_days" USING btree ("parent_id");
  CREATE INDEX "promotions_image_idx" ON "payload"."promotions" USING btree ("image_id");
  CREATE INDEX "promotions_video_idx" ON "payload"."promotions" USING btree ("video_id");
  CREATE INDEX "promotions_updated_at_idx" ON "payload"."promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "payload"."promotions" USING btree ("created_at");
  CREATE UNIQUE INDEX "promotions_locales_locale_parent_id_unique" ON "payload"."promotions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "promotions_locales_parent_id_idx" ON "payload"."promotions_locales" USING btree ("_parent_id");
  CREATE INDEX "event_packages_features_order_idx" ON "payload"."event_packages_features" USING btree ("_order");
  CREATE INDEX "event_packages_features_parent_id_idx" ON "payload"."event_packages_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "event_packages_features_locales_locale_parent_id_unique" ON "payload"."event_packages_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "event_packages_features_locales_parent_id_idx" ON "payload"."event_packages_features_locales" USING btree ("_parent_id");
  CREATE INDEX "event_packages_image_idx" ON "payload"."event_packages" USING btree ("image_id");
  CREATE INDEX "event_packages_updated_at_idx" ON "payload"."event_packages" USING btree ("updated_at");
  CREATE INDEX "event_packages_created_at_idx" ON "payload"."event_packages" USING btree ("created_at");
  CREATE UNIQUE INDEX "event_packages_locales_locale_parent_id_unique" ON "payload"."event_packages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "event_packages_locales_parent_id_idx" ON "payload"."event_packages_locales" USING btree ("_parent_id");
  CREATE INDEX "media_poster_idx" ON "payload"."media" USING btree ("poster_id");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "payload"."media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "payload"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_full_sizes_full_filename_idx" ON "payload"."media" USING btree ("sizes_full_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "payload"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "payload"."media_locales" USING btree ("_parent_id");
  CREATE INDEX "inquiries_updated_at_idx" ON "payload"."inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "payload"."inquiries" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_cuts_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("cuts_id");
  CREATE INDEX "payload_locked_documents_rels_menu_categories_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("menu_categories_id");
  CREATE INDEX "payload_locked_documents_rels_menu_items_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("menu_items_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_event_packages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("event_packages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_ritual_beats_order_idx" ON "payload"."home_ritual_beats" USING btree ("_order");
  CREATE INDEX "home_ritual_beats_parent_id_idx" ON "payload"."home_ritual_beats" USING btree ("_parent_id");
  CREATE INDEX "home_ritual_beats_video_idx" ON "payload"."home_ritual_beats" USING btree ("video_id");
  CREATE UNIQUE INDEX "home_ritual_beats_locales_locale_parent_id_unique" ON "payload"."home_ritual_beats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_ritual_beats_locales_parent_id_idx" ON "payload"."home_ritual_beats_locales" USING btree ("_parent_id");
  CREATE INDEX "home_market_gallery_order_idx" ON "payload"."home_market_gallery" USING btree ("_order");
  CREATE INDEX "home_market_gallery_parent_id_idx" ON "payload"."home_market_gallery" USING btree ("_parent_id");
  CREATE INDEX "home_market_gallery_image_idx" ON "payload"."home_market_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_market_gallery_locales_locale_parent_id_unique" ON "payload"."home_market_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_market_gallery_locales_parent_id_idx" ON "payload"."home_market_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "home_bar_clips_order_idx" ON "payload"."home_bar_clips" USING btree ("_order");
  CREATE INDEX "home_bar_clips_parent_id_idx" ON "payload"."home_bar_clips" USING btree ("_parent_id");
  CREATE INDEX "home_bar_clips_media_idx" ON "payload"."home_bar_clips" USING btree ("media_id");
  CREATE UNIQUE INDEX "home_bar_clips_locales_locale_parent_id_unique" ON "payload"."home_bar_clips_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_bar_clips_locales_parent_id_idx" ON "payload"."home_bar_clips_locales" USING btree ("_parent_id");
  CREATE INDEX "home_hero_hero_intro_video_idx" ON "payload"."home" USING btree ("hero_intro_video_id");
  CREATE INDEX "home_hero_hero_loop_video_idx" ON "payload"."home" USING btree ("hero_loop_video_id");
  CREATE INDEX "home_market_market_hero_image_idx" ON "payload"."home" USING btree ("market_hero_image_id");
  CREATE INDEX "home_market_market_video_idx" ON "payload"."home" USING btree ("market_video_id");
  CREATE INDEX "home_card_card_video_idx" ON "payload"."home" USING btree ("card_video_id");
  CREATE INDEX "home_visit_visit_media_idx" ON "payload"."home" USING btree ("visit_media_id");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "payload"."home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_locales_parent_id_idx" ON "payload"."home_locales" USING btree ("_parent_id");
  CREATE INDEX "home_rels_order_idx" ON "payload"."home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "payload"."home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "payload"."home_rels" USING btree ("path");
  CREATE INDEX "home_rels_cuts_id_idx" ON "payload"."home_rels" USING btree ("cuts_id");
  CREATE INDEX "home_rels_menu_items_id_idx" ON "payload"."home_rels" USING btree ("menu_items_id");
  CREATE INDEX "menu_page_media_idx" ON "payload"."menu_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "menu_page_locales_locale_parent_id_unique" ON "payload"."menu_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menu_page_locales_parent_id_idx" ON "payload"."menu_page_locales" USING btree ("_parent_id");
  CREATE INDEX "cuts_page_media_idx" ON "payload"."cuts_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "cuts_page_locales_locale_parent_id_unique" ON "payload"."cuts_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cuts_page_locales_parent_id_idx" ON "payload"."cuts_page_locales" USING btree ("_parent_id");
  CREATE INDEX "week_page_media_idx" ON "payload"."week_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "week_page_locales_locale_parent_id_unique" ON "payload"."week_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "week_page_locales_parent_id_idx" ON "payload"."week_page_locales" USING btree ("_parent_id");
  CREATE INDEX "events_page_media_idx" ON "payload"."events_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "events_page_locales_locale_parent_id_unique" ON "payload"."events_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_page_locales_parent_id_idx" ON "payload"."events_page_locales" USING btree ("_parent_id");
  CREATE INDEX "visit_page_media_idx" ON "payload"."visit_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "visit_page_locales_locale_parent_id_unique" ON "payload"."visit_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "visit_page_locales_parent_id_idx" ON "payload"."visit_page_locales" USING btree ("_parent_id");
  CREATE INDEX "reserve_page_occasions_order_idx" ON "payload"."reserve_page_occasions" USING btree ("_order");
  CREATE INDEX "reserve_page_occasions_parent_id_idx" ON "payload"."reserve_page_occasions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "reserve_page_occasions_locales_locale_parent_id_unique" ON "payload"."reserve_page_occasions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reserve_page_occasions_locales_parent_id_idx" ON "payload"."reserve_page_occasions_locales" USING btree ("_parent_id");
  CREATE INDEX "reserve_page_media_idx" ON "payload"."reserve_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "reserve_page_locales_locale_parent_id_unique" ON "payload"."reserve_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reserve_page_locales_parent_id_idx" ON "payload"."reserve_page_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_order_idx" ON "payload"."settings_hours" USING btree ("_order");
  CREATE INDEX "settings_hours_parent_id_idx" ON "payload"."settings_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_hours_locales_locale_parent_id_unique" ON "payload"."settings_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_hours_locales_parent_id_idx" ON "payload"."settings_hours_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_logo_idx" ON "payload"."settings" USING btree ("logo_id");
  CREATE INDEX "settings_favicon_idx" ON "payload"."settings" USING btree ("favicon_id");
  CREATE INDEX "settings_og_image_idx" ON "payload"."settings" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "payload"."settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_locales_parent_id_idx" ON "payload"."settings_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_links_order_idx" ON "payload"."navigation_links" USING btree ("_order");
  CREATE INDEX "navigation_links_parent_id_idx" ON "payload"."navigation_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_links_locales_locale_parent_id_unique" ON "payload"."navigation_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_links_locales_parent_id_idx" ON "payload"."navigation_links_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "payload"."navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_locales_parent_id_idx" ON "payload"."navigation_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_hero" CASCADE;
  DROP TABLE "payload"."pages_blocks_hero_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_rich_text" CASCADE;
  DROP TABLE "payload"."pages_blocks_rich_text_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_image_text" CASCADE;
  DROP TABLE "payload"."pages_blocks_image_text_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_gallery_items" CASCADE;
  DROP TABLE "payload"."pages_blocks_gallery_items_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_gallery" CASCADE;
  DROP TABLE "payload"."pages_blocks_gallery_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_cta" CASCADE;
  DROP TABLE "payload"."pages_blocks_cta_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_quote" CASCADE;
  DROP TABLE "payload"."pages_blocks_quote_locales" CASCADE;
  DROP TABLE "payload"."pages" CASCADE;
  DROP TABLE "payload"."pages_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_hero" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_hero_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_rich_text_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_image_text_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_gallery_items_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_gallery_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_cta" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_cta_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_quote" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_quote_locales" CASCADE;
  DROP TABLE "payload"."_pages_v" CASCADE;
  DROP TABLE "payload"."_pages_v_locales" CASCADE;
  DROP TABLE "payload"."cuts" CASCADE;
  DROP TABLE "payload"."cuts_locales" CASCADE;
  DROP TABLE "payload"."menu_categories" CASCADE;
  DROP TABLE "payload"."menu_categories_locales" CASCADE;
  DROP TABLE "payload"."menu_items_tags" CASCADE;
  DROP TABLE "payload"."menu_items" CASCADE;
  DROP TABLE "payload"."menu_items_locales" CASCADE;
  DROP TABLE "payload"."promotions_days" CASCADE;
  DROP TABLE "payload"."promotions" CASCADE;
  DROP TABLE "payload"."promotions_locales" CASCADE;
  DROP TABLE "payload"."event_packages_features" CASCADE;
  DROP TABLE "payload"."event_packages_features_locales" CASCADE;
  DROP TABLE "payload"."event_packages" CASCADE;
  DROP TABLE "payload"."event_packages_locales" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."media_locales" CASCADE;
  DROP TABLE "payload"."inquiries" CASCADE;
  DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."home_ritual_beats" CASCADE;
  DROP TABLE "payload"."home_ritual_beats_locales" CASCADE;
  DROP TABLE "payload"."home_market_gallery" CASCADE;
  DROP TABLE "payload"."home_market_gallery_locales" CASCADE;
  DROP TABLE "payload"."home_bar_clips" CASCADE;
  DROP TABLE "payload"."home_bar_clips_locales" CASCADE;
  DROP TABLE "payload"."home" CASCADE;
  DROP TABLE "payload"."home_locales" CASCADE;
  DROP TABLE "payload"."home_rels" CASCADE;
  DROP TABLE "payload"."menu_page" CASCADE;
  DROP TABLE "payload"."menu_page_locales" CASCADE;
  DROP TABLE "payload"."cuts_page" CASCADE;
  DROP TABLE "payload"."cuts_page_locales" CASCADE;
  DROP TABLE "payload"."week_page" CASCADE;
  DROP TABLE "payload"."week_page_locales" CASCADE;
  DROP TABLE "payload"."events_page" CASCADE;
  DROP TABLE "payload"."events_page_locales" CASCADE;
  DROP TABLE "payload"."visit_page" CASCADE;
  DROP TABLE "payload"."visit_page_locales" CASCADE;
  DROP TABLE "payload"."reserve_page_occasions" CASCADE;
  DROP TABLE "payload"."reserve_page_occasions_locales" CASCADE;
  DROP TABLE "payload"."reserve_page" CASCADE;
  DROP TABLE "payload"."reserve_page_locales" CASCADE;
  DROP TABLE "payload"."settings_hours" CASCADE;
  DROP TABLE "payload"."settings_hours_locales" CASCADE;
  DROP TABLE "payload"."settings" CASCADE;
  DROP TABLE "payload"."settings_locales" CASCADE;
  DROP TABLE "payload"."navigation_links" CASCADE;
  DROP TABLE "payload"."navigation_links_locales" CASCADE;
  DROP TABLE "payload"."navigation" CASCADE;
  DROP TABLE "payload"."navigation_locales" CASCADE;
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_pages_blocks_cta_action";
  DROP TYPE "payload"."enum_pages_status";
  DROP TYPE "payload"."enum__pages_v_blocks_cta_action";
  DROP TYPE "payload"."enum__pages_v_version_status";
  DROP TYPE "payload"."enum__pages_v_published_locale";
  DROP TYPE "payload"."enum_menu_items_tags";
  DROP TYPE "payload"."enum_promotions_days";
  DROP TYPE "payload"."enum_promotions_service";
  DROP TYPE "payload"."enum_inquiries_status";
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_settings_status";
  DROP TYPE "payload"."enum_settings_fonts_display";
  DROP TYPE "payload"."enum_settings_fonts_body";`)
}
