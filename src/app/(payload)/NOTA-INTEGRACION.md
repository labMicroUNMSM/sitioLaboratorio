# Punto de integración pendiente: rutas de Payload en Next.js

Payload 3 se monta dentro de Next.js mediante un route handler para el panel
de admin (`/admin/[[...segments]]`) y otro para la API REST/GraphQL
(`/api/[...slug]`). La forma exacta de estos archivos depende de la versión
instalada de `payload` y cambia entre releases menores.

En vez de copiar aquí un boilerplate que podría no coincidir con la versión
que termines instalando (riesgo real: romper el arranque en una máquina
limpia, que es justo el criterio de aceptación de M0), este paso se hace así:

1. Confirmar la versión de Payload 3 a instalar.
2. Generar el andamiaje oficial con `npx create-payload-app@latest` en un
   directorio temporal, o seguir la guía "Next.js App Router" de la
   documentación oficial de Payload para esa versión exacta.
3. Copiar únicamente los route handlers generados (no el resto del
   scaffolding, que ya lo tenemos con nuestras convenciones) a:
   - `src/app/(payload)/admin/[[...segments]]/page.tsx`
   - `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
   - `src/app/(payload)/api/[...slug]/route.ts`
   - `src/app/(payload)/api/graphql/route.ts` (si se usa GraphQL; el kit no
     lo requiere, se puede omitir)
4. Verificar que esos handlers importen `payload.config.ts` desde
   `src/payload/payload.config.ts` (no la ruta por defecto que genera el
   comando).

Esto es explícitamente parte de M0.3, no un detalle menor: sin esto, el
panel de administración no existe y el criterio de aceptación "un editor
inicia sesión, crea un registro de cada colección" no se puede verificar.
