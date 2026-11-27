import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { Secret, TOTP } from 'otpauth'

function clave() {
  const hex = process.env.FIELD_ENCRYPTION_KEY ?? ''
  if (!/^[0-9a-f]{64}$/i.test(hex))
    throw new Error('Configura FIELD_ENCRYPTION_KEY con 32 bytes hexadecimales.')
  return Buffer.from(hex, 'hex')
}

function sellar(valor: string, contexto: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', clave(), iv)
  cipher.setAAD(Buffer.from(contexto))
  const datos = Buffer.concat([cipher.update(valor, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), datos]).toString('base64url')
}

function abrir(valor: string, contexto: string) {
  const datos = Buffer.from(valor, 'base64url')
  const cipher = createDecipheriv('aes-256-gcm', clave(), datos.subarray(0, 12))
  cipher.setAAD(Buffer.from(contexto))
  cipher.setAuthTag(datos.subarray(12, 28))
  return Buffer.concat([cipher.update(datos.subarray(28)), cipher.final()]).toString('utf8')
}

export function propuesta(id: number, ahora = Date.now()) {
  const secreto = new Secret({ size: 20 }).base32
  const solicitud = sellar(JSON.stringify({ secreto, hasta: ahora + 300_000 }), 'alta:' + id)
  return { secreto, solicitud }
}

export function secretoPropuesto(id: number, solicitud: string, ahora = Date.now()): string | null {
  if (!solicitud || solicitud.length > 512) return null
  try {
    const datos = JSON.parse(abrir(solicitud, 'alta:' + id))
    return datos.hasta > ahora ? datos.secreto : null
  } catch {
    return null
  }
}

export function proteger(id: number, secreto: string) {
  return sellar(secreto, 'totp:' + id)
}

export function recuperar(id: number, cifrado: string) {
  return abrir(cifrado, 'totp:' + id)
}

export function autenticador(secreto: string, email: string) {
  return new TOTP({
    issuer: 'sitioLaboratorio',
    label: email,
    secret: secreto,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  })
}

export function periodoValido(secreto: string, codigo: string, ultimo: number, ahora = Date.now()) {
  if (!/^\d{6}$/.test(codigo)) return null
  const diferencia = autenticador(secreto, '').validate({
    token: codigo,
    timestamp: ahora,
    window: 1,
  })
  if (diferencia === null) return null
  const periodo = Math.floor(ahora / 30_000) + diferencia
  return periodo > ultimo ? periodo : null
}
