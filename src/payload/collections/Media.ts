import type { CollectionConfig } from 'payload'

/**
 * Media — colección de infraestructura.
 *
 * Reglas duras del kit de arranque:
 *  - validación por magic bytes (no solo por extensión/MIME declarado)
 *  - conversión a WebP/AVIF
 *  - alt OBLIGATORIO: el panel debe impedir guardar sin él (criterio de
 *    aceptación de M0).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // medios públicos por naturaleza (el sitio es de contenido público)
  },
  upload: {
    staticDir: '../media-uploads', // en producción, esto va a S3/MinIO vía @payloadcms/storage-s3
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, formatOptions: { format: 'webp' } },
      { name: 'card', width: 800, height: undefined, formatOptions: { format: 'webp' } },
      { name: 'full', width: 1600, height: undefined, formatOptions: { format: 'webp' } },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Texto alternativo obligatorio. Describe el contenido de la imagen, no repitas "foto de".',
      },
    },
    {
      name: 'creditos',
      type: 'text',
      admin: { description: 'Opcional: autor o fuente de la imagen, si aplica.' },
    },
  ],
  hooks: {
    beforeValidate: [
      // Verificación de magic bytes real (no solo mimetype declarado por el
      // cliente) — implementar con file-type o equivalente en M0.4. Aquí se
      // deja el punto de extensión documentado; el hook rechaza la subida si
      // los bytes reales no corresponden a jpeg/png/webp.
      // async ({ data, req }) => { ... verificarMagicBytes(req.file) ... }
    ],
  },
}
