# Integración con Payload 3.90.2

El layout de este grupo monta el panel y sus funciones de servidor. El grupo
hermano `(frontend)` contiene el documento HTML público. La configuración del
CMS vive en `src/payload/payload.config.ts`.

## Regenerar el mapa de componentes

En Node 22.22.2, el CLI interpreta la configuración TypeScript de este proyecto
como CommonJS y falla con `ERR_REQUIRE_ASYNC_MODULE` al cargar Lexical. Desde la
raíz, con las dependencias del lockfile instaladas, estos comandos ejecutan el
generador oficial sobre una copia temporal de las fuentes en modo ESM.

```bash
(
  set -eu
  proyecto=$PWD
  temporal=$(mktemp -d)
  cp -R src tsconfig.json "$temporal/"
  ln -s "$proyecto/node_modules" "$temporal/node_modules"
  printf '{"type":"module"}\n' > "$temporal/package.json"
  cd "$temporal"
  PAYLOAD_CONFIG_PATH=src/payload/payload.config.ts node node_modules/payload/bin.js generate:importmap
  cp 'src/app/(payload)/admin/importMap.js' "$proyecto/src/app/(payload)/admin/importMap.js"
)
```

El mapa generado incluye los campos Lexical, las tarjetas de colecciones y el
cliente de carga S3. Las pruebas del panel están en [Estado de M0](../../../docs/ESTADO-M0.md).
