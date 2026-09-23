# Sitio del Laboratorio de Investigación en Ciencias Biológicas (FCB, UNMSM)

Sitio institucional de contenido y credibilidad. **Independiente de los
sistemas de la UNMSM** (ver [ADR-0001](docs/adr/ADR-0001-independencia-de-la-universidad.md)):
base de datos y CMS propios, sin dependencias de APIs universitarias para
mostrar contenido.

## Arranque local (≤3 comandos)

Requisitos: Docker y Docker Compose. Node solo hace falta si vas a desarrollar
fuera del contenedor (ver más abajo).

```bash
cp .env.example .env      # 1. completar PAYLOAD_SECRET, FIELD_ENCRYPTION_KEY, etc.
docker compose up --build # 2. levanta app + PostgreSQL + MinIO
```

Con eso, la app queda arriba en `http://localhost:3000` y el panel de admin en
`http://localhost:3000/admin` (una vez wireado el punto de integración
descrito en `src/app/(payload)/NOTA-INTEGRACION.md`, ver estado más abajo).

Para desarrollo activo con recarga en caliente (fuera de Docker, apuntando a
la Postgres del compose):

```bash
pnpm install
pnpm dev                  # 3. requiere DATABASE_URI apuntando a localhost:5432
```

## Stack (ver ADR-0002)

Next.js (App Router) + TypeScript strict + Tailwind, Payload 3 embebido,
PostgreSQL única, Zod como validación compartida, Docker Compose + Cloudflare
para despliegue. Ver `docs/adr/` para qué se descartó y por qué.

## Sistema de diseño

Los tokens viven en un solo archivo: `src/styles/tokens.css`. Tailwind los
referencia por variable (`tailwind.config.ts`), nunca se duplica un hex fuera
de ese archivo. Paleta y razonamiento de contraste en
[ADR-0003](docs/adr/ADR-0003-identidad-visual-provisional.md) — es
**provisional** hasta que Imagen Institucional de la FCB entregue un manual
de identidad; cambiarla después cuesta editar un archivo, no una migración.

| Token | Uso |
|---|---|
| `--color-guinda-700` | Texto de énfasis, enlaces, header, botones primarios |
| `--color-oro-700` / `--color-oro-200` | Acentos decorativos y bordes — nunca texto pequeño (falla AA) |
| `--color-azul-700` | Tercer acento, para distinguir categorías/estados |
| `--color-ink` / `--color-ink-muted` | Texto principal / secundario |
| `--color-bg` | Fondo de página |

## Modelo de datos

7 colecciones de contenido (`LineaInvestigacion`, `Persona`, `Proyecto`,
`Publicacion`, `Patente`, `Equipamiento`, `Noticia`) + `Pagina` (genérica,
para textos estáticos como aviso de privacidad) + infraestructura (`Media`,
`Usuario`, `Auditoria`). Definiciones Payload en `src/payload/collections/`,
esquemas Zod espejo en `src/lib/validation/`.

Localización ES/EN **habilitada desde M0** en todos los campos de texto
marcados como localizables, aunque el contenido en inglés se cargue después
(decisión confirmada, Parte E-1 del kit de arranque).

Taxonomías semilla (líneas de investigación, roles de persona, categorías de
equipamiento) en `src/lib/taxonomias.ts` — son datos editables desde el
panel, no están hardcodeadas en el esquema salvo donde afectan permisos
(roles) o validación (categorías).

## Seguridad y accesibilidad de origen

- CSP con nonce por request + HSTS + demás cabeceras en `src/middleware.ts`.
- Foco visible global en `src/styles/globals.css` (no depende de que cada
  componente lo implemente).
- Un solo `<h1>` por página: el layout raíz nunca imprime uno, cada página lo
  define en su `<main>`.
- `pa11y-ci` corre en CI contra cada URL pública nueva (`.pa11yci.json`) —
  actualízalo a medida que M1, M2... entreguen páginas reales.
- MFA obligatorio para el rol `admin` (`src/payload/collections/Usuario.ts`).
- `alt` obligatorio en `Media`: el panel no permite guardar sin él.

## Legal (Perú, Ley 29733)

El cumplimiento pleno (aviso de privacidad, consentimiento granular, cifrado
de formularios en reposo, derechos ARCO) se construye en M6. M0 solo deja
listo el punto de extensión (`Pagina` genérica, `FIELD_ENCRYPTION_KEY` en
`.env.example`). Esto no es asesoría legal.

## Estado de M0

| Sub-tarea | Estado |
|---|---|
| M0.1 Repositorio + tooling + ADR-0001/0002 | Hecho |
| M0.2 Docker Compose, arranque ≤3 comandos | Hecho |
| M0.3 Payload 3 + Postgres + localización | Config lista; **falta wirear rutas de admin/API** (ver nota abajo) |
| M0.4 7 colecciones + infraestructura + Zod | Hecho |
| M0.5 Roles y permisos + MFA admin | Reglas definidas; **falta confirmar mecanismo TOTP real de la versión instalada** |
| M0.6 Tokens + primitivos + Header/Footer | Hecho (primitivos de UI aún no extraídos como librería de componentes) |
| M0.7 Cabeceras de seguridad + accesibilidad de origen | Hecho; pendiente correr `pa11y-ci` contra un build real |
| M0.8 CI + staging público | CI listo (`.github/workflows/ci.yml`); **falta el destino de staging real** |
| M0.9 README + ADRs | Este archivo + ADR-0001/0002/0003 |

### Antes de dar M0 por cerrado, faltan 3 cosas concretas
1. **Wirear las rutas de Payload** en `src/app/(payload)/` — ver
   `NOTA-INTEGRACION.md` en esa carpeta. Sin esto no hay panel de admin.
2. **Confirmar MFA real**: verificar si la versión de Payload 3 instalada trae
   TOTP nativo o si hace falta un plugin — el hook en `Usuario.ts` ya bloquea
   guardar un admin sin `mfa_habilitado`, pero eso es la regla de negocio, no
   el mecanismo de verificación en sí.
3. **Correr `pnpm install`** una vez y fijar el lockfile real (`pnpm-lock.yaml`)
   — las versiones en `package.json` son un punto de partida razonable, no
   verificadas contra el registro de npm al momento de generarse este
   andamiaje; revísalas contra las últimas releases estables antes de instalar
   en serio.

## Convenciones

- Commits: [Conventional Commits](https://www.conventionalcommits.org/), verificado por commitlint en cada commit.
- Borrado lógico universal (`eliminado_en`), `timestamptz` en UTC, slugs únicos e indexados — ver `src/lib/validation/common.ts`.
- Todo requerimiento nuevo debe llegar con un criterio de aceptación medible (ver Parte C del kit de arranque de módulos).
