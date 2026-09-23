import { z } from 'zod'
import { slugSchema, localizedTextSchema, localizedRichTextSchema, eliminadoEnSchema } from './common'

/**
 * Colección genérica para textos estáticos ("Sobre el laboratorio",
 * "Contacto", avisos legales de M6). El kit la deja como opcional-barata; se
 * incluye desde M0 porque el costo es mínimo y M6 (Ley 29733) la necesita
 * para el aviso de privacidad.
 */
export const paginaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: localizedTextSchema,
  slug: slugSchema,
  cuerpo: localizedRichTextSchema,
  estado: z.enum(['borrador', 'publicado']).default('borrador'),
  eliminado_en: eliminadoEnSchema.default(null),
})

export type Pagina = z.infer<typeof paginaSchema>

export const paginaCreateSchema = paginaSchema.omit({ id: true, eliminado_en: true })
