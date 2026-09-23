# ADR-0002 — Stack unificado en una sola app

**Estado:** Aceptado
**Fecha:** 2026-09-23
**Módulo:** M0

## Contexto

El proyecto lo mantiene un único desarrollador, por tiempo indefinido, sin
equipo de infraestructura detrás. El producto es un sitio de contenido y
credibilidad (no transaccional, sin picos de tráfico impredecibles, sin
necesidad de escalado horizontal). El principal riesgo del proyecto no es de
escala, es de **carga operativa sobre una sola persona**.

## Decisión

Una sola aplicación Next.js (App Router) + TypeScript strict + Tailwind, con
Payload 3 **embebido** en la misma app (no como servicio separado), una única
base de datos PostgreSQL, y despliegue con Docker Compose sobre un VPS detrás
de Cloudflare.

Se descartan explícitamente para v1: NestJS separado, Redis/colas, PgBouncer,
réplica de lectura, Kubernetes/HPA, Meilisearch (se usa full-text de
Postgres), OpenTelemetry, KMS por registro.

## Consecuencias

- **Se gana:** un solo repositorio, un solo proceso de build, un solo target
  de despliegue, una sola base de datos que respaldar. El desarrollador puede
  entender el sistema completo. `docker compose up` reproduce todo el entorno
  en una máquina limpia.
- **Se sacrifica:** techo de escalado horizontal más bajo (aceptable: el
  producto no lo necesita), sin aislamiento fuerte entre CMS y frontend
  (aceptable: es un solo equipo de desarrollo), sin motor de búsqueda
  dedicado (aceptable en v1: el volumen de contenido es bajo; Postgres
  full-text cubre el caso de uso de M7).
- Cada elemento descartado se reintroduce **solo** cuando un requisito real
  (no una preferencia de arquitectura) lo exija, y esa reintroducción debe
  documentarse en un nuevo ADR que explique qué gatilló el cambio.
