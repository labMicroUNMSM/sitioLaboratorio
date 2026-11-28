import type { CollectionConfig, TextareaField } from 'payload'
import { abrir, sellar } from '../cifrado'

function privado(name: string, label: string): TextareaField {
  return {
    name,
    label,
    type: 'textarea',
    required: true,
    admin: { readOnly: true },
    hooks: {
      beforeChange: [({ value }) => sellar(value, 'solicitud:' + name)],
      afterRead: [({ value }) => value && abrir(value, 'solicitud:' + name)],
    },
  }
}
export const Solicitud: CollectionConfig = {
  slug: 'solicitudes',
  labels: { singular: 'Solicitud', plural: 'Solicitudes' },
  admin: {
    useAsTitle: 'tipo',
    defaultColumns: ['tipo', 'createdAt'],
    description: 'Bandeja privada de consultas y solicitudes de participación.',
  },
  access: {
    create: () => false,
    update: () => false,
    delete: () => false,
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Contacto', value: 'contacto' },
        { label: 'Únete', value: 'unete' },
      ],
    },
    privado('nombre', 'Nombre'),
    privado('correo', 'Correo de respuesta'),
    privado('mensaje', 'Mensaje'),
    { name: 'aviso', type: 'text', required: true, admin: { readOnly: true } },
  ],
}
