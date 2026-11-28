import Link from 'next/link'
import { consultar } from '@/lib/catalogo'
import { Cuerpo } from '@/components/Catalogo'

export default async function PaginaInicio() {
  const {
    docs: [presentacion],
  } = await consultar('paginas', { clave: 'laboratorio' }).catch(() => {
    console.error('No se pudo cargar la presentación editorial de la portada.')
    return { docs: [] }
  })

  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-display text-3xl leading-tight text-ink">
        Laboratorio de Investigación en Ciencias Biológicas
      </h1>
      <p className="mt-4 max-w-content font-body text-lg leading-relaxed text-ink-muted">
        Facultad de Ciencias Biológicas, Universidad Nacional Mayor de San Marcos. Conoce a los
        integrantes del equipo y las líneas de investigación del laboratorio.
      </p>
      {presentacion && (
        <section className="mt-8 max-w-content space-y-3 rounded-md border border-border bg-white p-6">
          <h2 className="font-display text-2xl">{String(presentacion.titulo)}</h2>
          <Cuerpo valor={presentacion.cuerpo} />
          <Link className="inline-block text-guinda-700 underline" href="/lineas-investigacion">
            Explorar líneas de investigación
          </Link>
        </section>
      )}
    </div>
  )
}
