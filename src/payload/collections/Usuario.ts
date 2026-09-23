import type { CollectionConfig } from 'payload'

/**
 * Usuario — colección de infraestructura (auth).
 * Argon2id lo maneja Payload internamente para el hash de contraseña.
 * MFA: Payload 3 no trae TOTP nativo listo para producción en todas las
 * versiones — verificar en M0.5 contra la versión instalada; si no está
 * disponible de forma nativa, se implementa como plugin/hook antes de cerrar
 * M0.5 (es un requisito no negociable del kit, no queda para después).
 */
export const Usuario: CollectionConfig = {
  slug: 'usuarios',
  auth: {
    // Ajustar tras confirmar versión: verifyEmail no es necesario (no hay
    // autoregistro público), pero sí bloqueo tras intentos fallidos.
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
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
    },
    {
      name: 'mfa_habilitado',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Obligatorio para rol admin. Se valida en el hook beforeChange.',
      },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.rol === 'admin' && !data.mfa_habilitado) {
          throw new Error('MFA es obligatorio para el rol admin (principio no negociable, ver Parte A).')
        }
        return data
      },
    ],
  },
}
