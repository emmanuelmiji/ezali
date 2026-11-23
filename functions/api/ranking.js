// GET /api/ranking?service=courant
// Classement des communes sur 30 jours : part des signalements "ok".
// Une commune n'est classée qu'à partir de 10 signalements.
import { SERVICES, json } from "../../lib/shared.js";

const DAYS = 30;
const MIN_REPORTS = 10;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const service = url.searchParams.get("service") || "courant";
  if (!SERVICES.includes(service)) return json({ error: "Service inconnu" }, 400);

  const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  const { results } = await env.DB.prepare(
    `SELECT commune,
            COUNT(*) AS total,
            SUM(CASE WHEN state = 'ok' THEN 1 ELSE 0 END) AS ok
       FROM reports
      WHERE service = ? AND created_at > ?
      GROUP BY commune
     HAVING COUNT(*) >= ?`
  ).bind(service, since, MIN_REPORTS).all();

  const ranking = results
    .map((r) => ({ commune: r.commune, total: r.total, okRate: Math.round((r.ok / r.total) * 100) }))
    .sort((a, b) => b.okRate - a.okRate || b.total - a.total);

  return json({ service, days: DAYS, minReports: MIN_REPORTS, ranking });
}
