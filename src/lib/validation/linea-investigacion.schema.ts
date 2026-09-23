import { z } from 'zod'
import { slugSchema, localizedTextSchema, localizedRichTextSchema, eliminadoEnSchema } from './common'

export const lineaInvestigacionSchema = z.object({
  id: z.string().uuid().optional(), // ausente al crear
  titulo: localizedTextSchema,
  slug: slugSchema,
  resumen_divulgativo: localizedRichTextSchema,
  detalle_tecnico: localizedRichTextSchema,
  figura: z.string().uuid().nullable(), // referencia a Media
  destacada: z.boolean().default(false),
  orden: z.number().int().min(0).default(0),
  estado: z.enum(['borrador', 'publicado', 'archivado']).default('borrador'),
  eliminado_en: eliminadoEnSchema.default(null),
})

export type LineaInvestigacion = z.infer<typeof lineaInvestigacionSchema>

// Para creación: sin id, sin eliminado_en (lo fija el servidor).
export const lineaInvestigacionCreateSchema = lineaInvestigacionSchema.omit({
  id: true,
  eliminado_en: true,
})
