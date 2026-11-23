// Lieux enregistrés d'un appareil : domicile ("home") et travail ("work").
// Le courant et l'eau ne peuvent être signalés que pour ces lieux (voir reports.js).
// Un lieu ne peut changer qu'une fois par semaine, pour empêcher de « sauter » de commune en commune.
//
// GET  /api/places?device=...                      -> { home, work }
// POST /api/places { device, slot, commune, quartier }
import { COMMUNES, json, placeKey, validDevice } from "../../lib/shared.js";
import { resolveQuartier } from "../../lib/quartier.js";

const LOCK_MS = 7 * 24 * 3600e3;
const GRACE_MS = 30 * 60e3; // on peut corriger une erreur pendant 30 minutes après avoir enregistré un lieu

export async function onRequestGet({ request, env }) {
  const device = new URL(request.url).searchParams.get("device");
  if (!validDevice(device)) return json({ error: "Appareil invalide" }, 400);
  const key = await placeKey(device);
  const { results } = await env.DB.prepare("SELECT slot, commune, quartier, updated_at FROM places WHERE device = ?").bind(key).all();
  const out = { home: null, work: null };
  for (const r of results) out[r.slot] = { commune: r.commune, quartier: r.quartier, updatedAt: r.updated_at, lockedUntil: r.updated_at + LOCK_MS };
  return json(out);
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }
  const { device, slot, commune } = body || {};
  if (!validDevice(device)) return json({ error: "Appareil invalide" }, 400);
  if (slot !== "home" && slot !== "work") return json({ error: "Lieu inconnu" }, 400);
  if (!COMMUNES.includes(commune)) return json({ error: "Commune inconnue" }, 400);
  const q = resolveQuartier(commune, body.quartier);
  if (!q) return json({ error: "Nom de quartier invalide." }, 400);

  const key = await placeKey(device);
  const now = Date.now();
  const cur = await env.DB.prepare("SELECT commune, quartier, updated_at FROM places WHERE device = ? AND slot = ?").bind(key, slot).first();

  if (cur) {
    const same = cur.commune === commune && (cur.quartier || null) === q.quartier;
    if (same) return json({ ok: true, commune, quartier: q.quartier, lockedUntil: cur.updated_at + LOCK_MS });
    // Compléter un quartier manquant dans la même commune est toujours permis,
    // et on peut corriger une erreur dans les 30 minutes.
    const fillingQuartier = cur.commune === commune && !cur.quartier;
    const grace = now - cur.updated_at < GRACE_MS;
    if (!fillingQuartier && !grace && now - cur.updated_at < LOCK_MS) {
      return json({ error: "Tu as déjà changé ce lieu récemment.", code: "locked", lockedUntil: cur.updated_at + LOCK_MS }, 429);
    }
  }

  // Le délai d'une semaine part du premier enregistrement (une correction ne le relance pas).
  const keepAnchor = cur && ((cur.commune === commune && !cur.quartier) || now - cur.updated_at < GRACE_MS);
  const updatedAt = keepAnchor ? cur.updated_at : now;
  await env.DB.prepare(
    "INSERT INTO places (device, slot, commune, quartier, updated_at) VALUES (?, ?, ?, ?, ?) " +
    "ON CONFLICT (device, slot) DO UPDATE SET commune = excluded.commune, quartier = excluded.quartier, updated_at = excluded.updated_at"
  ).bind(key, slot, commune, q.quartier, updatedAt).run();

  return json({ ok: true, commune, quartier: q.quartier, lockedUntil: updatedAt + LOCK_MS });
}

// DELETE /api/places?device=...  -> supprime les lieux de cet appareil (Profil › Effacer mes données)
// Remarque : la limite d'une semaine reste celle du serveur ; effacer puis recréer un lieu est permis,
// mais l'identifiant de l'app change alors (nouveau départ, sans historique de confiance).
export async function onRequestDelete({ request, env }) {
  const device = new URL(request.url).searchParams.get("device");
  if (!validDevice(device)) return json({ error: "Appareil invalide" }, 400);
  await env.DB.prepare("DELETE FROM places WHERE device = ?").bind(await placeKey(device)).run();
  return json({ ok: true });
}
