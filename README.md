# Sitio del Laboratorio de Investigación en Ciencias Biológicas (FCB, UNMSM)

Sitio institucional de contenido y credibilidad. **Independiente de los
sistemas de la UNMSM** (ver [ADR-0001](docs/adr/ADR-0001-independencia-de-la-universidad.md)):
base de datos y CMS propios, sin dependencias de APIs universitarias para
mostrar contenido.

## Instalar en otra PC Windows

La [versión demo Windows 1](https://github.com/labMicroUNMSM/sitioLaboratorio/tree/demo-windows-1) incluye el código, el contenido ficticio y dos imágenes. La primera preparación carga registros editables en PostgreSQL y sube los archivos, sus variantes y sus descripciones a MinIO. Tú creas la primera cuenta.

Necesitas Windows con WSL 2, una distribución Linux predeterminada con Python 3.9 o posterior, Docker Desktop en modo Linux con integración WSL y Compose 2.24.4 o posterior. Abre Docker Desktop. Comprueba `wsl -l -v` si no aparece tu distribución con versión 2. Para instalar Ubuntu por primera vez usa `wsl --install -d Ubuntu`, reinicia y completa su primer inicio. La construcción inicial necesita Internet, espacio para las imágenes y varios minutos.

Con Git para Windows, copia en PowerShell:

```powershell
git clone --depth 1 --branch demo-windows-1 https://github.com/labMicroUNMSM/sitioLaboratorio.git "Laboratorio demo"
cd "Laboratorio demo"
.\sitioLaboratorio.cmd preparar
.\sitioLaboratorio.cmd iniciar
```

También puedes usar el [ZIP de la versión](https://github.com/labMicroUNMSM/sitioLaboratorio/archive/refs/tags/demo-windows-1.zip). En una carpeta donde aún no exista esa descarga:

```powershell
Invoke-WebRequest 'https://github.com/labMicroUNMSM/sitioLaboratorio/archive/refs/tags/demo-windows-1.zip' -OutFile laboratorio.zip
Unblock-File -LiteralPath laboratorio.zip
Expand-Archive -LiteralPath laboratorio.zip -DestinationPath 'Laboratorio demo'
cd 'Laboratorio demo\sitioLaboratorio-demo-windows-1'
.\sitioLaboratorio.cmd preparar
.\sitioLaboratorio.cmd iniciar
```

Abre **sitioLaboratorio demo 3107** en el escritorio para usar el menú. La portada está en http://127.0.0.1:3107/ y el panel en http://127.0.0.1:3107/admin. Si el puerto está ocupado en una instalación nueva, ejecuta `$env:SITIO_PUERTO='3110'` (o elige otro libre) antes de **preparar**. El launcher recuerda el puerto de esa carpeta. Conserva la carpeta en su ubicación. Otra copia o ruta identifica una instalación independiente. Si mueves una instalación con datos, devuelve la carpeta a su ubicación original antes de volver a preparar.

| Comando de uso diario | Resultado |
|---|---|
| `.\sitioLaboratorio.cmd iniciar` | Arranca los servicios, comprueba que Equipo responde y abre la portada. |
| `.\sitioLaboratorio.cmd panel` | Abre Payload. En el primer registro elige tu nombre, correo y contraseña. El rol inicial es editor. |
| `.\sitioLaboratorio.cmd estado` | Muestra el estado de la app, PostgreSQL y MinIO y la URL de esta copia. |
| `.\sitioLaboratorio.cmd detener` | Detiene los contenedores. Los volúmenes conservan las fichas, las cuentas y los archivos. |
| `.\sitioLaboratorio.cmd preparar` | Construye esta copia, prepara contenido una sola vez y actualiza su acceso directo. |

El acceso directo anterior de M0 sigue controlando el puerto 3102. Cada acceso nuevo lleva el puerto de su demo en el nombre.

Para editar basta la cuenta de editor. Para administrar cuentas, el operador local puede ejecutar `.\sitioLaboratorio.cmd primer-admin` con el sitio encendido. Introduce el correo del editor ya registrado. En el siguiente ingreso, escanea el QR con tu autenticador y confirma el código. Guarda las claves de la instalación en un respaldo privado. Cada copia usa su propio directorio `~/.local/share/sitiolaboratorio/demo-…` en WSL y sus propios volúmenes. El ZIP y Git incluyen únicamente el material inicial.

**Recorrido.** Abre una línea y sigue sus enlaces al proyecto y al artículo. En Equipo abre a Lucía Valle. En Payload cambia su cargo en **Personas**, guarda y recarga la ficha pública. Prueba Únete o Contacto con datos ficticios y lee el mensaje en **Solicitudes** del panel. La bandeja es local y está disponible para el equipo editorial. Para ver las acciones avanzadas pendientes y las decisiones de nube, consulta la [ficha de entrega](docs/ENTREGA-DEMO.md).

## Arranque directo con Docker Compose

Requisitos: Docker y Docker Compose. Node solo hace falta si vas a desarrollar
fuera del contenedor (ver más abajo).

```bash
cp .env.example .env      # 1. completar PAYLOAD_SECRET, FIELD_ENCRYPTION_KEY, etc.
docker compose up --build # 2. levanta app + PostgreSQL + MinIO
```

La portada abre en `http://localhost:3000` y Payload en `http://localhost:3000/admin`.
Con volúmenes nuevos, Compose crea el bucket indicado por `S3_BUCKET` y
Payload aplica la migración inicial al abrir el panel. La plantilla habilita
esto con `PAYLOAD_RUN_MIGRATIONS=true`. Para una base anterior creada mediante
`push` de desarrollo, revisa el esquema y su historial antes de activar esa opción.
`docker compose down` conserva los volúmenes para el siguiente arranque.

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
`Usuario`, `Auditoria`) y la bandeja privada `Solicitudes`. Definiciones Payload en `src/payload/collections/`,
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

### Primer administrador y autenticador

El primer registro crea un editor. En la distribución para Windows, el operador ejecuta
`.\sitioLaboratorio.cmd primer-admin` desde la carpeta preparada. La promoción revoca
las sesiones anteriores y queda registrada en Auditoría. El procedimiento SQL está en
`scripts/primer-admin.sql` para instalaciones administradas directamente.

Al entrar en `/admin`, el administrador introduce su contraseña, escanea el QR
en una app autenticadora y confirma el primer código. También puede introducir
la clave manualmente. En ingresos posteriores introduce el código vigente de
seis dígitos. Cada código sirve una vez. Los siguientes administradores se
crean o promueven en Usuarios desde una sesión administrativa confirmada.

El operador debe conservar la `FIELD_ENCRYPTION_KEY` de esa instalación junto
con su respaldo seguro de la base. La clave consta de 32 bytes aleatorios en
hexadecimal. Cambiarla sin recifrar las credenciales impide validar los
autenticadores vinculados. Sigue pendiente acordar el procedimiento de
recuperación por pérdida del dispositivo.

## Legal (Perú, Ley 29733)

La demostración solicita consentimiento y almacena los mensajes cifrados. Usa
datos ficticios. El laboratorio debe validar la finalidad, los plazos de conservación,
los destinatarios y el procedimiento de derechos ARCO antes de recibir datos reales.

## Líneas de investigación

El listado público está en `/lineas-investigacion`. Cada ficha reúne el resumen
divulgativo, el detalle técnico y los participantes y trabajos relacionados.
La vista previa local y las pruebas están en [Estado de M2](docs/ESTADO-M2.md).

## Equipo

La primera sección pública está en `/equipo`. Las fichas se editan en
**Personas** del panel de Payload. La vista previa y sus comprobaciones están
en [Estado de M1](docs/ESTADO-M1.md).

## Estado de M0

Las pruebas en navegador, Compose y GitHub Actions se registran en
[Estado de M0](docs/ESTADO-M0.md).

| Sub-tarea | Estado |
|---|---|
| M0.1 Repositorio + tooling + ADR-0001/0002 | Hecho |
| M0.2 Docker Compose, arranque ≤3 comandos | Hecho |
| M0.3 Payload 3 + Postgres + localización | Panel y API integrados. Migración inicial probada en una base nueva. |
| M0.4 7 colecciones + infraestructura + Zod | Hecho |
| M0.5 Roles y permisos + MFA admin | Matriz de editor verificada. Administradores con contraseña y TOTP. Recuperación del dispositivo por definir. |
| M0.6 Tokens + primitivos + Header/Footer | Hecho (primitivos de UI aún no extraídos como librería de componentes) |
| M0.7 Cabeceras de seguridad + accesibilidad de origen | La portada pasa pa11y-ci en producción. Sigue pendiente revisar la CSP de desarrollo. |
| M0.8 CI + staging público | CI verificado en el PR. Falta el staging público. |
| M0.9 README + ADRs | Este archivo + ADR-0001/0002/0003 |

Las decisiones de permisos pendientes y la compatibilidad de Next con el rango
declarado por la UI de Payload se detallan en el estado de M0.

## Convenciones

- Commits: [Conventional Commits](https://www.conventionalcommits.org/), verificado por commitlint en cada commit.
- Borrado lógico universal (`eliminado_en`), `timestamptz` en UTC, slugs únicos e indexados — ver `src/lib/validation/common.ts`.
- Todo requerimiento nuevo debe llegar con un criterio de aceptación medible (ver Parte C del kit de arranque de módulos).
