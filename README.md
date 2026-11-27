# Sitio del Laboratorio de Investigación en Ciencias Biológicas (FCB, UNMSM)

Sitio institucional de contenido y credibilidad. **Independiente de los
sistemas de la UNMSM** (ver [ADR-0001](docs/adr/ADR-0001-independencia-de-la-universidad.md)):
base de datos y CMS propios, sin dependencias de APIs universitarias para
mostrar contenido.

## Launcher de Windows con WSL 2

**Uso diario.** Abre el acceso directo **sitioLaboratorio** del escritorio o
`sitioLaboratorio.cmd` en el clon. Elige **1** para abrir la portada, **2**
para abrir Payload, **3** para consultar el estado, **4** para detener el sitio
y **5** para cerrar el menú. Las opciones 1 y 2 arrancan el sitio si hace
falta. La opción 4 conserva el editor y los medios. Puedes cerrar el menú
mientras trabajas en el navegador.

**Primera instalación.** Con Git para Windows, WSL 2 y Docker Desktop
instalados, abre Docker Desktop y habilita la integración con tu distribución
Linux predeterminada. Esta debe tener Python 3 y Git. Desde PowerShell, en la
carpeta de Windows donde quieres guardar el clon, ejecuta:

```powershell
git clone --branch fix/integracion-panel-payload https://github.com/labMicroUNMSM/sitioLaboratorio.git
cd sitioLaboratorio
.\sitioLaboratorio.cmd preparar
```

La preparación crea el acceso directo en el escritorio configurado por Windows
(incluido OneDrive). En una instalación nueva prepara las imágenes, genera
secretos privados y reserva los volúmenes. Entonces puedes abrir el icono y
registrar al primer usuario con la opción 2. Si ya usas `sitio-m0-almacen`,
la misma orden comprueba la instalación y crea el acceso directo, conservando
tu usuario y tus archivos. La portada está en `http://127.0.0.1:3102/` y
el panel en `http://127.0.0.1:3102/admin`.

El menú usa el wrapper de WSL en `~/.local/share/sitiolaboratorio/m0-compose/compose`.
Allí viven el clon de ejecución `repo-final`, `prueba.env` y un ajuste local
de puertos sobre el Compose del repositorio. Conserva ese directorio y los
volúmenes `sitio-m0-almacen_postgres_data` y `sitio-m0-almacen_minio_data`.
Si falta alguno, comprueba que elegiste la distribución WSL y el motor de Docker
originales antes de recuperar tu respaldo. Si el puerto 3102 está ocupado,
cierra el otro servicio y vuelve a elegir 1 o 2. Si moviste el clon de Windows,
ejecuta `.\sitioLaboratorio.cmd preparar` desde su nueva ubicación para
actualizar el acceso directo.

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

### Primer administrador y autenticador

El primer registro crea un editor. Para promoverlo, el operador de la base
ejecuta desde la raíz del clon el siguiente comando de WSL, eligiendo el
wrapper de **su instalación** y sustituyendo el correo. Funciona mientras
todavía no exista ningún administrador. La promoción cierra las sesiones
anteriores y queda registrada en Auditoría.

```bash
~/.local/share/sitiolaboratorio/m0-compose/compose exec -T postgres psql -X -U laboratorio -d laboratorio_db -v correo='correo-del-editor@example.test' < scripts/primer-admin.sql
```

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

El cumplimiento pleno (aviso de privacidad, consentimiento granular, cifrado
de formularios en reposo, derechos ARCO) se construye en M6. M0 solo deja
listo el punto de extensión (`Pagina` genérica, `FIELD_ENCRYPTION_KEY` en
`.env.example`). Esto no es asesoría legal.

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
