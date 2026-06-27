# OXMO Control - v23 permisos y sesión

## Cambios principales

1. Administrador inamovible
- La cuenta `admin` queda protegida.
- No se puede pausar, eliminar, renombrar ni cambiar su rol.
- Mantiene acceso total permanente.

2. Cierre automático de sesiones
- Si una cuenta es pausada o eliminada por administración, la sesión abierta se cierra automáticamente al sincronizarse `oxmo:usuarios`.
- Si intenta guardar cambios después de ser pausada/eliminada, la app bloquea la operación y vuelve al login.
- Las cuentas pausadas o eliminadas no pueden volver a iniciar sesión.

3. Roles corregidos
- `Supervisor` migra a `Encargado`.
- Lista operacional actual:
  - Operador
  - Encargado
  - Jefe de turno
  - Jefe de planta
  - Super intendente
  - Gerente
- `Administrador` se mantiene como rol técnico especial.

4. Creación de usuarios
- Se elimina el campo duplicado `Cargo` en la creación.
- El campo principal queda como `Rol`.
- El rol se guarda también como cargo interno para compatibilidad.

5. Permisos individuales
- En cada usuario aparece botón `Permisos`.
- Permite otorgar o quitar permisos por cuenta.
- La matriz muestra permisos marcados si están activos.
- Indica si el permiso es heredado por rol, otorgado manualmente o bloqueado manualmente.

6. Protección por permisos
- Pestañas visibles según permiso.
- Crear lote requiere `lot_create`.
- Editar/eliminar lotes respeta permisos propios, área o total.
- Subir Infodia requiere `infodia_upload`.
- Actualizar inventario con ACP requiere `infodia_apply_acp`.
- Ajustes de silos y eliminación de comunes se protegen por permisos de silos.
- Calcular/imprimir mezclas se protege por permisos de mezcla.
- Historial admin en reportes requiere `report_admin_history`.

## Validación técnica

- `node --check app.js`: correcto.
- Cache de `index.html` actualizado a `v23-permisos-sesion`.
