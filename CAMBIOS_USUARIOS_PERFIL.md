# Cambios v17 - Cruce ACP/Inventario corregido

## Corrección principal
El cruce ACP → Inventario ahora reconoce códigos de proceso/inventario como:

- `OO710-001-00303-26`
- `O0710-001-00303-26`
- `00710-001-00303-26`
- `OO630-004-03001-26`

La comparación sigue siendo por código completo, pero normaliza diferencias visuales:

- Letra `O` → número `0` solo en segmentos numéricos.
- Relleno de ceros por segmento: `710-1-303-26` queda comparable como `00710-001-00303-26`.
- No cruza por los últimos números solamente.

## Importante
Para que aparezcan los análisis que antes no se guardaron, se debe volver a subir el Infodia una vez con esta versión.

## Archivos que subir
- `app.js`
- `styles.css`
- `index.html`
