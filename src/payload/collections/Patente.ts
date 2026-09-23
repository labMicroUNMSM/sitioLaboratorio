import type { CollectionConfig } from 'payload'

export const Patente: CollectionConfig = {
  slug: 'patentes',
  labels: { singular: 'Patente', plural: 'Patentes' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'estado', 'oficina'] },
  access: { read: () => true },
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'estado', type: 'select', required: true, options: ['en_tramite', 'concedida'] },
    { name: 'numero_expediente', type: 'text', required: true },
    { name: 'oficina', type: 'text', required: true, admin: { description: 'p.ej. INDECOPI' } },
    { name: 'fecha_solicitud', type: 'date', required: true },
    { name: 'inventores', type: 'relationship', relationTo: 'personas', hasMany: true, required: true },
    { name: 'resumen', type: 'textarea', required: true, localized: true },
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
}
