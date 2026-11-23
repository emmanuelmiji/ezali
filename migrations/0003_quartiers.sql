-- Ajoute le quartier aux signalements. Non destructif : les anciens signalements gardent quartier = NULL.
ALTER TABLE reports ADD COLUMN quartier TEXT;
ALTER TABLE reports ADD COLUMN quartier_custom INTEGER NOT NULL DEFAULT 0; -- 1 = quartier proposé par un utilisateur
CREATE INDEX IF NOT EXISTS idx_reports_quartier ON reports (commune, quartier, service, created_at);
