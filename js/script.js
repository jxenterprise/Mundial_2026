/* ============================================================
   MUNDIAL 2026 PARTIDOS — script.js
   Motor de la página:
   1) Pinta todo con los datos de respaldo (data.js).
   2) Intenta conectar la API en vivo (/api/partidos).
   3) Si responde, actualiza cada 60 s, detecta goles y avisa.
   ============================================================ */

(function () {
  "use strict";

  const TITULO_BASE = document.title;
  const INTERVALO_VIVO_MS = 20_000;      // sondeo cuando la API funciona (igual al s-maxage de la Function)
  const REINTENTO_API_MS  = 5 * 60_000;  // reintento silencioso si falla
  const VIVO_CADUCA_MIN   = 165;         // en modo respaldo, un "vivo" viejo pasa a "por confirmar"

  /* ---------------- Estado global ---------------- */
  const estado = {
    partidos: DATOS_MUNDIAL.partidos.map(p => ({ ...p })),
    grupos: DATOS_MUNDIAL.grupos,
    fuente: "respaldo",                 // 'respaldo' | 'api'
    ultimaActualizacion: null,
    favorito: null,
    marcadoresPrevios: new Map(),       // id -> "gl-gv" para detectar goles
    timerSondeo: null,
  };

  try { estado.favorito = localStorage.getItem("m26_fav") || null; } catch (_) {}

  /* ---------------- Utilidades ---------------- */
  const $  = (sel, raiz = document) => raiz.querySelector(sel);
  const eq = code => DATOS_MUNDIAL.equipos[code] || null;

  const fmtFecha = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short" });
  const fmtHora  = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" });
  const fmtHMS   = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  function fechaHoraLocal(p) {
    if (!p.inicioUTC) return p.fechaTexto || "Fecha por definir";
    const d = new Date(p.inicioUTC);
    return `${fmtFecha.format(d)} · ${fmtHora.format(d)}`;
  }

  function nombreDe(p, lado) {
    const code = lado === "L" ? p.local : p.visita;
    if (code && eq(code)) return eq(code).nombre;
    if (code) return code; // equipo que la API conoce pero nuestro mapa no
    return lado === "L" ? (p.placeholderL || "Por definir") : (p.placeholderV || "Por definir");
  }

  /* Bandera como imagen real (flagcdn.com, gratis y sin API key).
     Si la imagen falla, cae automáticamente al emoji.
     Tamaños: b-sm (tablas), b-md (tarjetas), b-xl (marcador héroe). */
  function banderaHTML(code, clase = "b-md") {
    const e = code && eq(code);
    if (!e || !e.iso) {
      return `<span class="bandera-emoji ${clase}">${e ? e.bandera : "🏳️"}</span>`;
    }
    const anchos = { "b-sm": 40, "b-md": 80, "b-xl": 160 };
    const w = anchos[clase] || 80;
    const fb = `<span class='bandera-emoji ${clase}'>${e.bandera}</span>`;
    return `<img class="bandera-img ${clase}" src="https://flagcdn.com/w${w}/${e.iso}.png"` +
           ` alt="Bandera de ${e.nombre}" loading="lazy" decoding="async"` +
           ` data-fb="${fb}" onerror="this.outerHTML=this.dataset.fb">`;
  }

  /* Icono real de WhatsApp (SVG inline, sin depender de una CDN ni de la
     tipografía de emoji del sistema). clase controla el tamaño por CSS. */
  function iconoWhatsApp(clase = "ico-md") {
    return `<svg class="icono-ws ${clase}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">` +
      `<circle cx="16" cy="16" r="16" fill="#25D366"/>` +
      `<path fill="#fff" d="M23.47 19.34c-.4-.2-2.35-1.16-2.71-1.29-.36-.13-.63-.2-.89.2-.27.4-1.02 1.29-1.25 1.55-.23.27-.46.3-.86.1-.4-.2-1.67-.62-3.19-1.97-1.18-1.05-1.97-2.35-2.2-2.75-.23-.4-.03-.61.17-.81.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.27.06-.5-.03-.7-.1-.2-.89-2.15-1.22-2.94-.32-.78-.65-.67-.89-.68-.23-.01-.5-.01-.76-.01-.27 0-.7.1-1.06.5-.36.4-1.39 1.35-1.39 3.3 0 1.95 1.42 3.83 1.62 4.1.2.26 2.8 4.27 6.78 5.98.94.41 1.68.65 2.26.84.95.3 1.81.26 2.5.16.76-.11 2.35-.96 2.68-1.89.33-.92.33-1.71.23-1.88-.1-.16-.36-.26-.76-.46z"/>` +
      `<path fill="#fff" d="M16.01 5.33c-5.89 0-10.68 4.79-10.68 10.68 0 1.89.5 3.72 1.43 5.35L5.33 26.67l5.44-1.43a10.65 10.65 0 0 0 5.24 1.34c5.89 0 10.68-4.79 10.68-10.68 0-2.85-1.11-5.54-3.13-7.56a10.61 10.61 0 0 0-7.55-3.01zm0 19.54a8.85 8.85 0 0 1-4.51-1.24l-.33-.19-3.35.88.9-3.27-.21-.34a8.83 8.83 0 0 1-1.36-4.71c0-4.89 3.98-8.86 8.87-8.86a8.81 8.81 0 0 1 6.27 2.6 8.81 8.81 0 0 1 2.59 6.27c0 4.89-3.98 8.86-8.87 8.86z"/>` +
      `</svg>`;
  }

  /* Bandera del equipo, o un círculo punteado con "?" si esa llave del
     cuadro todavía depende de una ronda que no se ha jugado. */
  function banderaOTbd(code, clase = "b-md") {
    return code ? banderaHTML(code, clase) : `<span class="bandera-tbd ${clase}" aria-hidden="true">?</span>`;
  }

  function esFav(p) {
    return estado.favorito && (p.local === estado.favorito || p.visita === estado.favorito);
  }

  function textoMarcador(p) {
    return (p.gl ?? "–") + " – " + (p.gv ?? "–");
  }

  function banderaEmoji(p, lado) {
    const code = lado === "L" ? p.local : p.visita;
    const e = code && eq(code);
    return e ? e.bandera : "";
  }

  function urlCompartir(p) {
    const base = location.origin + location.pathname;
    const bL = banderaEmoji(p, "L"), bV = banderaEmoji(p, "V");
    const nL = nombreDe(p, "L"), nV = nombreDe(p, "V");
    let texto;
    if (p.estado === "fin") {
      texto = `⚽ Mundial 2026 · ${DATOS_MUNDIAL.nombresFase[p.fase] || ""}\n` +
              `${bL} ${nL} ${p.gl} – ${p.gv} ${nV} ${bV}` +
              (p.penales ? ` (${p.penales.l}-${p.penales.v} en penales)` : "") +
              `\nTodos los resultados 👉 ${base}`;
    } else if (p.estado === "vivo") {
      texto = `🔴 EN VIVO · Mundial 2026\n${bL} ${nL} ${p.gl} – ${p.gv} ${nV} ${bV}\nSíguelo aquí 👉 ${base}`;
    } else {
      texto = `⚽ Mundial 2026 · ${DATOS_MUNDIAL.nombresFase[p.fase] || ""}\n` +
              `${bL} ${nL} vs ${nV} ${bV} — ${fechaHoraLocal(p)} (tu hora local)\n` +
              `Horarios y marcadores 👉 ${base}`;
    }
    return "https://wa.me/?text=" + encodeURIComponent(texto);
  }

  /* Icono de calendario (SVG inline, mismo criterio que el de WhatsApp). */
  function iconoCalendario(clase = "ico-md") {
    return `<svg class="icono-cal ${clase}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">` +
      `<rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.8"/>` +
      `<path d="M3 9.5H21" stroke="currentColor" stroke-width="1.8"/>` +
      `<path d="M7.5 2.5V6.5M16.5 2.5V6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>` +
      `<rect x="6.5" y="12" width="3.4" height="3.4" rx=".8" fill="currentColor"/>` +
      `</svg>`;
  }

  /* Archivo .ics de un partido programado (duración estimada de 2 h),
     devuelto como data URI listo para usar en href+download. */
  function urlICS(p) {
    if (!p.inicioUTC) return null;
    const inicio = new Date(p.inicioUTC);
    const fin = new Date(inicio.getTime() + 2 * 60 * 60 * 1000);
    const aFecha = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const resumen = `${nombreDe(p, "L")} vs ${nombreDe(p, "V")} · Mundial 2026`;
    const desc = `${DATOS_MUNDIAL.nombresFase[p.fase] || ""} del Mundial 2026. Más info: ${location.origin}${location.pathname}`;
    const lineas = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mundial 2026 Partidos//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:partido-${p.id}@partidosdelmundial2026.pages.dev`,
      `DTSTAMP:${aFecha(new Date())}`,
      `DTSTART:${aFecha(inicio)}`,
      `DTEND:${aFecha(fin)}`,
      `SUMMARY:${resumen}`,
      `DESCRIPTION:${desc}`,
      p.estadio ? `LOCATION:${p.estadio}` : null,
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(lineas);
  }

  /* ---------------- Compartir el marcador como imagen (canvas) ---------------- */
  function cargarImagen(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function dibujarBanderaRedondeada(ctx, img, x, y, w, h, r) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  /* Reduce el tamaño de fuente hasta que el texto quepa en maxAncho. */
  function ajustarFuente(ctx, texto, maxAncho, tamInicial, pesoFamilia) {
    let tam = tamInicial;
    ctx.font = `${pesoFamilia} ${tam}px Archivo`;
    while (ctx.measureText(texto).width > maxAncho && tam > 26) {
      tam -= 4;
      ctx.font = `${pesoFamilia} ${tam}px Archivo`;
    }
    return tam;
  }

  async function dibujarEquipoEnImagen(ctx, p, lado, x, yBandera, banderaW, banderaH) {
    const code = lado === "L" ? p.local : p.visita;
    const equipo = code && eq(code);
    const cx = x + banderaW / 2;
    try {
      if (!equipo || !equipo.iso) throw new Error("sin bandera real");
      const img = await cargarImagen(`https://flagcdn.com/w640/${equipo.iso}.png`);
      dibujarBanderaRedondeada(ctx, img, x, yBandera, banderaW, banderaH, 20);
    } catch {
      ctx.textAlign = "center";
      ctx.font = "180px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(equipo ? equipo.bandera : "🏳️", cx, yBandera + banderaH / 2 + 60);
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    const nombre = (equipo ? equipo.nombre : "Por definir").toUpperCase();
    const tam = ajustarFuente(ctx, nombre, banderaW + 30, 46, "800");
    ctx.font = `800 ${tam}px Archivo`;
    ctx.fillText(nombre, cx, yBandera + banderaH + 70);
  }

  async function generarImagenMarcador(p) {
    await Promise.all([
      document.fonts.load("900 90px Anton"),
      document.fonts.load("800 40px Archivo"),
      document.fonts.load("700 30px Archivo"),
    ]);

    const W = 1080, H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const fondo = ctx.createLinearGradient(0, 0, 0, H);
    fondo.addColorStop(0, "#10142e");
    fondo.addColorStop(1, "#080a1a");
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, W, H);

    // Atmósfera tricolor (mismo lenguaje visual que el marcador héroe en la web)
    const glowVerde = ctx.createRadialGradient(80, H - 260, 0, 80, H - 260, 620);
    glowVerde.addColorStop(0, "rgba(13,138,78,.35)");
    glowVerde.addColorStop(1, "rgba(13,138,78,0)");
    ctx.fillStyle = glowVerde;
    ctx.fillRect(0, 0, W, H);
    const glowAzul = ctx.createRadialGradient(W - 60, H - 180, 0, W - 60, H - 180, 560);
    glowAzul.addColorStop(0, "rgba(30,63,174,.35)");
    glowAzul.addColorStop(1, "rgba(30,63,174,0)");
    ctx.fillStyle = glowAzul;
    ctx.fillRect(0, 0, W, H);

    const franja = W / 3;
    ctx.fillStyle = "#0d8a4e"; ctx.fillRect(0, 0, franja, 14);
    ctx.fillStyle = "#e0243f"; ctx.fillRect(franja, 0, franja, 14);
    ctx.fillStyle = "#1e3fae"; ctx.fillRect(franja * 2, 0, W - franja * 2, 14);
    ctx.fillStyle = "#0d8a4e"; ctx.fillRect(0, H - 14, franja, 14);
    ctx.fillStyle = "#e0243f"; ctx.fillRect(franja, H - 14, franja, 14);
    ctx.fillStyle = "#1e3fae"; ctx.fillRect(franja * 2, H - 14, W - franja * 2, 14);

    ctx.textAlign = "center";
    ctx.fillStyle = "#8f98c8";
    ctx.font = "700 30px Archivo";
    ctx.fillText("MUNDIAL 2026 · PARTIDOS", W / 2, 110);

    ctx.fillStyle = "#f2b705";
    ctx.font = "800 34px Archivo";
    ctx.fillText((DATOS_MUNDIAL.nombresFase[p.fase] || "").toUpperCase(), W / 2, 168);

    const banderaW = 300, banderaH = 210, yBandera = 320;
    const xL = W / 2 - banderaW - 40, xV = W / 2 + 40;
    await dibujarEquipoEnImagen(ctx, p, "L", xL, yBandera, banderaW, banderaH);
    await dibujarEquipoEnImagen(ctx, p, "V", xV, yBandera, banderaW, banderaH);

    // Marcador o "VS" en su propia fila, debajo de los nombres (a todo el ancho,
    // nunca se monta sobre las banderas sin importar cuántos dígitos tenga el resultado)
    const yNombres = yBandera + banderaH + 70;
    const yMarcador = yNombres + 140;
    ctx.textAlign = "center";
    if (p.estado === "fin" || p.estado === "vivo") {
      ctx.fillStyle = "#fff";
      ctx.font = "900 130px Anton";
      ctx.fillText(`${p.gl ?? 0} - ${p.gv ?? 0}`, W / 2, yMarcador);
    } else {
      ctx.fillStyle = "#f2b705";
      ctx.font = "900 80px Anton";
      ctx.fillText("VS", W / 2, yMarcador);
    }

    ctx.font = "700 34px Archivo";
    ctx.fillStyle = "#c8cde8";
    const estadoTxt = p.penales ? `PENALES ${p.penales.l}-${p.penales.v}`
      : p.estado === "fin" ? "RESULTADO FINAL"
      : p.estado === "vivo" ? "🔴 EN VIVO"
      : `${fechaHoraLocal(p).toUpperCase()} · TU HORA LOCAL`;
    ctx.fillText(estadoTxt, W / 2, yMarcador + 100);

    ctx.font = "700 28px Archivo";
    ctx.fillStyle = "#8f98c8";
    ctx.fillText("⚽ partidosdelmundial2026.pages.dev", W / 2, H - 46);

    return canvas;
  }

  async function compartirImagenPartido(id) {
    const p = estado.partidos.find(x => x.id == id);
    if (!p) return;
    let canvas;
    try {
      canvas = await generarImagenMarcador(p);
    } catch (err) {
      return;
    }
    canvas.toBlob(async blob => {
      if (!blob) return;
      const nombreArchivo = `mundial2026-${p.local || "tbd"}-${p.visita || "tbd"}.png`;
      const file = new File([blob], nombreArchivo, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Mundial 2026 Partidos" }); }
        catch (err) { /* el usuario canceló el share */ }
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  /* En modo respaldo, un partido "vivo" con hora de inicio muy vieja
     ya debió terminar: lo mostramos como "por confirmar" para no mentir.
     Devuelve true si algún estado cambió (para repintar solo si hace falta). */
  function normalizarRespaldo() {
    if (estado.fuente !== "respaldo") return false;
    const ahora = Date.now();
    let cambios = false;
    estado.partidos.forEach(p => {
      if (p.estado === "vivo" && p.inicioUTC) {
        const min = (ahora - new Date(p.inicioUTC).getTime()) / 60000;
        if (min > VIVO_CADUCA_MIN) { p.estado = "porconf"; cambios = true; }
      }
      if (p.estado === "prog" && p.inicioUTC && new Date(p.inicioUTC).getTime() < ahora - 10 * 60000) {
        p.estado = "porconf"; cambios = true; // ya debería haber empezado y no tenemos datos frescos
      }
    });
    return cambios;
  }

  /* ---------------- Plantillas ---------------- */
  function etiquetaEstado(p) {
    if (p.estado === "vivo")    return `<span class="tag tag-vivo">● EN VIVO</span>`;
    if (p.estado === "fin")     return `<span class="tag tag-fin">Final</span>`;
    if (p.estado === "porconf") return `<span class="tag tag-porconf">Por confirmar</span>`;
    return `<span class="tag tag-prog">Programado</span>`;
  }

  function lineaEquipo(p, lado) {
    const code   = lado === "L" ? p.local : p.visita;
    const goles  = lado === "L" ? p.gl : p.gv;
    const rival  = lado === "L" ? p.gv : p.gl;
    const tbd    = !code;
    const gano   = p.estado === "fin" && goles !== null && (
                     goles > rival ||
                     (p.penales && (lado === "L" ? p.penales.l > p.penales.v : p.penales.v > p.penales.l))
                   );
    const perdio = p.estado === "fin" && !gano;
    return `
      <div class="cp-linea">
        <span class="cp-bandera" aria-hidden="true">${banderaOTbd(code, "b-md")}</span>
        <span class="cp-nombre ${gano ? "ganador" : ""} ${tbd ? "tbd" : ""}">${nombreDe(p, lado)}${esFavCode(code) ? " ⭐" : ""}</span>
        <span class="cp-gol ${perdio ? "perdedor" : ""}">${goles ?? ""}</span>
      </div>`;
  }

  function esFavCode(code) { return code && code === estado.favorito; }

  function cardPartido(p, opciones = {}) {
    const notaPen = p.penales ? `<span class="tag tag-nota">Pen. ${p.penales.l}-${p.penales.v}</span>` : "";
    const notaTxt = p.nota && !p.penales ? `<span class="tag tag-nota">${p.nota}</span>` : "";
    const cuenta  = (p.estado === "prog" && p.inicioUTC && !opciones.sinCuenta)
      ? `<span class="cuenta-mini" data-cd="${p.inicioUTC}"></span>` : "";
    const lugar = p.estadio ? ` · ${p.estadio}` : "";
    return `
      <article class="card-partido ${esFav(p) ? "es-fav" : ""}" data-id="${p.id}">
        <div class="cp-meta">
          <span class="cp-fase">${DATOS_MUNDIAL.nombresFase[p.fase] || ""}${lugar}</span>
          ${etiquetaEstado(p)}
        </div>
        <div class="cp-equipos">
          ${lineaEquipo(p, "L")}
          ${lineaEquipo(p, "V")}
        </div>
        <div class="cp-pie">
          <span class="cp-hora">${p.estado === "fin" ? fechaHoraLocal(p) : `<strong>${fechaHoraLocal(p)}</strong>`}</span>
          ${cuenta}
          ${p.estado === "prog" && p.inicioUTC ? `<a class="btn-mini" href="${urlICS(p)}"
             download="mundial2026-${p.local || "tbd"}-${p.visita || "tbd"}.ics"
             aria-label="Añadir al calendario">${iconoCalendario("ico-sm")}</a>` : ""}
          <a class="btn-mini" href="${urlCompartir(p)}" target="_blank" rel="noopener"
             aria-label="Compartir por WhatsApp">${iconoWhatsApp("ico-sm")}</a>
        </div>
        ${notaPen || notaTxt ? `<div class="cp-meta">${notaPen}${notaTxt}</div>` : ""}
      </article>`;
  }

  /* ---------------- Render: héroe ---------------- */
  function renderHero() {
    const cont = $("#hero-contenido");
    const vivos = estado.partidos.filter(p => p.estado === "vivo");
    const proximos = estado.partidos
      .filter(p => p.estado === "prog" && p.inicioUTC)
      .sort((a, b) => new Date(a.inicioUTC) - new Date(b.inicioUTC));

    let p, modo;
    if (vivos.length) { p = vivos[0]; modo = "vivo"; }
    else if (proximos.length) { p = proximos[0]; modo = "proximo"; }
    else {
      // Sin partidos en vivo ni programados con hora: mostramos el último resultado
      const jugados = estado.partidos
        .filter(x => x.estado === "fin" && x.inicioUTC)
        .sort((a, b) => new Date(b.inicioUTC) - new Date(a.inicioUTC));
      if (!jugados.length) {
        cont.innerHTML = "";
        $("#proximos-mini").innerHTML = "";
        return;
      }
      p = jugados[0]; modo = "ultimo";
    }

    const lugar = [DATOS_MUNDIAL.nombresFase[p.fase], p.estadio].filter(Boolean).join(" · ");
    let centro;
    if (modo === "vivo") {
      centro = `<span class="badge-vivo">En vivo</span>
         <div class="m-marcador" data-id-hero="${p.id}">${textoMarcador(p)}</div>
         ${p.penales ? `<div class="m-penales">Penales ${p.penales.l} – ${p.penales.v}</div>` : ""}`;
    } else if (modo === "proximo") {
      centro = `<span class="badge-estado">Próximo partido</span>
         <div class="m-cuenta" data-cd="${p.inicioUTC}">--:--:--</div>
         <div class="m-cuenta-etq">${fechaHoraLocal(p)} · tu hora local</div>`;
    } else {
      centro = `<span class="badge-estado">Último resultado</span>
         <div class="m-marcador">${textoMarcador(p)}</div>
         ${p.penales ? `<div class="m-penales">Penales ${p.penales.l} – ${p.penales.v}</div>` : ""}`;
    }

    cont.innerHTML = `
      <div class="marcador" data-id="${p.id}">
        <p class="m-fase">${modo === "vivo" ? "Se juega ahora" : modo === "proximo" ? "Lo que viene" : "Así terminó"}</p>
        <p class="m-lugar">${lugar}</p>
        <div class="m-fila">
          <div class="m-equipo">
            <span class="m-bandera" aria-hidden="true">${banderaOTbd(p.local, "b-xl")}</span>
            <span class="m-nombre">${nombreDe(p, "L")}</span>
          </div>
          <div class="m-centro">${centro}</div>
          <div class="m-equipo">
            <span class="m-bandera" aria-hidden="true">${banderaOTbd(p.visita, "b-xl")}</span>
            <span class="m-nombre">${nombreDe(p, "V")}</span>
          </div>
        </div>
        <div class="m-acciones">
          ${modo === "proximo" && p.inicioUTC ? `<a class="btn-ws" href="${urlICS(p)}"
             download="mundial2026-${p.local || "tbd"}-${p.visita || "tbd"}.ics">${iconoCalendario("ico-md")} Añadir al calendario</a>` : ""}
          <a class="btn-ws" href="${urlCompartir(p)}" target="_blank" rel="noopener">${iconoWhatsApp("ico-md")} Compartir por WhatsApp</a>
          <button type="button" class="btn-ws" data-img-id="${p.id}">📸 Compartir imagen</button>
        </div>
      </div>`;

    // Mini: los 2 siguientes partidos después del destacado
    const mini = proximos.filter(x => x.id !== p.id).slice(0, 2);
    $("#proximos-mini").innerHTML = mini.map(m => cardPartido(m)).join("");
  }

  /* ---------------- Render: próximos ---------------- */
  function renderProximos() {
    const lista = estado.partidos
      .filter(p => (p.estado === "prog" || p.estado === "vivo") && p.inicioUTC)
      .sort((a, b) => {
        if (a.estado === "vivo" && b.estado !== "vivo") return -1;
        if (b.estado === "vivo" && a.estado !== "vivo") return 1;
        return new Date(a.inicioUTC) - new Date(b.inicioUTC);
      });
    // Mi selección primero
    lista.sort((a, b) => (esFav(b) ? 1 : 0) - (esFav(a) ? 1 : 0));
    $("#lista-proximos").innerHTML = lista.length
      ? lista.map(p => cardPartido(p)).join("")
      : `<p class="seccion-nota">No hay partidos programados por ahora.</p>`;
  }

  /* ---------------- Render: resultados ---------------- */
  function renderResultados() {
    const lista = estado.partidos
      .filter(p => p.estado === "fin" || p.estado === "porconf")
      .sort((a, b) => new Date(b.inicioUTC || 0) - new Date(a.inicioUTC || 0));
    $("#lista-resultados").innerHTML =
      lista.map(p => cardPartido(p, { sinCuenta: true })).join("");
  }

  /* ---------------- Render: cuadro ---------------- */
  function renderCuadro() {
    const fases = [
      { clave: "octavos", titulo: "Octavos" },
      { clave: "cuartos", titulo: "Cuartos" },
      { clave: "semis",   titulo: "Semifinales" },
      { clave: "final",   titulo: "🏆 Gran Final", esFinal: true },
    ];
    const html = fases.map(f => {
      let partidos = estado.partidos.filter(p => p.fase === f.clave);
      if (f.clave === "final") {
        partidos = partidos.concat(estado.partidos.filter(p => p.fase === "tercer"));
      }
      const llaves = partidos.map(p => cardPartido(p, { sinCuenta: true })).join("");
      return `
        <div class="col-fase ${f.esFinal ? "es-final" : ""}">
          <div class="col-titulo">${f.titulo}</div>
          <div class="llaves">${llaves}</div>
        </div>`;
    }).join("");
    $("#cuadro-contenido").innerHTML = html;
  }

  /* ---------------- Render: grupos ---------------- */
  function renderGrupos() {
    const abrirTodos = window.matchMedia("(min-width: 768px)").matches;
    // Recordar qué grupos abrió la persona (para no cerrárselos al repintar)
    const abiertos = new Set(
      Array.from(document.querySelectorAll("#grupos-contenido details[open]"))
        .map(d => d.dataset.letra)
    );
    $("#grupos-contenido").innerHTML = estado.grupos.map(g => `
      <details class="grupo" data-letra="${g.letra}" ${abrirTodos || abiertos.has(g.letra) ? "open" : ""}>
        <summary>
          <span class="letra">${g.letra}</span> Grupo ${g.letra}
          <span class="flecha" aria-hidden="true">▾</span>
        </summary>
        <table>
          <thead>
            <tr>
              <th>Equipo</th><th class="num">PJ</th><th class="num">G</th>
              <th class="num">E</th><th class="num">P</th><th class="num">Pts</th>
            </tr>
          </thead>
          <tbody>
            ${g.filas.map(f => {
              const e = eq(f.code);
              return `
                <tr class="${f.clasificado ? "fila-clasificado" : ""} ${esFavCode(f.code) ? "fila-fav" : ""}">
                  <td><span class="celda-equipo"><span class="band">${banderaHTML(f.code, "b-sm")}</span><span class="nom">${e.nombre}</span></span></td>
                  <td class="num">${f.pj}</td><td class="num">${f.g}</td>
                  <td class="num">${f.e}</td><td class="num">${f.p}</td>
                  <td class="num pts">${f.pts}</td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </details>`).join("");
  }

  /* ---------------- Render: dónde ver ---------------- */
  /* Chip de un canal/app de "Dónde ver": si conocemos su dominio oficial
     (DATOS_MUNDIAL.canalesInfo), muestra su favicon real y enlaza directo
     a su sitio. Si no lo conocemos, cae al chip de solo texto de siempre. */
  function chipCanal(nombre, claseTipo) {
    const info = DATOS_MUNDIAL.canalesInfo && DATOS_MUNDIAL.canalesInfo[nombre];
    if (!info) return `<span class="chip ${claseTipo}">${nombre}</span>`;
    const favicon = `https://icons.duckduckgo.com/ip3/${info.dominio}.ico`;
    return `<a class="chip ${claseTipo}" href="${info.url}" target="_blank" rel="noopener">` +
           `<img class="chip-ico" src="${favicon}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` +
           `${nombre}</a>`;
  }

  function renderDondeVer() {
    const cont = $("#dondever-contenido");
    if (!cont || !Array.isArray(DATOS_MUNDIAL.dondeVer)) return;
    const fecha = $("#dv-fecha");
    if (fecha) fecha.textContent = DATOS_MUNDIAL.dondeVerVerificado || "";
    cont.innerHTML = DATOS_MUNDIAL.dondeVer.map(d => `
      <article class="dv-card ${d.destacada ? "destacada" : ""}">
        <div class="dv-cab">
          <img class="bandera-img b-md" src="https://flagcdn.com/w80/${d.iso}.png"
               alt="Bandera de ${d.pais}" loading="lazy" decoding="async">
          <h3>${d.pais}</h3>
        </div>
        <div class="dv-bloque">
          <span class="dv-etq">TV</span>
          <div class="chips">${d.tv.map(c => chipCanal(c, "chip-tv")).join("")}</div>
        </div>
        <div class="dv-bloque">
          <span class="dv-etq">Streaming</span>
          <div class="chips">${d.streaming.map(c => chipCanal(c, "chip-str")).join("")}</div>
        </div>
      </article>`).join("");
  }

  /* ---------------- Selector "Mi selección" ---------------- */
  function montarSelectorFav() {
    const sel = $("#select-fav");
    const equipos = Object.entries(DATOS_MUNDIAL.equipos)
      .sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, "es"));
    sel.innerHTML = `<option value="">— Elegir —</option>` +
      equipos.map(([code, e]) => `<option value="${code}">${e.nombre}</option>`).join("");
    if (estado.favorito) sel.value = estado.favorito;
    sel.addEventListener("change", () => {
      estado.favorito = sel.value || null;
      try {
        if (estado.favorito) localStorage.setItem("m26_fav", estado.favorito);
        else localStorage.removeItem("m26_fav");
      } catch (_) {}
      renderTodo(false);
    });
  }

  /* ---------------- Chip de estado de datos ---------------- */
  function actualizarChip() {
    const chip = $("#chip-datos");
    const hayVivo = estado.partidos.some(p => p.estado === "vivo");
    if (estado.fuente === "api") {
      chip.textContent = `${hayVivo ? "🔴 EN VIVO · " : ""}Actualizado ${fmtHMS.format(estado.ultimaActualizacion || new Date())}`;
      chip.classList.toggle("en-vivo", hayVivo);
    } else {
      const corte = new Date(DATOS_MUNDIAL.corteDatosUTC);
      chip.textContent = `Datos al ${fmtFecha.format(corte)}, ${fmtHora.format(corte)} · horarios en tu hora local`;
      chip.classList.remove("en-vivo");
    }
  }

  /* ---------------- Cuenta regresiva a la Gran Final (footer) ---------------- */
  function renderCuentaFinal() {
    const cont = $("#pie-cuenta-final");
    if (!cont) return;
    const final = estado.partidos.find(p => p.fase === "final");
    if (!final || !final.inicioUTC || final.estado === "fin") {
      cont.hidden = true;
      return;
    }
    cont.querySelector("[data-cd]").dataset.cd = final.inicioUTC;
    cont.hidden = false;
  }

  /* ---------------- Cuentas regresivas ---------------- */
  function tickCuentas() {
    const ahora = Date.now();
    document.querySelectorAll("[data-cd]").forEach(el => {
      const meta = new Date(el.dataset.cd).getTime();
      let dif = Math.floor((meta - ahora) / 1000);
      if (dif <= 0) { el.textContent = "¡Ya casi!"; return; }
      const d = Math.floor(dif / 86400); dif %= 86400;
      const h = String(Math.floor(dif / 3600)).padStart(2, "0"); dif %= 3600;
      const m = String(Math.floor(dif / 60)).padStart(2, "0");
      const s = String(dif % 60).padStart(2, "0");
      el.textContent = d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
    });
  }

  /* ---------------- Título de pestaña en vivo ---------------- */
  function actualizarTitulo() {
    const vivo = estado.partidos.find(p => p.estado === "vivo");
    document.title = vivo
      ? `⚽ ${nombreDe(vivo, "L")} ${vivo.gl}-${vivo.gv} ${nombreDe(vivo, "V")} · Mundial 2026 Partidos`
      : TITULO_BASE;
  }

  /* ---------------- Aviso de gol ---------------- */
  let timerToast = null;
  function mostrarToast(msj) {
    const t = $("#toast");
    t.textContent = msj;
    t.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => t.classList.remove("visible"), 5000);
  }

  function detectarGoles() {
    estado.partidos.forEach(p => {
      if (p.gl === null && p.gv === null) return;
      const clave = `${p.gl}-${p.gv}`;
      const previa = estado.marcadoresPrevios.get(p.id);
      if (previa !== undefined && previa !== clave && (p.estado === "vivo" || p.estado === "fin")) {
        mostrarToast(`⚽ ¡GOOOL! ${nombreDe(p, "L")} ${p.gl} – ${p.gv} ${nombreDe(p, "V")}`);
        document.querySelectorAll(`[data-id="${p.id}"]`).forEach(el => {
          el.classList.remove("destello");
          void el.offsetWidth; // reinicia la animación
          el.classList.add("destello");
        });
      }
      estado.marcadoresPrevios.set(p.id, clave);
    });
  }

  /* ---------------- Conexión con la API en vivo ---------------- */
  async function cargarAPI() {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch("/api/partidos", { signal: ctrl.signal, headers: { "Accept": "application/json" } });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!json || json.disponible === false || !Array.isArray(json.partidos) || !json.partidos.length) {
        throw new Error(json && json.motivo ? json.motivo : "sin-datos");
      }

      estado.partidos = json.partidos;
      if (Array.isArray(json.grupos) && json.grupos.length) estado.grupos = json.grupos;
      estado.fuente = "api";
      estado.ultimaActualizacion = new Date();

      detectarGoles();
      renderTodo(false);

      clearTimeout(estado.timerSondeo);
      estado.timerSondeo = setTimeout(sondear, INTERVALO_VIVO_MS);
    } catch (err) {
      clearTimeout(timeout);
      // Sin API: nos quedamos en respaldo y reintentamos en silencio.
      if (estado.fuente !== "api") {
        clearTimeout(estado.timerSondeo);
        estado.timerSondeo = setTimeout(sondear, REINTENTO_API_MS);
      } else {
        // La API venía funcionando y falló una vez: reintento corto.
        clearTimeout(estado.timerSondeo);
        estado.timerSondeo = setTimeout(sondear, INTERVALO_VIVO_MS);
      }
    }
  }

  function sondear() {
    if (document.visibilityState === "visible") cargarAPI();
    else estado.timerSondeo = setTimeout(sondear, 15_000);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && estado.fuente === "api") cargarAPI();
  });

  /* ---------------- Navegación activa ---------------- */
  function montarNavActiva() {
    const pills = document.querySelectorAll(".pill");
    const mapa = {};
    pills.forEach(p => { mapa[p.getAttribute("href").slice(1)] = p; });
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) {
          pills.forEach(p => p.classList.remove("activo"));
          const pill = mapa[e.target.id];
          if (pill) pill.classList.add("activo");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(s => obs.observe(s));
  }

  /* ---------------- Render maestro ---------------- */
  function renderTodo(primeraVez) {
    normalizarRespaldo();
    renderHero();
    renderProximos();
    renderResultados();
    renderCuadro();
    renderGrupos();
    renderCuentaFinal();
    actualizarChip();
    actualizarTitulo();
    tickCuentas();
    if (primeraVez) {
      estado.partidos.forEach(p => {
        if (p.gl !== null || p.gv !== null) estado.marcadoresPrevios.set(p.id, `${p.gl}-${p.gv}`);
      });
    }
  }

  /* ---------------- Arranque ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    montarSelectorFav();
    renderDondeVer();
    renderTodo(true);
    montarNavActiva();
    setInterval(tickCuentas, 1000);

    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-img-id]");
      if (!btn) return;
      btn.disabled = true;
      compartirImagenPartido(btn.dataset.imgId).finally(() => { btn.disabled = false; });
    });

    // Vigilante del modo respaldo: si pasa la hora de un partido y seguimos
    // sin API, la página se repinta sola (antes quedaba congelada).
    setInterval(() => {
      if (estado.fuente === "respaldo" && normalizarRespaldo()) renderTodo(false);
    }, 30_000);

    // Reabrir/cerrar grupos al cambiar de tamaño (móvil ⇄ escritorio).
    // addListener es el respaldo para Safari viejo (iOS 13 o menos).
    const mqEscritorio = window.matchMedia("(min-width: 768px)");
    if (typeof mqEscritorio.addEventListener === "function") {
      mqEscritorio.addEventListener("change", renderGrupos);
    } else if (typeof mqEscritorio.addListener === "function") {
      mqEscritorio.addListener(renderGrupos);
    }

    cargarAPI(); // intenta pasar a modo EN VIVO
  });
})();
