-- Ajoute le service "securite" et la colonne "kind".
-- SQLite ne permet pas de modifier une contrainte CHECK : on recrée la table en gardant les données.
CREATE TABLE reports_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commune TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('courant','eau','routes','reseau','securite')),
  state TEXT NOT NULL CHECK (state IN ('ok','instable','coupe')),
  kind TEXT CHECK (kind IS NULL OR kind IN ('insecurite','accident','inondation','autre')),
  device TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
INSERT INTO reports_new (id, commune, service, state, device, created_at)
  SELECT id, commune, service, state, device, created_at FROM reports;
DROP TABLE reports;
ALTER TABLE reports_new RENAME TO reports;
CREATE INDEX IF NOT EXISTS idx_reports_recent ON reports (service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_commune ON reports (commune, service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_device ON reports (device, commune, service, created_at);
