/**
 * Portada — M0 solo entrega esto: Header/Footer + una portada vacía con un
 * único h1. El contenido real (líneas destacadas, últimas noticias, etc.)
 * llega en M1/M2/M7. No adelantar esas secciones aquí (ver "Qué NO hace M0").
 */
export default function PaginaInicio() {
  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-display text-3xl leading-tight text-ink">
        Laboratorio de Investigación en Ciencias Biológicas
      </h1>
      <p className="mt-4 max-w-content font-body text-lg leading-relaxed text-ink-muted">
        Facultad de Ciencias Biológicas, Universidad Nacional Mayor de San Marcos. Este sitio
        está en construcción — vuelve pronto para conocer al equipo, las líneas de investigación
        y las publicaciones del laboratorio.
      </p>
    </div>
  )
}
