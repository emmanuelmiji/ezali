// Code partagé par les fonctions Cloudflare (hors du dossier functions/ pour ne pas devenir une route).

// Les 24 communes de Kinshasa
export const COMMUNES = [
  "Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu",
  "Kimbanseke", "Kinshasa", "Kintambo", "Kisenso", "Lemba", "Limete",
  "Lingwala", "Makala", "Maluku", "Masina", "Matete", "Mont-Ngafula",
  "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "Nsele", "Selembao",
];

export const SERVICES = ["courant", "eau", "routes", "reseau", "securite"];
// Précision pour la sécurité (facultative)
export const KINDS = ["insecurite", "accident", "inondation", "autre"];
export const STATES = ["ok", "instable", "coupe"];

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Comparer des noms de quartiers sans tenir compte des accents, majuscules et espaces.
export function normName(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Nom de quartier proposé par un utilisateur : lettres, chiffres, espaces, ' . - ( ), 2 à 40 caractères.
export function cleanQuartier(s) {
  const q = String(s).trim().replace(/\s+/g, " ");
  return /^[\p{L}\p{N}' .()\-]{2,40}$/u.test(q) ? q : null;
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Identifiant anonyme d'un appareil pour ses lieux enregistrés (stable, sans l'IP).
export const placeKey = (device) => sha256(`place|${device}`);

export function validDevice(device) {
  return typeof device === "string" && device.length >= 8 && device.length <= 64;
}
