import * as migration_20261118_161400_esquema_inicial from './20261118_161400_esquema_inicial';

export const migrations = [
  {
    up: migration_20261118_161400_esquema_inicial.up,
    down: migration_20261118_161400_esquema_inicial.down,
    name: '20261118_161400_esquema_inicial'
  },
];
