# Cambios v19-clean-safe

## Objetivo
Limpieza segura sobre la versión v18 generada previamente, reduciendo código duplicado sin cambiar la lógica operacional sensible.

## Cambios principales

- Se tomó como base el ZIP v18: `oxmo-control-v18-admin-report-mo-fino-20260627.zip`.
- Se eliminaron 57 definiciones antiguas duplicadas de funciones top-level donde la última versión ya reemplazaba a la anterior.
- Se conservaron funciones duplicadas intencionales cuando una versión posterior capturaba una base anterior, por ejemplo wrappers de inventario, admin o mezclas.
- Se mantuvieron protegidos los bloques de cálculo de mezcla, ACP, Infodia, silos y Supabase.
- Se actualizó `index.html` con cache busting `v=20260627-v19-clean-safe`.
- Se incluyó `molyb-logo.webp`, requerido por etiquetas y vistas con logo.
- Se mantuvo la eliminación de pestaña Alertas/Alarma de v18.
- Se mantuvieron los KPIs superiores de Mo fino BC, Alto Cu y Fuera Esp.
- Se mantuvo el historial/admin audit en Reportes visible solo para Administrador.

## Resultado técnico

- `app.js` v18 original: 478006 bytes / 8360 líneas.
- `app.js` v19 limpio: 390194 bytes / 6947 líneas.
- Reducción aproximada: 87.8 KB y 1413 líneas.

## Validación realizada

- `node --check app.js` correcto.
- Se verificó que sigan presentes los bloques críticos v17/v18:
  - normalización ACP proceso/inventario;
  - cruce exacto ACP → inventario;
  - KPIs Mo fino por clasificación;
  - historial admin en Reportes;
  - eliminación de pestaña Alertas.

## Nota importante

Esta es una limpieza segura. No es todavía una reestructuración profunda por módulos. Para una versión v20 se podría separar motores de cálculo, render, permisos y almacenamiento en archivos distintos.
