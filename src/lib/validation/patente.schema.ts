import { z } from 'zod'
import { localizedTextSchema, localizedRichTextSchema, isoDateSchema, eliminadoEnSchema } from './common'

export const patenteSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: localizedTextSchema,
  estado: z.enum(['en_tramite', 'concedida']),
  numero_expediente: z.string().min(1),
  oficina: z.string().min(1), // p.ej. "INDECOPI"
  fecha_solicitud: isoDateSchema,
  inventores: z.array(z.string().uuid()).min(1), // relación a Persona
  resumen: localizedTextSchema,
  eliminado_en: eliminadoEnSchema.default(null),
})

export type Patente = z.infer<typeof patenteSchema>

export const patenteCreateSchema = patenteSchema.omit({ id: true, eliminado_en: true })
