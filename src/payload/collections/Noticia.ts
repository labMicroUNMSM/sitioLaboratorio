import type { CollectionConfig } from 'payload'
import { accesoContenido, eliminadoEn } from '../accesoContenido'

export const Noticia: CollectionConfig = {
  slug: 'noticias',
  labels: { singular: 'Noticia', plural: 'Noticias' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'fecha_publicacion', 'estado'] },
  access: accesoContenido({ and: [{ estado: { equals: 'publicado' } }, { _status: { equals: 'published' } }] }),
  versions: { drafts: { schedulePublish: true } }, // soporta estado "programado"
  indexes: [{ fields: ['estado', 'fecha_publicacion'] }],
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'fecha_publicacion', type: 'date', required: true },
    { name: 'resumen', type: 'textarea', required: true, localized: true },
    { name: 'cuerpo', type: 'richText', required: true, localized: true },
    { name: 'imagen_portada', type: 'upload', relationTo: 'media' },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      options: ['anuncio', 'logro', 'evento', 'publicacion_destacada'],
    },
    { name: 'lineas', type: 'relationship', relationTo: 'lineas-investigacion', hasMany: true },
    { name: 'personas', type: 'relationship', relationTo: 'personas', hasMany: true },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'borrador',
      options: ['borrador', 'revision', 'programado', 'publicado', 'archivado'],
    },
    eliminadoEn,
  ],
}
