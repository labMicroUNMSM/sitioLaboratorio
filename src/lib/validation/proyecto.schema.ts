import { z } from 'zod'
import { slugSchema, localizedTextSchema, isoDateSchema, eliminadoEnSchema } from './common'

// Objeto base sin refinamientos cruzados, para poder derivar variantes
// (create/update) con .omit() — Zod no permite .omit() sobre un schema que
// ya tiene .refine() aplicado.
export const proyectoBaseSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: localizedTextSchema,
  slug: slugSchema,
  tipo: z.enum(['investigacion', 'equipamiento_implementacion']),
  estado: z.enum(['activo', 'concluido']),
  entidad_financiadora: z.string().min(1),
  numero_contrato: z.string().optional(), // PROCIENCIA; obligatorio si tipo = equipamiento_implementacion (ver refine)
  periodo_inicio: isoDateSchema,
  periodo_fin: isoDateSchema.nullable(),
  monto: z.number().nonnegative().optional(),
  monto_publicable: z.boolean().default(false),
  resumen: localizedTextSchema,
  equipo: z.array(z.string().uuid()).default([]), // relación a Persona
  lineas: z.array(z.string().uuid()).default([]), // relación a LineaInvestigacion
  logos_financiadores: z.array(z.string().uuid()).default([]), // Media[]
  eliminado_en: eliminadoEnSchema.default(null),
})

function withProyectoRules<T extends typeof proyectoBaseSchema>(schema: T) {
  return schema
    .refine((data) => data.tipo !== 'equipamiento_implementacion' || Boolean(data.numero_contrato), {
      message: 'numero_contrato es obligatorio para proyectos de equipamiento (M4)',
      path: ['numero_contrato'],
    })
    .refine((data) => !data.periodo_fin || data.periodo_fin >= data.periodo_inicio, {
      message: 'periodo_fin no puede ser anterior a periodo_inicio',
      path: ['periodo_fin'],
    })
}

export const proyectoSchema = withProyectoRules(proyectoBaseSchema)
export const proyectoCreateSchema = proyectoBaseSchema.omit({ id: true, eliminado_en: true })

export type Proyecto = z.infer<typeof proyectoSchema>
