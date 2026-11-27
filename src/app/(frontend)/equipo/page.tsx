import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload/payload.config'
import { z } from 'zod'
import { personaSchema } from '@/lib/validation/persona.schema'
import { ROLES_PERSONA_LABEL } from '@/lib/taxonomias'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Equipo',
  description:
    'Integrantes del Laboratorio de Investigación en Ciencias Biológicas y sus funciones.',
}

const camposTarjeta = personaSchema.pick({ nombre_completo: true, rol: true }).extend({
  cargo_titulo: z.string().nullish(),
})
const fotoTarjeta = z.object({
  filename: z.string(),
  alt: z.string().nullish(),
  sizes: z.object({ thumbnail: z.object({ filename: z.string().nullish() }).nullish() }).nullish(),
})

function iniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/u)
  return [palabras[0], ...(palabras.length > 1 ? palabras.slice(-1) : [])]
    .map((palabra) => Array.from(palabra ?? '')[0])
    .join('')
    .toLocaleUpperCase('es')
}

export default async function Equipo() {
  const payload = await getPayload({ config })
  // Consulta anónima incluso si el navegador tiene una sesión de Payload.
  // Las reglas de Personas y de la foto relacionada filtran las fichas retiradas.
  const { docs } = await payload.find({
    collection: 'personas',
    overrideAccess: false,
    locale: 'es',
    depth: 1,
    pagination: false,
    sort: ['orden', 'nombre_completo', 'id'],
    select: { nombre_completo: true, rol: true, cargo_titulo: true, foto: true },
    populate: { media: { alt: true, filename: true, sizes: { thumbnail: { filename: true } } } },
  })

  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-display text-3xl leading-tight text-ink">Equipo</h1>
      {docs.length === 0 ? (
        <p className="mt-4 font-body text-lg text-ink-muted">Aún no hay integrantes publicados.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => {
            const persona = camposTarjeta.parse(doc)
            const foto =
              doc.foto && typeof doc.foto === 'object' ? fotoTarjeta.parse(doc.foto) : null
            const archivo = foto?.sizes?.thumbnail?.filename || foto?.filename
            return (
              <li id={`persona-${doc.id}`} key={doc.id} className="rounded-md border border-border bg-white p-6">
                {archivo ? (
                  <Image
                    unoptimized
                    src={'/api/media/file/' + encodeURIComponent(archivo)}
                    width={88}
                    height={88}
                    alt={foto?.alt ?? ''}
                    className="h-[88px] w-[88px] rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-guinda-100 font-display text-3xl text-guinda-700"
                  >
                    {iniciales(persona.nombre_completo)}
                  </span>
                )}
                <h2 className="mt-5 break-words font-display text-2xl leading-tight text-ink">
                  {persona.nombre_completo}
                </h2>
                <p className="mt-2 font-body font-semibold text-guinda-700">
                  {ROLES_PERSONA_LABEL[persona.rol].es}
                </p>
                {persona.cargo_titulo && (
                  <p className="mt-1 break-words font-body leading-relaxed text-ink-muted">
                    {persona.cargo_titulo}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
