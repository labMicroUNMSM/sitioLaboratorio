import { Imagen, conversores } from '@/components/ContenidoLexical'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { buscarLinea, participantesYTrabajos } from '@/lib/lineasPublicas'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const linea = await buscarLinea((await params).slug)
  return { title: linea?.titulo ?? 'Línea no encontrada' }
}

const texto =
  'mt-3 space-y-3 break-words leading-relaxed [&_a]:underline [&_h3]:font-semibold [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:ps-6 [&_ul]:ps-6'
const subtitulo = 'font-display text-2xl leading-tight text-ink'

export default async function FichaLinea({ params }: Props) {
  const linea = await buscarLinea((await params).slug)
  if (!linea) notFound()
  const { personas, proyectos, publicaciones } = await participantesYTrabajos(linea.id)
  return (
    <article className="mx-auto max-w-page px-4 py-12">
      <Link
        className="rounded-sm text-guinda-700 underline underline-offset-4"
        href="/lineas-investigacion"
      >
        Líneas de investigación
      </Link>
      <h1 className="mt-4 break-words font-display text-3xl leading-tight text-ink">
        {linea.titulo}
      </h1>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className={subtitulo}>Resumen divulgativo</h2>
            <RichText className={texto} data={linea.resumen_divulgativo} converters={conversores} />
          </section>
          <section>
            <h2 className={subtitulo}>Detalle técnico</h2>
            <RichText className={texto} data={linea.detalle_tecnico} converters={conversores} />
          </section>
          <Imagen media={linea.figura} />
        </div>
        <div className="min-w-0 space-y-6 rounded-md border border-border bg-white p-6">
          <section>
            <h2 className={subtitulo}>Participantes</h2>
            {personas.length ? (
              <ul className="mt-3 space-y-2">
                {personas.map((p) => (
                  <li key={p.id}>
                    <Link
                      className="break-words text-guinda-700 underline underline-offset-4"
                      href={'/equipo#persona-' + p.id}
                    >
                      {p.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-muted">Aún no hay integrantes vinculados.</p>
            )}
          </section>
          {(
            [
              ['Proyectos', proyectos],
              ['Publicaciones', publicaciones],
            ] as const
          ).map(
            ([titulo, registros]) =>
              registros.length > 0 && (
                <section key={titulo}>
                  <h2 className={subtitulo}>{titulo}</h2>
                  <ul className="mt-3 space-y-2">
                    {registros.map((r) => (
                      <li key={r.id} className="break-words">
                        <Link className="text-guinda-700 underline" href={r.href}>{r.titulo}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ),
          )}
        </div>
      </div>
    </article>
  )
}
