# OXMO Control Operacional — v20 clean-deep

## Base usada
- Se tomó como base el ZIP v19-clean-safe generado previamente.
- No se reescribieron los motores sensibles de mezcla, Infodia, ACP, silos ni nube desde cero.

## Limpieza de código
- Eliminadas definiciones duplicadas de funciones top-level que ya estaban reemplazadas por versiones posteriores.
- Eliminada la función antigua de Alertas/Alarma y retirada la pestaña de la navegación visible.
- Se mantuvieron los overrides necesarios que conectan áreas/células, gerente, ACP exacto, silos y reportes.
- `app.js` baja aprox. de 390 KB a 376 KB.
- Validado con `node --check`.

## Seguridad / usuarios
- Eliminada la exposición de contraseña visible en tabla de usuarios.
- El perfil del usuario no muestra campo de contraseña/clave.
- El administrador conserva la capacidad de crear usuario con contraseña inicial.
- En edición de usuario, la contraseña solo se reemplaza si el administrador escribe una nueva; si queda en blanco, se mantiene la anterior.

## ACP / Infodia
- Se mantiene el cruce exacto por código completo normalizado.
- Sigue aceptando diferencias visuales O/0 y ceros por segmento, por ejemplo: `OO710-001-00303-26` = `00710-001-00303-26`.
- No se vuelve al cruce por correlativo parcial.
- Se retiró la columna `Fuente` de las tablas ACP visibles.

## Reportes y KPIs
- Se mantienen KPIs de Mo fino por clasificación: BC, Alto Cu y Fuera de especificación.
- Se mantiene el historial por usuario/cuenta visible solo en contexto administrador.

## Pruebas ejecutadas
- `node --check app.js`: correcto.
- Prueba smoke en entorno simulado: app carga sin error inicial.
- Prueba de ACP exacto:
  - `OO710-001-00303-26` cruza con `00710-001-00303-26`.
  - `OO630-004-03001-26` cruza con `00630-004-03001-26`.
  - No cruza falsamente con otro primer/segundo segmento.
- Prueba de navegación: Alertas no aparece en tabs.
- Prueba de perfil: no aparece contraseña/clave en perfil del usuario.
- Prueba ACP visible: no aparece columna Fuente.
