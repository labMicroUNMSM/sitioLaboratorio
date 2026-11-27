// Prueba integral sobre el servicio PostgreSQL desechable del workflow.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { TOTP } from 'otpauth'

const base = 'http://127.0.0.1:3114'
const db = new URL(process.env.DATABASE_URI)
if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  !['localhost', '127.0.0.1'].includes(db.hostname) ||
  db.pathname !== '/laboratorio_db' ||
  db.username !== 'laboratorio'
) {
  throw new Error('Esta prueba requiere la base efímera de CI.')
}
const email = 'mfa-ci@example.test'
const password = randomBytes(24).toString('base64url')
const credenciales = { email, password }

function post(ruta, data) {
  return fetch(base + '/api/usuarios/' + ruta, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })
}
function auditar(cookie) {
  return fetch(base + '/api/auditoria?limit=1', { headers: { Cookie: cookie } })
}
function cookie(res) {
  return (res.headers.get('set-cookie') ?? '').split(';')[0]
}

const alta = await post('first-register', { ...credenciales, nombre: 'Prueba CI', rol: 'editor' })
assert.equal(alta.status, 200)
const anterior = cookie(alta)
assert.equal((await auditar(anterior)).status, 403)
execFileSync('psql', ['-X', '-q', '-v', 'correo=' + email, '-f', 'scripts/primer-admin.sql'], {
  env: {
    ...process.env,
    PGHOST: db.hostname,
    PGDATABASE: db.pathname.slice(1),
    PGUSER: db.username,
    PGPASSWORD: decodeURIComponent(db.password),
  },
  stdio: 'ignore',
})
assert.equal((await auditar(anterior)).status, 403)
const nativo = await post('login', credenciales)
assert.equal(nativo.status, 403)
assert.ok(!cookie(nativo))
const inicio = await post('login-mfa', credenciales)
assert.equal(inicio.status, 200)
assert.ok(!cookie(inicio))
const reto = await inicio.json()
assert.ok(reto.paso === 'vincular')
const totp = new TOTP({ secret: reto.secreto })
const rechazado = await post('login-mfa', {
  ...credenciales,
  solicitud: reto.solicitud,
  codigo: 'invalido',
})
assert.equal(rechazado.status, 401)
assert.ok(!cookie(rechazado))
const codigo = totp.generate()
const confirmado = await post('login-mfa', { ...credenciales, solicitud: reto.solicitud, codigo })
assert.equal(confirmado.status, 200)
assert.ok(Boolean(cookie(confirmado)))
assert.equal((await auditar(cookie(confirmado))).status, 200)
const otraSesion = await post('login-mfa', credenciales)
assert.ok((await otraSesion.json()).paso === 'codigo')
assert.ok(!cookie(otraSesion))
const repetido = await post('login-mfa', { ...credenciales, codigo })
assert.equal(repetido.status, 401)
assert.ok(!cookie(repetido))
for (let intento = 0; intento < 4; intento++) {
  assert.equal((await post('login-mfa', { ...credenciales, codigo: 'invalido' })).status, 401)
}
const limitado = await post('login-mfa', { ...credenciales, codigo: 'invalido' })
assert.equal(limitado.status, 429)
assert.ok(!cookie(limitado))
console.log(
  'MFA integrado: promoción, sesión anterior, enrolamiento, denegaciones, auditoría y antirreutilización comprobados.',
)
