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
- Dominio real en producción: `https://partidosdelmundial2026.pages.dev/` (ya actualizado
  en `index.html`, `privacidad.html`, `robots.txt` y `sitemap.xml` el 4 jul 2026).

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
├── worker-goles/                ← Worker APARTE (Cron Trigger) para push de goles, opcional
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
| `worker-goles/worker.js` + `wrangler.toml` | Worker aparte (Cron Trigger, no Pages Function) que detecta goles y manda push por OneSignal | Solo si activas notificaciones push — no se despliega solo |

## Cómo fluyen los datos

1. `js/script.js` pinta TODO con `DATOS_MUNDIAL` (respaldo) apenas carga.
2. Luego hace `fetch('/api/partidos')`:
   - **Sin token configurado** → la Function responde `{disponible:false}` y la
     web se queda en respaldo mostrando "Datos al …" en el chip del header.
   - **Con token** → datos reales normalizados; sondeo cada 60 s (solo con la
     pestaña visible), detección de goles (toast + destello + título de pestaña).
3. Estados de partido: `vivo | fin | prog | porconf`. En respaldo, un `vivo`
   con más de ~2 h 45 min o un `prog` ya vencido pasa a `porconf` (no mentimos).
4. El héroe, las mini-tarjetas, "Resultados" y el "Cuadro final" son **la misma
   pieza reutilizada** (`cardPartido()` / `lineaEquipo()`) sobre el mismo
   `estado.partidos` — no hay lógica separada por sección. Un gol se refleja
   en las 4 partes a la vez en el próximo sondeo.
5. Si un partido del cuadro depende de una ronda que no se ha jugado,
   `local`/`visita` vienen `null` → se muestra "Por definir" con un ícono de
   círculo punteado (`banderaOTbd()`). Se llena solo cuando la API confirme
   quién avanzó; no hace falta tocar nada.

## Actualizar el respaldo a mano

En `js/data.js` → `DATOS_MUNDIAL.partidos`: cambiar `estado`, `gl`, `gv`,
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
- La key **nunca** va en el frontend. La Function cachea 20 s (`s-maxage=20`
  en `functions/api/partidos.js`, y `INTERVALO_VIVO_MS` igual en `script.js`)
  para respetar el límite gratuito (10 req/min) sin importar cuántos
  visitantes haya — antes era 60 s, se bajó a 20 s el 5 jul 2026 porque un
  gol tardaba demasiado en reflejarse.
- **El retraso real de un gol tiene 2 componentes**: (1) football-data.org
  (la fuente gratuita) no es instantánea, eso no se puede acelerar desde acá;
  (2) la caché de 20 s de arriba. En el peor caso el gol puede tardar
  ~20-40 s en verse, nunca será instantáneo como una transmisión oficial.
- **Confirmado funcionando en producción el 4 jul 2026** (antes de esa fecha
  el archivo de la Function estaba mal ubicado en la raíz en vez de
  `functions/api/`, y por eso nunca se ejecutaba — si algo similar vuelve a
  fallar, lo primero es comprobar que `functions/api/partidos.js` exista
  exactamente en esa ruta).

## Íconos y marcas (nada oficial de FIFA/Adidas)

- **WhatsApp**: ícono real vía SVG inline (`iconoWhatsApp()` en `script.js`),
  no el emoji 📲. Mismo criterio para cualquier ícono de red social futuro.
- **Trofeo y balón**: se usan los emoji genéricos 🏆 (en "Cuadro final" y la
  columna "Gran Final") y ⚽ (logo del header, footer, mensajes de compartir)
  — **a propósito, no fotos reales** del trofeo ni del balón oficial del
  torneo, porque esos sí tienen derechos de FIFA/Adidas (mismo criterio que
  con los logos de selecciones). No agregar imágenes reales de esos objetos.
- **Compartir por WhatsApp**: el texto del mensaje (`urlCompartir()`) incluye
  la bandera emoji de cada equipo (`banderaEmoji()`), tomada del mismo campo
  `bandera` de `DATOS_MUNDIAL.equipos`.

## Reglas de estilo del proyecto

- Mobile-first (360 → 768 → 1080). Targets táctiles ≥ 44 px.
- `prefers-reduced-motion` respetado; hovers solo bajo `@media (hover:hover)`.
- Tipos: Anton (display/números) + Archivo (cuerpo). Banderas = imágenes
  reales de flagcdn.com, con emoji de respaldo si la imagen falla.
- El marcador héroe, el footer y el toast son los únicos bloques que se
  quedan **siempre oscuros** a propósito (el héroe es "el elemento firma"),
  incluso con el modo oscuro activado — ver más abajo.

## Modo oscuro automático (8 jul 2026)

- Sigue `prefers-color-scheme: dark` del sistema, sin switch manual en la UI.
- Todo el sistema de color está en variables CSS (`:root` en `styles.css`);
  el modo oscuro simplemente redefine esas mismas variables dentro de
  `@media (prefers-color-scheme: dark)` **al final del archivo** — a propósito,
  no es solo estética: algunas reglas (como el fondo translúcido de
  `.cabecera`) no usan variable, así que necesitan ganar por orden en el
  archivo, no solo por el `@media`. Si agregas un color nuevo, dale variable
  en vez de un hex directo, o el modo oscuro no lo va a agarrar.
- `--tinta-fija` y `--blanco-fijo` son los 2 tokens que **no cambian nunca**
  con el tema — úsalos para cualquier elemento nuevo que deba quedarse
  oscuro siempre (como el héroe/footer/toast), en vez de `--tinta`/`--blanco`
  normales (esos sí se invierten en modo oscuro).

## Funcionalidades del 8 jul 2026

- **Calendario (.ics)**: `urlICS()` en `script.js` genera el archivo como
  data URI (sin backend), solo para partidos `"prog"` con `inicioUTC` real.
  Botón en las tarjetas mini y en el héroe (`iconoCalendario()`).
- **Cuenta regresiva a la Final**: `renderCuentaFinal()` busca el partido
  `fase === "final"` en `estado.partidos` y reusa el mismo motor de cuentas
  regresivas (`tickCuentas()`, ya genérico sobre cualquier `[data-cd]`). Se
  oculta sola si todavía no hay `inicioUTC` exacto o si la final ya se jugó.
- **Compartir como imagen**: `generarImagenMarcador()` dibuja un canvas
  1080×1350 (4:5, funciona bien en feed y en stories) con banderas reales
  (flagcdn.com tiene CORS abierto, confirmado). Usa `navigator.share` con
  archivos si el navegador lo soporta (abre el share nativo, incluye
  stories); si no, descarga el PNG. El marcador/VS va en su **propia fila**
  debajo de los nombres — si se pone entre las banderas se monta encima
  cuando el resultado tiene 2 dígitos, ojo con eso si se toca ese layout.
- **Notificaciones push**: ver README.md § Notificaciones push de goles para
  la guía de activación completa (necesita cuenta de OneSignal + desplegar
  `worker-goles/` aparte). El SDK en `index.html` está comentado igual que
  el bloque de AdSense, mismo patrón.
