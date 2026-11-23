"use strict";
/* =========================================================
   Ezali? — application (PWA)
   Pas de compte, pas de bibliothèque : tout tient dans ce fichier.
   ========================================================= */

const VERSION = "1.1.0";

// ---------- Données fixes ----------
const COMMUNES = [
  "Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu",
  "Kimbanseke", "Kinshasa", "Kintambo", "Kisenso", "Lemba", "Limete",
  "Lingwala", "Makala", "Maluku", "Masina", "Matete", "Mont-Ngafula",
  "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "Nsele", "Selembao",
];

const ICON = {
  courant: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  eau: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  routes: '<path d="M4 20 9 4M20 20 15 4M12 6v2M12 11v2M12 16v2"/>',
  reseau: '<path d="M4 20h2v-4H4zM9 20h2v-8H9zM14 20h2V8h-2zM19 20h2V4h-2z"/>',
  securite: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><path d="M3 3l18 18"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
};

const SERVICES = {
  courant: { name: "Courant", states: { ok: "Disponible", instable: "Instable", coupe: "Coupure" } },
  eau: { name: "Eau", states: { ok: "Disponible", instable: "Faible pression", coupe: "Coupure" } },
  routes: { name: "Circulation", states: { ok: "Fluide", instable: "Embouteillage", coupe: "Route bloquée" } },
  reseau: { name: "Réseau", states: { ok: "Fonctionnel", instable: "Perturbé", coupe: "Indisponible" } },
  securite: { name: "Sécurité", states: { ok: "Situation normale", instable: "Prudence", coupe: "Zone à risque" } },
};
const SVC_KEYS = Object.keys(SERVICES);
const KINDS = { insecurite: "Insécurité", accident: "Accident", inondation: "Inondation", autre: "Autre" };
const STATE_LABEL = { ok: "Normal", instable: "Perturbé", coupe: "Fortement perturbé", inconnu: "Pas de données" };
const TRUST_LABEL = { elevee: "Confiance élevée", moyenne: "Confiance moyenne", faible: "Confiance faible" };
const FRESH_LABEL = { recent: "Signalement récent", actuel: "Information actuelle", ancien: "Information ancienne" };
const SEVERITY = { coupe: 3, instable: 2, ok: 1, inconnu: 0 };

// ---------- Stockage local (protégé : certains navigateurs le bloquent) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("ezali." + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem("ezali." + key, JSON.stringify(value)); } catch {} },
  clear() { try { Object.keys(localStorage).filter((k) => k.startsWith("ezali.")).forEach((k) => localStorage.removeItem(k)); } catch {} },
};

function deviceId() {
  let id = store.get("device", null);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, "");
    store.set("device", id);
  }
  return id;
}

// Anciennes versions : "follows" était une simple liste de noms.
function loadFollows() {
  const raw = store.get("follows", []);
  return raw.map((f) => (typeof f === "string" ? { name: f, group: "autre" } : f)).filter((f) => COMMUNES.includes(f.name));
}

const state = {
  commune: store.get("commune", null),
  follows: loadFollows(),
  theme: store.get("theme", "auto"),
  filter: "tout",
  report: { commune: null, service: "courant", state: null, kind: null, sent: false },
  rankPeriod: "week",
  overview: null,      // dernières données reçues
  overviewAt: 0,       // heure de réception
  fromCache: false,    // données venant de l'appareil (hors ligne)
  gpsCommune: null,
};

// ---------- Utilitaires ----------
const $app = document.getElementById("app");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ico = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;

function hourText(ts) {
  const d = new Date(ts);
  const m = d.getMinutes();
  return m ? `${d.getHours()} h ${String(m).padStart(2, "0")}` : `${d.getHours()} h`;
}
function agoText(ts) {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h${min % 60 ? " " + String(min % 60).padStart(2, "0") : ""}`;
  return `le ${new Date(ts).toLocaleDateString("fr-FR")} à ${hourText(ts)}`;
}
const badge = (st, text) => `<span class="badge b-${st}"><i></i>${esc(text || STATE_LABEL[st])}</span>`;
const stateText = (svc, info) => info.state === "inconnu" ? "Pas de données" : SERVICES[svc].states[info.state] + (info.kind ? ` · ${KINDS[info.kind]}` : "");

let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

// ---------- Thème ----------
function applyTheme() {
  const t = state.theme === "auto" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : state.theme;
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]').content = t === "dark" ? "#0B1B2B" : "#F5F7FA";
}
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => state.theme === "auto" && applyTheme());

// ---------- Données ----------
async function getOverview(fresh = false) {
  if (!fresh && state.overview && !state.fromCache && Date.now() - state.overviewAt < 60000) return state.overview;
  try {
    const res = await fetch("/api/overview", { cache: "no-store" });
    if (!res.ok) throw new Error("http");
    const data = await res.json();
    state.overview = data;
    state.overviewAt = Date.now();
    state.fromCache = false;
    store.set("lastOverview", { at: state.overviewAt, data });
    return data;
  } catch {
    // Hors ligne : on montre les dernières données connues, avec leur heure.
    const saved = store.get("lastOverview", null);
    if (saved) {
      state.overview = saved.data;
      state.overviewAt = saved.at;
      state.fromCache = true;
      return saved.data;
    }
    throw new Error("offline");
  }
}

async function sendReport({ commune, service, state: value, kind }) {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ commune, service, state: value, kind, device: deviceId() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Envoi impossible. Vérifie ta connexion et réessaie.");
  state.overviewAt = 0; // forcer l'actualisation
  return data;
}

// Pire situation d'une commune, tous services confondus.
function overall(c) {
  let worst = "inconnu";
  for (const k of SVC_KEYS) if (SEVERITY[c[k].state] > SEVERITY[worst]) worst = c[k].state;
  return worst;
}
const activeIssues = (c) => SVC_KEYS.filter((k) => c[k].state === "instable" || c[k].state === "coupe").length;
const lastUpdate = (c) => Math.max(0, ...SVC_KEYS.map((k) => c[k].last || 0));

// ---------- Contours des communes (OpenStreetMap) ----------
let shapesPromise = null;
function getShapes() {
  if (!shapesPromise) {
    shapesPromise = fetch("/communes.json")
      .then((r) => { if (!r.ok) throw new Error("shapes"); return r.json(); })
      .then((shapes) => {
        // Points et boîte englobante de chaque commune (pour zoomer et localiser).
        for (const s of Object.values(shapes)) {
          s.rings = s.d.split("Z").filter((x) => x.trim()).map((ring) => {
            const n = ring.replace("M", "").trim().split(/\s+/).map(Number);
            const pts = [];
            for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
            return pts;
          });
          const all = s.rings.flat();
          const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
          s.box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        }
        return shapes;
      })
      .catch((e) => { shapesPromise = null; throw e; });
  }
  return shapesPromise;
}

// Position GPS -> commune, calculée sur l'appareil. Les coordonnées ne sont jamais envoyées.
function communeAt(shapes, lat, lon) {
  const X = lon * 1e4 - 151000, Y = -lat * 1e4 - 40000;
  const inside = (pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > Y) !== (yj > Y) && X < ((xj - xi) * (Y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  for (const [name, s] of Object.entries(shapes)) if (s.rings.some(inside)) return name;
  return null;
}

function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Ton appareil ne permet pas la localisation."));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const shapes = await getShapes();
          const name = communeAt(shapes, pos.coords.latitude, pos.coords.longitude);
          if (!name) return reject(new Error("Ta position semble être hors de Kinshasa."));
          state.gpsCommune = name;
          resolve(name);
        } catch { reject(new Error("Carte indisponible pour le moment.")); }
      },
      () => reject(new Error("Localisation refusée ou indisponible.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

// =========================================================
// Écrans
// =========================================================

function header(title, sub) {
  return `
    <div class="top">
      <a class="brand" href="#accueil" aria-label="Ezali, accueil">
        <span class="mark">${ico("bolt")}</span>
        <span><span class="name">${title ? esc(title) : "Ezali<b>?</b>"}</span><span class="caption" style="display:block;margin-top:3px">${esc(sub)}</span></span>
      </a>
      <div class="top-actions">
        <a class="icon-btn" href="#profil/notifications" aria-label="Notifications">${ico("bell")}</a>
        <a class="icon-btn" href="#profil" aria-label="Paramètres">${ico("settings")}</a>
      </div>
    </div>`;
}

function offlineNotice() {
  if (!state.fromCache) return "";
  return `<div class="notice">${ico("wifi")}<span>Hors ligne. Données du ${new Date(state.overviewAt).toLocaleDateString("fr-FR")} à ${hourText(state.overviewAt)} — elles ne sont peut-être plus à jour.</span></div>`;
}

function errorBox(msg, retryId) {
  return `<div class="card pad empty">${esc(msg)}<div style="margin-top:12px"><button class="btn btn-secondary" id="${retryId}">${ico("refresh")}Réessayer</button></div></div>`;
}

// ---------- Choix de la commune (premier lancement) ----------
function viewChooseCommune(fromProfile) {
  $app.innerHTML = `
    <div class="view">
      <div class="top">
        <span class="brand"><span class="mark">${ico("bolt")}</span><span class="name">Ezali<b>?</b></span></span>
        ${fromProfile ? `<a class="icon-btn" href="#profil" aria-label="Retour">${ico("back")}</a>` : ""}
      </div>
      <h1 class="h1" style="margin-top:20px">Mbote ! Tu habites dans quelle commune ?</h1>
      <p class="caption" style="margin:8px 0 16px">Ezali? te montrera d'abord ce qui se passe chez toi. Tu pourras changer plus tard.</p>
      <button class="btn btn-secondary btn-block" id="gps">${ico("locate")}Me localiser automatiquement</button>
      <p class="caption" style="margin:8px 0 18px">Facultatif. Ta position reste sur ton téléphone : elle sert seulement à trouver ta commune.</p>
      <div class="cats" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        ${COMMUNES.map((c) => `<button class="card pad" data-pick="${esc(c)}" style="font-weight:700;font-size:14px;color:var(--text);text-align:left;padding:14px 12px">${esc(c)}</button>`).join("")}
      </div>
    </div>`;
  const pick = (name) => {
    state.commune = name;
    store.set("commune", name);
    if (!state.follows.some((f) => f.name === name)) {
      state.follows.unshift({ name, group: "moi" });
      store.set("follows", state.follows);
    }
    // Si l'utilisateur est arrivé par un lien partagé, on ouvre la commune du lien.
    location.hash = state.pendingOpen ? `#commune/${encodeURIComponent(state.pendingOpen)}` : "#accueil";
    state.pendingOpen = null;
  };
  $app.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => pick(b.dataset.pick)));
  document.getElementById("gps").addEventListener("click", async (e) => {
    e.currentTarget.classList.add("loading");
    try { const name = await locate(); toast(`Tu es à ${name}.`); pick(name); }
    catch (err) { toast(err.message); e.target.closest("button").classList.remove("loading"); }
  });
}

// ---------- Accueil ----------
function viewHome() {
  $app.innerHTML = `
    <div class="view">
      ${header(null, "Kinshasa · 24 communes")}
      <div id="home-notice"></div>

      <section class="section" style="margin-top:16px">
        <div class="section-head" style="margin-bottom:2px">
          <h2 class="h2">Kinshasa, actuellement</h2>
          <button class="icon-btn" id="refresh" aria-label="Actualiser" style="width:38px;height:38px">${ico("refresh")}</button>
        </div>
        <p class="caption" id="updated" style="margin:0 0 10px">Chargement…</p>
        <div class="cats" id="cats">
          ${SVC_KEYS.map(() => `<div class="card sk" style="height:118px"></div>`).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2 class="h2">Chez toi · ${esc(state.commune)}</h2>
          <button class="btn btn-ghost" id="near" style="height:36px;padding:0 6px;font-size:13px">${ico("locate")}Me localiser</button>
        </div>
        <button class="card mine" id="mine" style="width:100%;text-align:left;color:inherit;font:inherit"><div class="sk" style="height:84px"></div></button>
      </section>

      <section class="section">
        <div class="section-head"><h2 class="h2">Carte</h2><span class="caption">Touche une commune</span></div>
        <div class="search">
          ${ico("search")}
          <input id="q" type="search" placeholder="Rechercher une commune" autocomplete="off" aria-label="Rechercher une commune">
          <div class="card suggest" id="suggest" hidden></div>
        </div>
        <div class="pills" role="group" aria-label="Filtrer la carte">
          <button class="pill" data-filter="tout" aria-pressed="${state.filter === "tout"}">Tout</button>
          ${SVC_KEYS.map((k) => `<button class="pill" data-filter="${k}" aria-pressed="${state.filter === k}">${ico(k)}${SERVICES[k].name}</button>`).join("")}
        </div>
        <div class="mapbox">
          <div id="mapwrap"><div class="sk map" style="border-radius:0"></div></div>
          <div class="map-tools">
            <button class="icon-btn" id="zin" aria-label="Zoomer">${ico("plus")}</button>
            <button class="icon-btn" id="zout" aria-label="Dézoomer">${ico("minus")}</button>
            <button class="icon-btn" id="recenter" aria-label="Recentrer sur ma commune">${ico("locate")}</button>
          </div>
        </div>
        <div class="legend" aria-label="Légende">
          <span><i style="background:var(--ok)"></i>Normal</span>
          <span><i style="background:var(--mid)"></i>Perturbé</span>
          <span><i style="background:var(--bad)"></i>Fortement perturbé</span>
          <span><i style="background:var(--none)"></i>Pas de données</span>
        </div>
        <p class="caption" id="filter-note" style="margin-top:6px"></p>
      </section>

      <section class="section">
        <div class="section-head"><h2 class="h2">Derniers signalements</h2></div>
        <div class="card list" id="feed"><div class="sk" style="height:120px;margin:12px 0"></div></div>
      </section>

      <p class="caption" style="margin-top:20px;text-align:center">Informations signalées par les habitants, pas des données officielles.<br>Contours des communes © OpenStreetMap.</p>
    </div>`;

  $app.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    state.filter = b.dataset.filter;
    $app.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    map.paint();
  }));
  document.getElementById("refresh").addEventListener("click", (e) => { e.currentTarget.classList.add("spin"); loadHome(true); });
  document.getElementById("mine").addEventListener("click", () => openSheet(state.commune));
  document.getElementById("near").addEventListener("click", async (e) => {
    const b = e.currentTarget; b.classList.add("loading");
    try {
      const name = await locate();
      b.classList.remove("loading");
      map.focus(name);
      openSheet(name);
    } catch (err) { b.classList.remove("loading"); toast(err.message); }
  });
  document.getElementById("zin").addEventListener("click", () => map.zoom(0.7));
  document.getElementById("zout").addEventListener("click", () => map.zoom(1 / 0.7));
  document.getElementById("recenter").addEventListener("click", () => map.focus(state.gpsCommune || state.commune));
  setupSearch();
  loadHome(false);
}

async function loadHome(fresh) {
  const btn = document.getElementById("refresh");
  let data;
  try { data = await getOverview(fresh); }
  catch {
    if (!document.getElementById("cats")) return;
    document.getElementById("cats").outerHTML = errorBox("Impossible de charger les informations. Vérifie ta connexion.", "retry");
    document.getElementById("retry").addEventListener("click", () => viewHome());
    return;
  }
  if (!document.getElementById("cats")) return;
  document.getElementById("home-notice").innerHTML = offlineNotice();
  document.getElementById("updated").textContent = state.fromCache ? `Données de ${hourText(state.overviewAt)}` : `Mis à jour ${agoText(data.updated)}`;
  btn.classList.remove("spin");

  // Résumé par catégorie
  document.getElementById("cats").innerHTML = SVC_KEYS.map((k) => {
    const s = data.summary[k];
    let st = "inconnu", text = "Pas de données";
    const pl = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
    if (s.coupe) { st = "coupe"; text = pl(s.coupe, "touchée") + (s.instable ? " · " + pl(s.instable, "perturbée") : ""); }
    else if (s.instable) { st = "instable"; text = pl(s.instable, "commune perturbée").replace("communes perturbée", "communes perturbées"); }
    else if (s.ok) { st = "ok"; text = "Normal là où c'est signalé"; }
    return `
      <button class="card cat" data-cat="${k}" aria-label="${esc(SERVICES[k].name)} : ${esc(text)}">
        <span class="cat-head"><span class="cat-ico">${ico(k)}</span>${esc(SERVICES[k].name)}</span>
        ${badge(st, text)}
        <span class="caption">${s.coupe || s.instable ? "communes" : ""}</span>
        <span class="cat-meta">${s.reports ? `${s.reports} signalement${s.reports > 1 ? "s" : ""} · ${agoText(s.last)}` : "Aucun signalement récent"}</span>
      </button>`;
  }).join("");
  document.querySelectorAll("[data-cat]").forEach((b) => b.addEventListener("click", () => {
    state.filter = b.dataset.cat;
    document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.filter === state.filter));
    map.paint();
    document.querySelector(".mapbox").scrollIntoView({ behavior: "smooth", block: "center" });
  }));

  // Chez toi
  const mine = data.communes[state.commune];
  document.getElementById("mine").innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div>${badge(overall(mine))}</div>
      <span class="caption">${lastUpdate(mine) ? agoText(lastUpdate(mine)) : "Pas de signalement récent"}</span>
    </div>
    <div class="mine-grid">
      ${SVC_KEYS.map((k) => `<span class="mini s-${mine[k].state}">${ico(k)}${esc(mine[k].state === "inconnu" ? "—" : SERVICES[k].states[mine[k].state])}</span>`).join("")}
    </div>`;

  // Derniers signalements
  const feed = document.getElementById("feed");
  feed.innerHTML = data.recent.length
    ? data.recent.slice(0, 6).map(feedItem).join("")
    : `<div class="empty">Aucun signalement ces dernières heures.<br><a href="#signaler">Sois le premier à signaler</a></div>`;
  feed.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openSheet(b.dataset.open)));

  // Carte
  try {
    const shapes = await getShapes();
    if (!document.getElementById("mapwrap")) return;
    map.mount(document.getElementById("mapwrap"), shapes);
  } catch {
    document.getElementById("mapwrap").innerHTML = `<div class="empty">Carte indisponible pour le moment.</div>`;
  }
}

function feedItem(r) {
  const st = r.state;
  const colors = { ok: "var(--ok-bg);color:var(--ok-ink)", instable: "var(--mid-bg);color:var(--mid-ink)", coupe: "var(--bad-bg);color:var(--bad-ink)" };
  return `
    <button class="item" data-open="${esc(r.commune)}">
      <span class="feed-ico" style="background:${colors[st]}">${ico(r.service)}</span>
      <span class="grow"><span class="name">${esc(r.commune)}</span><span class="caption" style="display:block">${esc(SERVICES[r.service].name)} · ${esc(SERVICES[r.service].states[st])}${r.kind ? " · " + esc(KINDS[r.kind]) : ""}</span></span>
      <span class="caption">${agoText(r.at)}</span>
    </button>`;
}

// ---------- Recherche ----------
function setupSearch() {
  const q = document.getElementById("q");
  const box = document.getElementById("suggest");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  const show = () => {
    const v = norm(q.value);
    if (!v) { box.hidden = true; return; }
    const hits = COMMUNES.filter((c) => norm(c).includes(v)).slice(0, 6);
    box.innerHTML = hits.length
      ? hits.map((c) => {
        const st = state.overview ? overall(state.overview.communes[c]) : "inconnu";
        return `<button data-go="${esc(c)}"><span>${esc(c)}</span>${badge(st)}</button>`;
      }).join("")
      : `<div class="empty" style="padding:12px">Aucune commune trouvée</div>`;
    box.hidden = false;
    box.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
      q.value = ""; box.hidden = true; q.blur();
      map.focus(b.dataset.go);
      openSheet(b.dataset.go);
    }));
  };
  q.addEventListener("input", show);
  q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const f = box.querySelector("[data-go]"); if (f) f.click(); } });
  q.addEventListener("blur", () => setTimeout(() => (box.hidden = true), 200));
}

// ---------- Carte : zoom, déplacement, sélection ----------
// Unités : 1/10 000 de degré (x vers l'est, y vers le sud).
const map = {
  view: null, shapes: null, svg: null, selected: null,
  HOME: [1250, 2960, 2000, 2100],

  mount(wrap, shapes) {
    this.shapes = shapes;
    if (!this.view) this.view = [...this.HOME];
    const paths = Object.entries(shapes).map(([name, s]) =>
      `<path d="${s.d}" data-c="${esc(name)}" vector-effect="non-scaling-stroke"><title>${esc(name)}</title></path>`).join("");
    const labels = Object.keys(shapes).map((name) => `<text data-l="${esc(name)}">${esc(name === "Bandalungwa" ? "Bandal" : name)}</text>`).join("");
    wrap.innerHTML = `<svg class="map" viewBox="${this.view.join(" ")}" role="img" aria-label="Carte des 24 communes de Kinshasa">${paths}<g>${labels}</g></svg>`;
    this.svg = wrap.querySelector("svg");
    this.bind();
    this.paint();
    this.place();
  },

  paint() {
    if (!this.svg || !state.overview) return;
    const data = state.overview.communes;
    this.svg.querySelectorAll("path[data-c]").forEach((p) => {
      const c = data[p.dataset.c];
      const st = state.filter === "tout" ? overall(c) : c[state.filter].state;
      p.setAttribute("class", `m-${st}${p.dataset.c === this.selected ? " m-sel" : ""}`);
      p.querySelector("title").textContent = `${p.dataset.c} : ${STATE_LABEL[st]}`;
      const l = this.svg.querySelector(`text[data-l="${CSS.escape(p.dataset.c)}"]`);
      l.setAttribute("class", `t-${st}`);
    });
    // La commune choisie passe au-dessus pour que son contour soit visible.
    const sel = this.selected && this.svg.querySelector(`path[data-c="${CSS.escape(this.selected)}"]`);
    if (sel) sel.parentNode.insertBefore(sel, this.svg.querySelector("g"));
    const note = document.getElementById("filter-note");
    if (note) note.textContent = state.filter === "tout"
      ? "« Tout » montre la situation la plus perturbée signalée dans chaque commune."
      : `Filtre : ${SERVICES[state.filter].name}.`;
  },

  // Taille et visibilité des étiquettes selon le zoom.
  place() {
    if (!this.svg) return;
    const [, , w] = this.view;
    const rect = this.svg.getBoundingClientRect();
    const unitsPerPx = w / (rect.width || 360);
    const fs = 12 * unitsPerPx;
    for (const [name, s] of Object.entries(this.shapes)) {
      const t = this.svg.querySelector(`text[data-l="${CSS.escape(name)}"]`);
      const bw = (s.box[2] - s.box[0]) / unitsPerPx; // largeur de la commune à l'écran (px)
      const label = t.textContent;
      const visible = bw > label.length * 7 + 6;
      t.style.display = visible ? "" : "none";
      t.setAttribute("x", s.c[0]);
      t.setAttribute("y", s.c[1] + fs * 0.35);
      t.style.fontSize = fs + "px";
      t.style.strokeWidth = 3 * unitsPerPx + "px";
    }
  },

  setView(v, animate) {
    // Limites : ni trop près, ni trop loin.
    const ratio = this.HOME[3] / this.HOME[2];
    let [x, y, w] = v;
    w = Math.min(Math.max(w, 450), 16000);
    const h = w * ratio;
    const cx = Math.min(Math.max(x + v[2] / 2, 0), 14500), cy = Math.min(Math.max(y + v[3] / 2, -800), 10500);
    const target = [cx - w / 2, cy - h / 2, w, h];
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.view = target; this.svg.setAttribute("viewBox", target.join(" ")); this.place(); return;
    }
    const from = [...this.view], t0 = performance.now(), dur = 280;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      this.view = from.map((a, i) => a + (target[i] - a) * e);
      this.svg.setAttribute("viewBox", this.view.join(" "));
      this.place();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  zoom(f, cx, cy) {
    if (!this.svg) return;
    const [x, y, w, h] = this.view;
    cx ??= x + w / 2; cy ??= y + h / 2;
    this.setView([cx - (cx - x) * f, cy - (cy - y) * f, w * f, h * f], cx === x + w / 2);
  },

  focus(name) {
    if (!this.svg || !this.shapes[name]) return;
    this.selected = name;
    const [x0, y0, x1, y1] = this.shapes[name].box;
    const w = Math.max((x1 - x0) * 2.2, 900);
    const ratio = this.HOME[3] / this.HOME[2];
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    this.setView([cx - w / 2, cy - (w * ratio) / 2, w, w * ratio], true);
    this.paint();
  },

  bind() {
    const svg = this.svg;
    const pts = new Map();
    let moved = false, last = null;
    const toUnits = (px, py) => {
      const r = svg.getBoundingClientRect();
      const [x, y, w, h] = this.view;
      return [x + ((px - r.left) / r.width) * w, y + ((py - r.top) / r.height) * h];
    };
    svg.addEventListener("pointerdown", (e) => {
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      moved = false; last = null;
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      const r = svg.getBoundingClientRect();
      const [x, y, w, h] = this.view;
      if (pts.size === 1) {
        const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
        if (!moved && Math.hypot(dx, dy) < 4) { pts.set(e.pointerId, prev); return; }
        moved = true;
        this.view = [x - (dx / r.width) * w, y - (dy / r.height) * h, w, h];
        svg.setAttribute("viewBox", this.view.join(" "));
      } else if (pts.size === 2) {
        moved = true;
        const [a, b] = [...pts.values()];
        const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if (last) {
          const f = last / dist;
          const [cx, cy] = toUnits(mid[0], mid[1]);
          const nw = Math.min(Math.max(w * f, 450), 16000), k = nw / w;
          this.view = [cx - (cx - x) * k, cy - (cy - y) * k, nw, h * k];
          svg.setAttribute("viewBox", this.view.join(" "));
          this.place();
        }
        last = dist;
      }
    });
    const end = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size < 2) last = null;
      if (!moved && pts.size === 0) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const name = el && el.closest && el.closest("path[data-c]") && el.closest("path[data-c]").dataset.c;
        if (name) { this.selected = name; this.paint(); openSheet(name); }
      }
      if (pts.size === 0 && moved) this.setView(this.view, false);
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const [cx, cy] = toUnits(e.clientX, e.clientY);
      this.zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, cx, cy);
    }, { passive: false });
    // Clavier : flèches et +/- quand la carte a le focus.
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("keydown", (e) => {
      const [x, y, w, h] = this.view, s = w * 0.1;
      const moves = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
      if (moves[e.key]) { e.preventDefault(); this.setView([x + moves[e.key][0], y + moves[e.key][1], w, h], false); }
      if (e.key === "+" || e.key === "=") this.zoom(0.8);
      if (e.key === "-") this.zoom(1.25);
    });
  },
};

// ---------- Panneau d'une commune ----------
function openSheet(name) {
  closeSheet(true);
  const data = state.overview;
  if (!data) return;
  const c = data.communes[name];
  const followed = state.follows.some((f) => f.name === name);
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  const sheet = document.createElement("section");
  sheet.className = "sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", `Situation à ${name}`);
  const upd = lastUpdate(c);
  sheet.innerHTML = `
    <div class="handle" aria-hidden="true"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
      <div>
        <h2 class="h1" style="font-size:24px">${esc(name)}</h2>
        <div class="caption" style="margin-top:4px">${upd ? "Dernière actualisation " + agoText(upd) : "Aucun signalement récent"}${name === state.commune ? " · chez toi" : ""}</div>
      </div>
      <button class="icon-btn" data-close aria-label="Fermer">${ico("close")}</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 4px">${badge(overall(c), "État général : " + STATE_LABEL[overall(c)])}${activeIssues(c) ? `<span class="badge b-inconnu">${activeIssues(c)} perturbation${activeIssues(c) > 1 ? "s" : ""}</span>` : ""}</div>
    <div style="margin-top:8px">
      ${SVC_KEYS.map((k) => {
        const i = c[k];
        const detail = i.state === "inconnu"
          ? "Pas de signalement récent"
          : `Depuis ${hourText(i.since)} · ${i.people} personne${i.people > 1 ? "s" : ""} · ${FRESH_LABEL[i.freshness]}`;
        return `
          <div class="svc-row">
            <span class="cat-ico">${ico(k)}</span>
            <div class="grow"><div class="name">${esc(SERVICES[k].name)}</div><div class="caption">${esc(detail)}</div></div>
            <div style="text-align:right">${badge(i.state, stateText(k, i))}${i.trust ? `<div class="tag" style="margin-top:4px">${TRUST_LABEL[i.trust]}</div>` : ""}</div>
          </div>`;
      }).join("")}
    </div>
    <div class="row" style="margin-top:14px">
      <a class="btn btn-primary" href="#signaler" data-report>${ico("plus")}Signaler ici</a>
      <button class="btn btn-secondary" data-follow>${ico("star")}${followed ? "Suivie" : "Suivre"}</button>
      <button class="btn btn-secondary" data-share aria-label="Partager">${ico("share")}</button>
    </div>
    <p class="caption" style="margin-top:12px">La confiance dépend du nombre de personnes différentes, de la fraîcheur et de l'accord entre les signalements.</p>`;
  document.body.append(scrim, sheet);
  requestAnimationFrame(() => { scrim.classList.add("on"); sheet.classList.add("on"); });
  const prevFocus = document.activeElement;
  sheet.querySelector("[data-close]").focus();

  const close = () => closeSheet(false, prevFocus);
  scrim.addEventListener("click", close);
  sheet.querySelector("[data-close]").addEventListener("click", close);
  sheet.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  sheet.querySelector("[data-report]").addEventListener("click", () => { state.report.commune = name; closeSheet(true); });
  sheet.querySelector("[data-follow]").addEventListener("click", (e) => {
    if (state.follows.some((f) => f.name === name)) {
      if (name === state.commune) return toast("C'est ta commune : elle reste dans tes suivis.");
      state.follows = state.follows.filter((f) => f.name !== name);
      e.currentTarget.lastChild.textContent = "Suivre";
      toast(`${name} retirée de tes suivis.`);
    } else {
      state.follows.push({ name, group: "proche" });
      e.currentTarget.lastChild.textContent = "Suivie";
      toast(`${name} ajoutée à tes suivis.`);
    }
    store.set("follows", state.follows);
  });
  sheet.querySelector("[data-share]").addEventListener("click", () => shareCommune(name, c));

  // Glisser vers le bas pour fermer.
  let y0 = null;
  sheet.addEventListener("touchstart", (e) => { if (sheet.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    if (y0 === null) return;
    const dy = e.touches[0].clientY - y0;
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    if (y0 === null) return;
    const dy = e.changedTouches[0].clientY - y0;
    y0 = null;
    sheet.style.transform = "";
    if (dy > 90) close();
  });
}

function closeSheet(instant, focusBack) {
  const sheet = document.querySelector(".sheet"), scrim = document.querySelector(".scrim");
  if (!sheet) return;
  if (instant) { sheet.remove(); scrim && scrim.remove(); return; }
  sheet.classList.remove("on"); scrim && scrim.classList.remove("on");
  setTimeout(() => { sheet.remove(); scrim && scrim.remove(); }, 260);
  if (focusBack && focusBack.focus) focusBack.focus();
}

async function shareCommune(name, c) {
  const lines = SVC_KEYS.filter((k) => c[k].state !== "inconnu").map((k) => `• ${SERVICES[k].name} : ${stateText(k, c[k])}`);
  const text = `${name}, maintenant sur Ezali?\n${lines.length ? lines.join("\n") : "Pas encore de signalement. Signale ce qui se passe !"}`;
  const url = `${location.origin}/#commune/${encodeURIComponent(name)}`;
  if (navigator.share) {
    try { await navigator.share({ title: `Ezali? · ${name}`, text, url }); return; } catch { /* annulé */ }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank", "noopener");
}

// ---------- Signaler ----------
function viewReport() {
  const r = state.report;
  r.commune ||= state.commune;
  if (r.sent) {
    $app.innerHTML = `
      <div class="view done">
        <div class="check">${ico("check")}</div>
        <h1 class="h1">Melesi !</h1>
        <p class="caption" style="margin:8px 0 22px">Ton signalement pour ${esc(r.commune)} est envoyé à ${hourText(Date.now())}. Il aide tous les habitants.</p>
        <a class="btn btn-primary btn-block" href="#accueil">Voir la carte</a>
        <button class="btn btn-ghost btn-block" id="again" style="margin-top:8px">Faire un autre signalement</button>
      </div>`;
    document.getElementById("again").addEventListener("click", () => { r.sent = false; r.state = null; r.kind = null; viewReport(); });
    return;
  }
  const s = SERVICES[r.service];
  const dot = { ok: "var(--ok)", instable: "var(--mid)", coupe: "var(--bad)" };
  $app.innerHTML = `
    <div class="view">
      <div class="top">
        <a class="icon-btn" href="#accueil" aria-label="Fermer">${ico("close")}</a>
        <span class="caption">${hourText(Date.now())}</span>
      </div>
      <h1 class="h1" style="margin-top:10px">Nini ezali kosalema ?</h1>
      <p class="caption" style="margin:6px 0 16px">Qu'est-ce qui se passe ? Ton signalement est anonyme.</p>

      <label class="overline" for="commune">Commune</label>
      <div class="row" style="margin:8px 0 18px">
        <select class="select" id="commune">${COMMUNES.map((c) => `<option ${c === r.commune ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
        <button class="icon-btn" id="gps" style="flex:0 0 50px;width:50px;height:50px;border-radius:14px" aria-label="Me localiser">${ico("locate")}</button>
      </div>

      <div class="overline" style="margin-bottom:8px">Catégorie</div>
      <div class="services">
        ${SVC_KEYS.map((k) => `<button class="service" data-svc="${k}" aria-pressed="${k === r.service}">${ico(k)}${esc(SERVICES[k].name === "Circulation" ? "Routes" : SERVICES[k].name)}</button>`).join("")}
      </div>

      <div class="overline" style="margin:20px 0 8px">${esc(s.name)}, maintenant</div>
      <div class="choices">
        ${["ok", "instable", "coupe"].map((k) => `<button class="choice" data-state="${k}" aria-pressed="${r.state === k}"><i style="background:${dot[k]}"></i>${esc(s.states[k])}</button>`).join("")}
      </div>

      ${r.service === "securite" && r.state && r.state !== "ok" ? `
        <div class="overline" style="margin:20px 0 8px">Précision (facultatif)</div>
        <div class="pills" style="flex-wrap:wrap;padding:0">
          ${Object.entries(KINDS).map(([k, v]) => `<button class="pill" data-kind="${k}" aria-pressed="${r.kind === k}">${esc(v)}</button>`).join("")}
        </div>
        <p class="caption" style="margin-top:8px">Pas de nom, pas d'adresse : seulement la commune. Ezali? ne remplace pas les secours.</p>` : ""}

      <div class="card pad" style="margin-top:22px" id="recap" ${r.state ? "" : "hidden"}>
        <div class="overline">Vérifie avant d'envoyer</div>
        <div style="margin-top:8px;font-weight:700">${esc(r.commune)} · ${esc(s.name)}</div>
        <div style="margin-top:6px">${r.state ? badge(r.state, s.states[r.state] + (r.kind ? " · " + KINDS[r.kind] : "")) : ""}</div>
      </div>
      <button class="btn btn-primary btn-block" id="send" style="margin-top:14px" ${r.state ? "" : "disabled"}>Envoyer le signalement</button>
      <p class="caption" style="text-align:center;margin-top:10px">Un signalement toutes les 10 minutes par commune et par catégorie.</p>
    </div>`;

  document.getElementById("commune").addEventListener("change", (e) => { r.commune = e.target.value; viewReport(); });
  document.getElementById("gps").addEventListener("click", async (e) => {
    const b = e.currentTarget; b.classList.add("loading");
    try { r.commune = await locate(); viewReport(); toast(`Commune détectée : ${r.commune}`); }
    catch (err) { b.classList.remove("loading"); toast(err.message); }
  });
  $app.querySelectorAll("[data-svc]").forEach((b) => b.addEventListener("click", () => { r.service = b.dataset.svc; r.state = null; r.kind = null; viewReport(); }));
  $app.querySelectorAll("[data-state]").forEach((b) => b.addEventListener("click", () => { r.state = b.dataset.state; if (r.state === "ok") r.kind = null; viewReport(); }));
  $app.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { r.kind = r.kind === b.dataset.kind ? null : b.dataset.kind; viewReport(); }));
  document.getElementById("send").addEventListener("click", async (e) => {
    const b = e.currentTarget; b.classList.add("loading");
    try {
      await sendReport(r);
      r.sent = true;
      if (navigator.vibrate) navigator.vibrate(30);
      viewReport();
    } catch (err) { b.classList.remove("loading"); toast(err.message); }
  });
}

// ---------- Suivis ----------
async function viewFollows() {
  $app.innerHTML = `
    <div class="view">
      ${header("Suivis", "Tes communes et celles de tes proches")}
      <div id="follows" class="stack" style="margin-top:16px">${[1, 2, 3].map(() => `<div class="card sk" style="height:76px"></div>`).join("")}</div>
      <section class="section">
        <label class="overline" for="add">Ajouter une zone</label>
        <select class="select" id="add" style="margin-top:8px">
          <option value="">Choisir une commune…</option>
          ${COMMUNES.filter((c) => !state.follows.some((f) => f.name === c)).map((c) => `<option>${esc(c)}</option>`).join("")}
        </select>
      </section>
      <p class="caption" style="margin-top:14px">Tes suivis restent sur ce téléphone. Les notifications arriveront dans une prochaine version.</p>
    </div>`;
  document.getElementById("add").addEventListener("change", (e) => {
    if (!e.target.value) return;
    state.follows.push({ name: e.target.value, group: "proche" });
    store.set("follows", state.follows);
    viewFollows();
  });

  let data;
  try { data = await getOverview(); }
  catch {
    document.getElementById("follows").innerHTML = errorBox("Impossible de charger les informations.", "retry");
    document.getElementById("retry").addEventListener("click", viewFollows);
    return;
  }
  const box = document.getElementById("follows");
  if (!box) return;

  // La commune de l'utilisateur est toujours en tête, dans « Ma zone ».
  state.follows = state.follows.filter((f) => f.name !== state.commune);
  state.follows.unshift({ name: state.commune, group: "moi" });
  state.follows.forEach((f) => { if (f.name !== state.commune && f.group === "moi") f.group = "proche"; });
  store.set("follows", state.follows);

  const groups = [["moi", "Ma zone"], ["proche", "Mes proches"], ["autre", "Autres zones suivies"]];
  box.innerHTML = offlineNotice() + groups.map(([g, title]) => {
    const items = state.follows.map((f, i) => ({ ...f, i })).filter((f) => f.group === g);
    if (!items.length) return g === "proche" ? `<div class="overline" style="margin-top:10px">${title}</div><div class="card pad caption">Ajoute la commune d'un proche pour voir sa situation d'un coup d'œil.</div>` : "";
    return `<div class="overline" style="margin-top:10px">${title}</div>` + items.map((f) => {
      const c = data.communes[f.name];
      const n = activeIssues(c), upd = lastUpdate(c);
      return `
        <div class="card zone">
          <button class="grow" data-open="${esc(f.name)}" style="all:unset;flex:1;min-width:0;cursor:pointer">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="name" style="font-weight:750;font-size:16px">${esc(f.name)}</span>${badge(overall(c))}</div>
            <div class="caption" style="margin-top:6px">${n ? `${n} perturbation${n > 1 ? "s" : ""} active${n > 1 ? "s" : ""}` : "Aucune perturbation signalée"} · ${upd ? agoText(upd) : "pas de signalement récent"}</div>
          </button>
          ${g === "moi" ? "" : `
          <div class="zone-tools">
            <button class="icon-btn" data-up="${f.i}" aria-label="Monter ${esc(f.name)}">${ico("up")}</button>
            <button class="icon-btn" data-down="${f.i}" aria-label="Descendre ${esc(f.name)}">${ico("down")}</button>
            <button class="icon-btn" data-group="${f.i}" aria-label="Changer de groupe pour ${esc(f.name)}">${ico(g === "proche" ? "star" : "plus")}</button>
            <button class="icon-btn" data-remove="${f.i}" aria-label="Ne plus suivre ${esc(f.name)}">${ico("close")}</button>
          </div>`}
        </div>`;
    }).join("");
  }).join("");

  const save = () => { store.set("follows", state.follows); viewFollows(); };
  const move = (i, d) => {
    const g = state.follows[i].group;
    let j = i + d;
    while (j >= 0 && j < state.follows.length && state.follows[j].group !== g) j += d;
    if (j < 1 || j >= state.follows.length) return;
    [state.follows[i], state.follows[j]] = [state.follows[j], state.follows[i]];
    save();
  };
  box.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openSheet(b.dataset.open)));
  box.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.up, -1)));
  box.querySelectorAll("[data-down]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.down, 1)));
  box.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => { state.follows.splice(+b.dataset.remove, 1); save(); }));
  box.querySelectorAll("[data-group]").forEach((b) => b.addEventListener("click", () => {
    const f = state.follows[+b.dataset.group];
    f.group = f.group === "proche" ? "autre" : "proche";
    toast(`${f.name} : ${f.group === "proche" ? "Mes proches" : "Autres zones"}`);
    save();
  }));
}

// ---------- Classement ----------
async function viewRanking() {
  const periods = { day: "Aujourd'hui", week: "Cette semaine", month: "Ce mois" };
  $app.innerHTML = `
    <div class="view">
      ${header("Classement", "Participation des communes")}
      <div class="seg" style="margin-top:16px" role="group" aria-label="Période">
        ${Object.entries(periods).map(([k, v]) => `<button data-period="${k}" aria-pressed="${state.rankPeriod === k}">${v}</button>`).join("")}
      </div>
      <p class="caption" style="margin:10px 2px 0">Classées d'abord par nombre de personnes différentes, puis par part de signalements confirmés par quelqu'un d'autre. La quantité seule ne suffit pas.</p>
      <div id="rank" class="stack" style="margin-top:14px">${[1, 2, 3, 4].map(() => `<div class="card sk" style="height:84px"></div>`).join("")}</div>
    </div>`;
  $app.querySelectorAll("[data-period]").forEach((b) => b.addEventListener("click", () => { state.rankPeriod = b.dataset.period; viewRanking(); }));

  let data;
  try {
    const res = await fetch(`/api/ranking?period=${state.rankPeriod}`, { cache: "no-store" });
    if (!res.ok) throw 0;
    data = await res.json();
  } catch {
    document.getElementById("rank").innerHTML = errorBox("Impossible de charger le classement. Vérifie ta connexion.", "retry");
    document.getElementById("retry").addEventListener("click", viewRanking);
    return;
  }
  const box = document.getElementById("rank");
  if (!box) return;
  const list = data.ranking;
  if (!list.length) {
    box.innerHTML = `<div class="card empty">Pas encore de signalement sur cette période.<br><a href="#signaler">Fais le premier signalement</a></div>`;
    return;
  }
  const maxPeople = Math.max(...list.map((r) => r.people));
  const pos = list.findIndex((r) => r.commune === state.commune) + 1;
  box.innerHTML = `
    <div class="card pad" style="display:flex;align-items:center;gap:12px">
      <div class="grow" style="flex:1">
        <div class="overline">Ta commune</div>
        <div class="h2" style="margin-top:4px">${esc(state.commune)} · ${pos ? `${pos}${pos === 1 ? "re" : "e"} sur ${list.length}` : "pas encore classée"}</div>
      </div>
      <button class="btn btn-secondary" id="share">${ico("share")}Partager</button>
    </div>
    <div class="card list">
      ${list.slice(0, 10).map((r, i) => `
        <button class="item" data-open="${esc(r.commune)}">
          <span class="rank${i === 0 ? " first" : ""}">${i + 1}</span>
          <span class="grow">
            <span class="name">${esc(r.commune)}${r.commune === state.commune ? " · toi" : ""}</span>
            <span class="caption" style="display:block">${r.people} personne${r.people > 1 ? "s" : ""} · ${r.reports} signalement${r.reports > 1 ? "s" : ""} · ${r.confirmedRate} % confirmés</span>
            <span class="meter" aria-hidden="true"><i style="width:${Math.round((r.people / maxPeople) * 100)}%"></i></span>
          </span>
        </button>`).join("")}
    </div>`;
  box.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", async () => {
    try { await getOverview(); openSheet(b.dataset.open); } catch { toast("Pas de connexion."); }
  }));
  document.getElementById("share").addEventListener("click", () => {
    const text = pos
      ? `${state.commune} est ${pos}${pos === 1 ? "re" : "e"} sur ${list.length} en participation sur Ezali? (${periods[state.rankPeriod].toLowerCase()}). Et ta commune ?`
      : `Quelle commune de Kinshasa participe le plus sur Ezali? ?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + location.origin + "/#classement")}`, "_blank", "noopener");
  });
}

// ---------- Profil et paramètres ----------
function viewProfile(sub) {
  if (sub === "confidentialite" || sub === "conditions" || sub === "aide" || sub === "anonymat") return viewPage(sub);
  $app.innerHTML = `
    <div class="view prefs">
      ${header("Profil", "Sans compte, sur cet appareil")}

      <div class="overline" style="margin:20px 2px 8px">Préférences</div>
      <div class="card list">
        <div class="item"><span class="grow"><span class="name">Thème</span></span></div>
        <div class="seg" style="margin:0 0 14px" role="group" aria-label="Thème">
          ${[["auto", "Auto"], ["light", "Clair"], ["dark", "Sombre"]].map(([k, v]) => `<button data-theme-set="${k}" aria-pressed="${state.theme === k}">${v}</button>`).join("")}
        </div>
        <div class="item"><span class="grow"><span class="name">Langue</span><span class="caption" style="display:block">Français</span></span></div>
        <div class="item" id="notifications"><span class="grow"><span class="name">Notifications</span><span class="caption" style="display:block">Bientôt disponibles : retour du courant, coupure d'eau… dans les communes de ton choix.</span></span></div>
        <a class="item" href="#suivis"><span class="grow"><span class="name">Communes suivies</span><span class="caption" style="display:block">${state.follows.length} commune${state.follows.length > 1 ? "s" : ""}</span></span>${ico("chev")}</a>
        <a class="item" href="#commune"><span class="grow"><span class="name">Ma commune</span><span class="caption" style="display:block">${esc(state.commune)}</span></span>${ico("chev")}</a>
      </div>

      <div class="overline" style="margin:22px 2px 8px">Confidentialité</div>
      <div class="card list">
        <button class="item" id="loc"><span class="grow"><span class="name">Localisation</span><span class="caption" style="display:block">Facultative. Sert seulement à trouver ta commune, sur ton téléphone.</span></span>${ico("locate")}</button>
        <a class="item" href="#profil/anonymat"><span class="grow"><span class="name">Anonymat</span><span class="caption" style="display:block">Ce qu'Ezali? enregistre, et ce qu'il n'enregistre pas</span></span>${ico("chev")}</a>
        <button class="item" id="wipe"><span class="grow"><span class="name" style="color:var(--bad-ink)">Effacer mes données locales</span><span class="caption" style="display:block">Commune, suivis et préférences sur ce téléphone</span></span>${ico("trash")}</button>
      </div>

      <div class="overline" style="margin:22px 2px 8px">Application</div>
      <div class="card list">
        <div class="item"><span class="grow"><span class="name">Version</span></span><span class="caption">${VERSION}</span></div>
        <a class="item" href="#profil/aide"><span class="grow"><span class="name">Centre d'aide</span></span>${ico("chev")}</a>
        <a class="item" href="#profil/conditions"><span class="grow"><span class="name">Conditions d'utilisation</span></span>${ico("chev")}</a>
        <a class="item" href="#profil/confidentialite"><span class="grow"><span class="name">Politique de confidentialité</span></span>${ico("chev")}</a>
      </div>
      <p class="caption" style="text-align:center;margin-top:18px">Ezali? — Savoir ce qui se passe, avant de sortir.</p>
    </div>`;

  if (sub === "notifications") document.getElementById("notifications").scrollIntoView({ block: "center" });
  $app.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
    state.theme = b.dataset.themeSet; store.set("theme", state.theme); applyTheme();
    $app.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", x === b));
  }));
  document.getElementById("loc").addEventListener("click", async () => {
    try { const name = await locate(); toast(`Tu sembles être à ${name}.`); }
    catch (err) { toast(err.message); }
  });
  document.getElementById("wipe").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!b.dataset.confirm) {
      b.dataset.confirm = "1";
      b.querySelector(".name").textContent = "Touche encore pour confirmer";
      setTimeout(() => { if (b.isConnected) { delete b.dataset.confirm; b.querySelector(".name").textContent = "Effacer mes données locales"; } }, 4000);
      return;
    }
    store.clear();
    location.hash = "";
    location.reload();
  });
}

const PAGES = {
  anonymat: ["Anonymat", `
    <p>Ezali? fonctionne sans compte, sans nom et sans numéro de téléphone.</p>
    <h2>Ce qui est enregistré</h2>
    <p>Pour chaque signalement : la commune, la catégorie, la situation, l'heure, et un identifiant technique anonyme qui sert à limiter les abus (un signalement toutes les 10 minutes). Cet identifiant est mélangé et transformé avant d'être enregistré : il ne permet pas de retrouver ton téléphone.</p>
    <h2>Ce qui n'est jamais enregistré</h2>
    <p>Ton nom, ton numéro, ton adresse précise, ta position GPS. Si tu utilises « Me localiser », la position est utilisée seulement sur ton téléphone pour trouver ta commune, puis oubliée.</p>
    <h2>Sur ton téléphone</h2>
    <p>Ta commune, tes suivis et tes préférences restent sur ton appareil. Tu peux tout effacer dans Profil › Effacer mes données locales.</p>`],
  confidentialite: ["Politique de confidentialité", `
    <p><em>Version de travail, à faire relire avant la publication sur les stores.</em></p>
    <h2>Données collectées</h2>
    <p>Signalements anonymes : commune, catégorie, situation, heure et identifiant technique transformé. Aucune donnée de compte, de contact ou de localisation précise.</p>
    <h2>Utilisation</h2>
    <p>Afficher la situation des communes, calculer le classement et lutter contre les faux signalements.</p>
    <h2>Partage</h2>
    <p>Les signalements sont visibles par tous sous forme anonyme. Ils ne sont pas vendus.</p>
    <h2>Hébergement</h2>
    <p>Le service est hébergé chez Cloudflare.</p>
    <h2>Tes droits</h2>
    <p>Tu peux effacer à tout moment les données enregistrées sur ton téléphone. Les signalements déjà envoyés ne sont pas liés à ton identité.</p>`],
  conditions: ["Conditions d'utilisation", `
    <p><em>Version de travail, à faire relire avant la publication sur les stores.</em></p>
    <h2>Le service</h2>
    <p>Ezali? affiche des informations signalées par les habitants. Ce ne sont pas des données officielles de la SNEL, de la REGIDESO, des opérateurs ou des autorités.</p>
    <h2>Signaler honnêtement</h2>
    <p>Ne signale que ce que tu constates. Les faux signalements répétés peuvent être bloqués.</p>
    <h2>Urgences</h2>
    <p>Ezali? ne remplace pas les secours. En cas d'urgence, contacte directement les services compétents.</p>
    <h2>Responsabilité</h2>
    <p>Les informations peuvent être incomplètes ou dépassées. Vérifie leur heure et leur niveau de confiance avant de prendre une décision.</p>`],
  aide: ["Centre d'aide", `
    <h2>Comment lire la carte ?</h2>
    <p>Vert : normal. Orange : perturbé. Rouge : fortement perturbé. Gris : pas de données récentes. Touche une commune pour voir le détail.</p>
    <h2>D'où viennent les informations ?</h2>
    <p>Des habitants. Chaque information indique depuis quand elle est valable, combien de personnes l'ont signalée et un niveau de confiance.</p>
    <h2>Pourquoi une information disparaît ?</h2>
    <p>Elle expire : 1 h pour la circulation, 2 h pour le réseau et la sécurité, 3 h pour le courant, 6 h pour l'eau. Une information ancienne ne doit pas faire croire qu'elle est encore vraie.</p>
    <h2>Comment signaler ?</h2>
    <p>Touche le bouton + en bas, choisis la catégorie et la situation, vérifie, puis envoie.</p>
    <h2>Faut-il un compte ?</h2>
    <p>Non. Ezali? est anonyme.</p>`],
};

function viewPage(key) {
  const [title, html] = PAGES[key];
  $app.innerHTML = `
    <div class="view">
      <div class="top"><a class="icon-btn" href="#profil" aria-label="Retour">${ico("back")}</a><span></span></div>
      <h1 class="h1" style="margin-top:12px">${esc(title)}</h1>
      <div class="prose">${html}</div>
    </div>`;
}

// =========================================================
// Navigation
// =========================================================
function route() {
  closeSheet(true);
  const [tab, arg] = (location.hash || "#accueil").slice(1).split("/");
  const bar = document.getElementById("tabbar");

  if (!state.commune || tab === "commune") {
    bar.hidden = true;
    viewChooseCommune(!!state.commune);
    return;
  }
  bar.hidden = false;
  bar.querySelectorAll("[data-tab]").forEach((a) => {
    const on = a.dataset.tab === (tab || "accueil");
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);

  if (tab === "signaler") viewReport();
  else if (tab === "suivis") viewFollows();
  else if (tab === "classement") viewRanking();
  else if (tab === "profil") viewProfile(arg);
  else viewHome();
  if (tab !== "signaler") state.report.sent = false;
}

// Liens partagés (#commune/<nom>) : on ouvre la commune sur l'accueil.
function handleDeepLink() {
  const m = (location.hash || "").match(/^#commune\/(.+)$/);
  if (!m) return false;
  const name = decodeURIComponent(m[1]);
  if (!COMMUNES.includes(name)) return false;
  if (!state.commune) { state.pendingOpen = name; return false; }
  history.replaceState(null, "", "#accueil");
  route();
  getOverview().then(() => { map.focus(name); openSheet(name); }).catch(() => {});
  return true;
}

window.addEventListener("hashchange", () => { if (!handleDeepLink()) route(); });
window.addEventListener("online", () => { if (state.fromCache) { toast("Connexion retrouvée."); route(); } });
window.addEventListener("offline", () => toast("Tu es hors ligne. Les dernières données connues restent affichées."));
window.addEventListener("resize", () => map.place());

applyTheme();
if (!handleDeepLink()) route();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
