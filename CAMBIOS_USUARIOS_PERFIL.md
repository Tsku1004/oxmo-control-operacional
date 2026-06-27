# Cambios v15 - Cruce ACP exacto normalizado O/0

Corrección enfocada en el cruce de inventario con cartilla ACP al subir Infodia o usar "Actualizar inventario con ACP".

## Problema corregido
Algunos códigos de la cartilla ACP vienen con letra **O** en segmentos que visualmente corresponden a cero, por ejemplo:

- ACP: `OO710-001-00303-26`
- Inventario: `00710-001-00303-26`

La versión anterior exigía coincidencia exacta literal, por lo que esos casos no cruzaban aunque fueran el mismo código operacional.

## Nueva regla
El cruce sigue siendo por **código completo**, pero antes normaliza solo los segmentos numéricos convirtiendo `O` en `0`.

Ejemplos válidos:

- `OO710-001-00303-26` = `00710-001-00303-26`
- `OO630-004-03001-26` = `00630-004-03001-26`
- `OO300-001-06179-26` = `00300-001-06179-26`

Ejemplos que NO cruzan:

- `OO630-004-03001-26` ≠ `OO410-001-03001-26`
- `OO710-001-00303-26` ≠ `OO710-001-00302-26`

## Seguridad del cambio
- No vuelve a cruzar por últimos números.
- No toca códigos alfanuméricos reales como `OXMO10065-26`, `OXBR1305-26` u `OSAC`.
- Mantiene la coincidencia por código completo.
- Agrega alerta indicando cuántos lotes fueron actualizados.

## Archivos a subir
- `app.js`
- `styles.css`
- `index.html`
