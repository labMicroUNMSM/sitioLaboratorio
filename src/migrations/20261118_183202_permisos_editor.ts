import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "publicaciones" ALTER COLUMN "bibtex_raw" DROP NOT NULL;
    ALTER TABLE "media" ADD COLUMN "eliminado_en" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    LOCK TABLE "media" IN ACCESS EXCLUSIVE MODE;
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM "media" WHERE "eliminado_en" IS NOT NULL) THEN
        RAISE EXCEPTION 'Hay medios retirados. Revisa sus marcas antes de revertir.';
      END IF;
    END $$;
    ALTER TABLE "publicaciones" ALTER COLUMN "bibtex_raw" SET NOT NULL;
    ALTER TABLE "media" DROP COLUMN "eliminado_en";
  `)
}
