# OXMO Control Operacional – v27 Temas + alerta de tareas

## Cambios aplicados

### 1. Indicador rojo de tareas pendientes
- Cuando el día seleccionado tiene tareas pendientes, la pestaña **Tarea** muestra un pequeño punto rojo.
- La cabecera de **Agenda** también muestra un punto rojo si existen tareas pendientes dentro del mes visible.
- Los días del calendario con tareas pendientes ahora se marcan con indicador rojo.
- Las tareas hechas se mantienen con indicador verde y texto tachado.

### 2. Temas visuales por usuario
Cada usuario puede personalizar su cuenta desde **Mi perfil** con el campo **Tema visual**.

Temas disponibles:
- **Azul operacional**: tema actual.
- **Claro**: versión clara para mejor lectura en ambientes iluminados.
- **Negro**: versión más oscura, con fondo negro y contraste alto.

### 3. Persistencia por cuenta
- El tema queda guardado dentro del perfil del usuario.
- Al iniciar sesión, la app aplica automáticamente el tema configurado en esa cuenta.
- El administrador también puede modificar el tema cuando edita usuarios.

### 4. Compatibilidad
- Usuarios antiguos quedan automáticamente en tema **Azul operacional**.
- No se modifica la lógica de inventario, silos, Infodia, ACP ni mezcla.

## Archivos modificados
- index.html
- app.js
- styles.css

## Validación
- `node --check app.js` correcto.
