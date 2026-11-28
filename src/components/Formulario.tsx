import Link from 'next/link'
import { consultar } from '@/lib/catalogo'
import { recibir } from '@/app/(frontend)/solicitudes'
import { Cuerpo, enlace, h1, marco } from './Catalogo'
export async function Formulario({
  tipo,
  resultado,
  equipo,
}: {
  tipo: 'unete' | 'contacto'
  resultado?: string | undefined
  equipo?: string | undefined
}) {
  const {
    docs: [pagina],
  } = await consultar('paginas', { clave: tipo })
  const campo = 'mt-1 block w-full rounded border border-border bg-white p-3'
  return (
    <article className={marco}>
      <h1 className={h1}>{String(pagina?.titulo || (tipo === 'unete' ? 'Únete' : 'Contacto'))}</h1>
      <Cuerpo valor={pagina?.cuerpo} />
      {resultado === 'recibido' ? (
        <div role="status">
          <p>Recibimos tu mensaje. El equipo editorial puede consultarlo en su bandeja privada.</p>
          <Link className={enlace} href={'/' + tipo}>
            Enviar otro mensaje
          </Link>
        </div>
      ) : (
        <form action={recibir.bind(null, tipo)} className="max-w-content space-y-4">
          {resultado === 'revisar' && (
            <p role="alert">Revisa el correo, el consentimiento y la longitud del mensaje.</p>
          )}
          <label className="block">
            Nombre
            <input
              className={campo}
              required
              minLength={2}
              maxLength={100}
              type="text"
              name="nombre"
              autoComplete="name"
            />
          </label>
          <label className="block">
            Correo de respuesta
            <input
              className={campo}
              required
              maxLength={254}
              type="email"
              name="correo"
              autoComplete="email"
            />
          </label>
          <label className="block">
            {tipo === 'unete' ? 'Cuéntanos en qué te gustaría participar' : 'Mensaje'}
            <textarea
              className={campo}
              name="mensaje"
              required
              minLength={10}
              maxLength={2500}
              rows={5}
              defaultValue={equipo ? 'Consulta sobre ' + equipo.slice(0, 150) + '. ' : ''}
            />
          </label>
          <input type="hidden" name="sitio" value="" />
          <p>
            Usa datos ficticios durante la demostración.{' '}
            <Link className={enlace} href="/paginas/privacidad">
              Aviso de privacidad
            </Link>
          </p>
          <label className="flex items-start gap-2">
            <input type="checkbox" required name="consentimiento" value="si" className="mt-1" />
            Acepto que el equipo lea mis datos para atender este mensaje.
          </label>
          <button className="rounded bg-guinda-700 px-5 py-3 text-white">Enviar mensaje</button>
        </form>
      )}
    </article>
  )
}
