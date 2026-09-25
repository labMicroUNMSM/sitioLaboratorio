import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { LineaInvestigacion } from './collections/LineaInvestigacion'
import { Persona } from './collections/Persona'
import { Proyecto } from './collections/Proyecto'
import { Publicacion } from './collections/Publicacion'
import { Patente } from './collections/Patente'
import { Equipamiento } from './collections/Equipamiento'
import { Noticia } from './collections/Noticia'
import { Pagina } from './collections/Pagina'
import { Media } from './collections/Media'
import { Usuario } from './collections/Usuario'
import { Auditoria } from './collections/Auditoria'

export default buildConfig({
  // Localización ES/EN habilitada desde M0 (decisión confirmada, Parte E-1).
  // El español es el idioma "de captura" por defecto; el inglés se completa
  // después sin migrar esquema.
  localization: {
    locales: [
      { label: 'Español', code: 'es' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'es',
    fallback: true,
  },

  admin: {
    user: Usuario.slug,
  },

  editor: lexicalEditor({}),

  collections: [
    // Contenido
    LineaInvestigacion,
    Persona,
    Proyecto,
    Publicacion,
    Patente,
    Equipamiento,
    Noticia,
    Pagina,
    // Infraestructura
    Media,
    Usuario,
    Auditoria,
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    push: true
  }),

  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET ?? '',
      config: {
        endpoint: process.env.S3_ENDPOINT || '',
        region: process.env.S3_REGION ?? 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        },
        forcePathStyle: true, // requerido por MinIO
      },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET ?? '',
  sharp,

  typescript: {
    outputFile: 'src/payload/payload-types.ts',
  },
})
