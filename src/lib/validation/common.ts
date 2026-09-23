import { z } from 'zod'

/**
 * Convenciones transversales del modelo de datos (ver Parte C del kit de
 * arranque). Toda colección de contenido las reutiliza en vez de redefinirlas.
 */

// Slug: minúsculas, números, guiones. Único e indexado a nivel de BD, esto
// solo valida la forma.
export const slugSchema = z
  .string()
  .min(1, 'El slug no puede estar vacío')
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones (sin espacios ni tildes)')

// Campo localizable ES/EN. El inglés es opcional en captura (puede cargarse
// después) pero el campo existe desde M0 para no migrar esquema más adelante.
export const localizedTextSchema = z.object({
  es: z.string().min(1, 'El texto en español es obligatorio'),
  en: z.string().optional(),
})

export const localizedRichTextSchema = z.object({
  es: z.unknown(), // nodo de Lexical (Payload); se valida su forma en el editor, no aquí
  en: z.unknown().optional(),
})

// timestamptz en UTC, ISO-8601.
export const isoDateTimeSchema = z.string().datetime({ offset: true })
export const isoDateSchema = z.string().date()

// Borrado lógico universal.
export const eliminadoEnSchema = z.string().datetime({ offset: true }).nullable()

// ORCID: formato oficial 0000-0000-0000-000X (X permitido en el último dígito).
export const orcidSchema = z
  .string()
  .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'Formato de ORCID inválido (0000-0000-0000-0000)')

export const doiSchema = z
  .string()
  .regex(/^10\.\d{4,9}\/\S+$/, 'Formato de DOI inválido (10.xxxx/...)')

export const urlSchema = z.string().url()

// Email ofuscado ante rastreadores: se guarda el email real pero el frontend
// nunca lo imprime en HTML plano (ver componente EmailOfuscado, M1).
export const emailSchema = z.string().email()

export const estadoPublicacionEnum = z.enum([
  'borrador',
  'revision',
  'programado',
  'publicado',
  'archivado',
])
