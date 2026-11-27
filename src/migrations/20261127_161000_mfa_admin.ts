import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE usuario_mfa (
      usuario integer PRIMARY KEY, cifrado text NOT NULL, periodo integer NOT NULL, sesiones jsonb NOT NULL
    );
    CREATE TABLE usuario_mfa_intentos (
      usuario integer PRIMARY KEY, cantidad integer NOT NULL, hasta timestamp with time zone NOT NULL
    );
    UPDATE usuarios SET mfa_habilitado = false WHERE mfa_habilitado;
    DELETE FROM usuarios_sessions WHERE _parent_id IN (SELECT id FROM usuarios WHERE rol = 'admin');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    LOCK TABLE usuario_mfa IN ACCESS EXCLUSIVE MODE;
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM usuario_mfa) THEN
        RAISE EXCEPTION 'Hay autenticadores vinculados. La reversión requiere un plan de recuperación.';
      END IF;
    END $$;
    DROP TABLE usuario_mfa_intentos;
    DROP TABLE usuario_mfa;
  `)
}
