# 🌿 Katy Caballero - Osteópata y Masajista

Web profesional para Katy Caballero, osteópata y masajista en Alpedrete, Madrid.

## 🚀 Tecnología

- **Framework**: [Astro](https://astro.build/) v4
- **Estilos**: CSS puro (variables CSS, sin framework externo)
- **Blog**: Markdown con Content Collections de Astro
- **SEO**: Sitemap automático, Schema.org, Open Graph
- **Hosting recomendado**: Netlify, Vercel o cualquier hosting estático

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

1. Crea un archivo `.md` en `src/content/blog/`
2. Añade el frontmatter con los metadatos:

```markdown
---
title: "Título del artículo"
excerpt: "Descripción breve para listados y SEO"
date: 2024-12-20
category: "Osteopatía"
image: "https://url-de-imagen.jpg"
readTime: 5
author: "Katy Caballero"
---

Aquí va el contenido del artículo en Markdown...
```

3. El artículo aparecerá automáticamente en el blog

## 🌐 Despliegue

### Opción 1: Netlify (Recomendado - GRATIS)

1. Crea cuenta en [netlify.com](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Netlify desplegará automáticamente con cada push

### Opción 2: Vercel (GRATIS)

1. Crea cuenta en [vercel.com](https://vercel.com)
2. Importa el proyecto desde GitHub
3. Vercel detectará Astro automáticamente

### Opción 3: IONOS (hosting actual)

1. Ejecuta `npm run build`
2. Sube el contenido de la carpeta `dist/` por FTP
3. Configura el dominio en el panel de IONOS

## 🔗 Conectar el dominio katycaballeroosteopata.com

### En Namecheap (donde está el dominio):

1. Entra en Namecheap → Domain List → Manage
2. Ve a "Advanced DNS"
3. Configura según el hosting:

**Para Netlify:**
- Tipo: ALIAS o CNAME
- Host: @
- Value: [tu-sitio].netlify.app

**Para IONOS:**
- Tipo: A
- Host: @
- Value: [IP de tu hosting IONOS]

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
