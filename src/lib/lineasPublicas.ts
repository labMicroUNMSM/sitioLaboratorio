import { cache } from 'react'
import { getPayload } from 'payload'
import { z } from 'zod'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import config from '@/payload/payload.config'

const visitante = { overrideAccess: false, draft: false, locale: 'es', depth: 0 } as const
type Contenido = Parameters<typeof convertLexicalToPlaintext>[0]['data']
const texto = z.custom<Contenido>((v) => v?.root?.type === 'root' && Array.isArray(v.root.children))
const tarjeta = z.object({ titulo: z.string(), slug: z.string(), resumen_divulgativo: texto })

export async function listarLineas() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    ...visitante,
    collection: 'lineas-investigacion',
    pagination: false,
    sort: ['orden', 'titulo', 'id'],
    select: { titulo: true, slug: true, resumen_divulgativo: true },
  })
  return docs.map((doc) => {
    const { titulo, slug, resumen_divulgativo } = tarjeta.parse(doc)
    const resumen = convertLexicalToPlaintext({ data: resumen_divulgativo })
      .replace(/\s+/gu, ' ')
      .trim()
    return {
      titulo,
      slug,
      tema: resumen.length <= 220 ? resumen : resumen.slice(0, 220).replace(/\s+\S*$/u, '') + '…',
    }
  })
}

const nombreArchivo = z.object({
  filename: z.string().nullish(),
  width: z.number().nullish(),
  height: z.number().nullish(),
})
export const imagenPublica = nombreArchivo.extend({
  alt: z.string().nullish(),
  sizes: z.object({ card: nombreArchivo.nullish() }).nullish(),
})

const ficha = tarjeta.extend({ detalle_tecnico: texto })

// React comparte esta consulta entre metadata y página solo durante la petición.
export const buscarLinea = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const {
    docs: [doc],
  } = await payload.find({
    ...visitante,
    collection: 'lineas-investigacion',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    select: {
      titulo: true,
      slug: true,
      resumen_divulgativo: true,
      detalle_tecnico: true,
      figura: true,
    },
    populate: {
      personas: { nombre_completo: true },
      'lineas-investigacion': { slug: true },
      media: {
        filename: true,
        alt: true,
        width: true,
        height: true,
        sizes: { card: { filename: true, width: true, height: true } },
      },
    },
  })
  return doc ? { ...ficha.parse(doc), id: doc.id, figura: doc.figura } : null
})

export async function participantesYTrabajos(id: number | string) {
  const payload = await getPayload({ config })
  const consulta = { ...visitante, pagination: false, where: { lineas: { equals: id } } }
  const [personas, proyectos, publicaciones] = await Promise.all([
    payload.find({
      ...consulta,
      collection: 'personas',
      select: { nombre_completo: true },
      sort: ['orden', 'nombre_completo', 'id'],
    }),
    payload.find({
      ...consulta,
      collection: 'proyectos',
      select: { titulo: true, slug: true },
      sort: ['titulo', 'id'],
    }),
    payload.find({
      ...consulta,
      collection: 'publicaciones',
      select: { titulo: true },
      sort: ['-anio', 'titulo', 'id'],
    }),
  ])
  return {
    personas: personas.docs.map((p) => ({ id: p.id, nombre: z.string().parse(p.nombre_completo) })),
    proyectos: proyectos.docs.map((p) => ({ id: p.id, href: '/proyectos/' + encodeURIComponent(z.string().parse(p.slug)), titulo: z.string().parse(p.titulo) })),
    publicaciones: publicaciones.docs.map((p) => ({
      id: p.id,
      href: '/publicaciones/' + p.id,
      titulo: z.string().parse(p.titulo),
    })),
  }
}
