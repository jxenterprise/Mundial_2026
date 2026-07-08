/* ============================================================
   worker-goles — Cloudflare Worker con Cron Trigger (NO es una
   Pages Function; se despliega por separado, ver README.md).

   Cada minuto:
   1. Consulta football-data.org (los mismos partidos que ve la web).
   2. Compara el marcador de cada partido en juego con el último que
      guardó en KV.
   3. Si subió el marcador de algún equipo, es un gol → manda un push
      con OneSignal.
   4. Guarda el marcador nuevo en KV para la próxima vuelta.

   La Function de la web (functions/api/partidos.js) NO puede hacer esto
   sola: solo corre cuando alguien visita la página, no vigila nada en
   segundo plano. Por eso este worker es una pieza aparte.

   Necesita, en el proyecto de este worker en Cloudflare (no en el de Pages):
     - Secretos (wrangler secret put):
         FOOTBALL_DATA_TOKEN   → el mismo token que ya usas en Pages
         ONESIGNAL_API_KEY     → REST API key de tu app en OneSignal
     - Variable de entorno (en wrangler.toml, no es secreta):
         ONESIGNAL_APP_ID
     - Un namespace de KV enlazado como GOLES_KV (para recordar el
       último marcador de cada partido entre una vuelta y la siguiente)
   ============================================================ */

const PROVEEDOR = "https://api.football-data.org/v4/competitions/WC/matches";

// Códigos que usa football-data.org → códigos que usa la web (mismo
// alias que functions/api/partidos.js, mantenerlos sincronizados).
const ALIAS = {
  ALG: "DZA", CHE: "SUI", DEU: "GER", NLD: "NED", PRT: "POR",
  HRV: "CRO", ZAF: "RSA", SAU: "KSA", PRY: "PAR", CUR: "CUW", HAI: "HTI",
};

const codigo = tla => ALIAS[tla] || tla || null;

const EN_JUEGO = new Set(["IN_PLAY", "PAUSED", "FINISHED"]);

async function enviarPush(env, mensaje) {
  await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${env.ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: env.ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      headings: { es: "⚽ ¡GOL!", en: "⚽ GOAL!" },
      contents: { es: mensaje, en: mensaje },
      url: "https://partidosdelmundial2026.pages.dev/",
    }),
  });
}

export default {
  async scheduled(event, env, ctx) {
    const token = env.FOOTBALL_DATA_TOKEN;
    if (!token) return; // sin token no hay nada que vigilar, no revienta

    const res = await fetch(PROVEEDOR, { headers: { "X-Auth-Token": token } });
    if (!res.ok) return;

    const data = await res.json();
    const partidos = data.matches || [];

    for (const m of partidos) {
      if (!EN_JUEGO.has(m.status)) continue;
      const ft = (m.score && m.score.fullTime) || {};
      if (ft.home == null || ft.away == null) continue;

      const clave = `partido-${m.id}`;
      const anterior = await env.GOLES_KV.get(clave);
      const actual = `${ft.home}-${ft.away}`;
      if (anterior === actual) continue;

      // Primera vez que vemos este partido: solo guardamos el marcador
      // de referencia, para no mandar un aviso falso al arrancar.
      if (anterior !== null) {
        const [glAnt, gvAnt] = anterior.split("-").map(Number);
        if (ft.home > glAnt || ft.away > gvAnt) {
          const local = codigo(m.homeTeam && m.homeTeam.tla) || (m.homeTeam && m.homeTeam.name) || "Local";
          const visita = codigo(m.awayTeam && m.awayTeam.tla) || (m.awayTeam && m.awayTeam.name) || "Visitante";
          ctx.waitUntil(enviarPush(env, `${local} ${ft.home} - ${ft.away} ${visita}`));
        }
      }

      ctx.waitUntil(env.GOLES_KV.put(clave, actual, { expirationTtl: 60 * 60 * 12 }));
    }
  },
};
