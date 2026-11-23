-- Ezali — schéma D1
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commune TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('courant','eau','routes','reseau')),
  state TEXT NOT NULL CHECK (state IN ('ok','instable','coupe')),
  device TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_recent ON reports (service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_commune ON reports (commune, service, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_device ON reports (device, commune, service, created_at);
