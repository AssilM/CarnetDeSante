import pool from "../config/db.js";

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
      chemin_photo VARCHAR(255),
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
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      token VARCHAR(255) UNIQUE NOT NULL,
      utilisateur_id INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
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

const initTables = async () => {
  try {
    await createUserTable();
    await createRefreshTokenTable();
    console.log("Initialisation des tables terminée");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des tables:", error);
  }
};

export { createUserTable, createRefreshTokenTable, initTables };
export default initTables;
