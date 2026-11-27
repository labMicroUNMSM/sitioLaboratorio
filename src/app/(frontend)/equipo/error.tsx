'use client'

export default function ErrorEquipo() {
  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-display text-3xl leading-tight text-ink">Equipo</h1>
      <p role="alert" className="mt-4 font-body text-lg text-ink-muted">
        No se pudo cargar el directorio del equipo.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 rounded-sm font-semibold text-guinda-700 underline"
      >
        Reintentar
      </button>
    </div>
  )
}
