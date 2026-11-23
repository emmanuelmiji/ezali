// POST /api/reports  { commune, service, state, device }
import { COMMUNES, SERVICES, STATES, json } from "../../lib/shared.js";

const COOLDOWN_MS = 10 * 60 * 1000; // 1 signalement / 10 min / appareil / commune / service

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }

  const { commune, service, state, device } = body || {};
  if (!COMMUNES.includes(commune)) return json({ error: "Commune inconnue" }, 400);
  if (!SERVICES.includes(service)) return json({ error: "Service inconnu" }, 400);
  if (!STATES.includes(state)) return json({ error: "État inconnu" }, 400);
  if (typeof device !== "string" || device.length < 8 || device.length > 64) {
    return json({ error: "Appareil invalide" }, 400);
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
    "INSERT INTO reports (commune, service, state, device, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(commune, service, state, deviceKey, now).run();

  return json({ ok: true });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
