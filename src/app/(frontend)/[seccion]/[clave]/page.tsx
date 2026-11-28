import { notFound } from 'next/navigation'
import { consultar, modelos, colecciones } from '@/lib/catalogo'
import { Detalle } from '@/components/Catalogo'
export default async function Ficha({
  params,
}: {
  params: Promise<{ seccion: string; clave: string }>
}) {
  const { seccion, clave } = await params
  const patente = seccion === 'publicaciones' && clave.startsWith('patente-')
  const tipo = patente ? 'patentes' : colecciones.find((c) => modelos[c].seccion === seccion)
  if (!tipo) notFound()
  const {
    docs: [doc],
  } = await consultar(tipo, { clave: patente ? clave.slice(8) : clave })
  if (!doc) notFound()
  return <Detalle tipo={tipo} doc={doc} />
}
