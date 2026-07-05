# ⚽ Mundial 2026 Partidos

Web para seguir el **Mundial 2026** en vivo: marcador del partido que se está
jugando, próximos partidos con cuenta regresiva en tu hora local, resultados de
la eliminación directa, cuadro final completo y la clasificación de los 12
grupos. Hecha con **HTML, CSS y JavaScript vanilla** (sin frameworks, sin
build), lista para **Cloudflare Pages**.

> Sitio de aficionados, sin afiliación con la FIFA. No usa logos ni marcas
> registradas del torneo.

**🔴 En vivo:** desplegado en [partidosdelmundial2026.pages.dev](https://partidosdelmundial2026.pages.dev/),
con `FOOTBALL_DATA_TOKEN` configurado y confirmado funcionando desde el 4 jul 2026.

---

## ✨ Qué hace

- **Marcador héroe**: el partido en vivo (o el próximo, con cuenta regresiva gigante).
- **Banderas reales** de los 48 países (imágenes de flagcdn.com — gratis, sin API key,
  se ven igual en Windows, Android e iPhone; si una falla, cae al emoji automáticamente).
- **📺 Dónde ver**: canales de TV y streaming con derechos en 6 países
  (Colombia destacada), verificados con prensa del 3 jul 2026, cada uno con
  su favicon real (vía DuckDuckGo, sin API key) y enlace directo al sitio oficial.
- **Hoy y próximos**: carril deslizable con cuenta regresiva por partido.
- **Resultados**: eliminación directa con ganador en negrita, penales y prórroga marcados.
- **🏆 Cuadro final**: de octavos a la Gran Final del 19 de julio, deslizable.
  Las llaves aún no definidas muestran un círculo punteado "?" en vez de una
  bandera (se llenan solas apenas la API confirma quién avanza).
- **Grupos**: las 12 tablas con los clasificados marcados (acordeón en móvil).
- **⭐ Mi selección**: elige tu equipo y sus partidos se destacan y fijan primero (se guarda en tu navegador).
- **Compartir por WhatsApp**: cada partido tiene botón con ícono real de WhatsApp
  (SVG, no emoji) y mensaje con banderas de los dos equipos.
- **Modo EN VIVO**: si conectas la API, se actualiza solo cada 20 s, detecta
  goles (aviso + destello + título de la pestaña con el marcador) y muestra la
  hora de última actualización. Aun así, un gol puede tardar unos segundos
  extra en verse porque la fuente gratuita (football-data.org) no es instantánea.
- **Modo respaldo**: sin API, la web funciona igual con datos reales embebidos
  y lo dice honestamente en el chip del header ("Datos al …").
- Horarios convertidos automáticamente a la **hora local del visitante**.

## 📁 Estructura

```
mundial26/
├── index.html              ← estructura + SEO completo
├── privacidad.html         ← política de privacidad
├── css/
│   └── styles.css          ← estilos (mobile-first)
├── js/
│   ├── script.js           ← lógica de la página
│   └── data.js             ← datos de respaldo (reales al 2 jul 2026)
├── img/
│   ├── favicon.svg / favicon.ico / icon-192.png / icon-512.png
│   └── apple-touch-icon.png / og-image.png
├── functions/
│   └── api/partidos.js     ← Cloudflare Pages Function (proxy API segura)
├── site.webmanifest / robots.txt / sitemap.xml / ads.txt
├── _headers / _redirects
├── CLAUDE.md               ← contexto interno del proyecto
└── README.md               ← este archivo
```

> Solo `index.html` y `privacidad.html` quedan en la raíz por ser páginas
> navegables. `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `ads.txt`,
> `site.webmanifest` y `functions/` **deben** estar en la raíz — es un
> requisito técnico de Cloudflare Pages / de los estándares web, no se pueden
> mover a una subcarpeta.

## 🖥️ Probar en local

Con cualquier servidor estático:

```bash
# opción rápida
npx serve .
# o
python3 -m http.server 8080
```

La Function `/api/partidos` **no corre** con esos servidores (es de Cloudflare).
Para probarla en local:

```bash
npm install -g wrangler
wrangler pages dev . 
# con token:  wrangler pages dev . --binding FOOTBALL_DATA_TOKEN=tu_token
```

Sin la Function, la web usa el respaldo — así está diseñada.

## 🚀 Subir a Cloudflare Pages

1. Sube la carpeta a un repositorio de GitHub (o usa carga directa).
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Framework preset: **None** · Build command: *(vacío)* · Output directory: `/`.
4. Deploy. Cloudflare detecta `functions/` automáticamente y publica `/api/partidos`.

### Conectar los marcadores EN VIVO (5 minutos)

1. Crea una cuenta gratis en **football-data.org** y copia tu API token
   (el plan gratuito incluye la Copa del Mundo, 10 peticiones/min).
2. En tu proyecto de Pages: **Settings → Environment variables → Add**:
   - Nombre: `FOOTBALL_DATA_TOKEN` · Valor: tu token · Entorno: Production.
3. **Redeploy**. Listo: el chip del header pasará a "🔴 EN VIVO · Actualizado…".

La key queda solo en el servidor de Cloudflare (nunca en el navegador) y la
Function cachea 20 s (compartido entre todos los visitantes a la vez, no por
persona), así que aunque entren miles de personas, a la API le llega como
mucho ~3 peticiones por minuto — bien lejos del límite gratuito de 10/min.

> Alternativas de API si algún día la cambias: API-Football (100 req/día
> gratis, actualiza cada 15 s) o KickoffAPI (100 req/día gratis). Solo habría
> que adaptar `functions/api/partidos.js`; el frontend no se toca.

### Actualizar el respaldo a mano (opcional)

Si no conectas API, edita `js/data.js` → cambia `estado`, `gl`, `gv`, `penales`
del partido y la fecha `corteDatosUTC`. Dos minutos por jornada.

## 🔍 SEO — qué ya está hecho y qué te toca a ti

**Ya incluido en el código:**
- Título optimizado: *"Mundial 2026 Partidos — Resultados en vivo, marcadores, grupos y cuadro final"*.
- Meta description, keywords, canonical, `robots` meta.
- Open Graph + Twitter Card con `og-image.png` (se ve bonito al compartir en WhatsApp/redes).
- Datos estructurados JSON-LD (`WebSite` + `SportsEvent`).
- `robots.txt` + `sitemap.xml`.
- HTML semántico, headings correctos, texto estático indexable, carga rápida.

**Checklist tuya después del deploy:**
1. ~~Buscar `CAMBIAR` en `index.html`, `robots.txt` y `sitemap.xml`~~ — ya hecho,
   todo apunta a `partidosdelmundial2026.pages.dev` (4 jul 2026).
2. Opcional a futuro: **dominio propio** (ej. `mundial2026partidos.com`) —
   Cloudflare Pages lo conecta gratis y posiciona/monetiza mejor que `.pages.dev`.
3. Registrar el sitio en **Google Search Console** → verificar propiedad → enviar `sitemap.xml`. Esto es lo que hace que Google te indexe rápido.
4. Compartir la URL (WhatsApp, grupos, redes): los primeros enlaces y visitas ayudan muchísimo al posicionamiento.

## 💰 Monetización (cuando tengas tráfico)

### Google AdSense

Los dos huecos de anuncio ya están en `index.html` **comentados y con el
código de Google AdSense ya escrito** (busca "ESPACIO PUBLICITARIO"), y la
página `privacidad.html` (requisito de AdSense) ya existe y está enlazada en
el footer. Para activarlo cuando tengas la cuenta aprobada:

1. Crea tu cuenta en [adsense.google.com](https://adsense.google.com),
   agrega el sitio y espera la aprobación (requiere dominio propio, contenido
   original — ambos ya los tienes).
2. Copia tu ID de editor (`ca-pub-XXXXXXXXXXXXXXXX`, en Cuenta → Información de
   la cuenta) y reemplázalo en 3 lugares: el `<script>` comentado en el
   `<head>` de `index.html`, y en los dos bloques `data-ad-client`.
3. Crea un bloque de anuncios "En el contenido" en el panel de AdSense por
   cada "ESPACIO PUBLICITARIO", copia su `data-ad-slot` y pégalo en el bloque
   correspondiente.
4. Descomenta el `<script>` del `<head>` y los dos bloques `<div class="anuncio">`.
5. Reemplaza el ID de editor en `ads.txt` y descomenta esa línea (evita
   advertencias de "vendedor no autorizado" en AdSense).

Pagan por impresiones/clics (RPM).

### Otras formas de monetizar

1. **Afiliados**: camisetas y productos de fútbol (Amazon Afiliados), o
   servicios de streaming/VPN ("dónde ver el partido" es de lo más buscado en
   un Mundial).
2. **Patrocinio local**: un banner "Traído por [negocio]" — perfecto con tus
   clientes de JX Studio.
3. **Donaciones**: botón Ko-fi/PayPal en el footer.

## 🗺️ Ideas de mejora (roadmap)

**Siguientes en la lista (acordado 4 jul 2026):**
- [ ] Botón "Añadir a mi calendario" (.ics) en cada partido.
- [ ] Cuenta regresiva a la Gran Final del 19 de julio en el footer.
- [ ] Compartir el marcador como imagen (canvas) para stories de Instagram/WhatsApp.
- [ ] Notificaciones push de goles (OneSignal) — requiere además un Cloudflare
      Cron Trigger que vigile la API en segundo plano y dispare el push; no es
      solo agregar el SDK.
- [ ] Modo oscuro automático según el sistema — ojo: el marcador héroe es hoy
      *"el único bloque oscuro... el elemento firma"* (ver arriba). Aplicarlo a
      todo el sitio es una decisión de rediseño, no un ajuste cosmético rápido.

**Otras ideas, sin fecha:**
- Página "¿Dónde ver el partido?" por país (oro para SEO + afiliados).
- Polla/quiniela de predicciones con ranking de amigos.
- PWA completa (service worker) para funcionar offline.
- Versión en inglés (`/en/`) cuando el tráfico lo pida.

---

Hecho por **JX Studio** · Cartagena, Colombia 🇨🇴
