# CLAUDE.md — Mundial 2026 Partidos

Contexto interno del proyecto para asistentes de IA y para el propio JX.

## Qué es

Web pública de **una sola página** para seguir el Mundial 2026: partido en vivo,
próximos partidos con cuenta regresiva, resultados de eliminación directa,
cuadro final (octavos → final) y los 12 grupos. En español, hora local del
visitante, base blanca con identidad tricolor (verde/rojo/azul = México,
Canadá, EE. UU.). Deploy: **Cloudflare Pages**. Sin base de datos.

- Marca / título SEO: **"Mundial 2026 Partidos"**.
- Sitio de aficionados: **no usar logos ni marcas de FIFA** (aviso en el footer).
- Dominio placeholder en el código: `https://mundial2026-partidos.pages.dev/`
  → buscar "CAMBIAR" en `index.html`, `robots.txt` y `sitemap.xml` al tener el real.

## Estructura de archivos

Todo organizado en carpetas por tipo. Solo `index.html` y `privacidad.html`
(páginas navegables) quedan en la raíz; lo demás que **debe** vivir en la raíz
por requisito técnico de Cloudflare Pages / estándares web (`_headers`,
`_redirects`, `robots.txt`, `sitemap.xml`, `ads.txt`, `site.webmanifest`,
`functions/`) también se queda ahí — no es cuestión de estilo, esos no
funcionan si se mueven.

```
├── index.html                 ← página principal
├── privacidad.html             ← política de privacidad
├── css/styles.css              ← todo el estilo
├── js/
│   ├── script.js                ← motor: render, cuentas regresivas, sondeo API, goles, favorito, compartir
│   └── data.js                  ← datos de respaldo (DATOS_MUNDIAL)
├── img/                         ← favicon.svg/.ico, icon-192/512.png, apple-touch-icon.png, og-image.png
├── functions/api/partidos.js    ← Cloudflare Pages Function (proxy a football-data.org)
├── _headers / _redirects        ← cabeceras de caché + rewrite de /favicon.ico
├── robots.txt / sitemap.xml / ads.txt / site.webmanifest
├── CLAUDE.md / README.md
```

| Archivo | Qué es | Cuándo tocarlo |
|---|---|---|
| `index.html` | Estructura, SEO (title, metas, OG, JSON-LD), secciones vacías que llena JS | Textos fijos, metas, bloques de AdSense comentados |
| `css/styles.css` | Todo el estilo. Tokens en `:root` | Colores, tipografía, breakpoints (768 / 1080) |
| `js/script.js` | Motor: render, cuentas regresivas, sondeo API, goles, favorito, compartir | Lógica de UI |
| `js/data.js` | **Datos de respaldo** (reales al 2 jul 2026). `DATOS_MUNDIAL` | Actualizar resultados a mano si la API no está conectada |
| `functions/api/partidos.js` | Cloudflare Pages Function: proxy seguro a football-data.org + caché 60 s | Cambiar de proveedor de datos |
| `img/favicon.svg/.ico`, `img/icon-*.png`, `img/apple-touch-icon.png` | Íconos | Regenerar solo si cambia la marca |
| `img/og-image.png` | Imagen para compartir (1200×630) | Igual |
| `site.webmanifest`, `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, `ads.txt` | PWA básico + SEO + cabeceras CF | Dominio final |

## Cómo fluyen los datos

1. `script.js` pinta TODO con `DATOS_MUNDIAL` (respaldo) apenas carga.
2. Luego hace `fetch('/api/partidos')`:
   - **Sin token configurado** → la Function responde `{disponible:false}` y la
     web se queda en respaldo mostrando "Datos al …" en el chip del header.
   - **Con token** → datos reales normalizados; sondeo cada 60 s (solo con la
     pestaña visible), detección de goles (toast + destello + título de pestaña).
3. Estados de partido: `vivo | fin | prog | porconf`. En respaldo, un `vivo`
   con más de ~2 h 45 min o un `prog` ya vencido pasa a `porconf` (no mentimos).

## Actualizar el respaldo a mano

En `data.js` → `DATOS_MUNDIAL.partidos`: cambiar `estado`, `gl`, `gv`,
`penales`, y actualizar `corteDatosUTC`. Los códigos de equipo están en
`DATOS_MUNDIAL.equipos` (alias de otras APIs incluidos).

## Banderas y "Dónde ver"

- **Banderas**: imágenes reales de `flagcdn.com` (campo `iso` de cada equipo,
  incluye `gb-eng` y `gb-sct`). Helper `banderaHTML()` en `script.js` con
  tamaños `b-sm / b-md / b-xl` y respaldo automático al emoji si la imagen
  falla. Sin API key ni límite práctico.
- **Dónde ver**: datos en `DATOS_MUNDIAL.dondeVer` (+ `dondeVerVerificado`
  con la fecha). Verificado el 3 jul 2026 con El Colombiano, Futbolred, CNN,
  Depor e Infobae. Si cambian los derechos, se edita solo ese array.
- **Íconos de canales/streaming**: cada nombre en `tv`/`streaming` que tenga
  entrada exacta en `DATOS_MUNDIAL.canalesInfo` (dominio + url) se muestra
  como chip-enlace con su favicon real (vía `icons.duckduckgo.com`, sin API
  key) gracias a `chipCanal()` en `script.js`. Si agregas un canal nuevo al
  array y no lo pones en `canalesInfo`, simplemente sale como chip de texto
  sin ícono ni link (no rompe nada). Investigado el 3 jul 2026.

## API en vivo

- Proveedor: football-data.org v4, competición `WC` (plan gratuito).
- Variable de entorno en Cloudflare Pages: `FOOTBALL_DATA_TOKEN`.
- La key **nunca** va en el frontend. La Function cachea 60 s para respetar
  el límite gratuito (10 req/min) sin importar cuántos visitantes haya.

## Reglas de estilo del proyecto

- Mobile-first (360 → 768 → 1080). Targets táctiles ≥ 44 px.
- `prefers-reduced-motion` respetado; hovers solo bajo `@media (hover:hover)`.
- Tipos: Anton (display/números) + Archivo (cuerpo). Banderas = emoji.
- El único bloque oscuro es el marcador héroe: es el elemento firma.
