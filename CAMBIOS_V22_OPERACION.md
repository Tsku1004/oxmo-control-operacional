# OXMO Control - v22 operación

Cambios aplicados:

- Etiqueta: texto bajo QR cambiado a "Molibdeno para el mundo Molyb".
- Botón superior "MI CLAVE" reforzado para desaparecer por completo.
- Infodia: opción visible solo para usuarios con rol/cargo Encargado y Administrador.
- Infodia: al cargar archivo muestra mensaje con fecha, hora y nombre del archivo.
- Lotes OXMO/BQA: optimizado para evitar retardo; renderiza por bloques y permite mostrar más.
- Mezclas: filtra materiales según el área asignada a la cuenta, igual que Inventario.
- Nuevo lote: se habilita el acceso a Registro para Supervisor y usuarios operativos.
- Silos: al cargar Infodia se recalculan niveles actuales desde el archivo nuevo, sin arrastrar niveles antiguos pegados.
- Silos: se ignoran ajustes manuales antiguos después de una carga Infodia; solo ajustes manuales nuevos pueden sobreescribir.

Validación: node --check app.js.
