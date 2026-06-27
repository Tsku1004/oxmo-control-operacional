# Cambios v12 - Hotfix Lotes / Buscador / Silos

Correcciones aplicadas:

- La pestaña **Lotes OXMO/BQA** queda con render seguro y tabla propia.
- Se elimina la columna **Producto** en Lotes OXMO/BQA.
- El buscador de **Inventario** ya no re-renderiza mientras se escribe, por lo que no pierde el foco.
- El buscador ahora filtra al presionar **Enter** o el botón **Buscar**.
- Se agrega botón **Limpiar** cuando hay búsqueda activa.
- Los silos colorean el llenado según su caracterización química por **Cu, Mo y S**:
  - Bajo Cobre
  - Alto Cobre
  - Fuera Esp
  - Sin comunes / pendiente
- Se mantiene el valor inicial de azufre en mezclas en **0.01%**.
- No se reescribió la importación principal de Infodia.

Archivos a subir a GitHub:

- `app.js`
- `styles.css`
- `index.html`

Luego abrir con `Ctrl + F5`.
