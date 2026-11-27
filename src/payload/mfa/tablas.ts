import { integer, jsonb, pgTable, text, timestamp } from '@payloadcms/db-postgres/drizzle/pg-core'

// Tablas del adaptador. Payload no expone los secretos como campos ni colecciones.
export const credenciales = pgTable('usuario_mfa', {
  usuario: integer('usuario').primaryKey(),
  cifrado: text('cifrado').notNull(),
  periodo: integer('periodo').notNull(),
  sesiones: jsonb('sesiones').notNull(),
})

export const intentos = pgTable('usuario_mfa_intentos', {
  usuario: integer('usuario').primaryKey(),
  cantidad: integer('cantidad').notNull(),
  hasta: timestamp('hasta', { withTimezone: true }).notNull(),
})
