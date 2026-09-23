# ADR-0001 — Independencia respecto a los sistemas de la UNMSM

**Estado:** Aceptado
**Fecha:** 2026-09-23
**Módulo:** M0

## Contexto

El sitio representa a un laboratorio dentro de la UNMSM, pero la universidad no
ofrece (ni se le va a pedir) una API estable, versionada y con soporte para que
este proyecto la consuma en producción. Un solo desarrollador no puede absorber
el riesgo de que un cambio en un sistema ajeno tumbe el sitio del laboratorio.

## Decisión

El sitio **no consume ningún API ni sistema de la UNMSM** en tiempo de
ejecución. Tiene base de datos y CMS propios (PostgreSQL + Payload 3). Todo
dato "académico" (publicaciones, patentes) entra por **carga de archivos
validados** (CSV/JSON/BibTeX), nunca por sincronización en vivo con un sistema
universitario.

Sí se permite, como **destino de red declarado y opcional**, consultar
servicios externos que no son de la universidad —ORCID, Crossref, PubMed—
únicamente para *enriquecer* datos en el momento de importar (por ejemplo,
completar metadatos de una publicación a partir de su DOI). Estas consultas:

- ocurren solo durante una importación explícita (M3), nunca en el
  renderizado de una página pública;
- son opcionales — si el servicio externo falla o no responde, la importación
  continúa con los datos provistos en el archivo;
- se registran en la bitácora de auditoría con el resultado (éxito/fallo).

## Consecuencias

- **Se gana:** el sitio sigue funcionando aunque la UNMSM cambie o apague
  cualquier sistema propio; no hay coordinación inter-institucional necesaria
  para desplegar o mantener el sitio; superficie de ataque menor.
- **Se sacrifica:** no hay sincronización automática con sistemas de la
  universidad (por ejemplo, un directorio institucional de personal). Cada
  actualización de datos académicos requiere que alguien suba un archivo. Esto
  es una decisión deliberada, no una limitación técnica temporal.
- Cualquier integración futura con un sistema de la UNMSM requiere un nuevo
  ADR que revierta o acote explícitamente esta decisión, no un cambio de
  código silencioso.
