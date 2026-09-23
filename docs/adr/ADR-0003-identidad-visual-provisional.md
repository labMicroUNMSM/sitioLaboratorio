# ADR-0003 — Identidad visual provisional (paleta y logos)

**Estado:** Aceptado (provisional, revisable por Imagen Institucional)
**Fecha:** 2026-09-23
**Módulo:** M0

## Contexto

No existe todavía un manual de identidad de la FCB entregado al proyecto, y
M0 necesita un sistema de diseño para poder construir Header/Footer y
componentes primitivos. Esperar bloquearía todo M0.

Al mismo tiempo, el sitio es legal y técnicamente independiente de la UNMSM
(ADR-0001): no debe presentarse como si fuera un sistema oficial de la
universidad, ni reproducir su escudo o su marca registrada sin autorización.

## Decisión

Se define una paleta propia, sobria, que **resuena** con los tonos
históricamente asociados a San Marcos (guinda/vino oscuro y dorado sobre
neutros claros) sin copiar su escudo, tipografía de marca ni papelería
oficial. El objetivo es que el sitio se sienta "de la familia" cuando se
enlaza desde canales de la universidad, sin afirmar ser un sistema oficial de
Imagen Institucional.

Los logos (de la UNMSM y de la FCB) se colocan como **marcador de posición**
en el Header/Footer hasta que Imagen Institucional autorice los archivos
oficiales. El código deja el espacio y el `alt` reservados; no se inventa un
logo.

Ver tokens concretos en `src/styles/tokens.css` y en el README (sección
"Sistema de diseño").

## Consecuencias

- **Se gana:** M0 no se bloquea esperando un manual de marca; el sitio puede
  lanzar a staging con una identidad coherente y accesible.
- **Se sacrifica:** esta paleta es *provisional*. En cuanto exista un manual
  de identidad de la FCB, este ADR debe marcarse como superado por uno nuevo
  (ADR-000X) y los tokens deben actualizarse — son ~6 valores centralizados en
  un solo archivo, el costo de cambio es bajo por diseño.
- Ningún componente usa el escudo oficial de la UNMSM ni reproduce su
  papelería; esto evita un riesgo de uso indebido de marca mientras el
  proyecto no tiene autorización formal de Imagen Institucional.
