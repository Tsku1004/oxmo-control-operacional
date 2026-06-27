# OXMO Control Operacional – v24 Agenda + KPI

## Cambios aplicados

1. **Rol corregido**
   - Se unificó `Super intendente` a `Superintendente`.
   - Se mantiene compatibilidad con usuarios antiguos.
   - `Supervisor` ahora se normaliza como `Encargado` para mantener coherencia operacional.

2. **Zona de indicadores reorganizada**
   - Se reordenaron los KPI en una grilla más cuadrada para aprovechar mejor el espacio.
   - Se ajustaron tamaños mínimos y comportamiento responsivo.

3. **Agenda / calendario pequeño**
   - Se agregó una agenda compacta en la zona superior de KPI.
   - Permite cambiar de mes.
   - Permite seleccionar un día.
   - Permite agregar, guardar o limpiar una nota/evento por día.
   - Las fechas con nota quedan marcadas visualmente.

4. **Encabezado de usuario**
   - El rol mostrado en el encabezado también usa el nombre corregido.

5. **Cache busting**
   - `index.html` fue actualizado para apuntar a la versión `v24-agenda-kpi`.

## Archivos modificados
- index.html
- app.js
- styles.css
- etiqueta.html (mantiene el texto correcto bajo QR)
