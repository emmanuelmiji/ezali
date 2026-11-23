// POST /api/reports  { service, state, device, kind?, place?, commune?, quartier? }
// - Courant et eau : seulement pour un lieu enregistré (place = "home" ou "work") ;
//   la commune et le quartier viennent alors du serveur, pas du téléphone.
// - Circulation, réseau, sécurité : la commune où l'on se trouve (détectée par GPS dans l'app) ou un lieu enregistré.
import { COMMUNES, SERVICES, STATES, KINDS, json, sha256, placeKey, validDevice } from "../../lib/shared.js";
import { resolveQuartier } from "../../lib/quartier.js";

const PLACE_ONLY = ["courant", "eau"];

const COOLDOWN_MS = 10 * 60 * 1000; // 1 signalement / 10 min / appareil / commune / service
const RETENTION_MS = 365 * 24 * 3600e3; // les signalements sont supprimés après 12 mois (voir la politique de confidentialité)

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }

  const { service, state, device } = body || {};
  if (!SERVICES.includes(service)) return json({ error: "Service inconnu" }, 400);
  if (!STATES.includes(state)) return json({ error: "État inconnu" }, 400);
  if (!validDevice(device)) return json({ error: "Appareil invalide" }, 400);
  // "kind" seulement pour la sécurité, et seulement si ce n'est pas calme
  const kind = service === "securite" && state !== "ok" && KINDS.includes(body.kind) ? body.kind : null;

  let commune, quartier = null, custom = 0;
  const place = body.place === "home" || body.place === "work" ? body.place : null;
  if (place) {
    const row = await env.DB.prepare("SELECT commune, quartier FROM places WHERE device = ? AND slot = ?")
      .bind(await placeKey(device), place).first();
    if (!row) return json({ error: place === "home" ? "Enregistre d'abord ton domicile." : "Enregistre d'abord ton lieu de travail dans Profil.", code: "no_place" }, 403);
    commune = row.commune;
    const q = resolveQuartier(commune, row.quartier || "");
    quartier = q ? q.quartier : null;
    custom = q ? q.custom : 0;
  } else {
    if (PLACE_ONLY.includes(service)) {
      return json({ error: "Le courant et l'eau se signalent seulement chez toi ou à ton travail.", code: "place_required" }, 403);
    }
    commune = body.commune;
    if (!COMMUNES.includes(commune)) return json({ error: "Commune inconnue" }, 400);
    const q = resolveQuartier(commune, body.quartier);
    if (!q) return json({ error: "Nom de quartier invalide." }, 400);
    quartier = q.quartier; custom = q.custom;
  }

  // On mélange l'identifiant de l'appareil et l'IP pour limiter les abus,
  // sans stocker l'IP en clair.
  const ip = request.headers.get("CF-Connecting-IP") || "0";
  const deviceKey = await sha256(`${device}|${ip}`);
  const now = Date.now();

  const recent = await env.DB.prepare(
    "SELECT id FROM reports WHERE device = ? AND commune = ? AND service = ? AND created_at > ? LIMIT 1"
  ).bind(deviceKey, commune, service, now - COOLDOWN_MS).first();

  if (recent) {
    return json({ error: "Tu as déjà signalé ici il y a moins de 10 minutes." }, 429);
  }

  await env.DB.prepare(
    "INSERT INTO reports (commune, service, state, kind, device, created_at, quartier, quartier_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(commune, service, state, kind, deviceKey, now, quartier, custom).run();

  // Nettoyage : de temps en temps (environ 1 envoi sur 20), on supprime les signalements de plus de 12 mois.
  if (Math.random() < 0.05) {
    const cleanup = env.DB.prepare("DELETE FROM reports WHERE created_at < ?").bind(now - RETENTION_MS).run().catch(() => {});
    if (waitUntil) waitUntil(cleanup); else await cleanup;
  }

  return json({ ok: true });
}
