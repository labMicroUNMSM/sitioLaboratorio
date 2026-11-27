import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'
import { publicacionCreateSchema } from '../lib/validation/publicacion.schema'
import { Auditoria } from './collections/Auditoria'
import { Equipamiento } from './collections/Equipamiento'
import { LineaInvestigacion } from './collections/LineaInvestigacion'
import { Media } from './collections/Media'
import { Noticia } from './collections/Noticia'
import { Pagina } from './collections/Pagina'
import { Patente } from './collections/Patente'
import { Persona } from './collections/Persona'
import { Proyecto } from './collections/Proyecto'
import { Publicacion } from './collections/Publicacion'
import { Usuario } from './collections/Usuario'

const sesion: Pick<PayloadRequest, 'user'> = {
  user: { id: 1, collection: 'usuarios', rol: 'editor' },
}
const editor = { req: sesion as PayloadRequest }
const vigente = { eliminado_en: { exists: false } }

describe('Permisos del editor en M0', () => {
  it.each([LineaInvestigacion, Persona, Proyecto, Publicacion, Patente, Equipamiento, Noticia, Pagina, Media])(
    '$slug conserva el registro y limita la edición a fichas vigentes',
    async ({ access }) => {
      expect(await access?.delete?.(editor)).toBe(false)
      expect(await access?.read?.(editor)).toEqual(vigente)
      expect(await access?.update?.(editor)).toEqual(vigente)
    },
  )

  it('reserva los asientos de auditoría al sistema y la gestión de usuarios al administrador', async () => {
    for (const operation of ['read', 'create', 'update', 'delete'] as const) {
      expect(await Auditoria.access?.[operation]?.(editor)).toBe(false)
    }
    expect(await Usuario.access?.read?.(editor)).toBe(true)
    for (const operation of ['create', 'update', 'delete'] as const) {
      expect(await Usuario.access?.[operation]?.(editor)).toBe(false)
    }
  })

  it('permite el alta manual sin BibTeX y protege la procedencia frente a escrituras del editor', async () => {
    const manual = {
      titulo: 'Registro manual', autores: 'Autor de prueba', anio: 2025, revista: 'Revista',
      doi: '10.1234/prueba', tipo: 'articulo',
    }
    expect(publicacionCreateSchema.safeParse(manual).success).toBe(true)
    const lote = { ...manual, import_batch: '2ca64477-af99-449e-afdc-cf7a669e92a5' }
    expect(publicacionCreateSchema.safeParse(lote).success).toBe(false)
    expect(publicacionCreateSchema.safeParse({ ...lote, bibtex_raw: '@article{prueba}' }).success).toBe(true)
    for (const name of ['bibtex_raw', 'import_batch_id']) {
      const field = Publicacion.fields.find((item) => 'name' in item && item.name === name)
      if (!field || !('access' in field)) throw new Error(`Falta la protección de ${name}`)
      expect('required' in field && field.required).toBeFalsy()
      expect(await field.access?.create?.(editor)).toBe(false)
      expect(await field.access?.update?.(editor)).toBe(false)
    }
  })
})
