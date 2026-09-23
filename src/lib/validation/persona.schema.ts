import { z } from 'zod'
import {
  slugSchema,
  localizedTextSchema,
  localizedRichTextSchema,
  orcidSchema,
  urlSchema,
  emailSchema,
  eliminadoEnSchema,
} from './common'
import { ROLES_PERSONA } from '../taxonomias'

export const personaSchema = z.object({
  id: z.string().uuid().optional(),
  nombre_completo: z.string().min(1),
  slug: slugSchema,
  rol: z.enum(ROLES_PERSONA),
  cargo_titulo: localizedTextSchema.optional(),
  foto: z.string().uuid().nullable(),
  biografia: localizedRichTextSchema.optional(),
  orcid: orcidSchema.optional(),
  researchgate: urlSchema.optional(),
  email: emailSchema.optional(), // se ofusca en el frontend, nunca en HTML plano
  lineas: z.array(z.string().uuid()).default([]), // relación a LineaInvestigacion
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
  eliminado_en: eliminadoEnSchema.default(null),
})

export type Persona = z.infer<typeof personaSchema>

export const personaCreateSchema = personaSchema.omit({ id: true, eliminado_en: true })
