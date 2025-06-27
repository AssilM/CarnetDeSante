-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  tel VARCHAR(20),
  date_naissance DATE,
  sexe VARCHAR(10),
  adresse VARCHAR(255),
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'medecin', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les tokens de rafraîchissement
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des patients (hérite de utilisateurs)
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  groupe_sanguin VARCHAR(5),
  taille INTEGER,
  poids INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des médecins (hérite de utilisateurs)
CREATE TABLE IF NOT EXISTS medecins (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  specialite VARCHAR(100) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des disponibilités des médecins
CREATE TABLE IF NOT EXISTS disponibilites_medecin (
  id SERIAL PRIMARY KEY,
  medecin_id INTEGER NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
  jour VARCHAR(10) NOT NULL CHECK (jour IN ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')),
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT heure_valide CHECK (heure_debut < heure_fin)
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id INTEGER NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  heure TIME NOT NULL,
  duree INTEGER NOT NULL DEFAULT 30, -- durée en minutes
  statut VARCHAR(20) NOT NULL DEFAULT 'planifié' CHECK (statut IN ('planifié', 'confirmé', 'annulé', 'terminé')),
  motif TEXT,
  adresse VARCHAR(255), -- Adresse du cabinet ou de la consultation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des administrateurs (hérite de utilisateurs)
CREATE TABLE IF NOT EXISTS administrateurs (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  niveau_acces VARCHAR(50) DEFAULT 'standard',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_medecin ON rendez_vous(medecin_id);
CREATE INDEX IF NOT EXISTS idx_disponibilites_medecin ON disponibilites_medecin(medecin_id, jour);
