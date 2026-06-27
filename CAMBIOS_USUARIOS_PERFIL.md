# Cambios v13 - Hotfix coincidencia exacta ACP / Infodia

Se corrigió el cruce automático entre inventario y cartilla ACP/Infodia.

## Corrección principal

Antes el sistema podía actualizar un lote usando solo el último correlativo y el año, por ejemplo:

- `03001-26`

Eso podía provocar cruces incorrectos entre códigos distintos, como:

- `00630-004-03001-26`
- otro lote con distinto prefijo/familia pero mismo final `03001-26`

## Nueva regla

Desde esta versión, el inventario solo se actualiza con ACP cuando hay coincidencia exacta del código completo normalizado.

Ejemplo válido:

- Inventario: `00630-004-03001-26`
- ACP: `00630-004-03001-26`

Ejemplo no válido:

- Inventario: `00710-001-03001-26`
- ACP: `00630-004-03001-26`

Aunque ambos terminen en `03001-26`, ya no se cruzan.

## Archivos clave

- `app.js`
- `index.html`
- `styles.css`

Después de subir a GitHub/Vercel, abrir con `Ctrl + F5`.

## Nota operacional

Si ya se actualizó un lote con un cruce incorrecto antes de instalar este hotfix, hay que corregir ese lote manualmente o volver a cargar sus datos correctos. Esta versión evita que vuelva a ocurrir.
