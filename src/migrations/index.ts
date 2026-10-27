import * as migration_20261025_025919_initial from './20261025_025919_initial';
import * as migration_20261025_032158_blob_storage from './20261025_032158_blob_storage';
import * as migration_20261025_195426_reservation_requests from './20261025_195426_reservation_requests';
import * as migration_20261026_141934_hero_triptych from './20261026_141934_hero_triptych';
import * as migration_20261027_192259_hero_reels_v2 from './20261027_192259_hero_reels_v2';

export const migrations = [
  {
    up: migration_20261025_025919_initial.up,
    down: migration_20261025_025919_initial.down,
    name: '20261025_025919_initial',
  },
  {
    up: migration_20261025_032158_blob_storage.up,
    down: migration_20261025_032158_blob_storage.down,
    name: '20261025_032158_blob_storage',
  },
  {
    up: migration_20261025_195426_reservation_requests.up,
    down: migration_20261025_195426_reservation_requests.down,
    name: '20261025_195426_reservation_requests',
  },
  {
    up: migration_20261026_141934_hero_triptych.up,
    down: migration_20261026_141934_hero_triptych.down,
    name: '20261026_141934_hero_triptych',
  },
  {
    up: migration_20261027_192259_hero_reels_v2.up,
    down: migration_20261027_192259_hero_reels_v2.down,
    name: '20261027_192259_hero_reels_v2'
  },
];
