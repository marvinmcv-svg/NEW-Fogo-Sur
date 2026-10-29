import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { applyHeroExperience } from '../seed/heroTriptych'

// Content only: the "experiencia" reel leads the hero (and is the phone hero),
// and the Market Table gets its new overhead photo. Uploads run on their own
// requests, never on the migration's (see uploadSeedMedia).
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await applyHeroExperience(payload)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
