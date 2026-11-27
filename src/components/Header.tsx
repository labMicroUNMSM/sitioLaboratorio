import Link from 'next/link'

/**
 * Header institucional.
 * - <header> es un landmark nativo; no se repite en cada página.
 * - El <h1> de cada página vive en el <main>, NUNCA aquí (criterio de
 *   aceptación de M0: "un solo h1" por página).
 * - Los logos son marcador de posición hasta que Imagen Institucional
 *   autorice los archivos oficiales (ver ADR-0003). El alt queda reservado
 *   y descriptivo, no genérico.
 */
export function Header() {
  return (
    <header className="border-b border-border bg-guinda-700 text-white">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link
          href="/"
          aria-label="Inicio · Laboratorio de Investigación en Ciencias Biológicas"
          className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <span
            role="img"
            aria-label="Marcador de posición: escudo de la UNMSM (pendiente de autorización de Imagen Institucional)"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-oro-700/60 bg-guinda-900 text-xs text-oro-200"
          >
            UNMSM
          </span>
          <span
            role="img"
            aria-label="Marcador de posición: logo de la Facultad de Ciencias Biológicas"
            className="flex h-10 w-16 items-center justify-center rounded-sm border border-oro-700/60 bg-guinda-900 text-[10px] text-oro-200"
          >
            FCB
          </span>
          <span className="font-display text-lg leading-tight">
            Laboratorio de Investigación
            <br />
            <span className="text-sm font-normal text-oro-200">en Ciencias Biológicas</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal">
          <Link
            href="/equipo"
            className="inline-flex min-h-11 items-center rounded-sm px-3 font-body font-semibold underline decoration-oro-200 underline-offset-4 hover:bg-guinda-900"
          >
            Equipo
          </Link>
        </nav>
      </div>
    </header>
  )
}
