import Link from 'next/link'
export function Footer() {
  const anio = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-page px-4 py-8 font-body text-sm text-ink-muted">
        <p>
          © {anio} Laboratorio de Investigación en Ciencias Biológicas — Facultad de Ciencias
          Biológicas, Universidad Nacional Mayor de San Marcos.
        </p>
        <p className="mt-2">
          Este sitio es independiente de los sistemas informáticos de la UNMSM (ver ADR-0001);
          no consume ni depende de ningún API institucional.
        </p>
        <Link className="mt-3 inline-block text-guinda-700 underline" href="/paginas">Información y privacidad</Link>
      </div>
    </footer>
  )
}
