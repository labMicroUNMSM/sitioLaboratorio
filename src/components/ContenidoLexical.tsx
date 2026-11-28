import Image from 'next/image'
import Link from 'next/link'
import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { imagenPublica } from '@/lib/lineasPublicas'
export function Imagen({ media }: { media: unknown }) {
  const imagen = imagenPublica.safeParse(media)
  if (!imagen.success) return null
  const foto = imagen.data
  const variante = foto.sizes?.card?.filename ? foto.sizes.card : foto
  if (!variante.filename) return null
  return (
    <Image
      unoptimized
      src={'/api/media/file/' + encodeURIComponent(variante.filename)}
      alt={foto.alt ?? ''}
      width={variante.width ?? 800}
      height={variante.height ?? 500}
      className="h-auto w-full rounded-md"
    />
  )
}

const enlacesPublicos = ['/', '/equipo', '/lineas-investigacion']
export const conversores: JSXConvertersFunction = ({ defaultConverters }) => {
  function enlace(fields: SerializedLinkNode['fields'], contenido: React.ReactNode) {
    const doc = fields.doc
    let destino = fields.url && enlacesPublicos.includes(fields.url) ? fields.url : null
    if (fields.linkType === 'internal' && doc && typeof doc.value === 'object' && doc.value) {
      if (doc.relationTo === 'personas') destino = '/equipo#persona-' + doc.value.id
      if (doc.relationTo === 'lineas-investigacion' && typeof doc.value.slug === 'string') {
        destino = '/lineas-investigacion/' + encodeURIComponent(doc.value.slug)
      }
    }
    return destino ? <Link href={destino}>{contenido}</Link> : contenido
  }
  return {
    ...defaultConverters,
    link: ({ node, nodesToJSX }) => enlace(node.fields, nodesToJSX({ nodes: node.children })),
    autolink: ({ node, nodesToJSX }) => enlace(node.fields, nodesToJSX({ nodes: node.children })),
    upload: ({ node }) => <Imagen media={node.value} />,
    heading: ({ node, nodesToJSX }) => <h3>{nodesToJSX({ nodes: node.children })}</h3>,
  }
}
