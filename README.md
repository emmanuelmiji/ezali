# Ezali?

Courant, eau, routes et réseau en direct, commune par commune, signalés par les Kinois.

PWA hébergée sur **Cloudflare Pages**, données dans **Cloudflare D1**.

## Structure

```
public/            Site statique (PWA) : index.html, style.css, app.js, sw.js, manifest, icônes
functions/api/     Fonctions Cloudflare
  reports.js       POST /api/reports   : envoyer un signalement
  status.js        GET  /api/status    : état de chaque commune (3 dernières heures)
  ranking.js       GET  /api/ranking   : classement sur 30 jours (10 signalements minimum)
lib/shared.js      Liste des 24 communes, services, états
schema.sql         Schéma de la base D1
```

## Configuration Cloudflare Pages

- Commande de build : *(aucune)*
- Dossier de sortie : `public`
- Liaison D1 : variable `DB` → base `ezali-db`
- Schéma : exécuter `schema.sql` dans la console D1

## Règles

- Signalement anonyme : aucun compte, aucun nom, aucun numéro.
- Un signalement toutes les 10 minutes par appareil, par commune et par service.
- L'état d'une commune est calculé sur les 3 dernières heures ; les signalements récents comptent plus.
