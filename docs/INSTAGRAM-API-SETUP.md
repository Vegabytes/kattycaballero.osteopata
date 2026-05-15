# Instagram API Setup — feed en "tiempo real" para Katy

Guía paso a paso para conectar el componente `Instagram.astro` con la API de Meta y mostrar los últimos posts en la web con caché de 15 min.

**Tiempo estimado**: 20-30 min la primera vez.

---

## 0. Pre-requisitos

Antes de empezar comprueba:

- [ ] Cuenta de **Facebook** activa (puedes usar la personal — solo para crear la app, no se publica nada con tu nombre).
- [ ] La cuenta de **Instagram** `katycaballero.osteopata` está convertida a **cuenta de empresa o creador** (gratis: ajustes Instagram → Cuenta → Cambiar a cuenta profesional). Es obligatorio para la API.
- [ ] Si la cuenta NO está enlazada a una Página de Facebook, puedes funcionar igual con Instagram Basic Display, pero con limitaciones. Recomendado conectarla a una Página FB.

---

## 1. Crear una app de Meta Developer

1. Ve a https://developers.facebook.com/apps
2. Pulsa **Crear app**.
3. Tipo de app: **Empresa** (Business).
4. Nombre: `Katy Caballero - Instagram Feed` (cualquier nombre).
5. Email de contacto: el tuyo.
6. Pulsa **Crear app** y termina el captcha.

---

## 2. Añadir el producto "Instagram"

Dentro de la app:

1. En el panel izquierdo, **Productos** → **Añadir producto**.
2. Busca **Instagram** y pulsa **Configurar**.
3. Selecciona **API de Instagram con inicio de sesión empresarial** (Instagram Graph API).
4. Sigue el asistente que te conecta la cuenta de Instagram.

---

## 3. Generar el Long-Lived Access Token (60 días)

### Opción A (recomendada): Generador de tokens del Graph API Explorer

1. Ve a https://developers.facebook.com/tools/explorer/
2. Selecciona tu app (la que creaste).
3. En **User or Page**, elige **Get User Access Token**.
4. Permisos (Permissions) — añade al menos:
   - `instagram_basic`
   - `instagram_manage_insights` (si quieres estadísticas)
   - `pages_show_list`
   - `pages_read_engagement`
5. Pulsa **Generate Access Token** y autoriza con tu cuenta.
6. Copia el token corto (User Access Token) que aparece.

### Convertir el token corto a long-lived (60 días):

Abre esta URL en el navegador (sustituye los placeholders):

```
https://graph.facebook.com/v21.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={APP_ID}&
  client_secret={APP_SECRET}&
  fb_exchange_token={TOKEN_CORTO}
```

Donde:
- `{APP_ID}`: el ID de tu app (lo ves arriba a la izquierda en el panel de la app).
- `{APP_SECRET}`: en la app → Settings → Basic → App Secret (pulsa "Show").
- `{TOKEN_CORTO}`: el que copiaste del paso anterior.

Te devolverá:
```json
{"access_token":"...","token_type":"bearer","expires_in":5184000}
```

Ese `access_token` es el **Long-Lived Token** (válido 60 días). Cópialo.

---

## 4. Obtener el Instagram Business Account ID

1. Sigue en el Graph API Explorer.
2. Cambia el endpoint a: `me/accounts`
3. Pulsa **Submit**. Te muestra las Páginas de FB asociadas a tu cuenta.
4. Copia el `id` de la Página que conecta con `katycaballero.osteopata`.

Ahora, en el explorer:

5. Pega `{PAGE_ID}?fields=instagram_business_account` y Submit.
6. Te devuelve `{ "instagram_business_account": { "id": "17841..." } }`.
7. Copia ese **id**. Es el `INSTAGRAM_BUSINESS_ACCOUNT_ID`.

---

## 5. Configurar variables en Cloudflare Pages

1. Ve a **Cloudflare Dashboard** → Pages → `katy-caballero-osteopata` → Settings → **Environment Variables**.
2. Añade dos variables (selecciona **Production** y **Preview** en ambas):
   - **Nombre**: `INSTAGRAM_ACCESS_TOKEN` → **Valor**: el long-lived token del paso 3.
   - **Nombre**: `INSTAGRAM_BUSINESS_ACCOUNT_ID` → **Valor**: el id del paso 4.
3. Pulsa **Encrypt** en el token (más seguro).
4. **Importante**: tras añadirlas, **redeploy** del proyecto para que las pille (Deployments → ... → Redeploy).

---

## 6. Verificar que funciona

Una vez redespegado:

1. Abre https://katycaballeroosteopata.com/api/instagram-feed
2. Deberías ver un JSON con `"posts": [...]` y unos cuantos posts dentro.
3. Si ves `"posts": [], "source": "empty", "error": "..."`, mira el campo `error` para diagnosticar:
   - `"INSTAGRAM_ACCESS_TOKEN no configurado"` → no se ha hecho redeploy o la variable no está bien.
   - `"Instagram API 400"` → token expirado o mal generado. Regenerar.
   - `"Instagram API 190"` → token revocado. Regenerar.

Si el JSON sale bien, abre la home → sección Instagram, deberías ver tus últimos posts.

---

## 7. Renovar el token cada 60 días

El long-lived token expira a los 60 días. Tienes dos opciones:

### Opción A — Auto-refresh AUTOMÁTICO (recomendado, "set & forget")

**Ya está implementado en `workers/cron.ts`**. Solo necesitas añadir DOS variables de entorno más en Cloudflare Pages:

- **`INSTAGRAM_APP_ID`** → el ID de tu app de Meta Developer (lo ves en la página de la app).
- **`INSTAGRAM_APP_SECRET`** → en la app → Settings → Basic → App Secret (pulsa "Show").

Con esas dos vars + el `INSTAGRAM_ACCESS_TOKEN` inicial, el cron worker se encarga del resto:

- **Cada miércoles a las 10:00 UTC** llama al endpoint `fb_exchange_token` de Meta.
- Extiende el token long-lived a otros 60 días.
- Guarda el nuevo token en la tabla `configuracion` de D1 (`clave = 'instagram_access_token'`).
- El endpoint `/api/instagram-feed` lee de D1 primero, así que automáticamente usa el token fresco.
- Si algo falla, te avisa por Telegram con el error concreto para que actúes.

**Resultado**: solo tienes que configurar el setup inicial. El token se renueva solo para siempre.

### Opción B — Rotación MANUAL (sin App Secret)

Si no quieres dejar `INSTAGRAM_APP_SECRET` en Cloudflare:

1. Pon alarma en el calendario cada 50 días.
2. Vuelve al paso 3 y genera un token nuevo.
3. Actualiza `INSTAGRAM_ACCESS_TOKEN` en Cloudflare Pages.
4. Redeploy.

Si no configuras `INSTAGRAM_APP_ID` ni `INSTAGRAM_APP_SECRET`, el cron simplemente salta el refresh y registra `"saltar (modo manual)"` en los logs. No falla.

---

## 8. ¿Algo no funciona?

Causas típicas:

- **No has hecho redeploy tras añadir las variables** → siempre tras tocar env vars hay que redeploy.
- **Token expirado** → regenerar.
- **La cuenta de Instagram NO es de empresa/creador** → conviértela en ajustes de Instagram.
- **La cuenta de Instagram NO está enlazada a una Página de FB** → ve a la Página → Configuración → Vincular cuenta de Instagram.
- **Estás en modo "Desarrollo" de la app**: solo funciona para tu cuenta. Para producción la app debe pasar a modo "En activo" (Live). Para feeds básicos suele funcionar igual en modo Desarrollo si la cuenta es la del propietario.

---

## Notas técnicas

- **Caché**: el endpoint `/api/instagram-feed` cachea 15 min en la edge de Cloudflare. Si publicas, máximo 15 min hasta que aparezca.
- **Frontend**: lazy load. Solo se llama al endpoint cuando la sección está cerca del viewport.
- **Fallback**: si el endpoint falla, la sección muestra un botón "Visita mi perfil" en lugar de imágenes rotas.
- **Privacidad**: el token NO se expone al navegador. Solo el endpoint del servidor lo usa.
- **Coste**: gratis. Instagram Graph API es gratis para uso normal.
