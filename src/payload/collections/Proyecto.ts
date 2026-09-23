import type { CollectionConfig } from 'payload'

export const Proyecto: CollectionConfig = {
  slug: 'proyectos',
  labels: { singular: 'Proyecto', plural: 'Proyectos' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'tipo', 'estado'] },
  access: {
    // El portafolio es público por naturaleza (M4); lo que se restringe no es
    // el registro sino el campo `monto` cuando monto_publicable es falso —
    // eso se resuelve en el resolver de lectura pública (M4), no aquí.
    read: () => true,
  },
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: ['investigacion', 'equipamiento_implementacion'],
    },
    { name: 'estado', type: 'select', required: true, options: ['activo', 'concluido'] },
    { name: 'entidad_financiadora', type: 'text', required: true },
    {
      name: 'numero_contrato',
      type: 'text',
      admin: {
        description: 'Contrato PROCIENCIA. Obligatorio si tipo = equipamiento_implementacion.',
        condition: (data) => data?.tipo === 'equipamiento_implementacion',
      },
    },
    { name: 'periodo_inicio', type: 'date', required: true },
    { name: 'periodo_fin', type: 'date' },
    { name: 'monto', type: 'number', min: 0 },
    {
      name: 'monto_publicable',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Si está desmarcado, el monto nunca se sirve al público, aunque exista.' },
    },
    { name: 'resumen', type: 'textarea', required: true, localized: true },
    { name: 'equipo', type: 'relationship', relationTo: 'personas', hasMany: true },
    { name: 'lineas', type: 'relationship', relationTo: 'lineas-investigacion', hasMany: true },
    { name: 'logos_financiadores', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.tipo === 'equipamiento_implementacion' && !data.numero_contrato) {
          throw new Error('numero_contrato es obligatorio para proyectos de equipamiento (M4).')
        }
        return data
      },
    ],
  },
}
