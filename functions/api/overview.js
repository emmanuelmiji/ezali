// GET /api/overview
// Tout Kinshasa en une seule requête (moins de données, moins d'attente sur une connexion faible) :
// - l'état de chaque service dans chaque commune,
// - un résumé par service pour toute la ville,
// - le détail par quartier,
// - les derniers signalements (anonymes : commune, quartier, service, état, heure).
import { COMMUNES, SERVICES, json, normName } from "../../lib/shared.js";

// Durée pendant laquelle un signalement reste pertinent, par service.
const WINDOW_MS = {
  courant: 3 * 3600e3,
  eau: 6 * 3600e3,
  routes: 1 * 3600e3,
  reseau: 2 * 3600e3,
  securite: 2 * 3600e3,
};
const MAX_WINDOW = Math.max(...Object.values(WINDOW_MS));
const HALF_LIFE_MS = 45 * 60e3;
const RECENT_LIMIT = 15;
// Un quartier proposé par les utilisateurs n'est affiché qu'après avoir été utilisé
// par au moins 3 personnes différentes sur 30 jours (évite les fautes et les abus).
const CUSTOM_MIN_PEOPLE = 3;
const CUSTOM_PERIOD = 30 * 24 * 3600e3;

export async function onRequestGet({ env }) {
  const now = Date.now();
  const [{ results }, { results: approved }] = await Promise.all([
    env.DB.prepare(
      "SELECT commune, quartier, quartier_custom, service, state, kind, device, created_at FROM reports WHERE created_at > ? ORDER BY created_at ASC"
    ).bind(now - MAX_WINDOW).all(),
    env.DB.prepare(
      "SELECT commune, quartier, device FROM reports WHERE quartier_custom = 1 AND created_at > ?"
    ).bind(now - CUSTOM_PERIOD).all(),
  ]);

  // Quartiers proposés par les utilisateurs et suffisamment confirmés.
  const people = {};
  for (const r of approved) (people[r.commune + "|" + normName(r.quartier)] ||= new Set()).add(r.device);
  const visibleCustom = new Set(Object.keys(people).filter((k) => people[k].size >= CUSTOM_MIN_PEOPLE));
  const quartierOf = (r) => {
    if (!r.quartier) return null;
    if (!r.quartier_custom) return r.quartier;
    return visibleCustom.has(r.commune + "|" + normName(r.quartier)) ? r.quartier : null;
  };

  // Regrouper par commune puis par service, en ne gardant que ce qui est encore pertinent.
  const groups = {};
  for (const r of results) {
    if (!SERVICES.includes(r.service) || now - r.created_at > WINDOW_MS[r.service]) continue;
    ((groups[r.commune] ||= {})[r.service] ||= []).push(r);
  }

  const communes = {};
  const summary = Object.fromEntries(SERVICES.map((s) => [s, { reports: 0, ok: 0, instable: 0, coupe: 0, last: null }]));

  for (const name of COMMUNES) {
    communes[name] = {};
    for (const service of SERVICES) {
      const reports = (groups[name] || {})[service] || [];
      const info = computeState(reports, now, WINDOW_MS[service]);

      // Détail par quartier : état de chaque quartier signalé.
      const byQ = {};
      for (const r of reports) { const q = quartierOf(r); if (q) (byQ[q] ||= []).push(r); }
      const quartiers = {};
      const qstats = { ok: 0, instable: 0, coupe: 0 };
      for (const [q, rows] of Object.entries(byQ)) {
        const qi = computeState(rows, now, WINDOW_MS[service]);
        quartiers[q] = qi;
        qstats[qi.state] += 1;
      }
      if (Object.keys(quartiers).length) { info.quartiers = quartiers; info.qstats = qstats; }
      communes[name][service] = info;
      const sum = summary[service];
      sum.reports += reports.length;
      if (info.state !== "inconnu") sum[info.state] += 1;
      if (info.last && (!sum.last || info.last > sum.last)) sum.last = info.last;
    }
  }

  const recent = results
    .filter((r) => SERVICES.includes(r.service) && now - r.created_at <= WINDOW_MS[r.service])
    .slice(-RECENT_LIMIT)
    .reverse()
    .map((r) => ({ commune: r.commune, quartier: quartierOf(r), service: r.service, state: r.state, kind: r.kind, at: r.created_at }));

  return json({ updated: now, windows: WINDOW_MS, summary, communes, recent });
}

function computeState(reports, now, windowMs) {
  if (!reports.length) return { state: "inconnu", count: 0 };

  // Les signalements récents comptent plus que les anciens.
  const score = { ok: 0, instable: 0, coupe: 0 };
  for (const r of reports) score[r.state] += Math.pow(0.5, (now - r.created_at) / HALF_LIFE_MS);
  const state = Object.keys(score).sort((a, b) => score[b] - score[a])[0];

  const agree = reports.filter((r) => r.state === state);
  const devices = new Set(agree.map((r) => r.device)).size; // personnes différentes (identifiants anonymes)
  const last = reports[reports.length - 1].created_at;

  // Depuis quand cet état dure : premier signalement de cet état après le dernier signalement contraire.
  const lastOther = [...reports].reverse().find((r) => r.state !== state);
  const firstAfter = lastOther ? agree.find((r) => r.created_at > lastOther.created_at) : agree[0];
  const since = (firstAfter || agree[0]).created_at;

  // Précision la plus signalée (sécurité).
  const kinds = {};
  for (const r of agree) if (r.kind) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
  const kind = Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a])[0] || null;

  // Confiance : plusieurs personnes différentes + information fraîche + peu de contradictions.
  const age = now - last;
  const share = score[state] / (score.ok + score.instable + score.coupe);
  let trust = "faible";
  if (devices >= 3 && age < windowMs / 3 && share >= 0.7) trust = "elevee";
  else if (devices >= 2 && age < windowMs / 2 && share >= 0.5) trust = "moyenne";

  // Fraîcheur affichée à l'utilisateur.
  const freshness = age < 30 * 60e3 ? "recent" : age < windowMs / 2 ? "actuel" : "ancien";

  return { state, kind, count: agree.length, people: devices, total: reports.length, since, last, trust, freshness };
}
