import { afterEach, expect, test, vi } from 'vitest'
import { abrir, sellar } from './cifrado'
import { randomBytes } from 'node:crypto'
afterEach(() => vi.unstubAllEnvs())
test('los mensajes se cifran con un IV nuevo y quedan vinculados a su campo', () => {
  vi.stubEnv('FIELD_ENCRYPTION_KEY', randomBytes(32).toString('hex'))
  const mensaje = 'Consulta ficticia de campo'
  const a = sellar(mensaje, 'solicitud:mensaje')
  expect(a).not.toContain(mensaje)
  expect(sellar(mensaje, 'solicitud:mensaje')).not.toBe(a)
  expect(abrir(a, 'solicitud:mensaje')).toBe(mensaje)
  expect(() => abrir(a, 'solicitud:correo')).toThrow()
})
