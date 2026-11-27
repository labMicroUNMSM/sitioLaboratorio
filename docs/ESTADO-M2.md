# M2 · Líneas de investigación

La vista previa local parte de `b08b6cc` y usa el proyecto Compose
`sitio-m2-lineas` en `http://127.0.0.1:3106`, con PostgreSQL, MinIO y editor
propios. El primer lanzamiento previsto en el traspaso queda pendiente de
despliegue.

El listado muestra el título y un extracto del resumen. La ficha presenta el
resumen divulgativo, el detalle técnico y la figura de Media cuando existe.
Las dos rutas leen con permisos de visitante y `draft: false`. Para el
visitante, la colección exige que el registro esté vigente, que su estado
editorial sea `publicado` y que Payload haya publicado la versión.

| Comprobación en producción standalone | Resultado |
|---|---|
| Portada → listado → ficha | En Chromium a 390 y 1280 px se navegó con teclado y se recargó la ficha directamente. La línea de floración mostró su figura y la de paisajes sonoros abrió sin figura. |
| Publicación y borradores | Se publicó una línea y luego se guardaron cambios en el resumen y el detalle como borrador. El editor pudo leer la revisión. El listado y la ficha públicos conservaron el texto publicado. |
| Vacío y acceso directo | Sin líneas, el listado devolvió 200 y un mensaje de vacío. Las direcciones de una línea inexistente, una solo en borrador, una archivada y otra retirada devolvieron 404. |
| Relaciones inversas | En Personas, el editor vinculó a Mateo Salas con la línea de floración y después quitó esa relación. La ventana de visitante reflejó ambos guardados al recargar. Mateo conservó su vínculo inicial con paisajes sonoros. Una Persona inactiva quedó fuera. |
| Trabajos relacionados | La ficha mostró el título del proyecto y de la publicación. Retirarlos los ocultó y restaurarlos los hizo visibles otra vez. Los participantes enlazan a su tarjeta en Equipo; los trabajos se muestran como texto hasta que tengan páginas públicas. |
| Accesibilidad | La portada, Equipo, el listado y una ficha pasaron pa11y-ci con axe y HTML CodeSniffer, con cero errores en la vista previa. |

Para probarlo en Windows, abre `/lineas-investigacion/fenologia-del-bosque`
como visitante. En otra sesión abre `/admin` y edita el campo **Lineas** de
**Personas → Mateo Salas**. Añade **Floración del bosque nublado**, guarda y
recarga la ficha pública. El correo y la contraseña del editor de prueba se
consultan solo en la máquina local.

```powershell
wsl.exe sh -lc 'cat ~/.local/share/sitiolaboratorio/m2-lineas/credenciales-editor.txt'
```
