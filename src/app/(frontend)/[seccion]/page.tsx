import Link from 'next/link'
import { notFound } from 'next/navigation'
import { colecciones, consultar, modelos } from '@/lib/catalogo'
import { enlace, h1, marco, Tarjetas } from '@/components/Catalogo'
export default async function Listado({
  params,
  searchParams,
}: {
  params: Promise<{ seccion: string }>
  searchParams: Promise<{ pagina?: string }>
}) {
  const { seccion } = await params
  const tipos = colecciones.filter((c) => modelos[c].seccion === seccion)
  if (!tipos.length) notFound()
  const pagina = Math.max(
    1,
    Math.min(10000, Number.parseInt((await searchParams).pagina ?? '', 10) || 1),
  )
  const grupos = await Promise.all(
    tipos.map(async (tipo) => ({ tipo, ...(await consultar(tipo, { pagina })) })),
  )
  return (
    <article className={marco}>
      <h1 className={h1}>
        {tipos.length > 1 ? 'Publicaciones y patentes' : modelos[tipos[0]!].nombre}
      </h1>
      {grupos.map(({ tipo, docs }) => (
        <section key={tipo} className="space-y-4">
          {tipos.length > 1 && <h2 className="font-display text-2xl">{modelos[tipo].nombre}</h2>}
          <Tarjetas tipo={tipo} docs={docs} />
        </section>
      ))}
      <div className="flex gap-6">
        {pagina > 1 && (
          <Link className={enlace} href={'?pagina=' + (pagina - 1)}>
            Anterior
          </Link>
        )}
        {grupos.some((g) => g.totalPages > pagina) && (
          <Link className={enlace} href={'?pagina=' + (pagina + 1)}>
            Siguiente
          </Link>
        )}
      </div>
    </article>
  )
}
