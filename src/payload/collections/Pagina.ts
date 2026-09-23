import type { CollectionConfig } from 'payload'

export const Pagina: CollectionConfig = {
  slug: 'paginas',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'slug', 'estado'] },
  access: {
    read: ({ req }) => Boolean(req.user) || { estado: { equals: 'publicado' } },
  },
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'cuerpo', type: 'richText', required: true, localized: true },
    { name: 'estado', type: 'select', required: true, defaultValue: 'borrador', options: ['borrador', 'publicado'] },
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
}
