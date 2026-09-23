import type { CollectionConfig } from 'payload'

/**
 * Auditoria — colección de infraestructura.
 * Append-only: nadie puede editar ni borrar un registro desde la API o el
 * panel. La garantía dura se refuerza a nivel de BD con un REVOKE de
 * UPDATE/DELETE sobre esta tabla para el rol de la app (ver
 * scripts/db-hardening.sql) — la capa de acceso de Payload de abajo es la
 * primera línea de defensa, no la única.
 */
export const Auditoria: CollectionConfig = {
  slug: 'auditoria',
  access: {
    read: ({ req }) => req.user?.rol === 'admin',
    create: () => true, // la escritura la hacen hooks del sistema, no un usuario a mano
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'accion',
      type: 'text',
      required: true,
      admin: { description: 'p.ej. "publicacion.crear", "usuario.rol.cambiar"' },
    },
    {
      name: 'coleccion_afectada',
      type: 'text',
      required: true,
    },
    {
      name: 'documento_id',
      type: 'text',
      required: true,
    },
    {
      name: 'usuario',
      type: 'relationship',
      relationTo: 'usuarios',
      required: true,
    },
    {
      name: 'detalle',
      type: 'json',
      admin: { description: 'Diff o payload relevante de la acción, para trazabilidad.' },
    },
    {
      name: 'hash_sha256',
      type: 'text',
      admin: {
        description:
          'Usado por el importador de M3 para permitir reversión con evidencia de integridad.',
      },
    },
  ],
  timestamps: true, // createdAt sirve como el timestamp append-only; no hay updatedAt relevante
}
