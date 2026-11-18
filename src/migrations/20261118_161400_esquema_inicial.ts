import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_lineas_investigacion_estado" AS ENUM('borrador', 'publicado', 'archivado');
  CREATE TYPE "public"."enum_lineas_investigacion_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lineas_investigacion_v_version_estado" AS ENUM('borrador', 'publicado', 'archivado');
  CREATE TYPE "public"."enum__lineas_investigacion_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lineas_investigacion_v_published_locale" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_personas_rol" AS ENUM('investigador_principal', 'responsable_tecnico', 'postdoc', 'colaborador_internacional', 'tesista_pregrado', 'tesista_maestria', 'tesista_doctorado', 'alumni');
  CREATE TYPE "public"."enum_proyectos_tipo" AS ENUM('investigacion', 'equipamiento_implementacion');
  CREATE TYPE "public"."enum_proyectos_estado" AS ENUM('activo', 'concluido');
  CREATE TYPE "public"."enum_publicaciones_cuartil" AS ENUM('Q1', 'Q2', 'Q3', 'Q4');
  CREATE TYPE "public"."enum_publicaciones_tipo" AS ENUM('articulo', 'capitulo', 'conferencia', 'preprint');
  CREATE TYPE "public"."enum_patentes_estado" AS ENUM('en_tramite', 'concedida');
  CREATE TYPE "public"."enum_equipamiento_categoria" AS ENUM('biologia_molecular', 'cultivo_celular', 'bioinformatica', 'microscopia', 'analisis_bioquimico');
  CREATE TYPE "public"."enum_noticias_categoria" AS ENUM('anuncio', 'logro', 'evento', 'publicacion_destacada');
  CREATE TYPE "public"."enum_noticias_estado" AS ENUM('borrador', 'revision', 'programado', 'publicado', 'archivado');
  CREATE TYPE "public"."enum_noticias_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__noticias_v_version_categoria" AS ENUM('anuncio', 'logro', 'evento', 'publicacion_destacada');
  CREATE TYPE "public"."enum__noticias_v_version_estado" AS ENUM('borrador', 'revision', 'programado', 'publicado', 'archivado');
  CREATE TYPE "public"."enum__noticias_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__noticias_v_published_locale" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_paginas_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_usuarios_rol" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "lineas_investigacion" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" varchar,
    "figura_id" integer,
    "destacada" boolean DEFAULT false,
    "orden" numeric DEFAULT 0,
    "estado" "enum_lineas_investigacion_estado" DEFAULT 'borrador',
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_lineas_investigacion_status" DEFAULT 'draft'
  );

  CREATE TABLE "lineas_investigacion_locales" (
    "titulo" varchar,
    "resumen_divulgativo" jsonb,
    "detalle_tecnico" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_lineas_investigacion_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_slug" varchar,
    "version_figura_id" integer,
    "version_destacada" boolean DEFAULT false,
    "version_orden" numeric DEFAULT 0,
    "version_estado" "enum__lineas_investigacion_v_version_estado" DEFAULT 'borrador',
    "version_eliminado_en" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__lineas_investigacion_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__lineas_investigacion_v_published_locale",
    "latest" boolean
  );

  CREATE TABLE "_lineas_investigacion_v_locales" (
    "version_titulo" varchar,
    "version_resumen_divulgativo" jsonb,
    "version_detalle_tecnico" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "personas" (
    "id" serial PRIMARY KEY NOT NULL,
    "nombre_completo" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "rol" "enum_personas_rol" NOT NULL,
    "foto_id" integer,
    "orcid" varchar,
    "researchgate" varchar,
    "email" varchar,
    "orden" numeric DEFAULT 0,
    "activo" boolean DEFAULT true,
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "personas_locales" (
    "cargo_titulo" varchar,
    "biografia" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "personas_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "lineas_investigacion_id" integer
  );

  CREATE TABLE "proyectos" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" varchar NOT NULL,
    "tipo" "enum_proyectos_tipo" NOT NULL,
    "estado" "enum_proyectos_estado" NOT NULL,
    "entidad_financiadora" varchar NOT NULL,
    "numero_contrato" varchar,
    "periodo_inicio" timestamp(3) with time zone NOT NULL,
    "periodo_fin" timestamp(3) with time zone,
    "monto" numeric,
    "monto_publicable" boolean DEFAULT false,
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "proyectos_locales" (
    "titulo" varchar NOT NULL,
    "resumen" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "proyectos_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "personas_id" integer,
    "lineas_investigacion_id" integer,
    "media_id" integer
  );

  CREATE TABLE "publicaciones" (
    "id" serial PRIMARY KEY NOT NULL,
    "titulo" varchar NOT NULL,
    "autores" varchar NOT NULL,
    "anio" numeric NOT NULL,
    "revista" varchar NOT NULL,
    "doi" varchar NOT NULL,
    "cuartil" "enum_publicaciones_cuartil",
    "url_acceso_abierto" varchar,
    "tipo" "enum_publicaciones_tipo" NOT NULL,
    "bibtex_raw" varchar NOT NULL,
    "import_batch_id" varchar,
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "publicaciones_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "personas_id" integer,
    "lineas_investigacion_id" integer
  );

  CREATE TABLE "patentes" (
    "id" serial PRIMARY KEY NOT NULL,
    "estado" "enum_patentes_estado" NOT NULL,
    "numero_expediente" varchar NOT NULL,
    "oficina" varchar NOT NULL,
    "fecha_solicitud" timestamp(3) with time zone NOT NULL,
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "patentes_locales" (
    "titulo" varchar NOT NULL,
    "resumen" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "patentes_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "personas_id" integer
  );

  CREATE TABLE "equipamiento" (
    "id" serial PRIMARY KEY NOT NULL,
    "nombre" varchar NOT NULL,
    "categoria" "enum_equipamiento_categoria" NOT NULL,
    "marca_modelo" varchar NOT NULL,
    "foto_id" integer NOT NULL,
    "disponible_colaboracion" boolean DEFAULT false,
    "orden" numeric DEFAULT 0,
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "equipamiento_locales" (
    "capacidades" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "noticias" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" varchar,
    "fecha_publicacion" timestamp(3) with time zone,
    "imagen_portada_id" integer,
    "categoria" "enum_noticias_categoria",
    "estado" "enum_noticias_estado" DEFAULT 'borrador',
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_noticias_status" DEFAULT 'draft'
  );

  CREATE TABLE "noticias_locales" (
    "titulo" varchar,
    "resumen" varchar,
    "cuerpo" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "noticias_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "lineas_investigacion_id" integer,
    "personas_id" integer
  );

  CREATE TABLE "_noticias_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_slug" varchar,
    "version_fecha_publicacion" timestamp(3) with time zone,
    "version_imagen_portada_id" integer,
    "version_categoria" "enum__noticias_v_version_categoria",
    "version_estado" "enum__noticias_v_version_estado" DEFAULT 'borrador',
    "version_eliminado_en" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__noticias_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__noticias_v_published_locale",
    "latest" boolean
  );

  CREATE TABLE "_noticias_v_locales" (
    "version_titulo" varchar,
    "version_resumen" varchar,
    "version_cuerpo" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_noticias_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "lineas_investigacion_id" integer,
    "personas_id" integer
  );

  CREATE TABLE "paginas" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" varchar NOT NULL,
    "estado" "enum_paginas_estado" DEFAULT 'borrador' NOT NULL,
    "eliminado_en" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "paginas_locales" (
    "titulo" varchar NOT NULL,
    "cuerpo" jsonb NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "creditos" varchar,
    "_objectkey" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_thumbnail_url" varchar,
    "sizes_thumbnail_width" numeric,
    "sizes_thumbnail_height" numeric,
    "sizes_thumbnail_mime_type" varchar,
    "sizes_thumbnail_filesize" numeric,
    "sizes_thumbnail_filename" varchar,
    "sizes_card_url" varchar,
    "sizes_card_width" numeric,
    "sizes_card_height" numeric,
    "sizes_card_mime_type" varchar,
    "sizes_card_filesize" numeric,
    "sizes_card_filename" varchar,
    "sizes_full_url" varchar,
    "sizes_full_width" numeric,
    "sizes_full_height" numeric,
    "sizes_full_mime_type" varchar,
    "sizes_full_filesize" numeric,
    "sizes_full_filename" varchar
  );

  CREATE TABLE "media_locales" (
    "alt" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "usuarios_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "usuarios" (
    "id" serial PRIMARY KEY NOT NULL,
    "nombre" varchar NOT NULL,
    "rol" "enum_usuarios_rol" DEFAULT 'editor' NOT NULL,
    "mfa_habilitado" boolean DEFAULT false,
    "activo" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "reset_password_requested_at" timestamp(3) with time zone,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "auditoria" (
    "id" serial PRIMARY KEY NOT NULL,
    "accion" varchar NOT NULL,
    "coleccion_afectada" varchar NOT NULL,
    "documento_id" varchar NOT NULL,
    "usuario_id" integer NOT NULL,
    "detalle" jsonb,
    "hash_sha256" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "lineas_investigacion_id" integer,
    "personas_id" integer,
    "proyectos_id" integer,
    "publicaciones_id" integer,
    "patentes_id" integer,
    "equipamiento_id" integer,
    "noticias_id" integer,
    "paginas_id" integer,
    "media_id" integer,
    "usuarios_id" integer,
    "auditoria_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "usuarios_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "lineas_investigacion" ADD CONSTRAINT "lineas_investigacion_figura_id_media_id_fk" FOREIGN KEY ("figura_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lineas_investigacion_locales" ADD CONSTRAINT "lineas_investigacion_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lineas_investigacion_v" ADD CONSTRAINT "_lineas_investigacion_v_parent_id_lineas_investigacion_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lineas_investigacion_v" ADD CONSTRAINT "_lineas_investigacion_v_version_figura_id_media_id_fk" FOREIGN KEY ("version_figura_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lineas_investigacion_v_locales" ADD CONSTRAINT "_lineas_investigacion_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lineas_investigacion_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas" ADD CONSTRAINT "personas_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "personas_locales" ADD CONSTRAINT "personas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_rels" ADD CONSTRAINT "personas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_rels" ADD CONSTRAINT "personas_rels_lineas_investigacion_fk" FOREIGN KEY ("lineas_investigacion_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_locales" ADD CONSTRAINT "proyectos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_lineas_investigacion_fk" FOREIGN KEY ("lineas_investigacion_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publicaciones_rels" ADD CONSTRAINT "publicaciones_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publicaciones_rels" ADD CONSTRAINT "publicaciones_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publicaciones_rels" ADD CONSTRAINT "publicaciones_rels_lineas_investigacion_fk" FOREIGN KEY ("lineas_investigacion_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patentes_locales" ADD CONSTRAINT "patentes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."patentes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patentes_rels" ADD CONSTRAINT "patentes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."patentes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patentes_rels" ADD CONSTRAINT "patentes_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "equipamiento" ADD CONSTRAINT "equipamiento_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "equipamiento_locales" ADD CONSTRAINT "equipamiento_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."equipamiento"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias" ADD CONSTRAINT "noticias_imagen_portada_id_media_id_fk" FOREIGN KEY ("imagen_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "noticias_locales" ADD CONSTRAINT "noticias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_lineas_investigacion_fk" FOREIGN KEY ("lineas_investigacion_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_parent_id_noticias_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_version_imagen_portada_id_media_id_fk" FOREIGN KEY ("version_imagen_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v_locales" ADD CONSTRAINT "_noticias_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_noticias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_noticias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_lineas_investigacion_fk" FOREIGN KEY ("lineas_investigacion_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_locales" ADD CONSTRAINT "paginas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lineas_investigacion_fk" FOREIGN KEY ("lineas_investigacion_id") REFERENCES "public"."lineas_investigacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proyectos_fk" FOREIGN KEY ("proyectos_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publicaciones_fk" FOREIGN KEY ("publicaciones_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_patentes_fk" FOREIGN KEY ("patentes_id") REFERENCES "public"."patentes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_equipamiento_fk" FOREIGN KEY ("equipamiento_id") REFERENCES "public"."equipamiento"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_noticias_fk" FOREIGN KEY ("noticias_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paginas_fk" FOREIGN KEY ("paginas_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_auditoria_fk" FOREIGN KEY ("auditoria_id") REFERENCES "public"."auditoria"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "lineas_investigacion_slug_idx" ON "lineas_investigacion" USING btree ("slug");
  CREATE INDEX "lineas_investigacion_figura_idx" ON "lineas_investigacion" USING btree ("figura_id");
  CREATE INDEX "lineas_investigacion_updated_at_idx" ON "lineas_investigacion" USING btree ("updated_at");
  CREATE INDEX "lineas_investigacion_created_at_idx" ON "lineas_investigacion" USING btree ("created_at");
  CREATE INDEX "lineas_investigacion__status_idx" ON "lineas_investigacion" USING btree ("_status");
  CREATE UNIQUE INDEX "lineas_investigacion_locales_locale_parent_id_unique" ON "lineas_investigacion_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_lineas_investigacion_v_parent_idx" ON "_lineas_investigacion_v" USING btree ("parent_id");
  CREATE INDEX "_lineas_investigacion_v_version_version_slug_idx" ON "_lineas_investigacion_v" USING btree ("version_slug");
  CREATE INDEX "_lineas_investigacion_v_version_version_figura_idx" ON "_lineas_investigacion_v" USING btree ("version_figura_id");
  CREATE INDEX "_lineas_investigacion_v_version_version_updated_at_idx" ON "_lineas_investigacion_v" USING btree ("version_updated_at");
  CREATE INDEX "_lineas_investigacion_v_version_version_created_at_idx" ON "_lineas_investigacion_v" USING btree ("version_created_at");
  CREATE INDEX "_lineas_investigacion_v_version_version__status_idx" ON "_lineas_investigacion_v" USING btree ("version__status");
  CREATE INDEX "_lineas_investigacion_v_created_at_idx" ON "_lineas_investigacion_v" USING btree ("created_at");
  CREATE INDEX "_lineas_investigacion_v_updated_at_idx" ON "_lineas_investigacion_v" USING btree ("updated_at");
  CREATE INDEX "_lineas_investigacion_v_snapshot_idx" ON "_lineas_investigacion_v" USING btree ("snapshot");
  CREATE INDEX "_lineas_investigacion_v_published_locale_idx" ON "_lineas_investigacion_v" USING btree ("published_locale");
  CREATE INDEX "_lineas_investigacion_v_latest_idx" ON "_lineas_investigacion_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_lineas_investigacion_v_locales_locale_parent_id_unique" ON "_lineas_investigacion_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "personas_slug_idx" ON "personas" USING btree ("slug");
  CREATE INDEX "personas_foto_idx" ON "personas" USING btree ("foto_id");
  CREATE INDEX "personas_updated_at_idx" ON "personas" USING btree ("updated_at");
  CREATE INDEX "personas_created_at_idx" ON "personas" USING btree ("created_at");
  CREATE UNIQUE INDEX "personas_locales_locale_parent_id_unique" ON "personas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "personas_rels_order_idx" ON "personas_rels" USING btree ("order");
  CREATE INDEX "personas_rels_parent_idx" ON "personas_rels" USING btree ("parent_id");
  CREATE INDEX "personas_rels_path_idx" ON "personas_rels" USING btree ("path");
  CREATE INDEX "personas_rels_lineas_investigacion_id_idx" ON "personas_rels" USING btree ("lineas_investigacion_id");
  CREATE UNIQUE INDEX "proyectos_slug_idx" ON "proyectos" USING btree ("slug");
  CREATE INDEX "proyectos_updated_at_idx" ON "proyectos" USING btree ("updated_at");
  CREATE INDEX "proyectos_created_at_idx" ON "proyectos" USING btree ("created_at");
  CREATE UNIQUE INDEX "proyectos_locales_locale_parent_id_unique" ON "proyectos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "proyectos_rels_order_idx" ON "proyectos_rels" USING btree ("order");
  CREATE INDEX "proyectos_rels_parent_idx" ON "proyectos_rels" USING btree ("parent_id");
  CREATE INDEX "proyectos_rels_path_idx" ON "proyectos_rels" USING btree ("path");
  CREATE INDEX "proyectos_rels_personas_id_idx" ON "proyectos_rels" USING btree ("personas_id");
  CREATE INDEX "proyectos_rels_lineas_investigacion_id_idx" ON "proyectos_rels" USING btree ("lineas_investigacion_id");
  CREATE INDEX "proyectos_rels_media_id_idx" ON "proyectos_rels" USING btree ("media_id");
  CREATE INDEX "publicaciones_anio_idx" ON "publicaciones" USING btree ("anio");
  CREATE UNIQUE INDEX "publicaciones_doi_idx" ON "publicaciones" USING btree ("doi");
  CREATE INDEX "publicaciones_updated_at_idx" ON "publicaciones" USING btree ("updated_at");
  CREATE INDEX "publicaciones_created_at_idx" ON "publicaciones" USING btree ("created_at");
  CREATE INDEX "anio_idx" ON "publicaciones" USING btree ("anio");
  CREATE UNIQUE INDEX "doi_idx" ON "publicaciones" USING btree ("doi");
  CREATE INDEX "publicaciones_rels_order_idx" ON "publicaciones_rels" USING btree ("order");
  CREATE INDEX "publicaciones_rels_parent_idx" ON "publicaciones_rels" USING btree ("parent_id");
  CREATE INDEX "publicaciones_rels_path_idx" ON "publicaciones_rels" USING btree ("path");
  CREATE INDEX "publicaciones_rels_personas_id_idx" ON "publicaciones_rels" USING btree ("personas_id");
  CREATE INDEX "publicaciones_rels_lineas_investigacion_id_idx" ON "publicaciones_rels" USING btree ("lineas_investigacion_id");
  CREATE INDEX "patentes_updated_at_idx" ON "patentes" USING btree ("updated_at");
  CREATE INDEX "patentes_created_at_idx" ON "patentes" USING btree ("created_at");
  CREATE UNIQUE INDEX "patentes_locales_locale_parent_id_unique" ON "patentes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "patentes_rels_order_idx" ON "patentes_rels" USING btree ("order");
  CREATE INDEX "patentes_rels_parent_idx" ON "patentes_rels" USING btree ("parent_id");
  CREATE INDEX "patentes_rels_path_idx" ON "patentes_rels" USING btree ("path");
  CREATE INDEX "patentes_rels_personas_id_idx" ON "patentes_rels" USING btree ("personas_id");
  CREATE INDEX "equipamiento_foto_idx" ON "equipamiento" USING btree ("foto_id");
  CREATE INDEX "equipamiento_updated_at_idx" ON "equipamiento" USING btree ("updated_at");
  CREATE INDEX "equipamiento_created_at_idx" ON "equipamiento" USING btree ("created_at");
  CREATE UNIQUE INDEX "equipamiento_locales_locale_parent_id_unique" ON "equipamiento_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "noticias_slug_idx" ON "noticias" USING btree ("slug");
  CREATE INDEX "noticias_imagen_portada_idx" ON "noticias" USING btree ("imagen_portada_id");
  CREATE INDEX "noticias_updated_at_idx" ON "noticias" USING btree ("updated_at");
  CREATE INDEX "noticias_created_at_idx" ON "noticias" USING btree ("created_at");
  CREATE INDEX "noticias__status_idx" ON "noticias" USING btree ("_status");
  CREATE INDEX "estado_fecha_publicacion_idx" ON "noticias" USING btree ("estado","fecha_publicacion");
  CREATE UNIQUE INDEX "noticias_locales_locale_parent_id_unique" ON "noticias_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "noticias_rels_order_idx" ON "noticias_rels" USING btree ("order");
  CREATE INDEX "noticias_rels_parent_idx" ON "noticias_rels" USING btree ("parent_id");
  CREATE INDEX "noticias_rels_path_idx" ON "noticias_rels" USING btree ("path");
  CREATE INDEX "noticias_rels_lineas_investigacion_id_idx" ON "noticias_rels" USING btree ("lineas_investigacion_id");
  CREATE INDEX "noticias_rels_personas_id_idx" ON "noticias_rels" USING btree ("personas_id");
  CREATE INDEX "_noticias_v_parent_idx" ON "_noticias_v" USING btree ("parent_id");
  CREATE INDEX "_noticias_v_version_version_slug_idx" ON "_noticias_v" USING btree ("version_slug");
  CREATE INDEX "_noticias_v_version_version_imagen_portada_idx" ON "_noticias_v" USING btree ("version_imagen_portada_id");
  CREATE INDEX "_noticias_v_version_version_updated_at_idx" ON "_noticias_v" USING btree ("version_updated_at");
  CREATE INDEX "_noticias_v_version_version_created_at_idx" ON "_noticias_v" USING btree ("version_created_at");
  CREATE INDEX "_noticias_v_version_version__status_idx" ON "_noticias_v" USING btree ("version__status");
  CREATE INDEX "_noticias_v_created_at_idx" ON "_noticias_v" USING btree ("created_at");
  CREATE INDEX "_noticias_v_updated_at_idx" ON "_noticias_v" USING btree ("updated_at");
  CREATE INDEX "_noticias_v_snapshot_idx" ON "_noticias_v" USING btree ("snapshot");
  CREATE INDEX "_noticias_v_published_locale_idx" ON "_noticias_v" USING btree ("published_locale");
  CREATE INDEX "_noticias_v_latest_idx" ON "_noticias_v" USING btree ("latest");
  CREATE INDEX "version_estado_version_fecha_publicacion_idx" ON "_noticias_v" USING btree ("version_estado","version_fecha_publicacion");
  CREATE UNIQUE INDEX "_noticias_v_locales_locale_parent_id_unique" ON "_noticias_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_noticias_v_rels_order_idx" ON "_noticias_v_rels" USING btree ("order");
  CREATE INDEX "_noticias_v_rels_parent_idx" ON "_noticias_v_rels" USING btree ("parent_id");
  CREATE INDEX "_noticias_v_rels_path_idx" ON "_noticias_v_rels" USING btree ("path");
  CREATE INDEX "_noticias_v_rels_lineas_investigacion_id_idx" ON "_noticias_v_rels" USING btree ("lineas_investigacion_id");
  CREATE INDEX "_noticias_v_rels_personas_id_idx" ON "_noticias_v_rels" USING btree ("personas_id");
  CREATE UNIQUE INDEX "paginas_slug_idx" ON "paginas" USING btree ("slug");
  CREATE INDEX "paginas_updated_at_idx" ON "paginas" USING btree ("updated_at");
  CREATE INDEX "paginas_created_at_idx" ON "paginas" USING btree ("created_at");
  CREATE UNIQUE INDEX "paginas_locales_locale_parent_id_unique" ON "paginas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_full_sizes_full_filename_idx" ON "media" USING btree ("sizes_full_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE INDEX "auditoria_usuario_idx" ON "auditoria" USING btree ("usuario_id");
  CREATE INDEX "auditoria_updated_at_idx" ON "auditoria" USING btree ("updated_at");
  CREATE INDEX "auditoria_created_at_idx" ON "auditoria" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_lineas_investigacion_id_idx" ON "payload_locked_documents_rels" USING btree ("lineas_investigacion_id");
  CREATE INDEX "payload_locked_documents_rels_personas_id_idx" ON "payload_locked_documents_rels" USING btree ("personas_id");
  CREATE INDEX "payload_locked_documents_rels_proyectos_id_idx" ON "payload_locked_documents_rels" USING btree ("proyectos_id");
  CREATE INDEX "payload_locked_documents_rels_publicaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("publicaciones_id");
  CREATE INDEX "payload_locked_documents_rels_patentes_id_idx" ON "payload_locked_documents_rels" USING btree ("patentes_id");
  CREATE INDEX "payload_locked_documents_rels_equipamiento_id_idx" ON "payload_locked_documents_rels" USING btree ("equipamiento_id");
  CREATE INDEX "payload_locked_documents_rels_noticias_id_idx" ON "payload_locked_documents_rels" USING btree ("noticias_id");
  CREATE INDEX "payload_locked_documents_rels_paginas_id_idx" ON "payload_locked_documents_rels" USING btree ("paginas_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_locked_documents_rels_auditoria_id_idx" ON "payload_locked_documents_rels" USING btree ("auditoria_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lineas_investigacion" CASCADE;
  DROP TABLE "lineas_investigacion_locales" CASCADE;
  DROP TABLE "_lineas_investigacion_v" CASCADE;
  DROP TABLE "_lineas_investigacion_v_locales" CASCADE;
  DROP TABLE "personas" CASCADE;
  DROP TABLE "personas_locales" CASCADE;
  DROP TABLE "personas_rels" CASCADE;
  DROP TABLE "proyectos" CASCADE;
  DROP TABLE "proyectos_locales" CASCADE;
  DROP TABLE "proyectos_rels" CASCADE;
  DROP TABLE "publicaciones" CASCADE;
  DROP TABLE "publicaciones_rels" CASCADE;
  DROP TABLE "patentes" CASCADE;
  DROP TABLE "patentes_locales" CASCADE;
  DROP TABLE "patentes_rels" CASCADE;
  DROP TABLE "equipamiento" CASCADE;
  DROP TABLE "equipamiento_locales" CASCADE;
  DROP TABLE "noticias" CASCADE;
  DROP TABLE "noticias_locales" CASCADE;
  DROP TABLE "noticias_rels" CASCADE;
  DROP TABLE "_noticias_v" CASCADE;
  DROP TABLE "_noticias_v_locales" CASCADE;
  DROP TABLE "_noticias_v_rels" CASCADE;
  DROP TABLE "paginas" CASCADE;
  DROP TABLE "paginas_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "auditoria" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_lineas_investigacion_estado";
  DROP TYPE "public"."enum_lineas_investigacion_status";
  DROP TYPE "public"."enum__lineas_investigacion_v_version_estado";
  DROP TYPE "public"."enum__lineas_investigacion_v_version_status";
  DROP TYPE "public"."enum__lineas_investigacion_v_published_locale";
  DROP TYPE "public"."enum_personas_rol";
  DROP TYPE "public"."enum_proyectos_tipo";
  DROP TYPE "public"."enum_proyectos_estado";
  DROP TYPE "public"."enum_publicaciones_cuartil";
  DROP TYPE "public"."enum_publicaciones_tipo";
  DROP TYPE "public"."enum_patentes_estado";
  DROP TYPE "public"."enum_equipamiento_categoria";
  DROP TYPE "public"."enum_noticias_categoria";
  DROP TYPE "public"."enum_noticias_estado";
  DROP TYPE "public"."enum_noticias_status";
  DROP TYPE "public"."enum__noticias_v_version_categoria";
  DROP TYPE "public"."enum__noticias_v_version_estado";
  DROP TYPE "public"."enum__noticias_v_version_status";
  DROP TYPE "public"."enum__noticias_v_published_locale";
  DROP TYPE "public"."enum_paginas_estado";
  DROP TYPE "public"."enum_usuarios_rol";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
