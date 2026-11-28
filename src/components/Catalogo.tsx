import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { destino, etiqueta, modelos, texto, type Coleccion, type Registro } from '@/lib/catalogo'
import { Imagen, conversores } from './ContenidoLexical'

export const enlace = 'text-guinda-700 underline underline-offset-4'
export const marco = 'mx-auto max-w-page space-y-6 px-4 py-12'
export const h1 = 'font-display text-3xl leading-tight text-ink'
const h2 = 'font-display text-2xl leading-tight text-ink'
export function Tarjetas({ tipo, docs }: { tipo: Coleccion; docs: Registro[] }) {
  if (!docs.length) return <p>Aún no hay registros públicos.</p>
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {docs.map((d) => (
        <li key={texto(d.id)} className="space-y-2 rounded-md border border-border bg-white p-5">
          {(tipo === 'equipamiento' || tipo === 'noticias') && (
            <Imagen media={d.foto ?? d.imagen_portada} />
          )}
          {tipo === 'equipamiento' && (
            <p className="text-sm font-semibold text-guinda-700">
              {texto(d.categoria).replaceAll('_', ' ')}
            </p>
          )}
          <Link className={enlace + ' font-display text-xl'} href={destino(tipo, d)}>
            {texto(d[modelos[tipo].titulo])}
          </Link>
          {etiqueta(tipo, d) && <p>{etiqueta(tipo, d)}</p>}
        </li>
      ))}
    </ul>
  )
}
export function Cuerpo({ valor }: { valor: unknown }) {
  return valor && typeof valor === 'object' && 'root' in valor ? (
    <RichText
      className="max-w-content space-y-3 leading-relaxed [&_a]:underline"
      data={valor as SerializedEditorState}
      converters={conversores}
    />
  ) : null
}
const atributos: Record<string, string> = {
  cargo_titulo: 'Cargo',
  autores: 'Autores',
  anio: 'Año',
  revista: 'Revista',
  doi: 'DOI',
  cuartil: 'Cuartil',
  tipo: 'Tipo',
  estado: 'Estado',
  numero_expediente: 'Expediente',
  oficina: 'Oficina',
  fecha_solicitud: 'Fecha de solicitud',
  entidad_financiadora: 'Entidad financiadora',
  numero_contrato: 'Contrato',
  periodo_inicio: 'Inicio',
  periodo_fin: 'Fin',
  monto: 'Monto',
  categoria: 'Categoría',
  marca_modelo: 'Marca y modelo',
  fecha_publicacion: 'Publicado el',
}
const relaciones: Record<string, [Coleccion, string]> = {
  autores_laboratorio: ['personas', 'Autores del laboratorio'],
  inventores: ['personas', 'Inventores'],
  equipo: ['personas', 'Equipo'],
  personas: ['personas', 'Integrantes'],
  lineas: ['lineas-investigacion', 'Líneas de investigación'],
}
function valores(v: unknown): Registro[] {
  return (Array.isArray(v) ? v : [v]).filter((d): d is Registro => !!d && typeof d === 'object')
}
export function Detalle({ tipo, doc }: { tipo: Coleccion; doc: Registro }) {
  const m = modelos[tipo]
  const acceso = texto(doc.url_acceso_abierto)
  return (
    <article className={marco}>
      <Link href={'/' + m.seccion} className={enlace}>
        {m.nombre}
      </Link>
      <h1 className={h1}>{texto(doc[m.titulo])}</h1>
      {tipo === 'personas' && <p>{etiqueta(tipo, doc)}</p>}
      {doc.resumen ? <p className="max-w-content text-lg">{texto(doc.resumen)}</p> : null}
      <div className="max-w-content">
        <Imagen media={doc.foto ?? doc.imagen_portada} />
      </div>
      <Cuerpo valor={doc.cuerpo ?? doc.biografia ?? doc.capacidades} />
      <dl className="grid max-w-content gap-3 sm:grid-cols-2">
        {Object.entries(atributos).map(([campo, label]) => {
          let v = texto(doc[campo])
          if (!v || (campo === 'monto' && !doc.monto_publicable)) return null
          if (campo.startsWith('fecha_') || campo.startsWith('periodo_'))
            v = new Date(v).toLocaleDateString('es-PE', { timeZone: 'UTC' })
          if (['tipo', 'estado', 'categoria'].includes(campo)) v = v.replaceAll('_', ' ')
          return (
            <div key={campo}>
              <dt className="font-semibold">{label}</dt>
              <dd>{v}</dd>
            </div>
          )
        })}
      </dl>
      {/^(https?):\/\//i.test(acceso) && (
        <a className={enlace} href={acceso}>
          Leer en acceso abierto
        </a>
      )}
      {Object.entries(relaciones).map(([campo, [coleccion, label]]) => {
        const docs = valores(doc[campo]).filter((d) => d[modelos[coleccion].titulo])
        return (
          docs.length > 0 && (
            <section key={campo}>
              <h2 className={h2}>{label}</h2>
              <ul>
                {docs.map((d) => (
                  <li key={texto(d.id)}>
                    <Link className={enlace} href={destino(coleccion, d)}>
                      {texto(d[modelos[coleccion].titulo])}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        )
      })}
      {valores(doc.logos_financiadores).map((d) => (
        <div className="max-w-xs" key={texto(d.id)}>
          <Imagen media={d} />
        </div>
      ))}
      {doc.disponible_colaboracion === true && (
        <Link className={enlace} href={'/contacto?equipo=' + encodeURIComponent(texto(doc.nombre))}>
          Consultar disponibilidad para colaboración
        </Link>
      )}
    </article>
  )
}
