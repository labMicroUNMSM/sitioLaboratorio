import { randomBytes } from 'node:crypto'
import type { PayloadRequest } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Usuario } from '../collections/Usuario'
import {
  autenticador,
  periodoValido,
  propuesta,
  proteger,
  recuperar,
  secretoPropuesto,
} from './credencial'
import { exigirMfa, filtrarSesiones } from './login'

beforeEach(() => {
  vi.stubEnv('FIELD_ENCRYPTION_KEY', randomBytes(32).toString('hex'))
})
afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Segundo factor administrativo', () => {
  it.each([false, true])(
    'la contraseña sola no permite emitir el JWT aunque la casilla valga %s',
    async (marcada) => {
      expect(Usuario.hooks?.beforeLogin).toContain(exigirMfa)
      const req = { context: {} } as PayloadRequest
      await expect(
        exigirMfa({
          collection: {} as never,
          context: {},
          req,
          user: { id: 1, rol: 'admin', mfa_habilitado: marcada },
        }),
      ).rejects.toMatchObject({ status: 403 })
    },
  )

  it('el editor conserva el login de Payload', async () => {
    const user = { id: 2, rol: 'editor' }
    expect(
      await exigirMfa({ user, req: {} as PayloadRequest, collection: {} as never, context: {} }),
    ).toBe(user)
  })

  it('la propuesta caduca, queda vinculada a la cuenta y se distingue de la credencial confirmada', () => {
    const { secreto, solicitud } = propuesta(1, 0)
    expect(secretoPropuesto(1, solicitud, 299_999) === secreto).toBe(true)
    expect(secretoPropuesto(1, solicitud, 300_000)).toBeNull()
    expect(secretoPropuesto(2, solicitud, 1)).toBeNull()
    const cifrado = proteger(1, secreto)
    expect(cifrado.includes(secreto)).toBe(false)
    expect(recuperar(1, cifrado) === secreto).toBe(true)
    expect(() => recuperar(2, cifrado)).toThrow()
    expect(secretoPropuesto(1, cifrado, 1)).toBeNull()
  })

  it('acepta el periodo actual solo una vez y rechaza periodos caducados', () => {
    const { secreto } = propuesta(1)
    const ahora = 300_000
    const codigo = autenticador(secreto, 'qa').generate({ timestamp: ahora })
    expect(periodoValido(secreto, codigo, -1, ahora)).toBe(10)
    expect(periodoValido(secreto, codigo, 10, ahora)).toBeNull()
    expect(periodoValido(secreto, codigo, -1, ahora + 90_000)).toBeNull()
    expect(periodoValido(secreto, '', -1, ahora)).toBeNull()
  })

  it.each([{ rows: [] }, { rows: [{ sesiones: ['confirmada'] }] }])(
    'la estrategia JWT solo ve sesiones con segundo factor',
    async ({ rows }) => {
      const req = {
        payload: { db: { drizzle: { execute: async () => ({ rows }) } } },
      } as unknown as PayloadRequest
      expect(Usuario.hooks?.afterRead).toContain(filtrarSesiones)
      const doc = await filtrarSesiones({
        req,
        context: {},
        collection: {} as never,
        doc: {
          id: 1,
          rol: 'admin',
          mfa_habilitado: true,
          sessions: [{ id: 'antigua' }, { id: 'confirmada' }],
        },
      })
      expect(doc.sessions).toEqual(rows.length ? [{ id: 'confirmada' }] : [])
      expect(doc.mfa_habilitado).toBe(Boolean(rows.length))
    },
  )
})
