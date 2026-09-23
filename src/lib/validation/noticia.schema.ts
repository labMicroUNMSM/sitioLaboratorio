import { z } from 'zod'
import {
  slugSchema,
  localizedTextSchema,
  localizedRichTextSchema,
  isoDateSchema,
  estadoPublicacionEnum,
  eliminadoEnSchema,
} from './common'

export const noticiaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: localizedTextSchema,
  slug: slugSchema,
  fecha_publicacion: isoDateSchema,
  resumen: localizedTextSchema,
  cuerpo: localizedRichTextSchema,
  imagen_portada: z.string().uuid().nullable(),
  categoria: z.enum(['anuncio', 'logro', 'evento', 'publicacion_destacada']),
  lineas: z.array(z.string().uuid()).default([]),
  personas: z.array(z.string().uuid()).default([]),
  estado: estadoPublicacionEnum.default('borrador'),
  eliminado_en: eliminadoEnSchema.default(null),
})

export type Noticia = z.infer<typeof noticiaSchema>

export const noticiaCreateSchema = noticiaSchema.omit({ id: true, eliminado_en: true })
