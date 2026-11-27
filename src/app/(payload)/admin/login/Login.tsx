'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import './login.css'

type Reto =
  { paso: 'codigo' } | { paso: 'vincular'; qr: string; secreto: string; solicitud: string }

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  const [reto, setReto] = useState<Reto>()
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    setOcupado(true)
    setError('')
    try {
      const res = await fetch('/api/usuarios/login-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          email,
          password,
          codigo: reto ? codigo : undefined,
          solicitud: reto?.paso === 'vincular' ? reto.solicitud : undefined,
        }),
      })
      const datos = await res.json()
      if (!res.ok) {
        setError(datos.error || 'No se pudo iniciar sesión.')
        setCodigo('')
      } else if (datos.paso === 'panel') {
        setPassword('')
        setCodigo('')
        setReto(undefined)
        const original = new URLSearchParams(window.location.search).get('redirect')
        const destino = new URL(original || '/admin', window.location.origin)
        window.location.replace(
          destino.origin === window.location.origin && destino.pathname.startsWith('/admin/')
            ? destino.href
            : '/admin',
        )
      } else {
        setReto(datos)
      }
    } catch {
      setError('No se pudo contactar con el panel. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <main className="acceso-panel">
      <h1>
        {!reto
          ? 'Iniciar sesión'
          : reto.paso === 'vincular'
            ? 'Vincular autenticador'
            : 'Verificar código'}
      </h1>
      <form onSubmit={enviar}>
        {!reto ? (
          <>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Link href="/admin/forgot">Olvidé mi contraseña</Link>
          </>
        ) : (
          <>
            {reto.paso === 'vincular' && (
              <>
                <p>
                  En tu app autenticadora, añade una cuenta y escanea el QR. Tienes cinco minutos
                  para confirmar.
                </p>
                {/* El QR contiene una clave privada y se genera en el servidor local. */}
                <Image
                  unoptimized
                  src={reto.qr}
                  alt="Código QR para vincular tu app autenticadora"
                  width="212"
                  height="212"
                />
                <details>
                  <summary>Introducir la clave manualmente</summary>
                  <p>Selecciona una clave basada en tiempo.</p>
                  <code>{reto.secreto}</code>
                </details>
              </>
            )}
            <label>
              Código de seis dígitos
              <input
                key="codigo"
                autoFocus
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </label>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <button disabled={ocupado} type="submit">
          {reto ? 'Confirmar código' : 'Continuar'}
        </button>
        {reto && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => {
              setReto(undefined)
              setCodigo('')
              setPassword('')
              setError('')
            }}
          >
            Volver al inicio
          </button>
        )}
      </form>
    </main>
  )
}
