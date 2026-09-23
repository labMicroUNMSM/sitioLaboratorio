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
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <span
            aria-label="Marcador de posición: escudo de la UNMSM (pendiente de autorización de Imagen Institucional)"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-oro-700/60 bg-guinda-900 text-xs text-oro-200"
          >
            UNMSM
          </span>
          <span
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

        <nav aria-label="Principal" className="hidden gap-6 font-body text-sm md:flex">
          <Link href="/equipo" className="hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]">
            Equipo
          </Link>
          <Link href="/lineas-investigacion" className="hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]">
            Líneas de investigación
          </Link>
          <Link href="/publicaciones" className="hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]">
            Publicaciones
          </Link>
          <Link href="/contacto" className="hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]">
            Contacto
          </Link>
        </nav>
      </div>
    </header>
  )
}
