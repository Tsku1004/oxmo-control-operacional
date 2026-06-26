# Cambios realizados - Usuarios y Perfil

Fecha: 2026-06-26

## Cambios principales

1. Se reemplazó la edición de usuarios mediante `prompt()` por una ventana emergente/modal.
2. El administrador ahora puede editar desde el modal:
   - Usuario
   - Nombre visible
   - Contraseña visible
   - Rol
   - Estado activo/deshabilitado
   - Cargo
   - Área
   - Turno
   - Teléfono
   - Correo
   - Dirección
   - Contacto de emergencia
   - Relación del contacto
   - Teléfono de emergencia
   - Observaciones
3. Se agregó una nueva pestaña `Mi perfil` para todos los usuarios.
4. Cada usuario puede completar y guardar sus propios datos de contacto.
5. Se agregaron estilos CSS para modal, formulario de perfil y campos responsivos.

## Archivos modificados

- `app.js`
- `styles.css`

## Cómo aplicar en GitHub

1. Descomprime el ZIP.
2. Reemplaza los archivos del repositorio por los archivos incluidos.
3. Sube los cambios a GitHub.
4. Si usas Vercel, espera el redeploy automático.
5. Abre la app, inicia sesión como administrador y revisa `Admin > Usuarios > Editar`.
6. Luego inicia sesión como usuario y revisa la nueva pestaña `Mi perfil`.

## Nota

La app conserva el mismo sistema actual de usuarios guardados en `oxmo:usuarios` y sincronizados por Supabase. No se migró a autenticación real de Supabase; eso sería una mejora posterior para producción.


## Ajuste etiqueta 100x150 mm - Zebra ZT230 300 dpi
- Se corrigio la plantilla de etiqueta para formato vertical 100 x 150 mm.
- Se ajustaron margenes internos, bloque de cabecera, cajas quimicas, masa y QR.
- El QR queda centrado, cuadrado y aumentado a 40 mm para lectura mas estable.
- Se actualizo el pie a Zebra ZT230 · Etiqueta 100 x 150 mm · 300 dpi.
