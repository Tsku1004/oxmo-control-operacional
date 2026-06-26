# Cambios v20260626 - Área/Célula v7 FIX

## Corrección crítica
- Se corrigió el problema de pantalla en blanco.
- La app estaba renderizando antes de terminar de definir la lógica de Área/Célula.
- Ahora la inicialización se ejecuta al final, después de cargar todos los parches y migraciones.

## Área / célula
- Cada usuario queda asociado a un Área/Célula.
- Usuarios operativos solo ven inventarios de su área.
- Roles con vista global:
  - Administrador
  - Gerente
  - Jefe de planta
  - Super intendente / Superintendente
- Inventario histórico sin área se migra automáticamente a `Envase`.
- Los lotes nuevos quedan asociados al área del usuario que los registra.

## Administración de usuarios
- Al crear usuario se exige área/célula.
- El área se elige desde lista desplegable.
- El admin puede crear nuevas áreas desde `+ Añadir área / célula...`.
- En ficha de usuario, el admin puede modificar el área/célula.
- En Mi perfil, el usuario ve su área pero no la modifica.

## Visual
- Se mantiene el estilo visual suavizado del dashboard gerencial.
- Se agregaron chips visuales de área/célula.

## Archivos para subir a GitHub
Subir mínimo:
- `app.js`
- `styles.css`
- `index.html`

Después del deploy, abrir con Ctrl + F5.
