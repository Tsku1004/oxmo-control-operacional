# Cambios v20260626 - Área / célula + salida gerente

## Vista Gerente
- Se agregó nuevamente el botón **Salir** para cerrar sesión.
- Se mantiene eliminada la barra lateral y los controles técnicos visibles.
- No se muestra configuración de nube ni botón de clave en el dashboard gerencial.

## Usuarios / áreas de trabajo
- Al crear usuarios ahora existe el campo **Área / célula**.
- El admin puede seleccionar un área existente o usar **+ Añadir área / célula...** para crear una nueva.
- Los datos de usuario ahora conservan `area` / `areaCelula` junto con cargo, turno y contacto.

## Base multi-área / célula
- Se agregó una base lógica para que los centros trabajen de forma independiente por área/célula.
- Los lotes nuevos quedan asociados al área/célula del usuario que los registra.
- Usuarios no globales ven/operan inventario de su propia área.
- Administrador y Gerente pueden ver el totalizado general.
- La vista de inventario muestra si está trabajando en una área específica o en totalizado.

## Archivos clave
Subir a GitHub:
- `app.js`
- `styles.css`
- `index.html`

Después del deploy, abrir con `Ctrl + F5`.
