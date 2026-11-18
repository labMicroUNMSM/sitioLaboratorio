import type { CollectionConfig, DateField, Where } from 'payload'

// Las fichas retiradas se conservan en la base. La fecha la fija el servidor.
export const eliminadoEn: DateField = {
  name: 'eliminado_en',
  type: 'date',
  admin: { hidden: true },
  access: { create: () => false, update: () => false },
}

export function accesoContenido(filtroPublico?: Where): NonNullable<CollectionConfig['access']> {
  const vigente: Where = { eliminado_en: { exists: false } }
  return {
    read: ({ req }) => !req.user && filtroPublico ? { and: [vigente, filtroPublico] } : vigente,
    update: ({ req }) => Boolean(req.user) && vigente,
    delete: () => false,
  }
}
