import messagingPool from "../config/messagingDb.js";
import pool from "../config/db.js";

// Fonction pour supprimer une table spécifique de la base Messagerie
const dropMessagingTable = async (tableName) => {
  const queryText = `DROP TABLE IF EXISTS ${tableName} CASCADE`;

  try {
    await messagingPool.query(queryText);
    console.log(`Table ${tableName} supprimée avec succès de la base 'Messagerie'`);
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la table ${tableName}:`,
      error
    );
    throw error;
  }
};

// Fonction pour supprimer toutes les tables de messagerie
const dropAllMessagingTables = async () => {
  try {
    // Ordre de suppression important pour respecter les contraintes de clés étrangères
    await dropMessagingTable("messages");
    await dropMessagingTable("conversations");
    console.log("Toutes les tables de messagerie ont été supprimées avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression des tables de messagerie:", error);
    throw error;
  }
};

// Fonction pour supprimer les tables de messagerie de la base "Database"
const cleanupMessagingTables = async () => {
  try {
    console.log("🧹 Nettoyage des tables de messagerie de la base 'Database'...");

    // Supprimer les tables dans l'ordre (messages d'abord car elle référence conversations)
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    console.log("✅ Table messages supprimée de la base 'Database'");

    await pool.query('DROP TABLE IF EXISTS conversations CASCADE');
    console.log("✅ Table conversations supprimée de la base 'Database'");

    console.log("🎉 Nettoyage terminé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des tables:", error);
    throw error;
  }
};

const createConversationsTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      rendez_vous_id INTEGER UNIQUE,
      patient_id INTEGER NOT NULL,
      medecin_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await messagingPool.query(queryText);
    console.log("Table conversations créée avec succès dans la base 'Messagerie'");
  } catch (error) {
    console.error("Erreur lors de la création de la table conversations:", error);
    throw error;
  }
};

const createMessagesTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await messagingPool.query(queryText);
    console.log("Table messages créée avec succès dans la base 'Messagerie'");
  } catch (error) {
    console.error("Erreur lors de la création de la table messages:", error);
    throw error;
  }
};

const createMessagingIndexes = async () => {
  const queries = [
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_patient_id ON conversations(patient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_medecin_id ON conversations(medecin_id)`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_rendez_vous_id ON conversations(rendez_vous_id)`,
  ];

  try {
    for (const query of queries) {
      await messagingPool.query(query);
    }
    console.log("Index de messagerie créés avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des index de messagerie:", error);
    throw error;
  }
};

// Fonction principale pour initialiser toutes les tables de messagerie
const createMessagingTables = async () => {
  try {
    // Supprimer toutes les tables de messagerie avant de les recréer
    await dropAllMessagingTables();

    await createConversationsTable();
    await createMessagesTable();
    await createMessagingIndexes();
    console.log("Initialisation des tables de messagerie terminée");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des tables de messagerie:", error);
  }
};

export {
  createConversationsTable,
  createMessagesTable,
  createMessagingIndexes,
  dropAllMessagingTables,
  createMessagingTables,
  cleanupMessagingTables,
};

export default createMessagingTables; 