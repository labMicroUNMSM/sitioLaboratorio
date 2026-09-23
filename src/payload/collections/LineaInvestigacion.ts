import type { CollectionConfig } from 'payload'

export const LineaInvestigacion: CollectionConfig = {
  slug: 'lineas-investigacion',
  labels: { singular: 'Línea de investigación', plural: 'Líneas de investigación' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'destacada', 'estado'] },
  access: {
    read: ({ req }) => Boolean(req.user) || { estado: { equals: 'publicado' } },
  },
  versions: { drafts: true }, // permite guardar borrador sin publicar
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'resumen_divulgativo', type: 'richText', required: true, localized: true },
    { name: 'detalle_tecnico', type: 'richText', required: true, localized: true },
    { name: 'figura', type: 'upload', relationTo: 'media' },
    { name: 'destacada', type: 'checkbox', defaultValue: false },
    { name: 'orden', type: 'number', defaultValue: 0 },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'borrador',
      options: ['borrador', 'publicado', 'archivado'],
    },
    // Relaciones inversas (personas, proyectos, publicaciones): NO son campos
    // de esta colección. Se resuelven con una consulta filtrada desde el lado
    // de Persona/Proyecto/Publicacion (que sí tienen el campo `lineas`), para
    // no duplicar la relación en ambos lados. Ver src/lib/relations.ts (M1/M2).
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
}
