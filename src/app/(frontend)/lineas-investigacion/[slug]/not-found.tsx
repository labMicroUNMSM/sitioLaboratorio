import Link from 'next/link'

export default function LineaNoEncontrada() {
  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-display text-3xl text-ink">Línea no encontrada</h1>
      <Link
        href="/lineas-investigacion"
        className="mt-4 inline-block text-guinda-700 underline underline-offset-4"
      >
        Ver las líneas de investigación
      </Link>
    </div>
  )
}
