import config from '@/payload/payload.config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
// @ts-expect-error - Payload genera este archivo dinámicamente sin tipos
import { importMap } from '../importMap.js'

type Args = {
// ... resto de tu código
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams })

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config, importMap, params, searchParams })
}