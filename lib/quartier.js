import { normName, cleanQuartier } from "./shared.js";
import { QUARTIERS } from "./quartiers.js";

// Nom de quartier -> { quartier, custom } ; null si le nom est invalide ; quartier null si vide.
export function resolveQuartier(commune, value) {
  if (typeof value !== "string" || !value.trim()) return { quartier: null, custom: 0 };
  const known = (QUARTIERS[commune] || []).find((q) => normName(q) === normName(value));
  if (known) return { quartier: known, custom: 0 };
  const q = cleanQuartier(value);
  return q ? { quartier: q, custom: 1 } : null;
}
