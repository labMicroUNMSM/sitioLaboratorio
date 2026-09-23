import { z } from 'zod'
import { localizedRichTextSchema, eliminadoEnSchema } from './common'
import { CATEGORIAS_EQUIPAMIENTO } from '../taxonomias'

export const equipamientoSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(1),
  categoria: z.enum(CATEGORIAS_EQUIPAMIENTO),
  marca_modelo: z.string().min(1),
  foto: z.string().uuid(), // Media; alt obligatorio se valida en la colección Media, no aquí
  capacidades: localizedRichTextSchema,
  disponible_colaboracion: z.boolean().default(false),
  orden: z.number().int().min(0).default(0),
  eliminado_en: eliminadoEnSchema.default(null),
})

export type Equipamiento = z.infer<typeof equipamientoSchema>

export const equipamientoCreateSchema = equipamientoSchema.omit({ id: true, eliminado_en: true })
