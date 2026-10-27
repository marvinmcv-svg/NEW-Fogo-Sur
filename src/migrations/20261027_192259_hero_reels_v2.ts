import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { replaceHeroReels } from '../seed/heroTriptych'

// Content only: the live hero switches to the three Fogo reels (end cards trimmed).
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await replaceHeroReels(payload, req)
}

// The previous reels stay in the media library; pick them again in the admin if needed.
export async function down(_args: MigrateDownArgs): Promise<void> {}
