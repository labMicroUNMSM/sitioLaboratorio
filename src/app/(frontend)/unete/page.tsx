import { Formulario } from '@/components/Formulario'
export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ resultado?: string; equipo?: string }>
}) {
  const { resultado, equipo } = await searchParams
  return <Formulario tipo="unete" resultado={resultado} equipo={equipo} />
}
