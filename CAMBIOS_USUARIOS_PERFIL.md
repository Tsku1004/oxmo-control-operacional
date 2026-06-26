# Cambios v20260626 - Área/Célula V6

Se implementó la separación de inventario por **Área / Célula de trabajo**.

## Reglas de visibilidad

- Usuarios operativos ven solo los lotes asociados a su área/célula.
- Los roles con vista global ven el totalizado completo:
  - Administrador
  - Gerente
  - Jefe de planta
  - Super intendente / Superintendente

## Áreas / células

- El área por defecto ahora es **Envase**.
- El inventario existente que no tenía área se migra automáticamente a **Envase**.
- Usuarios existentes sin área también se normalizan a **Envase**.
- Al crear usuarios, el Admin debe seleccionar un área desde lista desplegable.
- El Admin puede crear áreas nuevas desde `+ Añadir área / célula...`.
- En la ficha del usuario, el área aparece bloqueada para el usuario común y solo la modifica el Admin.

## Diseño

- Se retocó el estilo general para acercarlo al look gerencial:
  - tarjetas más suaves
  - bordes más redondeados
  - fondo más elegante
  - tabla y modales más modernos
  - chips visuales de área/célula

## Archivos principales

Subir a GitHub:

- `app.js`
- `styles.css`
- `index.html`

Luego abrir la app con `Ctrl + F5`.
