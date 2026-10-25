import * as migration_20261025_025919_initial from './20261025_025919_initial';
import * as migration_20261025_032158_blob_storage from './20261025_032158_blob_storage';

export const migrations = [
  {
    up: migration_20261025_025919_initial.up,
    down: migration_20261025_025919_initial.down,
    name: '20261025_025919_initial',
  },
  {
    up: migration_20261025_032158_blob_storage.up,
    down: migration_20261025_032158_blob_storage.down,
    name: '20261025_032158_blob_storage'
  },
];
