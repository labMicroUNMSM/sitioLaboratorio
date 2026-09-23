import type { CollectionConfig } from 'payload'

export const Publicacion: CollectionConfig = {
  slug: 'publicaciones',
  labels: { singular: 'Publicación', plural: 'Publicaciones' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'anio', 'revista', 'cuartil'] },
  access: { read: () => true },
  indexes: [{ fields: ['anio'] }, { fields: ['doi'], unique: true }],
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'autores', type: 'text', required: true, admin: { description: 'Texto completo tal como aparece en la revista.' } },
    { name: 'autores_laboratorio', type: 'relationship', relationTo: 'personas', hasMany: true },
    { name: 'anio', type: 'number', required: true, index: true },
    { name: 'revista', type: 'text', required: true },
    { name: 'doi', type: 'text', required: true, unique: true },
    { name: 'cuartil', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4'] },
    { name: 'url_acceso_abierto', type: 'text' },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: ['articulo', 'capitulo', 'conferencia', 'preprint'],
    },
    { name: 'lineas', type: 'relationship', relationTo: 'lineas-investigacion', hasMany: true },
    {
      name: 'bibtex_raw',
      type: 'textarea',
      required: true,
      admin: { description: 'Procedencia: el bloque BibTeX original tal como se importó.', readOnly: true },
    },
    {
      // TODO(M3): cambiar a `type: 'relationship', relationTo: 'importaciones'`
      // cuando esa colección se diseñe en M3. Se deja como texto plano en M0
      // para no declarar una relación a una colección que todavía no existe
      // (Payload fallaría al arrancar si se pone relationTo a algo inexistente).
      name: 'import_batch_id',
      type: 'text',
      admin: { description: 'Se llena automáticamente al importar (M3). Vacío si se creó a mano.', readOnly: true },
    },
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
}
