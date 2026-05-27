# 🌿 Katy Caballero - Osteópata y Masajista

Web profesional para Katy Caballero, osteópata y masajista en Alpedrete, Madrid.

## 🚀 Tecnología

- **Framework**: [Astro](https://astro.build/) (SSR con `@astrojs/cloudflare`)
- **Estilos**: CSS puro (variables CSS, sin framework externo)
- **Blog**: Markdown con Content Collections de Astro
- **SEO**: Sitemap automático, Schema.org, Open Graph
- **Hosting**: Cloudflare Workers (`wrangler deploy`)
- **Base de datos**: Cloudflare D1 (`katy-clinica`) — reserva de citas y panel de contabilidad
- **Despliegue**: manual con `wrangler deploy` (no hay CI). Migraciones D1 vía scripts `npm run db:*`

## 📁 Estructura del proyecto

```
katy-astro/
├── public/
│   ├── images/          # Imágenes (logo, fotos de la sala, etc.)
│   └── robots.txt
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── content/
│   │   └── blog/        # Artículos del blog en Markdown
│   ├── layouts/         # Layout principal
│   ├── pages/           # Páginas de la web
│   └── styles/          # Estilos globales
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 🛠️ Instalación y desarrollo

### Requisitos previos
- Node.js 18+ instalado
- npm o yarn

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Iniciar servidor de desarrollo**
```bash
npm run dev
```
La web estará disponible en `http://localhost:4321`

3. **Construir para producción**
```bash
npm run build
```
Los archivos se generarán en la carpeta `dist/`

4. **Previsualizar build**
```bash
npm run preview
```

## 📝 Cómo añadir artículos al blog

### Desde GitHub (sin programar):

1. Ve a: https://github.com/Vegabytes/kattycaballero.osteopata
2. Navega a `src/content/blog/`
3. Clic en **"Add file"** → **"Create new file"**
4. Nombre del archivo: `mi-nuevo-post.md` (usa guiones, sin espacios ni acentos)
5. Copia este formato:

```markdown
---
title: "Título del artículo"
excerpt: "Resumen corto del artículo (1-2 frases)"
date: 2025-12-20
category: "Osteopatía"
image: "/images/blog/nombre-imagen.jpg"
readTime: 5
author: "Katy Caballero"
---

Aquí va el contenido del artículo.

## Subtítulo

Más texto...

### Otro subtítulo

- Lista de puntos
- Otro punto
```

6. Clic en **"Commit changes"**
7. Cloudflare desplegará automáticamente en 1-2 minutos

### Categorías disponibles:
- Osteopatía
- Masajes
- Bienestar
- Consejos

### Editar un post existente:

1. Ve a `src/content/blog/`
2. Clic en el archivo `.md`
3. Clic en el lápiz ✏️ (editar)
4. Haz los cambios
5. Clic en **"Commit changes"**

### Subir imágenes para el blog:

1. Ve a `public/images/blog/`
2. Clic en **"Add file"** → **"Upload files"**
3. Arrastra la imagen
4. Clic en **"Commit changes"**
5. Usa en el post: `image: "/images/blog/nombre-imagen.jpg"`

## 🌐 Despliegue actual: Cloudflare Pages

- **Web**: https://katycaballeroosteopata.com
- **Preview**: https://kattycaballero-osteopata.pages.dev
- **GitHub**: https://github.com/Vegabytes/kattycaballero.osteopata

### Despliegue automático:
Cada vez que hagas un cambio en GitHub, Cloudflare lo despliega automáticamente en 1-2 minutos.

### DNS:
El dominio está en Namecheap con nameservers de Cloudflare:
- elliot.ns.cloudflare.com
- natasha.ns.cloudflare.com

## 🔗 Enlaces importantes

- **WhatsApp**: https://wa.me/34643961065
- **Instagram**: https://instagram.com/katycaballero.osteopata
- **Google Business**: Centro de masaje y osteopatía Katy Caballero
- **Dejar reseña**: https://g.page/r/CUVuAD3Rp90PEBE/review

## ✏️ Personalización

### Cambiar colores
Edita las variables CSS en `src/styles/global.css`:

```css
:root {
  --color-primary: #5a7c59;      /* Verde principal */
  --color-secondary: #c4a35a;    /* Dorado/ocre */
  --color-cream: #faf8f3;        /* Fondo crema */
}
```

### Cambiar información de contacto
Busca y reemplaza en estos archivos:
- `src/components/Footer.astro`
- `src/components/Contact.astro`
- `src/pages/reservar.astro`
- `src/layouts/Layout.astro` (Schema.org)

### Cambiar precios
Edita `src/components/Services.astro` y `src/pages/reservar.astro`

### Añadir sistema de reservas online (Calendly)

1. Crea cuenta gratuita en [calendly.com](https://calendly.com)
2. Configura tu disponibilidad y servicios
3. Obtén tu enlace de Calendly
4. Añade en `src/pages/reservar.astro`:

```html
<!-- Añadir después de la sección booking-methods -->
<section class="calendly-embed">
  <div class="container">
    <h2>Reserva online</h2>
    <div class="calendly-inline-widget" 
         data-url="https://calendly.com/TU-USUARIO" 
         style="min-width:320px;height:700px;">
    </div>
    <script src="https://assets.calendly.com/assets/external/widget.js"></script>
  </div>
</section>
```

## 📱 Redes Sociales

- **Instagram**: @katycaballero.osteopata
- **WhatsApp**: +34 643 961 065
- **Email**: katycaballero.osteopata@gmail.com

## 📊 SEO incluido

- ✅ Meta tags optimizados
- ✅ Open Graph para redes sociales
- ✅ Schema.org (LocalBusiness)
- ✅ Sitemap automático
- ✅ URLs amigables
- ✅ Imágenes optimizadas con lazy loading
- ✅ HTML semántico

## 🤝 Soporte

Para cualquier duda o modificación, contacta con el desarrollador.

---

Hecho con ❤️ para Katy Caballero
