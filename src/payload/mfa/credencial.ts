import { abrir, sellar } from '../cifrado'
import { Secret, TOTP } from 'otpauth'

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
