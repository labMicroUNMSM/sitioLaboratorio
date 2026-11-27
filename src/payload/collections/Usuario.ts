import type { CollectionConfig } from 'payload'

import { exigirMfa, filtrarSesiones, loginMfa } from '../mfa/login'

export const Usuario: CollectionConfig = {
  slug: 'usuarios',
  auth: {
    // Ajustar tras confirmar versión: verifyEmail no es necesario (no hay
    // autoregistro público), pero sí bloqueo tras intentos fallidos.
    useSessions: true,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  endpoints: [loginMfa],
  access: {
    read: ({ req }) => Boolean(req.user), // solo usuarios autenticados ven la lista de usuarios
    create: ({ req }) => req.user?.rol === 'admin',
    update: ({ req }) => req.user?.rol === 'admin',
    delete: () => false, // nunca se borra un usuario; se desactiva (borrado lógico)
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'rol',
      type: 'select',
      required: true,
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      admin: {
        description:
          'El primer registro siempre crea un editor. Un operador promueve al primer administrador.',
      },
    },
    {
      name: 'mfa_habilitado',
      type: 'checkbox',
      defaultValue: false,
      access: { create: () => false, update: () => false },
      admin: {
        readOnly: true,
        description: 'Se activa al confirmar el primer código del autenticador.',
      },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeLogin: [exigirMfa],
    afterRead: [filtrarSesiones],
    beforeChange: [
      ({ data, operation, originalDoc, req }) => {
        if (operation === 'create' && !req.user) data.rol = 'editor'
        if (originalDoc && data.rol && originalDoc.rol !== data.rol) data.sessions = []
        delete data.mfa_habilitado
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'update' && previousDoc.rol !== doc.rol && req.user) {
          await req.payload.create({
            collection: 'auditoria',
            req,
            overrideAccess: true,
            data: {
              accion: 'usuario.rol.cambiar',
              coleccion_afectada: 'usuarios',
              documento_id: String(doc.id),
              usuario: req.user.id,
              detalle: { anterior: previousDoc.rol, nuevo: doc.rol },
            },
          })
        }
      },
    ],
  },
}
