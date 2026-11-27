// Ejercita el ciclo editorial real con un editor efímero en la base de la auditoría.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'

if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  new URL(process.env.DATABASE_URI).pathname !== '/lineas_ci'
) {
  throw new Error('Esta comprobación requiere la base efímera lineas_ci de GitHub Actions.')
}
const base = 'http://localhost:3000'
const ruta = '/lineas-investigacion'
const slug = 'fenologia-del-bosque'
const privado = 'Revisión pendiente del editor'
function texto(text) {
  const formato = { direction: 'ltr', format: '', indent: 0, version: 1 }
  return {
    root: {
      ...formato,
      type: 'root',
      children: [
        {
          ...formato,
          type: 'paragraph',
          children: [
            { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' },
          ],
        },
      ],
    },
  }
}

let cookie = ''
async function escribir(endpoint, data, method = 'POST') {
  const response = await fetch(base + '/api/' + endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(data),
  })
  assert.ok(response.ok, method + ' ' + endpoint + ' devolvió ' + response.status)
  return response
}
async function pagina(path, status) {
  const response = await fetch(base + path)
  assert.equal(response.status, status, path)
  return response.text()
}

assert.ok((await pagina(ruta, 200)).includes('Aún no hay líneas de investigación publicadas.'))
const alta = await escribir('usuarios/first-register', {
  email: 'editor-lineas@example.test',
  password: randomBytes(24).toString('base64url'),
  nombre: 'Editor CI',
  rol: 'editor',
})
cookie = alta.headers.get('set-cookie').split(';')[0]
const data = {
  titulo: 'Fenología del bosque',
  slug,
  resumen_divulgativo: texto('El calendario de las flores.'),
  detalle_tecnico: texto('Serie de observaciones por estación.'),
  estado: 'publicado',
  _status: 'published',
}
const coleccion = 'lineas-investigacion'
const { doc } = await (await escribir(coleccion, data)).json()
const endpoint = coleccion + '/' + doc.id
await escribir(
  endpoint + '?draft=true',
  { resumen_divulgativo: texto(privado), _status: 'draft' },
  'PATCH',
)
const borrador = await fetch(base + '/api/' + endpoint + '?draft=true', {
  headers: { Cookie: cookie },
})
assert.ok((await borrador.text()).includes(privado))
await escribir(coleccion + '?draft=true', {
  ...data,
  titulo: 'Línea en preparación',
  slug: 'solo-borrador',
  _status: 'draft',
})
for (const path of [ruta, ruta + '/' + slug]) {
  const html = await pagina(path, 200)
  assert.ok(html.includes('El calendario de las flores.'))
  assert.ok(!html.includes(privado) && !html.includes('Línea en preparación'))
}
await pagina(ruta + '/solo-borrador', 404)
await pagina(ruta + '/inexistente', 404)

const { doc: persona } = await (
  await escribir('personas', {
    nombre_completo: 'Integrante de la línea CI',
    slug: 'integrante-linea-ci',
    rol: 'postdoc',
    lineas: [doc.id],
  })
).json()
assert.ok((await pagina(ruta + '/' + slug, 200)).includes('Integrante de la línea CI'))
await escribir('personas/' + persona.id, { lineas: [] }, 'PATCH')
assert.ok(!(await pagina(ruta + '/' + slug, 200)).includes('Integrante de la línea CI'))
await escribir('personas/' + persona.id, { lineas: [doc.id] }, 'PATCH')

const { doc: archivar } = await (await escribir(coleccion, { ...data, slug: 'archivo-ci' })).json()
await escribir(
  coleccion + '/' + archivar.id,
  { estado: 'archivado', _status: 'published' },
  'PATCH',
)
await pagina(ruta + '/archivo-ci', 404)
console.log(
  'Líneas verificadas en HTTP: vacío, publicación, borrador posterior, archivo y cambios de relación.',
)
