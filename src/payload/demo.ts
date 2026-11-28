import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
} from 'payload'

function parrafo(text: string) {
  const bloque = { direction: 'ltr', format: '', indent: 0, version: 1 }
  return {
    root: {
      ...bloque,
      type: 'root',
      children: [
        {
          ...bloque,
          type: 'paragraph',
          children: [
            { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' },
          ],
        },
      ],
    },
  }
}
export async function prepararDemo(payload: Payload) {
  if (process.env.SITIO_DEMO !== 'true') return
  const req = await createLocalReq({ locale: 'es' }, payload)
  await initTransaction(req)
  try {
    const id = await req.transactionID
    const tx = id && (payload.db as Pick<PostgresAdapter, 'sessions'>).sessions[id]?.db
    if (!tx) throw new Error('La preparación requiere una transacción de PostgreSQL.')
    await tx.execute(sql`SELECT pg_advisory_xact_lock(724611,1)`)
    const marca = await tx.execute(sql`SELECT id FROM payload_kv WHERE key='demo.contenido.v1'`)
    if (!marca.rows.length) {
      // Una base preexistente solo puede recibir contenido mediante edición explícita.
      const base = await tx.execute(
        sql`SELECT EXISTS(SELECT 1 FROM usuarios UNION ALL SELECT 1 FROM personas UNION ALL SELECT 1 FROM media UNION ALL SELECT 1 FROM proyectos UNION ALL SELECT 1 FROM publicaciones UNION ALL SELECT 1 FROM patentes UNION ALL SELECT 1 FROM equipamiento UNION ALL SELECT 1 FROM lineas_investigacion UNION ALL SELECT 1 FROM noticias UNION ALL SELECT 1 FROM paginas) AS usada`,
      )
      if (base.rows[0]?.usada)
        throw new Error(
          'La base contiene datos previos. Selecciona una instalación nueva para la demo.',
        )
      async function crear(collection: string, data: Record<string, unknown>) {
        return (await payload.create({ collection, data, req, depth: 0 })).id
      }
      async function imagen(name: string, alt: string) {
        const data = await readFile(path.join(process.cwd(), 'demo', 'media', name))
        return (
          await payload.create({
            collection: 'media',
            req,
            data: { alt, creditos: 'Ilustración de demostración' },
            file: { data, name, mimetype: 'image/webp', size: data.length },
          })
        ).id
      }
      const bosque = await imagen(
        'bosque.webp',
        'Vegetación del bosque nublado alrededor de la parcela de observación.',
      )
      const retrato = await imagen(
        'integrante.webp',
        'Retrato ilustrativo de Lucía, integrante ficticia del laboratorio.',
      )
      const linea = await crear('lineas-investigacion', {
        titulo: 'Floración del bosque nublado',
        slug: 'floracion',
        estado: 'publicado',
        _status: 'published',
        figura: bosque,
        orden: 1,
        resumen_divulgativo: parrafo(
          'Seguimos los árboles de una parcela para descubrir cuándo florecen y qué cambia entre estaciones.',
        ),
        detalle_tecnico: parrafo(
          'Observamos las mismas copas cada mes y comparamos la presencia de botones, flores y frutos a lo largo del año.',
        ),
      })
      const humedal = await crear('lineas-investigacion', {
        titulo: 'Paisajes sonoros del humedal',
        slug: 'paisajes-sonoros',
        estado: 'publicado',
        _status: 'published',
        resumen_divulgativo: parrafo(
          'Escuchamos el paisaje para reconocer cómo cambia al amanecer.',
        ),
        detalle_tecnico: parrafo(
          'Clasificamos los intervalos de canto y comparamos registros de varias estaciones.',
        ),
        orden: 2,
      })
      const lucia = await crear('personas', {
        nombre_completo: 'Lucía Valle',
        slug: 'lucia-valle',
        rol: 'investigador_principal',
        cargo_titulo: 'Coordinadora de campo',
        foto: retrato,
        biografia: parrafo(
          'Coordina las visitas mensuales a la parcela y mantiene el calendario de observaciones.',
        ),
        lineas: [linea],
        orden: 1,
        activo: true,
      })
      const teo = await crear('personas', {
        nombre_completo: 'Mateo Prado',
        slug: 'mateo-prado',
        rol: 'tesista_maestria',
        cargo_titulo: 'Analista de registros',
        lineas: [linea, humedal],
        orden: 2,
        activo: true,
      })
      await crear('proyectos', {
        titulo: 'Calendario de las copas',
        slug: 'calendario-de-las-copas',
        tipo: 'investigacion',
        estado: 'activo',
        entidad_financiadora: 'Fondo Bosque · demostración',
        periodo_inicio: '2025-03-01',
        resumen:
          'Un calendario abierto conecta las observaciones de las copas con la estación de lluvias.',
        equipo: [lucia, teo],
        lineas: [linea],
      })
      await crear('publicaciones', {
        titulo: 'Un año de floración en la parcela Mirador',
        autores: 'Valle L., Prado M.',
        autores_laboratorio: [lucia, teo],
        anio: 2025,
        revista: 'Cuadernos del Bosque · revista ficticia',
        doi: '10.0000/demo.floracion.1',
        tipo: 'articulo',
        lineas: [linea],
      })
      await crear('patentes', {
        titulo: 'Soporte ajustable para observación del dosel',
        estado: 'en_tramite',
        numero_expediente: 'DEMO-001',
        oficina: 'Oficina de muestra',
        fecha_solicitud: '2025-06-12',
        inventores: [teo],
        resumen:
          'Un soporte portátil permite volver a fotografiar una rama desde el mismo ángulo. Expediente ficticio.',
      })
      await crear('equipamiento', {
        nombre: 'Estación de imágenes del dosel',
        categoria: 'bioinformatica',
        marca_modelo: 'Mirador · prototipo de campo',
        foto: bosque,
        capacidades: parrafo(
          'Puesto de observación para registrar y comparar imágenes de la parcela que se muestra en la fotografía.',
        ),
        disponible_colaboracion: true,
      })
      await crear('noticias', {
        titulo: 'La parcela Mirador abre su calendario de campo',
        slug: 'calendario-de-campo',
        fecha_publicacion: '2025-07-10',
        resumen: 'El equipo comparte sus primeras observaciones de la floración.',
        cuerpo: parrafo(
          'La serie reúne un año de visitas. Los registros se pueden explorar en la ficha del proyecto Calendario de las copas.',
        ),
        imagen_portada: bosque,
        categoria: 'anuncio',
        personas: [lucia],
        lineas: [linea],
        estado: 'publicado',
        _status: 'published',
      })
      for (const [slug, titulo, contenido] of [
        [
          'unete',
          'Únete',
          'Recibimos propuestas de tesis y colaboración. Indica qué línea te interesa y qué te gustaría aportar.',
        ],
        [
          'contacto',
          'Contacto',
          'Escribe al equipo sobre proyectos, visitas o disponibilidad de equipos.',
        ],
        [
          'privacidad',
          'Privacidad y uso de los datos',
          'Esta instalación es una demostración local. Usa datos ficticios. Tu consulta y correo quedan en la bandeja del equipo editorial de esta instalación. Para solicitar su revisión, escribe mediante Contacto.',
        ],
        [
          'laboratorio',
          'El laboratorio',
          'Estudiamos los cambios estacionales del bosque y los humedales. Esta muestra utiliza personas, resultados y expedientes ficticios.',
        ],
      ])
        await crear('paginas', { slug, titulo, cuerpo: parrafo(contenido!), estado: 'publicado' })
      await tx.execute(
        sql`INSERT INTO payload_kv(key,data) VALUES ('demo.contenido.v1','true'::jsonb)`,
      )
    }
    await commitTransaction(req)
  } catch (error) {
    await killTransaction(req)
    throw error
  }
}
