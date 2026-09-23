import type { CollectionConfig } from 'payload'
import { ROLES_PERSONA, ROLES_PERSONA_LABEL } from '../../lib/taxonomias'

export const Persona: CollectionConfig = {
  slug: 'personas',
  labels: { singular: 'Persona', plural: 'Personas' },
  admin: { useAsTitle: 'nombre_completo', defaultColumns: ['nombre_completo', 'rol', 'activo'] },
  access: {
    read: ({ req }) => Boolean(req.user) || { activo: { equals: true } },
  },
  fields: [
    { name: 'nombre_completo', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'rol',
      type: 'select',
      required: true,
      options: ROLES_PERSONA.map((value) => ({ value, label: ROLES_PERSONA_LABEL[value].es })),
    },
    { name: 'cargo_titulo', type: 'text', localized: true },
    { name: 'foto', type: 'upload', relationTo: 'media' },
    { name: 'biografia', type: 'richText', localized: true },
    {
      name: 'orcid',
      type: 'text',
      admin: { description: 'Formato: 0000-0000-0000-0000' },
    },
    { name: 'researchgate', type: 'text' },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Se muestra ofuscado en el sitio público (ver componente EmailOfuscado, M1).',
      },
    },
    { name: 'lineas', type: 'relationship', relationTo: 'lineas-investigacion', hasMany: true },
    { name: 'orden', type: 'number', defaultValue: 0 },
    { name: 'activo', type: 'checkbox', defaultValue: true },
    { name: 'eliminado_en', type: 'date', admin: { hidden: true } },
  ],
}
