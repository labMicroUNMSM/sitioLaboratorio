import { getPayload, type Where } from 'payload'
import config from '@/payload/payload.config'
import { ROLES_PERSONA_LABEL, type RolPersona } from './taxonomias'

export const colecciones = [
  'personas',
  'lineas-investigacion',
  'publicaciones',
  'patentes',
  'proyectos',
  'equipamiento',
  'noticias',
  'paginas',
] as const
export type Coleccion = (typeof colecciones)[number]
type Modelo = {
  seccion: string
  nombre: string
  titulo: string
  clave: 'id' | 'slug'
  campos: string[]
  buscar: string[]
  sort: string
}
export const modelos: Record<Coleccion, Modelo> = {
  personas: {
    seccion: 'equipo',
    nombre: 'Equipo',
    titulo: 'nombre_completo',
    clave: 'slug',
    campos: ['rol', 'cargo_titulo', 'biografia', 'foto', 'lineas'],
    buscar: ['nombre_completo', 'cargo_titulo'],
    sort: 'orden',
  },
  'lineas-investigacion': {
    seccion: 'lineas-investigacion',
    nombre: 'Líneas de investigación',
    titulo: 'titulo',
    clave: 'slug',
    campos: [],
    buscar: ['titulo'],
    sort: 'orden',
  },
  publicaciones: {
    seccion: 'publicaciones',
    nombre: 'Publicaciones',
    titulo: 'titulo',
    clave: 'id',
    campos: [
      'autores',
      'autores_laboratorio',
      'anio',
      'revista',
      'doi',
      'tipo',
      'lineas',
      'cuartil',
      'url_acceso_abierto',
    ],
    buscar: ['titulo', 'autores', 'revista', 'doi'],
    sort: '-anio',
  },
  patentes: {
    seccion: 'publicaciones',
    nombre: 'Patentes',
    titulo: 'titulo',
    clave: 'id',
    campos: ['resumen', 'estado', 'numero_expediente', 'oficina', 'fecha_solicitud', 'inventores'],
    buscar: ['titulo', 'numero_expediente', 'resumen'],
    sort: '-fecha_solicitud',
  },
  proyectos: {
    seccion: 'proyectos',
    nombre: 'Proyectos y financiamiento',
    titulo: 'titulo',
    clave: 'slug',
    campos: [
      'resumen',
      'tipo',
      'estado',
      'entidad_financiadora',
      'numero_contrato',
      'periodo_inicio',
      'periodo_fin',
      'monto',
      'monto_publicable',
      'equipo',
      'lineas',
      'logos_financiadores',
    ],
    buscar: ['titulo', 'resumen', 'entidad_financiadora'],
    sort: '-periodo_inicio',
  },
  equipamiento: {
    seccion: 'equipamiento',
    nombre: 'Equipamiento',
    titulo: 'nombre',
    clave: 'id',
    campos: ['foto', 'categoria', 'marca_modelo', 'capacidades', 'disponible_colaboracion'],
    buscar: ['nombre', 'marca_modelo'],
    sort: 'orden',
  },
  noticias: {
    seccion: 'actualidad',
    nombre: 'Actualidad',
    titulo: 'titulo',
    clave: 'slug',
    campos: [
      'resumen',
      'cuerpo',
      'categoria',
      'fecha_publicacion',
      'imagen_portada',
      'personas',
      'lineas',
    ],
    buscar: ['titulo', 'resumen'],
    sort: '-fecha_publicacion',
  },
  paginas: {
    seccion: 'paginas',
    nombre: 'Información',
    titulo: 'titulo',
    clave: 'slug',
    campos: ['cuerpo'],
    buscar: ['titulo'],
    sort: 'titulo',
  },
}
export type Registro = Record<string, unknown>
export function texto(valor: unknown) {
  return typeof valor === 'string' || typeof valor === 'number' ? String(valor) : ''
}
export function ruta(tipo: Coleccion, doc: Registro) {
  const m = modelos[tipo]
  return (
    '/' +
    m.seccion +
    '/' +
    (tipo === 'patentes' ? 'patente-' : '') +
    encodeURIComponent(texto(doc[m.clave]))
  )
}
export function etiqueta(tipo: Coleccion, doc: Registro) {
  if (tipo === 'personas') return ROLES_PERSONA_LABEL[doc.rol as RolPersona]?.es
  if (tipo === 'publicaciones') return [doc.revista, doc.anio].filter(Boolean).join(' · ')
  if (tipo === 'equipamiento') return texto(doc.marca_modelo)
  return texto(doc.resumen)
}
const contactos = ['unete', 'contacto']
export function destino(tipo: Coleccion, doc: Registro) {
  return tipo === 'paginas' && contactos.includes(texto(doc.slug))
    ? '/' + doc.slug
    : ruta(tipo, doc)
}
function campos(nombres: string[]) {
  return Object.fromEntries(nombres.map((n) => [n, true as const]))
}
export async function consultar(
  tipo: Coleccion,
  opciones: { clave?: string; q?: string; pagina?: number } = {},
) {
  const m = modelos[tipo]
  const payload = await getPayload({ config })
  const { clave, q, pagina = 1 } = opciones
  if (clave && m.clave === 'id' && !/^[1-9]\d{0,8}$/.test(clave)) return { docs: [], totalPages: 0 }
  const where: Where = clave
    ? { [m.clave]: { equals: clave } }
    : q
      ? { or: m.buscar.map((campo) => ({ [campo]: { contains: q } })) }
      : {}
  const relacionadas = Object.fromEntries(
    colecciones.map((c) => [c, campos([modelos[c].titulo, modelos[c].clave])]),
  )
  return payload.find({
    collection: tipo,
    overrideAccess: false,
    draft: false,
    locale: 'es',
    depth: clave || tipo === 'equipamiento' || tipo === 'noticias' ? 1 : 0,
    limit: clave ? 1 : 24,
    page: pagina,
    sort: [m.sort, 'id'],
    where,
    select: campos([m.titulo, m.clave, ...m.campos]),
    populate: {
      ...relacionadas,
      media: { filename: true, alt: true, width: true, height: true, sizes: true },
    },
  })
}
