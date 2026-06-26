# Cambios v20260626 - Dashboard Gerencial V4

Se actualizó la vista del perfil **Gerente** para que se vea como un panel ejecutivo más limpio y proporcional.

## Cambios principales

- Se quitó la barra lateral del dashboard gerencial.
- Se quitaron los botones superiores visibles de `NUBE: SINCRONIZADO`, `MI CLAVE` y otros controles técnicos.
- Se mantuvo la vista gerencial como lectura ejecutiva, sin acceso a módulos técnicos como silos o detalle operacional.
- El título principal ahora es **Control Operacional Molyb**.
- Se agregó un fondo visual tipo ilustración industrial en el encabezado.
- Se reorganizó el dashboard en dos zonas:
  - contenido principal con KPIs, tendencia y distribución;
  - columna derecha con calendario, reloj y observaciones.
- El gráfico de tendencia mantiene la función base `calcularProduccionDiariaGerencial(day)` para el cálculo futuro de producción diaria.

## Archivos modificados

- `app.js`
- `styles.css`
- `index.html`

## Subida a GitHub

Subir los archivos a la raíz del repositorio y reemplazar los existentes. Luego esperar el redeploy de Vercel y abrir la app con `Ctrl + F5`.
