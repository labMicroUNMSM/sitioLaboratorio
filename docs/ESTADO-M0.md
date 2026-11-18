# Estado de M0

## GitHub Actions y almacenamiento en Compose · 18 de noviembre de 2026

El [PR en borrador hacia main](https://github.com/labMicroUNMSM/sitioLaboratorio/pull/1)
activó el workflow. En `febccfa` pasaron pnpm, tipos, lint, test y build. La
auditoría falló con `No usable sandbox!` al iniciar el Chromium incluido con
Puppeteer. Con el Chrome instalado en el runner, axe señaló dos
`aria-allowed-attr` en los marcadores del encabezado. Al añadirles `role="img"`,
pasó la auditoría de la portada con axe y HTML CodeSniffer. La suite de Vitest
sigue teniendo una prueba. [Ejecución sobre el encabezado corregido](https://github.com/labMicroUNMSM/sitioLaboratorio/actions/runs/44345418550).

Docker Desktop 4.99.0 respondió desde WSL con Engine 29.9.3 y Compose 5.7.0.
El primer build del clon limpio falló en `COPY` con `"/app/public": not found`.
El registro de Quay respondió `401 UNAUTHORIZED` al pedir MinIO. El Dockerfile
prepara el directorio público y Compose compila el servidor y el cliente desde
versiones fijas de MinIO. Un servicio de inicialización crea el bucket privado
de forma idempotente. [Distribución oficial de MinIO](https://github.com/minio/minio/releases/tag/RELEASE.2025-10-15T17-29-55Z).

Con PostgreSQL vacío, la API devolvió `relation "media" does not exist`.
Se generó la migración inicial con Payload 3.90.2. El standalone la ejecuta
en producción cuando se configura `PAYLOAD_RUN_MIGRATIONS=true`. Se probó en
PostgreSQL 16.16, en el proyecto aislado `sitio-m0-almacen`. Solo la app
publica puerto en el host, en `127.0.0.1:3102`.

En Chromium, un editor temporal intentó guardar un PNG de 900 × 450 sin texto
alternativo. El panel mostró la validación, la API devolvió 400 y Media siguió
con cero registros. Con el texto alternativo, el mismo archivo obtuvo 201.
La ficha 1 mostró `m0-bandas.webp`. El navegador decodificó el original y su
SHA-256 coincidió con el objeto leído directamente del bucket `m0-medios`.
MinIO también contenía las variantes de 400 y 800 px.

Se construyeron las imágenes desde otro clon limpio de `c565a23`. Tras
`down` y `up -d --wait`, los tres contenedores tenían identificadores nuevos.
En una sesión nueva de Chromium, el mismo editor inició sesión y abrió la
ficha 1, su texto alternativo y el original de 900 × 450. El SHA-256 del
WebP seguía siendo `cffbd6d8074f1cc204bfac730579a0a5a7054b6fd69d0bc9493a8c6c722a9dbb`.
Desde Windows respondieron ambas portadas (3101 y 3102) y el WebP (200,
986 bytes). Pasaron instalación congelada, tipos, lint, test, build y auditoría
en [Actions sobre el código probado](https://github.com/labMicroUNMSM/sitioLaboratorio/actions/runs/44347255963).

En la máquina de prueba, desde WSL:

```bash
cd ~/.local/share/sitiolaboratorio/m0-compose
./compose ps
./compose down
./compose up -d --wait
```

El directorio privado conserva la configuración y los datos de acceso del
editor en `editor.txt`. Los datos de PostgreSQL y MinIO residen en los volúmenes
`sitio-m0-almacen_postgres_data` y `sitio-m0-almacen_minio_data`.

## Navegación y controles locales · 18 de noviembre de 2026

El encabezado conserva el enlace a Inicio y los marcadores institucionales. En el
standalone, Chromium comprobó a 390 y 1280 px que el salto al contenido y el
enlace a Inicio reciben foco con Tab. Inicio abre la portada (200). Hubo cero
peticiones a las cuatro secciones pendientes y cero respuestas HTTP de error al
cargar la portada. En una base aislada, `/admin` mostró el formulario inicial.
Cada sección volverá al menú cuando su ruta pública esté disponible.

En un clon limpio, con Node 22.22.2 y pnpm 9.12.0, pasaron la instalación con
`--frozen-lockfile`, `typecheck`, `lint` (0 errores y 0 advertencias), `test`
(una prueba) y `build`. ESLint rechazó un `any` explícito y un `@ts-ignore` sin
justificación en una prueba de control. `FlatCompat` carga el preset de Next 15
en ESLint 9 mediante `@eslint/eslintrc` 3.3.7, ya presente en el lockfile.

El [run de GitHub sobre main](https://github.com/labMicroUNMSM/sitioLaboratorio/actions/runs/36085276049)
falló por declarar dos versiones de pnpm. El workflow local ahora toma la versión
de `packageManager`. Su ejecución en GitHub queda pendiente de publicación.
Next 15.5.26 sigue fuera del rango de la UI de Payload 3.90.2.

Compose validó el modelo con `config --quiet` en una copia limpia. Docker Desktop
no respondió en el pipe del motor Linux. El build local tampoco produjo el
directorio `public/` que el Dockerfile intenta copiar. Quedan pendientes el
build de la imagen, el arranque completo y una carga real a MinIO.

## Integración del panel · 17 de noviembre de 2026

Prueba del 17 de noviembre de 2026 sobre la base `50e5c8b`. Se usaron Node
22.22.2, pnpm 9.12.0, el lockfile del repositorio y PostgreSQL 16.15 temporal
con socket privado. Para producción se preparó una copia del esquema de
desarrollo con cero usuarios y se ejecutó el build standalone con sus recursos
estáticos. El flujo de usuarios se probó en Chromium con Playwright.

| Comprobación | Antes | Después, en desarrollo y producción |
|---|---|---|
| Portada | HTTP 200 con cabecera, contenido y pie | El HTML de los landmarks, el enlace de salto, idioma y metadatos coinciden. Las capturas antes/después son idénticas a 390 × 900 y 1280 × 900. |
| Consola pública | CSP bloquea la evaluación de JavaScript de desarrollo. En producción, la precarga de cuatro rutas públicas pendientes devuelve 404. | Se reproducen los mismos mensajes. En producción no se observó un error de hidratación. |
| Alta inicial | La vista de alta devolvía 500 al leer el contexto de configuración. | Desde `/admin` apareció el formulario. Se completó en navegador y se abrió el panel. |
| Login y salida | Con usuario existente, el login también fallaba al renderizar en el diagnóstico. El flujo de sesión estaba bloqueado. | En un contexto de navegador nuevo, el editor entró al panel, abrió el menú, cerró sesión y volvió a entrar. La sesión confirmó rol `editor` y `mfa_habilitado: false`. |
| Lexical | Inaccesible desde el login. El mapa versionado estaba vacío. | En Páginas se creó un registro, se escribió en el campo enriquecido y se guardó (201). Al recargar la ficha, el editor mostró el mismo texto. |

El layout de Payload proporciona el contexto y las funciones de servidor. El
mapa generado desde la configuración del proyecto contiene 25 entradas. El
error de contexto desapareció de las vistas probadas. La secuencia comprobada
para regenerar el mapa está en la [nota de integración](../src/app/%28payload%29/NOTA-INTEGRACION.md).

`typecheck`, `test` (una prueba de inicialización) y `build` pasaron antes y
después. En aquella revisión, `lint` salió con código 2 en ESLint 9.39.5 y
`@rushstack/eslint-patch`: `Failed to patch ESLint because the calling module was not recognized.`

**Pendientes independientes.** Next 15.5.26 queda fuera del rango declarado por
la UI de Payload 3.90.2. React 19.3.0 satisface su rango. La CSP pública de
desarrollo sigue bloqueando `unsafe-eval`. MFA sigue siendo una casilla sin
TOTP. El diagnóstico encontró el motor Docker Desktop inaccesible. El arranque
con Compose y las cargas reales a MinIO siguen pendientes. La prueba del panel
se hizo con PostgreSQL temporal, sin acceder a los datos habituales.
