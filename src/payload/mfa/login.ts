import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import {
  addDataAndFileToRequest,
  APIError,
  type CollectionAfterReadHook,
  type CollectionBeforeLoginHook,
  type Endpoint,
  type PayloadRequest,
} from 'payload'
import { generatePayloadCookie } from 'payload/shared'
import QRCode from 'qrcode'
import {
  autenticador,
  periodoValido,
  propuesta,
  proteger,
  recuperar,
  secretoPropuesto,
} from './credencial'

const requerido = 'Completa el segundo factor en el panel.'
type Paso =
  { paso: 'codigo' } | { paso: 'vincular'; solicitud: string; secreto: string; qr: string }

// Objeto creado en el servidor. Los datos del cliente nunca se copian al contexto.
class Flujo {
  paso?: Paso
  constructor(
    readonly codigo: string | undefined,
    readonly solicitud: string,
  ) {}
}

function denegar(): never {
  throw new APIError('Código incorrecto, caducado o ya utilizado.', 401)
}

function postgres(
  req: PayloadRequest,
): Pick<PostgresAdapter, 'sessions' | 'pg' | 'poolOptions' | 'drizzle'> {
  return req.payload.db as Pick<PostgresAdapter, 'sessions' | 'pg' | 'poolOptions' | 'drizzle'>
}

// Payload retiene una conexión mientras se autentica. El contador debe poder confirmar
// un fallo aunque todas las conexiones del pool principal estén atendiendo logins.
const contadores = new WeakMap<PayloadRequest['payload'], PostgresAdapter['pool']>()

function contador(req: PayloadRequest) {
  let pool = contadores.get(req.payload)
  if (!pool) {
    const db = postgres(req)
    pool = new db.pg.Pool({
      ...db.poolOptions,
      max: 1,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 5000,
    })
    const logger = req.payload.logger
    pool.on('error', () => logger.error('La conexión del contador MFA se ha interrumpido.'))
    contadores.set(req.payload, pool)
  }
  return pool
}

async function transaccion(req: PayloadRequest) {
  const db = postgres(req)
  const id = await req.transactionID
  const tx = id && db.sessions[id]?.db
  if (!tx) throw new Error('MFA requiere una transacción activa de Payload.')
  return tx
}

export const exigirMfa: CollectionBeforeLoginHook = async ({ user, req }) => {
  if (user.rol !== 'admin') return user
  const flujo = req.context.flujoMfa
  if (!(flujo instanceof Flujo)) throw new APIError(requerido, 403)
  const tx = await transaccion(req)
  const id = Number(user.id)
  // Serializa las confirmaciones incluso durante el primer enrolamiento.
  await tx.execute(sql`SELECT pg_advisory_xact_lock(724610, ${id})`)
  const { rows } = await tx.execute(
    sql`SELECT cifrado, periodo, sesiones FROM usuario_mfa WHERE usuario = ${id}`,
  )
  const actual = rows[0] as { cifrado: string; periodo: number; sesiones: string[] } | undefined
  if (flujo.codigo === undefined) {
    if (actual) {
      flujo.paso = { paso: 'codigo' }
    } else {
      const alta = propuesta(id)
      flujo.paso = {
        paso: 'vincular',
        ...alta,
        qr: await QRCode.toDataURL(autenticador(alta.secreto, user.email).toString()),
      }
    }
    throw new APIError(requerido, 403)
  }

  // Cuenta fuera de la transacción de login: un rollback no borra los intentos fallidos.
  const intento = await contador(req).query(
    `INSERT INTO usuario_mfa_intentos (usuario, cantidad, hasta) VALUES ($1, 1, now() + interval '15 minutes')
     ON CONFLICT (usuario) DO UPDATE SET
       cantidad = CASE WHEN usuario_mfa_intentos.hasta <= now() THEN 1 ELSE usuario_mfa_intentos.cantidad + 1 END,
       hasta = CASE WHEN usuario_mfa_intentos.hasta <= now() THEN EXCLUDED.hasta ELSE usuario_mfa_intentos.hasta END
     WHERE usuario_mfa_intentos.cantidad < 5 OR usuario_mfa_intentos.hasta <= now() RETURNING usuario`,
    [id],
  )
  if (!intento.rowCount) throw new APIError('Demasiados intentos. Espera 15 minutos.', 429)

  const secreto = actual ? recuperar(id, actual.cifrado) : secretoPropuesto(id, flujo.solicitud)
  if (!secreto) return denegar()
  const periodo = periodoValido(secreto, flujo.codigo, actual?.periodo ?? -1)
  if (periodo === null) return denegar()
  // Payload acaba de añadir esta sesión en la misma transacción y aún no ha firmado el JWT.
  const nativas = (user.sessions ?? []).map((s: { id: string }) => s.id)
  const sid = nativas.at(-1)
  if (!sid) throw new Error('Payload no asignó una sesión para MFA.')
  const sesiones = [...(actual?.sesiones ?? []).filter((s) => nativas.includes(s)), sid]
  const cifrado = actual?.cifrado ?? proteger(id, secreto)
  await tx.execute(sql`INSERT INTO usuario_mfa (usuario, cifrado, periodo, sesiones)
    VALUES (${id}, ${cifrado}, ${periodo}, ${JSON.stringify(sesiones)}::jsonb)
    ON CONFLICT (usuario) DO UPDATE SET periodo = EXCLUDED.periodo, sesiones = EXCLUDED.sesiones`)
  if (!actual) {
    await tx.execute(sql`UPDATE usuarios SET mfa_habilitado = true WHERE id = ${id}`)
    await req.payload.create({
      collection: 'auditoria',
      req,
      overrideAccess: true,
      data: {
        accion: 'usuario.mfa.activar',
        coleccion_afectada: 'usuarios',
        documento_id: String(id),
        usuario: id,
      },
    })
  }
  await tx.execute(sql`DELETE FROM usuario_mfa_intentos WHERE usuario = ${id}`)
  user.mfa_habilitado = true
  return user
}

// La estrategia JWT comprueba el sid en esta lista, incluso para una cookie antigua o de editor promovido.
export const filtrarSesiones: CollectionAfterReadHook = async ({ doc, req }) => {
  if (doc.rol !== 'admin') return doc
  const db = postgres(req)
  const tx = req.transactionID ? await transaccion(req) : db.drizzle
  const { rows } = await tx.execute(sql`SELECT sesiones FROM usuario_mfa WHERE usuario = ${doc.id}`)
  const permitidas = (rows[0]?.sesiones ?? []) as string[]
  doc.mfa_habilitado = rows.length > 0
  if (Array.isArray(doc.sessions))
    doc.sessions = doc.sessions.filter((s: { id: string }) => permitidas.includes(s.id))
  return doc
}

function respuesta(datos: object, status: number, cookie?: string) {
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  if (cookie) headers.set('Set-Cookie', cookie)
  return Response.json(datos, { status, headers })
}

export const loginMfa: Endpoint = {
  path: '/login-mfa',
  method: 'post',
  handler: async (req) => {
    if (req.headers.get('content-type')?.split(';')[0] !== 'application/json')
      return respuesta({}, 415)
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    const protocolo =
      req.headers.get('x-forwarded-proto') === 'https'
        ? 'https'
        : new URL(req.url!).protocol.slice(0, -1)
    if (
      origin &&
      origin !== protocolo + '://' + host &&
      origin !== process.env.NEXT_PUBLIC_SITE_URL
    ) {
      return respuesta({}, 403)
    }
    await addDataAndFileToRequest(req)
    const { email, password, codigo, solicitud } = req.data ?? {}
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      (codigo !== undefined && typeof codigo !== 'string')
    )
      return respuesta({ error: 'Revisa los datos del formulario.' }, 400)
    const flujo = new Flujo(codigo, typeof solicitud === 'string' ? solicitud : '')
    try {
      const { token } = await req.payload.login({
        collection: 'usuarios',
        data: { email, password },
        req,
        context: { flujoMfa: flujo },
        overrideAccess: false,
      })
      if (!token) throw new Error('Payload no emitió una sesión.')
      const cookie = generatePayloadCookie({
        token,
        collectionAuthConfig: req.payload.collections.usuarios!.config.auth,
        cookiePrefix: req.payload.config.cookiePrefix,
      })
      return respuesta({ paso: 'panel' }, 200, cookie)
    } catch (error) {
      if (flujo.paso) return respuesta(flujo.paso, 200)
      if (error instanceof APIError && error.status < 500) {
        const mensaje =
          error.status === 429
            ? error.message
            : codigo === undefined
              ? 'Revisa el correo y la contraseña.'
              : 'Código incorrecto, caducado o ya utilizado.'
        return respuesta({ error: mensaje }, error.status)
      }
      req.payload.logger.error(
        'No se pudo completar la autenticación MFA. Comprueba el esquema y la clave de cifrado.',
      )
      return respuesta({ error: 'No se pudo completar el acceso.' }, 500)
    }
  },
}
