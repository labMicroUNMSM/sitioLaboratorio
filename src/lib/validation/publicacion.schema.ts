import { z } from 'zod'
import { doiSchema, urlSchema, eliminadoEnSchema } from './common'

const publicacionBase = z.object({
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
  bibtex_raw: z.string().min(1).nullish(), // Solo existe si se importó un original (M3).
  import_batch: z.string().uuid().nullable().default(null), // se llena en M3
  eliminado_en: eliminadoEnSchema.default(null),
})

export function procedenciaValida(lote: unknown, original: string | null | undefined) {
  return !lote || Boolean(original?.trim())
}

const validarLote = (data: Pick<z.infer<typeof publicacionBase>, 'import_batch' | 'bibtex_raw'>) =>
  procedenciaValida(data.import_batch, data.bibtex_raw)
const errorLote = { message: 'Una importación requiere su BibTeX original.', path: ['bibtex_raw'] }
export const publicacionSchema = publicacionBase.refine(validarLote, errorLote)
export const publicacionCreateSchema = publicacionBase
  .omit({ id: true, eliminado_en: true })
  .refine(validarLote, errorLote)

export type Publicacion = z.infer<typeof publicacionSchema>
