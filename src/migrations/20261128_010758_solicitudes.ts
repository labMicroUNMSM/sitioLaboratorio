import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_solicitudes_tipo" AS ENUM('contacto', 'unete');
  CREATE TABLE "solicitudes" (
    "id" serial PRIMARY KEY NOT NULL,
    "tipo" "enum_solicitudes_tipo" NOT NULL,
    "nombre" varchar NOT NULL,
    "correo" varchar NOT NULL,
    "mensaje" varchar NOT NULL,
    "aviso" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "solicitudes_id" integer;
  CREATE INDEX "solicitudes_updated_at_idx" ON "solicitudes" USING btree ("updated_at");
  CREATE INDEX "solicitudes_created_at_idx" ON "solicitudes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solicitudes_fk" FOREIGN KEY ("solicitudes_id") REFERENCES "public"."solicitudes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_solicitudes_id_idx" ON "payload_locked_documents_rels" USING btree ("solicitudes_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   LOCK TABLE "solicitudes" IN ACCESS EXCLUSIVE MODE;
   DO $$ BEGIN
     IF EXISTS (SELECT 1 FROM solicitudes) THEN
       RAISE EXCEPTION 'Respalda y revisa las solicitudes antes de revertir.';
     END IF;
   END $$;
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "solicitudes_id";
   DROP TABLE "solicitudes";
  DROP TYPE "public"."enum_solicitudes_tipo";`)
}
