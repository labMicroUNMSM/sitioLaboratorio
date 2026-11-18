import * as migration_20261118_161400_esquema_inicial from './20261118_161400_esquema_inicial';
import * as migration_20261118_183202_permisos_editor from './20261118_183202_permisos_editor';

export const migrations = [
  {
    up: migration_20261118_161400_esquema_inicial.up,
    down: migration_20261118_161400_esquema_inicial.down,
    name: '20261118_161400_esquema_inicial',
  },
  {
    up: migration_20261118_183202_permisos_editor.up,
    down: migration_20261118_183202_permisos_editor.down,
    name: '20261118_183202_permisos_editor'
  },
];
