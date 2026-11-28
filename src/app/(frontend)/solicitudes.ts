'use server'
import { z } from 'zod'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@/payload/payload.config'

const entrada = z.object({
  nombre: z.string().trim().min(2).max(100),
  correo: z.string().trim().email().max(254),
  mensaje: z.string().trim().min(10).max(2500),
  consentimiento: z.literal('si'),
})
export async function recibir(tipo: 'contacto' | 'unete', form: FormData) {
  if (tipo !== 'contacto' && tipo !== 'unete') throw new Error('Formulario desconocido.')
  const datos = entrada.safeParse(Object.fromEntries(form))
  if (!datos.success || form.get('sitio')) redirect('/' + tipo + '?resultado=revisar')
  const { nombre, correo, mensaje } = datos.data
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'solicitudes',
    overrideAccess: true,
    data: { tipo, nombre, correo, mensaje, aviso: 'demo-v1 · consentimiento explícito' },
  })
  redirect('/' + tipo + '?resultado=recibido')
}
