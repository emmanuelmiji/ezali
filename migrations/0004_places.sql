-- Lieux enregistrés (domicile, travail) par appareil anonyme.
-- device = empreinte SHA-256 de l'identifiant aléatoire de l'app (pas de nom, pas d'adresse, pas d'IP).
CREATE TABLE IF NOT EXISTS places (
  device TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('home', 'work')),
  commune TEXT NOT NULL,
  quartier TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (device, slot)
);
