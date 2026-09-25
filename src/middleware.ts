import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Cabeceras de seguridad de origen (M0.7).
 *
 * El nonce se genera por request y se pasa a la página vía header, para que
 * cualquier <script> inline legítimo lo reciba a través de un componente
 * (ver src/lib/nonce.ts) en vez de usar 'unsafe-inline'.
 */
export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas EXCEPTO:
     * - api (Rutas de API)
     * - _next/static (Archivos estáticos)
     * - _next/image (Optimización de imágenes)
     * - favicon.ico (Icono)
     * - admin (Panel de Payload)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
}

/**
 * Nota para M0.7: el panel de Payload (/admin) es una SPA de React que en
 * algunas versiones necesita 'unsafe-eval' en desarrollo. Verificar contra la
 * versión real de Payload 3 instalada; si hace falta, relajar el CSP SOLO
 * para el prefijo /admin (no para las rutas públicas) y dejarlo documentado
 * aquí con la razón exacta.
 *
 * Nota sobre HSTS 'preload': no actives el submit a hstspreload.org hasta
 * que el dominio definitivo (no el de staging temporal) esté estable — es
 * casi irreversible una vez aceptado por los navegadores.
 */

