import * as migration_20261118_161400_esquema_inicial from './20261118_161400_esquema_inicial';
import * as migration_20261118_183202_permisos_editor from './20261118_183202_permisos_editor';
import * as migration_20261127_161000_mfa_admin from './20261127_161000_mfa_admin';
import * as migration_20261128_010758_solicitudes from './20261128_010758_solicitudes';

export const migrations = [
  {
    up: migration_20261118_161400_esquema_inicial.up,
    down: migration_20261118_161400_esquema_inicial.down,
    name: '20261118_161400_esquema_inicial',
  },
  {
    up: migration_20261118_183202_permisos_editor.up,
    down: migration_20261118_183202_permisos_editor.down,
    name: '20261118_183202_permisos_editor',
  },
  {
    up: migration_20261127_161000_mfa_admin.up,
    down: migration_20261127_161000_mfa_admin.down,
    name: '20261127_161000_mfa_admin',
  },
  {
    up: migration_20261128_010758_solicitudes.up,
    down: migration_20261128_010758_solicitudes.down,
    name: '20261128_010758_solicitudes'
  },
];
