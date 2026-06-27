# Cambios v11 - Hotfix pestañas, buscador, mezcla y clave

Esta versión corrige problemas detectados en la versión v10.

## Correcciones principales

- Se corrigió la apertura de la pestaña **Lotes OXMO/BQA**.
- Se estabilizó el buscador de **Inventario** para evitar que quede pegado al escribir.
- El valor inicial de **S máximo** en Mezclas queda en **0.01%**, editable.
- La cuenta **Gerente** vuelve a iniciar directamente en el **Dashboard**, no en Mi perfil.
- Se corrigió el cierre de la ventana **Mi clave** para que no quede bloqueada.
- Al cambiar contraseña se solicita confirmación antes de guardar.

## Cambios que se mantienen desde versiones anteriores

- Control de inventario por área.
- Usuarios de áreas distintas a Envase con acceso solo a Inventario y Mi perfil.
- Usuarios por área pueden crear sus propios lotes.
- Roles globales ven totalizado general y pueden filtrar por área.
- KPIs superiores se recalculan según área/filtro.
- Cu promedio y Fino Mo consideran todos los materiales con análisis, incluidos fuera de especificación.
- Infodia, silos y comunes de turno se conservan.

## Archivos clave para subir a GitHub

- `app.js`
- `styles.css`
- `index.html`

Después del redeploy, abrir con `Ctrl + F5` para evitar caché vieja.
