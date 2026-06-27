# Cambios v14 - Infodia, KPIs y dashboard Mo fino

## Cambios solicitados

- Se eliminó la columna **Fuente** de la pestaña **Lotes OXMO/BQA**.
- El botón de **Importar/Subir Infodia** se reemplazó visualmente por un botón con icono de nube upload.
- Se reforzó la actualización automática de inventario al cargar Infodia:
  - Solo cruza ACP ↔ inventario con **coincidencia exacta del código completo**.
  - Ya no usa coincidencia parcial por correlativo final.
- El indicador superior **Masa Retenida** pasa a llamarse **Masa sin análisis**.
- El indicador **Masa disponible** ahora se muestra como **Masa disponible (con análisis)**.
- Los KPIs superiores se calculan por área/filtro activo.
- El dashboard gerencial ahora presenta el inventario en **Mo fino**:
  - Mo fino total
  - Mo fino disponible
  - Mo fino retenido
  - Mo fino fuera de especificación
  - Producción Mo fino del mes
  - Cu promedio ponderado por masa física

## Fórmulas usadas

- **Mo fino:** masa × (%Mo / 100)
- **Cu promedio:** Σ(masa × Cu%) / Σ(masa con análisis)

## Archivos a subir

Subir a GitHub, en la raíz del repositorio:

- `app.js`
- `styles.css`
- `index.html`

Luego esperar redeploy de Vercel y abrir con `Ctrl + F5`.
