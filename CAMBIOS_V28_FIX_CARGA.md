# OXMO Control Operacional – v28 FIX Carga

## Problema corregido
La v27 podía quedar con pantalla blanca al cargar la app porque la normalización del tema visual del usuario se ejecutaba durante la carga inicial antes de que la lista de temas estuviera disponible.

## Corrección aplicada
- Se movió la definición de temas (`Azul operacional`, `Claro`, `Negro`) antes de la carga del estado inicial.
- Se mantiene el selector de temas por usuario.
- Se mantiene el indicador rojo de tareas pendientes.
- Se mantienen las funciones de agenda: Nota / Tarea, tareas tachadas al completar, eliminar tarea y notas por día.
- Se actualizó el cache busting de `index.html` a `v28-fix-carga`.

## Validación
- `node --check app.js`: correcto.
- Prueba de ejecución básica en entorno simulado: correcto.

## Archivos modificados
- index.html
- app.js
- styles.css
- etiqueta.html
