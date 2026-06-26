# Cambios v9 FIX - Área / Célula + Infodia + permisos

## Permisos por área/célula
- Cada usuario queda asociado a un Área / Célula.
- El inventario sin área se migra automáticamente a **Envase**.
- Usuarios de áreas distintas a Envase solo ven:
  - Inventario
  - Mi perfil
- Esos usuarios sí pueden agregar, editar e imprimir sus propios inventarios dentro de su área.
- Roles con vista totalizada general:
  - Administrador
  - Gerente
  - Jefe de planta
  - Super intendente / Superintendente

## Administración de usuarios
- El campo Área / Célula ahora usa lista desplegable.
- El admin puede crear nuevas áreas con `+ Añadir área / célula...`.
- El admin puede ver la contraseña de cada usuario.
- Antes de guardar modificaciones de usuario, la app muestra una confirmación con los cambios críticos.

## Infodia / Silos / Comunes de turno
- Se corrigió la lectura de comunes de turno para códigos tipo `OO300-001-00xxx-26` y `O0300-001-00xxx-26`.
- Se recalcula el historial de silos usando fecha de análisis ACP + llenado de silos del Infodia.
- No se filtra `state.lotes` globalmente al entrar a Silos, para no romper niveles ni comunes.
- Si el Infodia fue importado con una versión antigua que no guardó los comunes, reimportar el archivo Infodia poblará nuevamente la caracterización.

## Archivos clave
Subir a GitHub:
- `app.js`
- `styles.css`
- `index.html`
