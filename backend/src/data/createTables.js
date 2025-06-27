import pool from "../config/db.js";

const createUserTable = async () => {
  const queryText = `
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
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table utilisateurs créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table utilisateurs:",
      error
    );
    throw error;
  }
};

const createRefreshTokenTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      token VARCHAR(255) UNIQUE NOT NULL,
      utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table refresh_tokens créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table refresh_tokens:",
      error
    );
    throw error;
  }
};

const createPatientTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
      groupe_sanguin VARCHAR(5),
      taille INTEGER,
      poids INTEGER,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table patients créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table patients:", error);
    throw error;
  }
};

const createMedecinTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS medecins (
      id SERIAL PRIMARY KEY,
      utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
      specialite VARCHAR(100) NOT NULL,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table medecins créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table medecins:", error);
    throw error;
  }
};

const createDisponibiliteMedecinTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS disponibilites_medecin (
      id SERIAL PRIMARY KEY,
      medecin_id INTEGER NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
      jour VARCHAR(10) NOT NULL CHECK (jour IN ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')),
      heure_debut TIME NOT NULL,
      heure_fin TIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT heure_valide CHECK (heure_debut < heure_fin)
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table disponibilites_medecin créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table disponibilites_medecin:",
      error
    );
    throw error;
  }
};

const createRendezVousTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS rendez_vous (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      medecin_id INTEGER NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      heure TIME NOT NULL,
      duree INTEGER NOT NULL DEFAULT 30,
      statut VARCHAR(20) NOT NULL DEFAULT 'planifié' CHECK (statut IN ('planifié', 'confirmé', 'annulé', 'terminé')),
      motif TEXT,
      adresse VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table rendez_vous créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table rendez_vous:", error);
    throw error;
  }
};

const createAdministrateurTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS administrateurs (
      id SERIAL PRIMARY KEY,
      utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
      niveau_acces VARCHAR(50) DEFAULT 'standard',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table administrateurs créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table administrateurs:",
      error
    );
    throw error;
  }
};

const createIndexes = async () => {
  const queries = [
    `CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email)`,
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`,
    `CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date)`,
    `CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_rendez_vous_medecin ON rendez_vous(medecin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_disponibilites_medecin ON disponibilites_medecin(medecin_id, jour)`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log("Index créés avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des index:", error);
    throw error;
  }
};

const initTables = async () => {
  try {
    await createUserTable();
    await createRefreshTokenTable();
    await createPatientTable();
    await createMedecinTable();
    await createDisponibiliteMedecinTable();
    await createRendezVousTable();
    await createAdministrateurTable();
    await createIndexes();
    console.log("Initialisation des tables terminée");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des tables:", error);
  }
};

export {
  createUserTable,
  createRefreshTokenTable,
  createPatientTable,
  createMedecinTable,
  createDisponibiliteMedecinTable,
  createRendezVousTable,
  createAdministrateurTable,
  createIndexes,
  initTables,
};

export default initTables;
