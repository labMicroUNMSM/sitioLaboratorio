import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Laboratorio de Investigación en Ciencias Biológicas · UNMSM FCB',
    template: '%s · Laboratorio FCB',
  },
  description:
    'Sitio institucional del Laboratorio de Investigación en Ciencias Biológicas, Facultad de Ciencias Biológicas, UNMSM.',
}

/**
 * Landmarks obligatorios: <header>, <main id="contenido">, <footer>.
 * El <h1> de cada página va DENTRO de <main>, definido por esa página — este
 * layout nunca imprime un h1 propio (criterio de aceptación de M0).
 *
 * El skip-link es el primer elemento enfocable de la página: le permite a un
 * usuario de teclado saltar la navegación del header e ir directo al
 * contenido.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="es">
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-guinda-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>

        <Header />

        <main id="contenido">{children}</main>

        <Footer />

        {/* Ejemplo de cómo un script inline legítimo recibiría el nonce del
            middleware, en vez de depender de 'unsafe-inline' en el CSP. */}
        {nonce ? <script nonce={nonce} type="application/ld+json" suppressHydrationWarning /> : null}
      </body>
    </html>
  )
}
