# Cambios OXMO Control - usuarios, perfil y etiqueta Zebra

Versión: `v20260626-label-pro-v3`

## 1. Usuarios / Admin

- Se mantiene la mejora anterior: edición de usuarios desde modal/ventana emergente.
- El administrador puede editar datos de acceso, rol, estado y datos de contacto.
- Se mantiene la pestaña `Mi perfil` para que cada usuario complete su información personal/contacto.

## 2. Etiqueta Zebra ZT230 300 dpi

Se corrigió nuevamente la etiqueta porque la vista `about:blank` no usa solo `etiqueta.html`; también depende de la función `printLabels()` dentro de `app.js`.

Cambios aplicados:

- Formato fijo `100 mm x 150 mm`.
- Área útil interna `96 mm x 146 mm`.
- Márgenes más equilibrados.
- Logo y bloque `OXMO / CONTROL` separados en dos líneas para evitar quiebres como `CONTROL15-06-2026`.
- ID centrado y con tamaño adaptable.
- Clasificación más visible.
- Bloques Cu / Mo / S proporcionados.
- Masa centrada.
- QR aumentado a 46-52 mm según largo del ID.
- QR centrado en el espacio inferior usando mejor el papel.
- Pie alineado al borde inferior.
- `index.html` actualizado con cache-busting `v=20260626-label-pro-v3`.

## 3. Archivos que debes reemplazar sí o sí

- `app.js`
- `etiqueta.html`
- `index.html`

También puedes subir el ZIP completo descomprimido para reemplazar todo el proyecto.

## 4. Después de subir a GitHub/Vercel

1. Espera el redeploy.
2. Abre la app.
3. Presiona `Ctrl + F5`.
4. Si aún aparece la antigua etiqueta, abre la app en incógnito o borra caché del sitio.


## Dashboard Gerencial

Se agregó una vista especial para usuarios con rol **Gerente**:

- Oculta módulos técnicos como Inventario, Silos, Mezclas, Infodia, Alertas, Avisos y Admin.
- Muestra solo un dashboard informativo de lectura con KPIs y gráficos simples.
- Incluye masa total, masa disponible, masa retenida, fuera de especificación, producción acumulada, fino Mo, consumo/descarga de silos y llenado de silos.
- Agrega gráficos por sector, por estado, producción de últimos 7 días y nivel de silos.
- Mantiene acceso a Mi perfil para completar datos personales.

Para activar esta vista, en Admin > Usuarios edita o crea una cuenta con rol **Gerente**.

## Ajuste v20260626 - Usuarios sin bloqueo de mayúsculas

- Se corrigió la función global que transformaba automáticamente textos a MAYÚSCULAS.
- Ya no se fuerza mayúscula en Administración de Usuarios ni en Mi perfil.
- Campos liberados: usuario, nombre, cargo, área, turno, teléfono, correo, dirección, contacto de emergencia y observaciones.
- Se mantiene la normalización interna del usuario para login, pero la escritura ya no se bloquea visualmente en mayúsculas.
- Se actualizó `index.html` con versión `20260626-usuarios-sin-mayus` para evitar caché en Vercel/navegador.

