// GET /api/ranking?period=day|week|month
// Classement de la participation par commune.
// Il ne récompense pas seulement la quantité : on classe d'abord par nombre de personnes
// différentes, puis par part de signalements confirmés par quelqu'un d'autre.
import { json } from "../../lib/shared.js";

const PERIODS = { day: 24 * 3600e3, week: 7 * 24 * 3600e3, month: 30 * 24 * 3600e3 };
const CONFIRM_MS = 2 * 3600e3; // un signalement est "confirmé" si une autre personne dit la même chose dans les 2 h

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  // Compatibilité avec l'ancienne version (?service=courant) : on garde 30 jours.
  const period = PERIODS[url.searchParams.get("period")] ? url.searchParams.get("period") : "month";
  const since = Date.now() - PERIODS[period];

  const { results } = await env.DB.prepare(
    "SELECT commune, service, state, device, created_at FROM reports WHERE created_at > ? ORDER BY created_at ASC"
  ).bind(since).all();

  const byCommune = {};
  for (const r of results) (byCommune[r.commune] ||= []).push(r);

  const ranking = Object.entries(byCommune).map(([commune, rows]) => {
    const people = new Set(rows.map((r) => r.device)).size;
    // rows est trié par date : on ne regarde que les voisins à moins de 2 h.
    let confirmed = 0;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const same = (o) => o.device !== r.device && o.service === r.service && o.state === r.state;
      let found = false;
      for (let j = i - 1; j >= 0 && r.created_at - rows[j].created_at <= CONFIRM_MS && !found; j--) found = same(rows[j]);
      for (let j = i + 1; j < rows.length && rows[j].created_at - r.created_at <= CONFIRM_MS && !found; j++) found = same(rows[j]);
      if (found) confirmed++;
    }
    return {
      commune,
      reports: rows.length,
      people,
      confirmed,
      confirmedRate: Math.round((confirmed / rows.length) * 100),
    };
  }).sort((a, b) => b.people - a.people || b.confirmedRate - a.confirmedRate || b.reports - a.reports);

  return json({ period, ranking });
}
