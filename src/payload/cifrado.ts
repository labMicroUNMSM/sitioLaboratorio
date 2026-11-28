import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

function clave() {
  const hex = process.env.FIELD_ENCRYPTION_KEY ?? ''
  if (!/^[0-9a-f]{64}$/i.test(hex))
    throw new Error('Configura FIELD_ENCRYPTION_KEY con 32 bytes hexadecimales.')
  return Buffer.from(hex, 'hex')
}

export function sellar(valor: string, contexto: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', clave(), iv)
  cipher.setAAD(Buffer.from(contexto))
  const datos = Buffer.concat([cipher.update(valor, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), datos]).toString('base64url')
}

export function abrir(valor: string, contexto: string) {
  const datos = Buffer.from(valor, 'base64url')
  const cipher = createDecipheriv('aes-256-gcm', clave(), datos.subarray(0, 12))
  cipher.setAAD(Buffer.from(contexto))
  cipher.setAuthTag(datos.subarray(12, 28))
  return Buffer.concat([cipher.update(datos.subarray(28)), cipher.final()]).toString('utf8')
}
