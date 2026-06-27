# OXMO Control Operacional – v26 Agenda Notas/Tareas

## Cambios aplicados

1. **Agenda con dos modos reales**
   - Se eliminaron las tres pestañas anteriores y ahora quedan solo:
     - Nota
     - Tarea
   - La opción Pendiente fue eliminada.

2. **Modo Nota**
   - Al seleccionar Nota, aparece un campo de escritura libre para el día seleccionado.
   - Permite guardar o limpiar la nota del día.

3. **Modo Tarea**
   - Al seleccionar Tarea, cambia la vista a un campo para agregar tareas.
   - Se pueden agregar varias tareas por día.
   - Cada tarea se puede marcar con un clic.
   - Si la tarea queda hecha, el texto aparece tachado.
   - Si se vuelve a hacer clic, vuelve a quedar pendiente.
   - Se agregó botón para eliminar tareas individuales.

4. **Compatibilidad de datos anteriores**
   - Las notas antiguas guardadas como texto simple se conservan y se convierten automáticamente al formato nuevo.
   - Las tareas antiguas del formato anterior se migran como tarea individual.

5. **Indicadores en calendario**
   - Nota: marcador discreto.
   - Tarea pendiente: marcador amarillo.
   - Tareas completadas: marcador verde.

6. **Cache busting**
   - index.html apunta a `v26-agenda-notas-tareas` para evitar que el navegador cargue JS/CSS antiguos.

## Archivos modificados
- index.html
- app.js
- styles.css
- etiqueta.html se mantiene.
