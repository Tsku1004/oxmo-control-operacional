# Publicar OXMO Control en una web con tiempo real

## 1. Crear Supabase

1. Entra a https://supabase.com y crea un proyecto.
2. Abre `SQL Editor`.
3. Copia y ejecuta el contenido de `supabase.sql`.
4. Ve a `Project Settings > API`.
5. Copia:
   - `Project URL`
   - `anon public key`

## 2. Configurar la app

1. Abre la app publicada o local.
2. Inicia sesión.
3. Arriba, presiona `NUBE: LOCAL`.
4. Pega la URL de Supabase.
5. Pega la `anon public key`.

Desde ese momento, lotes, sectores, silos, comunes e historial se sincronizan en tiempo real entre dispositivos.

## 3. Publicar como web

La app es estática. Puedes publicar estos archivos:

- `index.html`
- `styles.css`
- `app.js`

Opciones simples:

- Netlify: arrastra la carpeta del proyecto a Netlify Drop.
- Vercel: crea un proyecto estático desde GitHub.
- Servidor interno: copia los archivos en una carpeta web.

## Nota de seguridad

La configuración actual es ideal para demo o piloto interno. Para producción real conviene agregar autenticación Supabase y reglas por rol en la base de datos.
