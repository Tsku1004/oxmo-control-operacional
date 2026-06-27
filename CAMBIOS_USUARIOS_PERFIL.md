# Cambios v10 - Área, inventario, KPIs, silos e Infodia

## Permisos por área
- Los usuarios de áreas distintas a **Envase** solo ven las pestañas **Inventario** y **Mi perfil**.
- Estos usuarios pueden crear lotes propios dentro de su área.
- Los roles con vista totalizada son: **Administrador**, **Gerente**, **Jefe de planta**, **Super intendente** y **Superintendente**.

## Inventario
- Se agregó buscador en la pestaña Inventario.
- Se agregó filtro por área para usuarios con permiso de vista totalizada.
- Los KPIs superiores ahora recalculan según el área filtrada.
- Si no hay filtro de área, se totalizan todas las áreas.
- El inventario histórico sin área sigue asignado automáticamente a **Envase**.

## KPIs corregidos
- **Cu promedio** ahora se calcula ponderado por masa y considera todos los lotes con análisis, incluyendo fuera de especificación.
- **Fino Mo** ahora considera todos los lotes con análisis, incluyendo fuera de especificación.

## Usuarios
- En creación y edición de usuarios se reemplazó el texto “Área / célula” por **Área**.
- El área sigue siendo una lista desplegable administrada por el administrador.
- El admin puede ver y modificar contraseñas visibles, con confirmación antes de cambios críticos.

## Silos e Infodia
- El color de llenado de los silos ahora se basa en la caracterización química Cu/Mo/S usando los colores de clasificación.
- Se reforzó lectura de comunes de turno con códigos **OO300-001-...** y **O0300-001-...**.
- No se reescribió la importación principal de Infodia: se mantuvo la lógica existente y se reforzó alrededor.

## Mezclas
- El valor S máximo parte por defecto en **0.2%** y sigue siendo editable.

## Cartilla ACP
- Se eliminó la columna **Producto** de la vista de cartilla ACP para dejarla más limpia.

Subir mínimo: `app.js`, `styles.css`, `index.html`.
