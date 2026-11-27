import Link from 'next/link'
import { listarLineas } from '@/lib/lineasPublicas'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Líneas de investigación' }

export default async function LineasInvestigacion() {
  const lineas = await listarLineas()
  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-display text-3xl leading-tight text-ink">Líneas de investigación</h1>
      {lineas.length === 0 ? (
        <p className="mt-4 font-body text-lg text-ink-muted">
          Aún no hay líneas de investigación publicadas.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {lineas.map(({ titulo, slug, tema }) => (
            <li
              key={slug}
              className="min-w-0 rounded-md border border-border border-t-4 border-t-guinda-700 bg-white p-6"
            >
              <h2 className="break-words font-display text-2xl leading-tight">
                <Link
                  className="rounded-sm text-guinda-700 underline decoration-1 underline-offset-4 hover:text-guinda-900"
                  href={'/lineas-investigacion/' + encodeURIComponent(slug)}
                >
                  {titulo}
                </Link>
              </h2>
              <p className="mt-4 break-words leading-relaxed text-ink-muted">{tema}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
