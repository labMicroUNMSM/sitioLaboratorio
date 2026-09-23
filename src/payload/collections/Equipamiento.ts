import type { CollectionConfig } from 'payload'
import { CATEGORIAS_EQUIPAMIENTO } from '../../lib/taxonomias'

export const Equipamiento: CollectionConfig = {
  slug: 'equipamiento',
  labels: { singular: 'Equipamiento', plural: 'Equipamiento' },
  admin: { useAsTitle: 'nombre', defaultColumns: ['nombre', 'categoria', 'disponible_colaboracion'] },
  access: { read: () => true },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    { name: 'categoria', type: 'select', required: true, options: [...CATEGORIAS_EQUIPAMIENTO] },
    { name: 'marca_modelo', type: 'text', required: true },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      required: true, // el alt vive en la colección Media y ya es obligatorio ahí
    },
    { name: 'capacidades', type: 'richText', localized: true },
    { name: 'disponible_colaboracion', type: 'checkbox', defaultValue: false },
    { name: 'orden', type: 'number', defaultValue: 0 },
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
}
