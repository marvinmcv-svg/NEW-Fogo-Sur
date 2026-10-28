import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { repairHeroReels } from '../seed/heroTriptych'

// Content only: re-uploads the hero reels, whose Blob files all held the same
// poster image (they had been uploaded on one shared request).
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await repairHeroReels(payload)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
