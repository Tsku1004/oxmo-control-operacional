# Cambios OXMO Control - usuarios, perfil y etiqueta Zebra

Versión: `v20260626-label-pro-v3`

## 1. Usuarios / Admin

- Se mantiene la mejora anterior: edición de usuarios desde modal/ventana emergente.
- El administrador puede editar datos de acceso, rol, estado y datos de contacto.
- Se mantiene la pestaña `Mi perfil` para que cada usuario complete su información personal/contacto.

## 2. Etiqueta Zebra ZT230 300 dpi

Se corrigió nuevamente la etiqueta porque la vista `about:blank` no usa solo `etiqueta.html`; también depende de la función `printLabels()` dentro de `app.js`.

Cambios aplicados:

- Formato fijo `100 mm x 150 mm`.
- Área útil interna `96 mm x 146 mm`.
- Márgenes más equilibrados.
- Logo y bloque `OXMO / CONTROL` separados en dos líneas para evitar quiebres como `CONTROL15-06-2026`.
- ID centrado y con tamaño adaptable.
- Clasificación más visible.
- Bloques Cu / Mo / S proporcionados.
- Masa centrada.
- QR aumentado a 46-52 mm según largo del ID.
- QR centrado en el espacio inferior usando mejor el papel.
- Pie alineado al borde inferior.
- `index.html` actualizado con cache-busting `v=20260626-label-pro-v3`.

## 3. Archivos que debes reemplazar sí o sí

- `app.js`
- `etiqueta.html`
- `index.html`

También puedes subir el ZIP completo descomprimido para reemplazar todo el proyecto.

## 4. Después de subir a GitHub/Vercel

1. Espera el redeploy.
2. Abre la app.
3. Presiona `Ctrl + F5`.
4. Si aún aparece la antigua etiqueta, abre la app en incógnito o borra caché del sitio.
