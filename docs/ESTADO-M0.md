# M0 · Integración del panel de Payload

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
después. `lint` sigue saliendo con código 2 en ESLint 9.39.5 y
`@rushstack/eslint-patch`: `Failed to patch ESLint because the calling module was not recognized.`

**Pendientes independientes.** Next 15.5.26 queda fuera del rango declarado por
la UI de Payload 3.90.2. React 19.3.0 satisface su rango. La CSP pública de
desarrollo sigue bloqueando `unsafe-eval`. MFA sigue siendo una casilla sin
TOTP. El diagnóstico encontró el motor Docker Desktop inaccesible. El arranque
con Compose y las cargas reales a MinIO siguen pendientes. La prueba del panel
se hizo con PostgreSQL temporal, sin acceder a los datos habituales.
