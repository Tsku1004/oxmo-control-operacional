# Cambios v20260626 - Control Operacional Molyb Gerencial V3

Se implementó el dashboard gerencial con el estilo visual suave aprobado:

- Título principal: **Control Operacional Molyb**.
- Perfil Gerente mantiene vista ejecutiva sin acceso a módulos técnicos ni detalles de silos.
- Sidebar gerencial de solo lectura con accesos de alto nivel.
- Calendario pequeño integrado.
- Reloj pequeño integrado.
- Indicador de nube visible para cuenta gerente.
- KPI cards más suaves, con bordes redondeados, sombras y gradientes.
- Gráfico de tendencia operacional conectado a una nueva función base:
  `calcularProduccionDiariaGerencial(day)`.

## Producción diaria

La función queda preparada para la lógica definitiva:

`producción diaria estimada = (cargado a silo + descarga - retorno) * densidad material`

`fino Mo estimado = producción diaria estimada * (%Mo / 100)`

Por ahora usa los datos disponibles desde Infodia como fallback:

- `llenadoT` como cargado a silo si no existe `cargadoASiloT`.
- `descargaT` para consumo/descarga.
- `retornoT` si en el futuro existe.
- `densidadMaterial` si en el futuro existe; por defecto usa 1.
- `%Mo` calculado desde `kgMo / produccionKg` si no viene explícito.

## Archivos clave para subir

- `app.js`
- `styles.css`
- `index.html`

Después de subir, abrir la app con `Ctrl + F5`.
