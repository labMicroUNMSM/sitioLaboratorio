import { colecciones, consultar, modelos } from '@/lib/catalogo'
import { h1, marco, Tarjetas } from '@/components/Catalogo'
export default async function Buscar({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const valor = (await searchParams).q
  const q = typeof valor === 'string' ? valor.trim().slice(0, 100) : ''
  const resultados = q
    ? await Promise.all(
        colecciones.map(async (tipo) => ({ tipo, ...(await consultar(tipo, { q })) })),
      )
    : []
  return (
    <article className={marco}>
      <h1 className={h1}>Buscar en el laboratorio</h1>
      <form className="flex flex-wrap items-end gap-3">
        <label>
          Título, autor o tema
          <input
            className="block rounded border border-border p-2"
            name="q"
            defaultValue={q}
            maxLength={100}
            required
          />
        </label>
        <button className="rounded bg-guinda-700 px-4 py-2 text-white">Buscar</button>
      </form>
      {q && resultados.every((g) => !g.docs.length) && (
        <p>No se encontraron resultados para «{q}».</p>
      )}
      {resultados
        .filter((g) => g.docs.length)
        .map((g) => (
          <section key={g.tipo} className="space-y-3">
            <h2 className="font-display text-2xl">{modelos[g.tipo].nombre}</h2>
            <Tarjetas tipo={g.tipo} docs={g.docs} />
          </section>
        ))}
    </article>
  )
}
