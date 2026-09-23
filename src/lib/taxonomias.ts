/**
 * Taxonomías iniciales (Parte E, punto 5 del kit de arranque).
 *
 * Las líneas de investigación son datos reales (se cargan como registros de
 * LineaInvestigacion vía el panel, no un enum de código) — esta lista es la
 * semilla sugerida, tomada de las líneas que el propio kit menciona en la
 * ficha de M2. Un editor puede agregar o renombrar líneas después sin tocar
 * código: es contenido, no esquema.
 *
 * Los roles de Persona SÍ son un enum (afectan permisos y agrupación de UI),
 * ya estaban fijados en el modelo de datos del kit; se listan aquí para que
 * Payload, Zod y los componentes de filtro compartan una sola fuente.
 */

export const LINEAS_INVESTIGACION_SEED = [
  {
    slug: 'chagas-trypanosoma-cruzi',
    titulo_es: 'Enfermedad de Chagas y Trypanosoma cruzi',
    titulo_en: "Chagas disease and Trypanosoma cruzi",
  },
  {
    slug: 'leishmaniasis',
    titulo_es: 'Leishmaniasis y parásitos tropicales',
    titulo_en: 'Leishmaniasis and tropical parasites',
  },
  {
    slug: 'bioinformatica',
    titulo_es: 'Bioinformática y biología computacional',
    titulo_en: 'Bioinformatics and computational biology',
  },
  {
    slug: 'transcriptomica',
    titulo_es: 'Transcriptómica y expresión génica',
    titulo_en: 'Transcriptomics and gene expression',
  },
  {
    slug: 'proteomica',
    titulo_es: 'Proteómica y biología estructural',
    titulo_en: 'Proteomics and structural biology',
  },
] as const

export type LineaInvestigacionSlug = (typeof LINEAS_INVESTIGACION_SEED)[number]['slug']

export const ROLES_PERSONA = [
  'investigador_principal',
  'responsable_tecnico',
  'postdoc',
  'colaborador_internacional',
  'tesista_pregrado',
  'tesista_maestria',
  'tesista_doctorado',
  'alumni',
] as const

export type RolPersona = (typeof ROLES_PERSONA)[number]

export const ROLES_PERSONA_LABEL: Record<RolPersona, { es: string; en: string }> = {
  investigador_principal: { es: 'Investigador principal', en: 'Principal investigator' },
  responsable_tecnico: { es: 'Responsable técnico', en: 'Technical lead' },
  postdoc: { es: 'Investigador postdoctoral', en: 'Postdoctoral researcher' },
  colaborador_internacional: { es: 'Colaborador internacional', en: 'International collaborator' },
  tesista_pregrado: { es: 'Tesista de pregrado', en: 'Undergraduate thesis student' },
  tesista_maestria: { es: 'Tesista de maestría', en: "Master's thesis student" },
  tesista_doctorado: { es: 'Tesista de doctorado', en: 'PhD thesis student' },
  alumni: { es: 'Alumni', en: 'Alumni' },
}

export const CATEGORIAS_EQUIPAMIENTO = [
  'biologia_molecular',
  'cultivo_celular',
  'bioinformatica',
  'microscopia',
  'analisis_bioquimico',
] as const

export type CategoriaEquipamiento = (typeof CATEGORIAS_EQUIPAMIENTO)[number]
