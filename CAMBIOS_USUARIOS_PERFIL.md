# Hotfix v16 - Corrección de carga de la app

## Problema detectado
La versión anterior dejó `index.html` apuntando a una ruta inválida:

- `./P260627-v15-acp-o0`

Eso impedía cargar correctamente `styles.css` y `app.js`, provocando pantalla blanca.

## Corrección
Se restauraron las rutas correctas:

- `./styles.css?v=20260627-v16-index-fix`
- `./app.js?v=20260627-v16-index-fix`

## Archivos a subir
- `index.html`
- `app.js`
- `styles.css`

Aunque el cambio principal está en `index.html`, se recomienda subir los tres para mantener la versión sincronizada.
