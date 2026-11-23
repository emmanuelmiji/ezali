// GET /api/status?service=courant
// État de chaque commune, calculé à partir des signalements des 3 dernières heures.
// Les signalements récents comptent plus que les anciens.
import { COMMUNES, SERVICES, json } from "../../lib/shared.js";

const WINDOW_MS = 3 * 60 * 60 * 1000;
const HALF_LIFE_MS = 45 * 60 * 1000;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const service = url.searchParams.get("service") || "courant";
  if (!SERVICES.includes(service)) return json({ error: "Service inconnu" }, 400);

  const now = Date.now();
  const { results } = await env.DB.prepare(
    "SELECT commune, state, created_at FROM reports WHERE service = ? AND created_at > ? ORDER BY created_at ASC"
  ).bind(service, now - WINDOW_MS).all();

  const byCommune = {};
  for (const r of results) (byCommune[r.commune] ||= []).push(r);

  const communes = COMMUNES.map((name) => {
    const reports = byCommune[name] || [];
    if (!reports.length) return { commune: name, state: "inconnu", count: 0 };

    const score = { ok: 0, instable: 0, coupe: 0 };
    for (const r of reports) {
      score[r.state] += Math.pow(0.5, (now - r.created_at) / HALF_LIFE_MS);
    }
    const state = Object.keys(score).sort((a, b) => score[b] - score[a])[0];

    // Depuis quand cet état dure (dernier signalement d'un autre état)
    let since = reports[0].created_at;
    for (const r of reports) if (r.state !== state) since = r.created_at;
    const firstOfState = reports.find((r) => r.state === state && r.created_at >= since);

    return {
      commune: name,
      state,
      count: reports.filter((r) => r.state === state).length,
      since: firstOfState ? firstOfState.created_at : since,
      last: reports[reports.length - 1].created_at,
    };
  });

  return json({ service, updated: now, communes });
}
