import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload/payload.config'
import { Login } from './Login'

export const metadata = { title: 'Iniciar sesión · sitioLaboratorio' }

export default async function Page() {
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  if ((await payload.auth({ headers: requestHeaders })).user) redirect('/admin')
  if (!(await payload.count({ collection: 'usuarios', overrideAccess: true })).totalDocs) {
    redirect('/admin/create-first-user')
  }
  return <Login />
}
