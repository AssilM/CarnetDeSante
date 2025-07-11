import pool from "../config/db.js";

// Fonction pour supprimer une table spécifique
const dropTable = async (tableName) => {
  const queryText = `DROP TABLE IF EXISTS ${tableName} CASCADE`;

  try {
    await pool.query(queryText);
    console.log(`Table ${tableName} supprimée avec succès`);
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la table ${tableName}:`,
      error
    );
    throw error;
  }
};

// Fonction pour supprimer toutes les tables
const dropAllTables = async () => {
  try {
    // Ordre de suppression important pour respecter les contraintes de clés étrangères
    await dropTable("refresh_token");
    await dropTable("documents_rendez_vous");
    await dropTable("document");
    await dropTable("rendez_vous");
    await dropTable("disponibilite_medecin");
    await dropTable("patient");
    await dropTable("medecin");
    await dropTable("administrateur");
    await dropTable("utilisateur");

    console.log("Toutes les tables ont été supprimées avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression des tables:", error);
    throw error;
  }
};

const createUserTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS utilisateur (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      tel_indicatif VARCHAR(5),
      tel_numero VARCHAR(15),
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
    console.log("Table utilisateur créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table utilisateur:", error);
    throw error;
  }
};

const createRefreshTokenTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS refresh_token (
      id SERIAL PRIMARY KEY,
      token VARCHAR(255) UNIQUE NOT NULL,
      utilisateur_id INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table refresh_token créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table refresh_token:",
      error
    );
    throw error;
  }
};

const createPatientTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS patient (
      utilisateur_id INTEGER PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
      groupe_sanguin VARCHAR(5),
      taille INTEGER,
      poids INTEGER,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table patient créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table patient:", error);
    throw error;
  }
};

const createMedecinTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS medecin (
      utilisateur_id INTEGER PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
      specialite VARCHAR(100) NOT NULL,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table medecin créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table medecin:", error);
    throw error;
  }
};

const createDisponibiliteMedecinTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS disponibilite_medecin (
      id SERIAL PRIMARY KEY,
      medecin_id INTEGER NOT NULL REFERENCES medecin(utilisateur_id) ON DELETE CASCADE,
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
    console.log("Table disponibilite_medecin créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table disponibilite_medecin:",
      error
    );
    throw error;
  }
};

const createRendezVousTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS rendez_vous (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES patient(utilisateur_id) ON DELETE CASCADE,
      medecin_id INTEGER NOT NULL REFERENCES medecin(utilisateur_id) ON DELETE CASCADE,
      date DATE NOT NULL,
      heure TIME NOT NULL,
      duree INTEGER NOT NULL DEFAULT 30,
      statut VARCHAR(20) NOT NULL DEFAULT 'planifié' CHECK (statut IN ('planifié', 'confirmé', 'annulé', 'en_cours', 'terminé')),
      motif TEXT,
      adresse VARCHAR(255),
      notes_medecin TEXT,
      notes_patient TEXT,
      raison_annulation VARCHAR(255),
      heure_debut_reel TIMESTAMP,
      heure_fin_reel TIMESTAMP,
      duree_reelle INTEGER,
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
    CREATE TABLE IF NOT EXISTS administrateur (
      utilisateur_id INTEGER PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
      niveau_acces VARCHAR(50) DEFAULT 'standard',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table administrateur créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table administrateur:",
      error
    );
    throw error;
  }
};

const createDocumentTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS document (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES patient(utilisateur_id) ON DELETE CASCADE,
      medecin_id INTEGER REFERENCES medecin(utilisateur_id) ON DELETE SET NULL,
      titre VARCHAR(255) NOT NULL,
      type_document VARCHAR(50) NOT NULL CHECK (type_document IN ('ordonnance', 'analyse', 'radio', 'consultation', 'autre')),
      nom_fichier VARCHAR(255) NOT NULL,
      chemin_fichier VARCHAR(500) NOT NULL,
      type_mime VARCHAR(100) NOT NULL CHECK (type_mime IN ('application/pdf', 'image/jpeg', 'image/png')),
      taille_fichier INTEGER NOT NULL,
      date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table document créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table document:", error);
    throw error;
  }
};

const createDocumentsRendezVousTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS documents_rendez_vous (
      id SERIAL PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES document(id) ON DELETE CASCADE,
      rendez_vous_id INTEGER NOT NULL REFERENCES rendez_vous(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(document_id, rendez_vous_id)
    )
  `;

  try {
    await pool.query(queryText);
    console.log("Table documents_rendez_vous créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table documents_rendez_vous:",
      error
    );
    throw error;
  }
};

const createIndexes = async () => {
  const queries = [
    `CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email)`,
    `CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_token(token)`,
    `CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date)`,
    `CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_rendez_vous_medecin ON rendez_vous(medecin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_disponibilite_medecin ON disponibilite_medecin(medecin_id, jour)`,
    `CREATE INDEX IF NOT EXISTS idx_document_patient ON document(patient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_document_medecin ON document(medecin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_document_type ON document(type_document)`,
    `CREATE INDEX IF NOT EXISTS idx_document_date ON document(date_creation)`,
    `CREATE INDEX IF NOT EXISTS idx_documents_rendez_vous_document ON documents_rendez_vous(document_id)`,
    `CREATE INDEX IF NOT EXISTS idx_documents_rendez_vous_rdv ON documents_rendez_vous(rendez_vous_id)`,
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

// Fonction principale pour initialiser toutes les tables
const initTables = async () => {
  try {
    // Décommentez la ligne suivante pour supprimer toutes les tables avant de les recréer
    // await dropAllTables();

    await createUserTable();
    await createRefreshTokenTable();
    await createPatientTable();
    await createMedecinTable();
    await createDisponibiliteMedecinTable();
    await createRendezVousTable();
    await createAdministrateurTable();
    await createDocumentTable();
    await createDocumentsRendezVousTable();
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
  createDocumentTable,
  createDocumentsRendezVousTable,
  createIndexes,
  dropAllTables,
  initTables,
};

export default initTables;
