"use strict";

// ---------- Données fixes ----------
const COMMUNES = [
  "Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu",
  "Kimbanseke", "Kinshasa", "Kintambo", "Kisenso", "Lemba", "Limete",
  "Lingwala", "Makala", "Maluku", "Masina", "Matete", "Mont-Ngafula",
  "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "Nsele", "Selembao",
];

const ICONS = {
  courant: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  eau: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  routes: '<path d="M4 20 9 4M20 20 15 4M12 6v2M12 11v2M12 16v2"/>',
  reseau: '<path d="M4 20h2v-4H4zM9 20h2v-8H9zM14 20h2V8h-2zM19 20h2V4h-2z"/>',
  securite: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  ok: '<path d="M5 12l5 5 9-10"/>',
  coupe: '<path d="M6 6l12 12M18 6 6 18"/>',
  instable: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
};

const SERVICES = {
  courant: { name: "Courant", short: "Courant", states: { ok: "Ezali", instable: "Instable", coupe: "Ezali te · Coupé" } },
  eau: { name: "Mai · Eau", short: "Mai", states: { ok: "Ezali · L'eau coule", instable: "Faible", coupe: "Pas d'eau" } },
  routes: { name: "Nzela · Routes", short: "Nzela", states: { ok: "Fluide", instable: "Ralenti", coupe: "Bloqué" } },
  reseau: { name: "Réseau", short: "Réseau", states: { ok: "Normal", instable: "Faible", coupe: "Pas de réseau" } },
  securite: { name: "Sécurité", short: "Sécurité", states: { ok: "Calme", instable: "Prudence", coupe: "Danger" } },
};

const KINDS = { insecurite: "Insécurité", accident: "Accident", inondation: "Inondation", autre: "Autre" };

const STATE_SHORT = { ok: "OK", instable: "Instable", coupe: "Coupé", inconnu: "Pas d'info" };
const STATE_COLOR = { ok: "var(--ok)", instable: "var(--mid)", coupe: "var(--bad)", inconnu: "var(--none)" };

// ---------- Stockage local (protégé : certains navigateurs le bloquent) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("ezali." + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem("ezali." + key, JSON.stringify(value)); } catch {} },
};

function deviceId() {
  let id = store.get("device", null);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, "");
    store.set("device", id);
  }
  return id;
}

const state = {
  commune: store.get("commune", null),
  follows: store.get("follows", []),
  service: "courant",
  report: { service: "courant", state: null, kind: null },
  rankTab: "top",
  homeView: store.get("homeView", "carte"),
  mapZoom: "centre",
  mapSel: null,
  cache: {},
};

// ---------- Utilitaires ----------
const $app = document.getElementById("app");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

function hourText(ts) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

function agoText(ts) {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

let shapesPromise = null;
function getShapes() {
  if (!shapesPromise) {
    shapesPromise = fetch("/communes.json").then((r) => { if (!r.ok) throw new Error("shapes"); return r.json(); })
      .catch((e) => { shapesPromise = null; throw e; });
  }
  return shapesPromise;
}

// Vues de la carte (unités : 1/10 000 de degré ; x = est, y = sud)
const MAP_VIEWS = {
  centre: [1250, 2960, 2000, 1850],
  ville: [150, -900, 14350, 11350],
};
// Petits décalages d'étiquettes pour éviter qu'elles se chevauchent au centre-ville
const LABEL_SHORT = { Bandalungwa: "Bandal" };
// Les plus petites communes n'ont pas d'étiquette au centre-ville (on les touche pour voir leur nom)
const NO_LABEL_CENTRE = ["Kinshasa", "Barumbu", "Lingwala", "Kasa-Vubu", "Ngiri-Ngiri", "Bumbu", "Makala", "Ngaba"];
const LABELS_VILLE = ["Maluku", "Nsele", "Mont-Ngafula"];

function mapSvg(shapes, communes) {
  const [vx, vy, vw, vh] = MAP_VIEWS[state.mapZoom];
  const byName = Object.fromEntries(communes.map((c) => [c.commune, c]));
  const sel = state.mapSel || state.commune;
  const fs = vw / (state.mapZoom === "centre" ? 32 : 26);
  const entries = Object.entries(shapes).sort((a, b) => (a[0] === sel) - (b[0] === sel)); // la commune choisie au-dessus
  const paths = entries.map(([name, s]) => {
    const st = (byName[name] || {}).state || "inconnu";
    const w = name === sel ? vw / 80 : vw / 260;
    return `<path d="${s.d}" class="m-${st}${name === sel ? " m-sel" : ""}" data-c="${esc(name)}" style="stroke-width:${w}"><title>${esc(name)}</title></path>`;
  }).join("");
  const labels = Object.entries(shapes).map(([name, s]) => {
    if (state.mapZoom === "ville" ? !LABELS_VILLE.includes(name) : NO_LABEL_CENTRE.includes(name)) return "";
    const label = LABEL_SHORT[name] || name;
    const half = label.length * fs * 0.32 + fs * 0.4; // demi-largeur approximative du texte
    const x = Math.min(Math.max(s.c[0], vx + half), vx + vw - half);
    const y = Math.min(Math.max(s.c[1], vy + fs * 1.6), vy + vh - fs * 2.4);
    const st = (byName[name] || {}).state || "inconnu";
    return `<text x="${x}" y="${y}" class="t-${st}" style="font-size:${fs}px">${esc(label)}</text>`;
  }).join("");
  return `<svg class="map" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="Carte des communes de Kinshasa">${paths}${labels}</svg>`;
}

function mapInfo(communes) {
  const name = state.mapSel || state.commune;
  const c = communes.find((x) => x.commune === name) || { state: "inconnu" };
  const s = SERVICES[state.service];
  const detail = c.state === "inconnu"
    ? "Pas de signalement ces 3 dernières heures"
    : `${esc(s.states[c.state])}${c.kind ? " (" + esc(KINDS[c.kind]) + ")" : ""} · depuis ${hourText(c.since)} · ${c.count} signalement${c.count > 1 ? "s" : ""}`;
  return `<i class="dot" style="background:${STATE_COLOR[c.state]}"></i>
    <div class="grow"><div class="name">${esc(name)}${name === state.commune ? " · chez toi" : ""}</div><div class="small">${detail}</div></div>`;
}

async function getStatus(service, fresh = false) {
  const c = state.cache[service];
  if (!fresh && c && Date.now() - c.at < 60000) return c.data;
  const res = await fetch(`/api/status?service=${service}`);
  if (!res.ok) throw new Error("status");
  const data = await res.json();
  state.cache[service] = { at: Date.now(), data };
  return data;
}

async function sendReport(commune, service, value, kind = null) {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ commune, service, state: value, kind, device: deviceId() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Envoi impossible. Réessaie.");
  delete state.cache[service];
  return data;
}

// ---------- Écrans ----------
function viewChooseCommune(fromProfile = false) {
  $app.innerHTML = `
    <div class="top">
      <div><div class="brand">Ezali<b>?</b></div><div class="sub">Courant, eau, routes, réseau</div></div>
      ${fromProfile ? `<a class="round" href="#profil" aria-label="Retour"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></a>` : ""}
    </div>
    <div class="h1">Mbote ! Tu habites dans quelle commune ?</div>
    <p class="small">Tu pourras la changer plus tard.</p>
    <div class="grid" style="margin-top:16px">
      ${COMMUNES.map((c) => `<button class="tile s-inconnu" data-pick="${esc(c)}" style="color:var(--text)">${esc(c)}</button>`).join("")}
    </div>`;
  $app.querySelectorAll("[data-pick]").forEach((b) =>
    b.addEventListener("click", () => {
      state.commune = b.dataset.pick;
      store.set("commune", state.commune);
      if (!state.follows.includes(state.commune)) {
        state.follows.unshift(state.commune);
        store.set("follows", state.follows);
      }
      location.hash = "#accueil";
      route();
    })
  );
}

async function viewHome() {
  const svc = state.service;
  const now = new Date();
  $app.innerHTML = `
    <div class="top">
      <div>
        <div class="brand">Ezali<b>?</b></div>
        <div class="sub">${esc(state.commune)}, Kinshasa · ${hourText(now)}</div>
      </div>
      <button class="round" id="refresh" aria-label="Actualiser"><svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg></button>
    </div>
    <div class="card hero" id="hero"><div class="small">Chargement…</div></div>
    <div class="services">
      ${Object.keys(SERVICES).map((k) => `
        <button class="service" data-svc="${k}" aria-pressed="${k === svc}">${icon(k)}${SERVICES[k].short}</button>`).join("")}
    </div>
    <div class="seg" style="margin-top:16px">
      <button data-view="carte" aria-pressed="${state.homeView === "carte"}">Carte</button>
      <button data-view="liste" aria-pressed="${state.homeView === "liste"}">Liste</button>
    </div>
    ${state.homeView === "carte" ? `
      <div class="mapbox card" style="margin-top:10px;padding:0">
        <div id="mapwrap"><div class="empty">Chargement de la carte…</div></div>
        <button class="zoom" id="zoom">${state.mapZoom === "centre" ? "Toute la ville" : "Centre-ville"}</button>
      </div>
      <div class="card list" style="margin-top:8px"><div class="item" id="mapinfo"></div></div>
      <p class="small" style="margin-top:8px">Touche une commune pour voir son état. Contours : © OpenStreetMap.</p>` : `
      <div class="grid" id="grid" style="margin-top:10px"></div>`}
    <div class="legend">
      <span><i style="background:var(--ok)"></i>OK</span>
      <span><i style="background:var(--mid)"></i>Instable</span>
      <span><i style="background:var(--bad)"></i>Coupé</span>
      <span><i style="background:var(--none)"></i>Pas d'info</span>
    </div>
    <p class="small" style="margin-top:12px">Basé sur les signalements des 3 dernières heures.${svc === "securite" ? " Ezali? ne remplace pas les secours : en cas d'urgence, appelle-les directement." : ""}</p>`;

  $app.querySelectorAll("[data-svc]").forEach((b) =>
    b.addEventListener("click", () => { state.service = b.dataset.svc; viewHome(); })
  );
  $app.querySelectorAll("[data-view]").forEach((b) =>
    b.addEventListener("click", () => { state.homeView = b.dataset.view; store.set("homeView", state.homeView); viewHome(); })
  );
  const zoom = document.getElementById("zoom");
  if (zoom) zoom.addEventListener("click", () => { state.mapZoom = state.mapZoom === "centre" ? "ville" : "centre"; viewHome(); });
  document.getElementById("refresh").addEventListener("click", () => loadHome(true));
  loadHome(false);
}

async function loadHome(fresh) {
  const svc = state.service;
  let data;
  try { data = await getStatus(svc, fresh); }
  catch {
    document.getElementById("hero").innerHTML = `<div class="small">Pas de connexion. Réessaie dans un instant.</div>`;
    return;
  }
  if (svc !== state.service || !document.getElementById("hero")) return;

  const mine = data.communes.find((c) => c.commune === state.commune) || { state: "inconnu" };
  const s = SERVICES[svc];
  const hero = document.getElementById("hero");

  if (mine.state === "inconnu") {
    hero.innerHTML = `
      <div class="pill" style="color:var(--muted)"><i style="background:var(--none)"></i>${esc(s.name)}</div>
      <div class="big">Pas encore de signalement</div>
      <div class="small">Personne n'a signalé à ${esc(state.commune)} ces 3 dernières heures. Sois le premier !</div>
      <div class="row">
        <button class="btn primary" data-quick="ok">${icon("ok")}${esc(STATE_SHORT.ok)}</button>
        <button class="btn" data-quick="coupe">${icon("coupe")}${esc(STATE_SHORT.coupe)}</button>
      </div>`;
  } else {
    const color = STATE_COLOR[mine.state];
    const other = mine.state === "ok" ? "coupe" : "ok";
    hero.innerHTML = `
      <div class="pill" style="color:${color}"><i style="background:${color}"></i>${esc(s.name)} · ${esc(STATE_SHORT[mine.state])}</div>
      <div class="big">${esc(s.states[mine.state])}${mine.kind ? ` · ${esc(KINDS[mine.kind])}` : ""}</div>
      <div class="small">Depuis ${hourText(mine.since)} · dernier signalement ${agoText(mine.last)}</div>
      <div class="small">${mine.count} signalement${mine.count > 1 ? "s" : ""} le confirme${mine.count > 1 ? "nt" : ""}</div>
      <div class="row">
        <button class="btn" data-quick="${mine.state}">Je confirme</button>
        <button class="btn primary" data-quick="${other}">${other === "ok" ? "C'est revenu" : "C'est coupé"}</button>
      </div>`;
  }
  hero.querySelectorAll("[data-quick]").forEach((b) =>
    b.addEventListener("click", async () => {
      b.disabled = true;
      try { await sendReport(state.commune, svc, b.dataset.quick); toast("Merci ! Ton signalement est envoyé."); loadHome(true); }
      catch (e) { toast(e.message); b.disabled = false; }
    })
  );

  if (state.homeView === "carte") {
    const wrap = document.getElementById("mapwrap");
    let shapes;
    try { shapes = await getShapes(); }
    catch { wrap.innerHTML = `<div class="empty">Carte indisponible. Passe en mode Liste.</div>`; return; }
    if (!document.getElementById("mapwrap")) return;
    const draw = () => {
      wrap.innerHTML = mapSvg(shapes, data.communes);
      document.getElementById("mapinfo").innerHTML = mapInfo(data.communes);
      wrap.querySelectorAll("path[data-c]").forEach((p) =>
        p.addEventListener("click", () => { state.mapSel = p.dataset.c; draw(); })
      );
    };
    draw();
    return;
  }

  document.getElementById("grid").innerHTML = data.communes
    .map((c) => `
      <div class="tile s-${c.state}${c.commune === state.commune ? " me" : ""}">
        ${esc(c.commune)}<span>${c.commune === state.commune ? "Toi · " : ""}${esc(STATE_SHORT[c.state])}</span>
      </div>`)
    .join("");
}

function viewReport() {
  const r = state.report;
  const s = SERVICES[r.service];
  $app.innerHTML = `
    <div class="top">
      <a class="round" href="#accueil" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></a>
      <div class="sub">${esc(state.commune)}</div>
    </div>
    <div class="h1">Nini ezali kosalema ?</div>
    <p class="small" style="margin:0">Qu'est-ce qui se passe chez toi ?</p>
    <div class="services">
      ${Object.keys(SERVICES).map((k) => `
        <button class="service" data-svc="${k}" aria-pressed="${k === r.service}">${icon(k)}${SERVICES[k].short}</button>`).join("")}
    </div>
    <div class="label">${esc(s.name)}, maintenant</div>
    <div class="choices">
      ${["ok", "coupe", "instable"].map((k) => `
        <button class="choice s-${k}" data-state="${k}" aria-pressed="${r.state === k}">${icon(k)}${esc(s.states[k])}</button>`).join("")}
    </div>
    ${r.service === "securite" && r.state && r.state !== "ok" ? `
      <div class="label">Que se passe-t-il ? (facultatif)</div>
      <div class="kinds">
        ${Object.entries(KINDS).map(([k, v]) => `<button class="kind" data-kind="${k}" aria-pressed="${r.kind === k}">${esc(v)}</button>`).join("")}
      </div>
      <p class="small" style="margin-top:8px">Pas de nom, pas d'adresse : seulement la commune.</p>` : ""}
    <div style="margin-top:28px">
      <button class="btn primary block" id="send" ${r.state ? "" : "disabled"}>Envoyer</button>
    </div>
    <p class="small" style="text-align:center;margin-top:10px">Un signalement toutes les 10 minutes par service.</p>`;

  $app.querySelectorAll("[data-svc]").forEach((b) =>
    b.addEventListener("click", () => { r.service = b.dataset.svc; r.state = null; r.kind = null; viewReport(); })
  );
  $app.querySelectorAll("[data-state]").forEach((b) =>
    b.addEventListener("click", () => { r.state = b.dataset.state; if (r.state === "ok") r.kind = null; viewReport(); })
  );
  $app.querySelectorAll("[data-kind]").forEach((b) =>
    b.addEventListener("click", () => { r.kind = r.kind === b.dataset.kind ? null : b.dataset.kind; viewReport(); })
  );
  document.getElementById("send").addEventListener("click", async (e) => {
    e.target.disabled = true;
    try {
      await sendReport(state.commune, r.service, r.state, r.kind);
      toast("Melesi ! Ton signalement est envoyé.");
      state.service = r.service;
      r.state = null;
      r.kind = null;
      location.hash = "#accueil";
    } catch (err) {
      toast(err.message);
      e.target.disabled = false;
    }
  });
}

async function viewFollows() {
  $app.innerHTML = `
    <div class="top"><div><div class="h1" style="margin:0">Mes quartiers</div><div class="sub">Les communes que tu suis</div></div></div>
    <div class="card list" id="follows"><div class="empty">Chargement…</div></div>
    <div class="label">Ajouter une commune</div>
    <div class="row">
      <select class="select" id="add" aria-label="Commune à suivre">
        <option value="">Choisir…</option>
        ${COMMUNES.filter((c) => !state.follows.includes(c)).map((c) => `<option>${esc(c)}</option>`).join("")}
      </select>
    </div>
    <p class="small" style="margin-top:16px">Les notifications (« le courant est revenu chez toi ») arrivent dans une prochaine version.</p>`;

  document.getElementById("add").addEventListener("change", (e) => {
    if (!e.target.value) return;
    state.follows.push(e.target.value);
    store.set("follows", state.follows);
    viewFollows();
  });

  let all;
  try { all = await Promise.all(Object.keys(SERVICES).map((k) => getStatus(k))); }
  catch { document.getElementById("follows").innerHTML = `<div class="empty">Pas de connexion. Réessaie dans un instant.</div>`; return; }

  const box = document.getElementById("follows");
  if (!box) return;
  if (!state.follows.length) { box.innerHTML = `<div class="empty">Tu ne suis aucune commune pour l'instant.</div>`; return; }

  box.innerHTML = state.follows.map((name) => {
    const dots = Object.keys(SERVICES).map((k, i) => {
      const st = (all[i].communes.find((c) => c.commune === name) || {}).state || "inconnu";
      return `<span title="${esc(SERVICES[k].short)} : ${esc(STATE_SHORT[st])}" style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;font-size:12px;color:var(--muted)"><i class="dot" style="background:${STATE_COLOR[st]}"></i>${esc(SERVICES[k].short)}</span>`;
    }).join("");
    return `
      <div class="item">
        <div class="grow"><div class="name">${esc(name)}${name === state.commune ? " · chez toi" : ""}</div><div style="margin-top:6px">${dots}</div></div>
        ${name === state.commune ? "" : `<button class="round" data-unfollow="${esc(name)}" aria-label="Ne plus suivre ${esc(name)}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`}
      </div>`;
  }).join("");

  box.querySelectorAll("[data-unfollow]").forEach((b) =>
    b.addEventListener("click", () => {
      state.follows = state.follows.filter((c) => c !== b.dataset.unfollow);
      store.set("follows", state.follows);
      viewFollows();
    })
  );
}

async function viewRanking() {
  $app.innerHTML = `
    <div class="top"><div><div class="h1" style="margin:0">Classement</div><div class="sub">Courant · 30 derniers jours</div></div></div>
    <div class="seg">
      <button data-tab="top" aria-pressed="${state.rankTab === "top"}">Champions</button>
      <button data-tab="bottom" aria-pressed="${state.rankTab === "bottom"}">Oubliés</button>
    </div>
    <div class="card list" id="rank" style="margin-top:14px"><div class="empty">Chargement…</div></div>
    <div id="mine"></div>`;

  $app.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => { state.rankTab = b.dataset.tab; viewRanking(); })
  );

  let data;
  try { const res = await fetch("/api/ranking?service=courant"); data = await res.json(); if (!res.ok) throw 0; }
  catch { document.getElementById("rank").innerHTML = `<div class="empty">Pas de connexion. Réessaie dans un instant.</div>`; return; }

  const box = document.getElementById("rank");
  if (!box) return;
  const list = data.ranking;
  if (!list.length) {
    box.innerHTML = `<div class="empty">Pas encore assez de signalements.<br>Une commune entre au classement à partir de ${data.minReports} signalements.</div>`;
    return;
  }
  const shown = state.rankTab === "top" ? list.slice(0, 5) : list.slice(-5).reverse();
  box.innerHTML = shown.map((r) => {
    const pos = list.indexOf(r) + 1;
    const color = r.okRate >= 66 ? "var(--ok)" : r.okRate >= 33 ? "var(--mid)" : "var(--bad)";
    return `
      <div class="item">
        <div class="rank${pos === 1 ? " first" : ""}">${pos}</div>
        <div class="grow"><div class="name">${esc(r.commune)}</div><div class="small">${r.okRate} % des signalements : courant présent</div></div>
        <div class="bar"><i style="width:${r.okRate}%;background:${color}"></i></div>
      </div>`;
  }).join("");

  const pos = list.findIndex((r) => r.commune === state.commune) + 1;
  const text = pos
    ? `${state.commune} est ${pos}${pos === 1 ? "re" : "e"} sur ${list.length} au classement du courant sur Ezali? Et ta commune ?`
    : `Le courant à Kinshasa, commune par commune, sur Ezali? Et ta commune ?`;
  document.getElementById("mine").innerHTML = `
    <div class="card hero" style="margin-top:14px;border-color:var(--yellow)">
      <div class="label" style="margin:0">Ta commune</div>
      <div class="big" style="font-size:22px">${esc(state.commune)} · ${pos ? `${pos}${pos === 1 ? "re" : "e"} sur ${list.length}` : "pas encore classée"}</div>
      <a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(text + " " + location.origin)}" target="_blank" rel="noopener">Partager sur WhatsApp</a>
    </div>`;
}

function viewProfile() {
  $app.innerHTML = `
    <div class="top"><div><div class="h1" style="margin:0">Profil</div><div class="sub">Sur cet appareil</div></div></div>
    <div class="card list">
      <div class="item"><div class="grow"><div class="small">Ma commune</div><div class="name">${esc(state.commune)}</div></div><a class="btn" href="#commune">Changer</a></div>
    </div>
    <p class="small" style="margin-top:16px;line-height:1.5">Ezali? ne demande ni nom, ni numéro, ni compte. Tes signalements sont anonymes.</p>`;
}

// ---------- Navigation ----------
function route() {
  const tab = (location.hash || "#accueil").slice(1);
  const bar = document.getElementById("tabbar");

  if (!state.commune || tab === "commune") {
    bar.hidden = true;
    viewChooseCommune(!!state.commune);
    return;
  }
  bar.hidden = false;
  bar.querySelectorAll("[data-tab]").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
  window.scrollTo(0, 0);

  if (tab === "signaler") viewReport();
  else if (tab === "suivis") viewFollows();
  else if (tab === "classement") viewRanking();
  else if (tab === "profil") viewProfile();
  else viewHome();
}

window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
