import type { CollectionConfig } from 'payload'
import { accesoContenido, eliminadoEn } from '../accesoContenido'

export const Pagina: CollectionConfig = {
  slug: 'paginas',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'slug', 'estado'] },
  access: accesoContenido({ estado: { equals: 'publicado' } }),
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'cuerpo', type: 'richText', required: true, localized: true },
    { name: 'estado', type: 'select', required: true, defaultValue: 'borrador', options: ['borrador', 'publicado'] },
    eliminadoEn,
  ],
}
