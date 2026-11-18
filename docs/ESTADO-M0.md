# Estado de M0

## Permisos del editor por colección · 18 de noviembre de 2026

Se partió de `4b9b670` y se usó el proyecto Compose `sitio-m0-permisos`,
con PostgreSQL, MinIO, bucket y cuenta ficticia propios en `127.0.0.1:3103`.
Se comprobó el rol con la sesión de Chromium. Las altas y ediciones de contenido
se hicieron con los formularios del panel, seguidas de una recarga y una
consulta del listado. Las denegaciones REST se probaron con la cookie de esa
misma sesión sobre registros existentes.

| Colección | Consultar | Crear | Editar | Borrar físicamente | Operación o evidencia adicional |
|---|---|---|---|---|---|
| Líneas de investigación | Sí | Sí | Sí | 403 | Guardó borrador, publicó, archivó y restauró la versión publicada desde el historial. |
| Personas | Sí | Sí | Sí | 403 | Editó nombre. Una segunda ficha marcada como retirada quedó fuera de la lista y rechazó la edición. |
| Proyectos | Sí | Sí | Sí | 403 | Guardó tipo, estado, financiador y fecha. |
| Publicaciones | Sí | Sí | Sí | 403 | Alta manual con DOI y sin BibTeX. Una ficha con procedencia previa conservó el original y el lote. |
| Patentes | Sí | Sí | Sí | 403 | Guardó expediente, fecha e inventor vinculado a una Persona. |
| Equipamiento | Sí | Sí | Sí | 403 | Seleccionó una imagen existente de Media y guardó la ficha. |
| Noticias | Sí | Sí | Sí | 403 | Guardó borrador, publicó, archivó y restauró la versión publicada desde el historial. |
| Páginas | Sí | Sí | Sí | 403 | Editó el título y pasó de borrador a publicado. |
| Media | Sí | Sí | Sí | 403 | La misma imagen obtuvo 400 sin alt y 201 con alt. Se editaron los créditos y se abrió el WebP después del DELETE denegado. |
| Usuarios | Sí | 403 | 403 | 403 | El editor abrió la ficha de otro usuario de referencia. La cuenta conservó sus valores. |
| Auditoría | 403 | 403 | 403 | 403 | Ausente del menú. La ruta del panel mostró 404. La API denegó lista y ficha. El asiento de control se conservó. |

**Expectativa y decisiones abiertas.** El traspaso pide crear un registro de
cada colección. En la rama, el alta de usuarios corresponde al administrador y
la bitácora está reservada al sistema. Las nueve altas editoriales y esas dos
excepciones quedaron comprobadas. Las reglas actuales permiten al editor cambiar
el estado de Páginas, Líneas y Noticias. En las dos últimas se seleccionó
`estado` y se usó el botón de publicación de Payload. Archivar cambió el
estado editorial; restaurar una versión recuperó el estado anterior. Queda por
decidir si se requiere aprobación de un administrador para esas transiciones,
y qué rol podrá retirar y reincorporar fichas mediante `eliminado_en`. El
desbloqueo de cuentas es otra operación independiente: Payload declara
`unlock: true` al editor y muestra **Force Unlock**. Falta definir su responsable.
La ejecución futura de publicaciones programadas queda sin verificar.

**Fallos reproducidos y correcciones.**

- En la revisión inicial, borrar una Persona ficticia devolvió 200 y su ficha
  pasó a 404. Otra Persona con fecha de baja seguía en el listado del editor.
  Las nueve colecciones editoriales ahora deniegan el borrado físico, filtran
  las fichas retiradas en lectura y edición ordinarias, y reservan la fecha de
  baja al servidor. Media incorpora la misma marca. Después del cambio, las
  nueve peticiones DELETE dieron 403 y las nueve fichas coincidieron con su
  contenido previo.
- El editor pudo crear manualmente un asiento de auditoría (201), aunque la
  colección reserva esa escritura a los hooks del sistema. El alta manual
  ahora devuelve 403. Sigue pendiente el refuerzo de la bitácora a nivel de BD
  que menciona el traspaso.
- Al guardar una Publicación manual, el panel mostraba `The following field is
  invalid: Bibtex_raw` y el campo estaba bloqueado. La API también aceptaba
  cambios en la procedencia. Ahora el alta manual admite procedencia nula,
  un lote de importación requiere su original y el editor no puede escribir
  el BibTeX ni el lote. La migración conserva los valores anteriores. Para
  revertirla hay que resolver antes los registros manuales con BibTeX nulo
  y los medios con baja lógica.

La evidencia anterior de Páginas acreditaba el alta y la recuperación del texto
Lexical tras recargar. La de Media acreditaba alt obligatorio, alta, lectura y
persistencia del objeto tras recrear contenedores. Esta ronda comprobó también
la edición de fichas existentes y el rechazo del borrado por API. Pasaron la
instalación con lockfile congelado, typecheck, lint, las 12 pruebas y el build.
El staging público, MFA, compatibilidad Next/Payload y CSP de desarrollo
siguen pendientes.

## Launcher de Windows y WSL 2 · 18 de noviembre de 2026

El acceso directo del escritorio abre `sitioLaboratorio.cmd`. En la instalación
existente se comprobó el wrapper privado, su proyecto `sitio-m0-almacen` y
los volúmenes etiquetados de PostgreSQL y MinIO. Desde `cmd.exe`, dos inicios
consecutivos abrieron la portada y conservaron el mismo contenedor. El menú
mostró los tres servicios activos, los detuvo y mostró los tres detenidos.
Un proceso de prueba ocupó 3102 durante la parada y el launcher avisó del
conflicto. Al liberarlo, **Abrir panel** arrancó el sitio. El puerto 3101
respondió también durante la parada.

En una sesión nueva de Google Chrome 157 en Windows el editor existente
inició sesión y abrió Media 1. El campo conservó «Tres bandas verticales de
color guinda, oro y azul.» y el navegador decodificó el WebP de 900 × 450.
Su SHA-256 coincidió con el registrado en la prueba de Compose. Se comprobó
el destino del acceso directo de OneDrive. Queda la prueba personal del doble
clic en el escritorio.

Desde un clon de Windows en una ruta con espacios se probó el menú. Para
ensayar una primera instalación en el mismo equipo se cambiaron únicamente
el directorio privado, el nombre del proyecto y el puerto (3112) en la copia
de prueba. La preparación construyó las imágenes, creó volúmenes propios y
permitió abrir el formulario inicial. Se repitió la preparación con éxito.
Al retirar el archivo de configuración o el volumen de PostgreSQL de ese
entorno, el launcher indicó qué faltaba. Tanto el inicio como la preparación
rehusaron reemplazar el volumen perdido. El motor inaccesible se simuló con
un socket inexistente y se comprobó el mensaje sobre Docker Desktop.

De los cinco criterios de M0, siguen pendientes el staging público y completar
las operaciones del editor por colección según sus permisos. Se han probado
Páginas y Media, incluido el rechazo de una imagen sin texto alternativo.
La auditoría automatizada cubre la portada. También siguen abiertos el MFA
real del administrador, la compatibilidad Next/Payload y la CSP de desarrollo.

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
