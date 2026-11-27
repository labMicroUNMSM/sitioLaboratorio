# M1 · Equipo

La vista previa local parte de `fc235f8`. El enlace **Equipo** de la cabecera
abre `/equipo`. Payload consulta Personas como visitante en cada petición,
ordena por `orden` ascendente y desempata por nombre e ID. Las tarjetas
muestran nombre, rol en español, cargo cuando existe y foto de Media o
iniciales. El correo está restringido al equipo editorial también en la API.

| Prueba en producción standalone | Resultado observado |
|---|---|
| Portada → Equipo con teclado y recarga directa | En Chromium, a 390 px las tarjetas ocuparon una columna y a 1280 px, tres. No hubo desbordamiento horizontal. Se cargó la miniatura de Media de 400 px y las otras dos fichas mostraron iniciales. |
| Cambio editorial | Un editor cambió el cargo de Lucía Paredes desde el formulario de Payload. Una ventana de visitante mostró el nuevo cargo al recargar, con la misma compilación. |
| Visibilidad y privacidad | Al desactivar una ficha quedaron dos tarjetas. Una ficha activa con marca de retirada también quedó excluida. El correo y el perfil externo de control quedaron fuera de la respuesta de la página. La API omitió el correo para el visitante y lo devolvió al editor. |
| Vacío y fallo de conexión | Con cero fichas visibles, el directorio respondió HTTP 200 y mostró el mensaje de vacío. Al detener el PostgreSQL de prueba respondió HTTP 500 y mostró el mensaje de error. Se restauraron la base y las tres fichas activas. |
| Accesibilidad y controles | La portada y el directorio con integrantes pasaron pa11y-ci (axe y HTML CodeSniffer) con cero errores. Instalación congelada, typecheck, lint, 19 pruebas de Vitest y build de producción pasaron. |

La instancia `sitio-m1-equipo` usa `127.0.0.1:3105`, volúmenes de PostgreSQL
y MinIO propios y datos ficticios, incluido el retrato. En PowerShell,
`wsl.exe sh -lc 'cat ~/.local/share/sitiolaboratorio/m1-equipo/credenciales-editor.txt'`
muestra el correo y la contraseña locales. En Payload, abre **Personas**,
elige una ficha y guarda un cambio en **Cargo**. Recarga `/equipo` desde
una ventana de visitante. El primer lanzamiento público sigue previsto para M2.
