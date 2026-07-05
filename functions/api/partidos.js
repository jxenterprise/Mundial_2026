/* ============================================================
   /api/partidos — Cloudflare Pages Function
   Puente seguro entre la web y football-data.org:
   - La API key vive en una variable de entorno (nunca en el navegador).
   - Cachea la respuesta 60 s para respetar el límite gratuito
     (10 peticiones/min) aunque entren miles de visitantes.
   - Devuelve los datos ya "traducidos" al formato de la web.

   Configuración (ver README.md):
   Cloudflare Pages → Settings → Environment variables →
   FOOTBALL_DATA_TOKEN = tu token de football-data.org
   ============================================================ */

const PROVEEDOR = "https://api.football-data.org/v4/competitions/WC";

// Códigos que usa el proveedor → códigos que usa la web
const ALIAS = {
  ALG: "DZA", CHE: "SUI", DEU: "GER", NLD: "NED", PRT: "POR",
  HRV: "CRO", ZAF: "RSA", SAU: "KSA", PRY: "PAR", CUR: "CUW", HAI: "HTI",
};

// Los 8 mejores terceros que avanzaron a dieciseisavos
const TERCEROS = new Set(["PAR", "ECU", "GHA", "DZA", "BIH", "SWE", "SEN", "COD"]);

const FASES = {
  LAST_32: "16avos",
  LAST_16: "octavos",
  ROUND_OF_16: "octavos",
  QUARTER_FINALS: "cuartos",
  SEMI_FINALS: "semis",
  THIRD_PLACE: "tercer",
  FINAL: "final",
};

const ESTADOS = {
  IN_PLAY: "vivo",
  PAUSED: "vivo",
  FINISHED: "fin",
  TIMED: "prog",
  SCHEDULED: "prog",
  POSTPONED: "porconf",
  SUSPENDED: "porconf",
  CANCELLED: "porconf",
};

function json(cuerpo, extraHeaders = {}) {
  return new Response(JSON.stringify(cuerpo), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

const codigo = tla => ALIAS[tla] || tla || null;

export async function onRequestGet(context) {
  const token = context.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    // La web seguirá funcionando en modo respaldo, sin error visible.
    return json({ disponible: false, motivo: "sin-token" });
  }

  // ---- Caché compartida (60 s) ----
  const cache = caches.default;
  const claveCache = new Request(new URL("/api/partidos", context.request.url).toString());
  const enCache = await cache.match(claveCache);
  if (enCache) return enCache;

  try {
    const cab = { headers: { "X-Auth-Token": token } };
    const [resPartidos, resTabla] = await Promise.all([
      fetch(`${PROVEEDOR}/matches`, cab),
      fetch(`${PROVEEDOR}/standings`, cab),
    ]);

    if (!resPartidos.ok) {
      return json({ disponible: false, motivo: "proveedor", codigo: resPartidos.status });
    }

    const brutoPartidos = await resPartidos.json();
    const brutoTabla = resTabla.ok ? await resTabla.json() : null;

    // ---- Partidos (solo eliminación directa; los grupos ya cerraron) ----
    const partidos = (brutoPartidos.matches || [])
      .filter(m => FASES[m.stage])
      .map(m => {
        const ft = (m.score && m.score.fullTime) || {};
        const pen = (m.score && m.score.penalties) || null;
        const duracion = m.score && m.score.duration;
        return {
          id: m.id,
          fase: FASES[m.stage],
          estado: ESTADOS[m.status] || "prog",
          inicioUTC: m.utcDate || null,
          local: codigo(m.homeTeam && m.homeTeam.tla),
          visita: codigo(m.awayTeam && m.awayTeam.tla),
          gl: ft.home ?? null,
          gv: ft.away ?? null,
          penales: pen && pen.home != null ? { l: pen.home, v: pen.away } : null,
          nota: duracion === "PENALTY_SHOOTOUT" ? "Penales"
              : duracion === "EXTRA_TIME" ? "Prórroga" : null,
          estadio: m.venue || null,
          placeholderL: m.homeTeam && !m.homeTeam.tla ? (m.homeTeam.name || "Por definir") : null,
          placeholderV: m.awayTeam && !m.awayTeam.tla ? (m.awayTeam.name || "Por definir") : null,
        };
      });

    // ---- Grupos ----
    let grupos = null;
    if (brutoTabla && Array.isArray(brutoTabla.standings)) {
      grupos = brutoTabla.standings
        .filter(s => s.type === "TOTAL" && s.group)
        .map(s => ({
          letra: s.group.replace("GROUP_", ""),
          filas: (s.table || []).map(f => {
            const code = codigo(f.team && f.team.tla);
            return {
              code,
              pj: f.playedGames, g: f.won, e: f.draw, p: f.lost, pts: f.points,
              clasificado: f.position <= 2 || (f.position === 3 && TERCEROS.has(code)),
            };
          }),
        }))
        .sort((a, b) => a.letra.localeCompare(b.letra));
    }

    const respuesta = json(
      {
        disponible: true,
        actualizadoUTC: new Date().toISOString(),
        partidos,
        grupos,
      },
      { "Cache-Control": "public, s-maxage=20" }
    );

    context.waitUntil(cache.put(claveCache, respuesta.clone()));
    return respuesta;
  } catch (err) {
    return json({ disponible: false, motivo: "excepcion" });
  }
}
