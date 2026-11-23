-- Ezali — schéma D1
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commune TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('courant','eau','routes','reseau','securite')),
  state TEXT NOT NULL CHECK (state IN ('ok','instable','coupe')),
  kind TEXT CHECK (kind IS NULL OR kind IN ('insecurite','accident','inondation','autre')),
  device TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  quartier TEXT,
  quartier_custom INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_reports_recent ON reports (service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_commune ON reports (commune, service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_device ON reports (device, commune, service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_quartier ON reports (commune, quartier, service, created_at);
CREATE TABLE IF NOT EXISTS places (
  device TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('home', 'work')),
  commune TEXT NOT NULL,
  quartier TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (device, slot)
);
