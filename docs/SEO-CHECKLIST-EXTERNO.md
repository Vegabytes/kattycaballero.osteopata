# SEO de Katy — Checklist externo (acciones que NO se hacen desde el código)

Estado a 2026-05-15: el SEO técnico (on-page, schema, internal linking, sitemap) está al día tras el push `33f9c21`. Lo que sigue solo se hace desde fuera del repo.

---

## 1. Google Search Console (URGENTE — 15 min)

### Verificar propiedad del dominio
1. Ir a https://search.google.com/search-console
2. Añadir propiedad → tipo **Dominio** (preferible) → `katycaballeroosteopata.com`
3. Si no es posible verificar por DNS, usar **Prefijo de URL** → `https://katycaballeroosteopata.com`
4. Elegir método **HTML tag**. Copiar el valor del atributo `content="..."`
5. Pegarlo como variable de entorno en Cloudflare Pages:
   - Settings → Environment variables
   - Añadir `PUBLIC_GSC_VERIFICATION` con el valor del paso 4
   - Redeploy
6. En Search Console, pulsar **Verificar**. Debería funcionar al toque.

### Enviar el sitemap
- Una vez verificado, en Search Console → Sitemaps
- Añadir: `https://katycaballeroosteopata.com/sitemap-index.xml`
- Esperar 24-48h a que Google empiece a procesarlo.

### Solicitar indexación manual (acelera las nuevas páginas)
En Search Console → Inspeccionar URL, una por una:

**Prioridad ALTA (páginas nuevas que aún no se han indexado):**
- `https://katycaballeroosteopata.com/osteopata-sierra-de-guadarrama`
- `https://katycaballeroosteopata.com/masaje-sierra-de-guadarrama`

**Prioridad MEDIA (mejoras significativas, vale la pena re-indexar):**
- `https://katycaballeroosteopata.com/` (home)
- `https://katycaballeroosteopata.com/opiniones`
- `https://katycaballeroosteopata.com/donde-te-duele`
- `https://katycaballeroosteopata.com/osteopata-sierra-noroeste-madrid`
- `https://katycaballeroosteopata.com/masaje-sierra-noroeste-madrid`

Tras cada inspección → "Solicitar indexación". Google tiene cuota diaria (~10-15), así que prioriza las nuevas primero.

---

## 2. Google Business Profile / Google Maps (URGENTE — 10 min)

Ir a https://business.google.com → ficha de Katy Caballero.

### Editar la descripción del negocio
Asegurarse de que la descripción incluye explícitamente:
- "Sierra de Guadarrama"
- "Sierra Noroeste de Madrid"
- Lista de localidades cubiertas
- Servicios principales

Ejemplo sugerido:
> Osteópata y masajista en Alpedrete, en plena Sierra de Guadarrama. Atendemos pacientes de Collado Villalba, Moralzarzal, Galapagar, Cercedilla, Navacerrada, Guadarrama, Becerril de la Sierra y toda la Sierra Noroeste de Madrid. Osteopatía estructural, visceral y craneal, masaje deportivo, tailandés, corporal y para embarazadas. 12+ años de experiencia.

### Zonas de servicio
Editar → Áreas de servicio: añadir los pueblos uno por uno. Mínimo:
- Alpedrete, Collado Villalba, Moralzarzal, Galapagar, Guadarrama, Torrelodones, El Escorial, Cercedilla, Navacerrada, Collado Mediano, Becerril de la Sierra, Los Molinos, Las Rozas

### Categoría secundaria
Asegurar que tienes "Osteópata" como principal y añadir "Masajista" / "Centro de masajes" como secundaria.

### Posts en GBP (1 por semana — efecto directo en local SEO)
Crear posts cortos linkando a:
- Promociones actuales
- Nuevos artículos del blog
- Recordatorios estacionales (preparación maratón, recuperación esquí, etc.)

---

## 3. Backlinks locales (ESTRATEGIA — 1-3 meses)

### Directorios médicos gratuitos / baratos
- doctoralia.es — ficha profesional, gratis
- topdoctors.es — gratis básico
- masquemedicos.com
- doctorgo.es
- saludonet.com

Llenar perfil completo con descripción, especialidad, foto, ubicación. Cada uno = 1 backlink + visibilidad directa.

### Directorios locales de la Sierra
- pueblus.com → **YA está, pero la ficha podría enlazar específicamente a `/osteopata-sierra-de-guadarrama`** (proyecto propio, ver `pueblus/`)
- sierranoroeste.com (si existe)
- guíalocal.com de pueblos individuales

### Webs deportivas locales
Grupos/clubs de la Sierra:
- Trail running: contactar con clubs de Cercedilla, Navacerrada, Guadarrama
- Ciclismo: clubs de Sierra Norte / Guadarrama
- Senderismo: Federación Madrileña de Montañismo
- Ofrecer descuento para socios a cambio de mención en su web/newsletter

### Asociaciones profesionales
- Registro de Osteópatas de España (ROE)
- Si Katy es miembro, asegurar que la ficha incluye link a la web

---

## 4. Contenido — publicar al menos 2 posts/mes

Hay 30 temas preparados en `src/data/blog-topics.ts`. Workflow:

```bash
npm run draft:list                # ver todos los temas pendientes
npm run draft:random              # elegir uno al azar e imprimir el prompt
npm run draft -- <slug>           # imprimir prompt de uno específico
npm run draft -- <slug> --auto    # generar con Claude API (necesita ANTHROPIC_API_KEY)
```

El borrador queda en `drafts/<fecha>-<slug>.md`. Katy revisa, personaliza con experiencia real, mueve a `src/content/blog/`.

**Importante para EAT (Expertise, Authoritativeness, Trustworthiness):** los artículos médicos deben tener voz humana, casos reales (anonimizados), y matices clínicos. Lo más penalizable es contenido genérico que parece IA. Por eso el flujo es "IA borra → humano edita y firma".

---

## 5. Medir y ajustar

Cada 2 semanas, revisar en Search Console:
- **Rendimiento → Consultas**: ¿con qué keywords aparecemos? Si "sierra guadarrama" empieza a aparecer en impresiones aunque sea sin clics, es buena señal.
- **Páginas**: ¿cuáles tienen más clics? Donde haya más impresiones pero pocos clics, mejorar título/descripción.
- **Cobertura**: si hay errores de indexación, atacarlos.

Métrica objetivo realista: en 6-8 semanas, aparecer en top 20 para "osteopata sierra guadarrama" desde una IP de la zona. Top 10 en 3-4 meses si se publican 4-6 posts y se consigue al menos 1-2 backlinks locales.
