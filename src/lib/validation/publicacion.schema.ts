import { z } from 'zod'
import { doiSchema, urlSchema, eliminadoEnSchema } from './common'

export const publicacionSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().min(1),
  autores: z.string().min(1), // texto completo, tal como aparece en la revista
  autores_laboratorio: z.array(z.string().uuid()).default([]), // relación a Persona
  anio: z.number().int().min(1900).max(new Date().getFullYear() + 1), // indexado en BD
  revista: z.string().min(1),
  doi: doiSchema, // único a nivel de BD
  cuartil: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
  url_acceso_abierto: urlSchema.optional(),
  tipo: z.enum(['articulo', 'capitulo', 'conferencia', 'preprint']),
  lineas: z.array(z.string().uuid()).default([]),
  bibtex_raw: z.string().min(1), // procedencia, tal como se importó (M3)
  import_batch: z.string().uuid().nullable().default(null), // se llena en M3
  eliminado_en: eliminadoEnSchema.default(null),
})

export type Publicacion = z.infer<typeof publicacionSchema>

export const publicacionCreateSchema = publicacionSchema.omit({ id: true, eliminado_en: true })
