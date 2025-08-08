import { chatPool } from "../config/db.js";

// Fonction pour supprimer une table spécifique de messagerie
const dropChatTable = async (tableName) => {
  const queryText = `DROP TABLE IF EXISTS ${tableName} CASCADE`;

  try {
    await chatPool.query(queryText);
    console.log(`Table de messagerie ${tableName} supprimée avec succès`);
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la table de messagerie ${tableName}:`,
      error
    );
    throw error;
  }
};

// Fonction pour supprimer toutes les tables de messagerie
const dropAllChatTables = async () => {
  try {
    // Ordre de suppression important pour respecter les contraintes de clés étrangères
    await dropChatTable("messages");
    await dropChatTable("conversations");
    console.log(
      "Toutes les tables de messagerie ont été supprimées avec succès"
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des tables de messagerie:",
      error
    );
    throw error;
  }
};

// Table des conversations
const createConversationsTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
      last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (patient_id, doctor_id)
    )
  `;

  try {
    await chatPool.query(queryText);
    console.log("Table conversations créée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la création de la table conversations:",
      error
    );
    throw error;
  }
};

// Table des messages simplifiée
const createMessagesTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT FALSE
    )
  `;

  try {
    await chatPool.query(queryText);
    console.log("Table messages créée avec succès");
  } catch (error) {
    console.error("Erreur lors de la création de la table messages:", error);
    throw error;
  }
};

// Création des index pour optimiser les performances
const createChatIndexes = async () => {
  const queries = [
    // Index pour les conversations
    `CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_doctor ON conversations(doctor_id)`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at)`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)`,

    // Index pour les messages
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read)`,
  ];

  try {
    for (const query of queries) {
      try {
        await chatPool.query(query);
      } catch (indexError) {
        console.warn(`Index non créé (peut-être déjà existant): ${query}`);
        // Continuer avec les autres index même si celui-ci échoue
      }
    }
    console.log("Index de messagerie créés avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des index de messagerie:", error);
    // Ne pas faire échouer l'initialisation pour des erreurs d'index
    console.log("Continuing without indexes...");
  }
};

// Fonction principale pour initialiser toutes les tables de messagerie
const initChatTables = async () => {
  try {
    // Décommentez la ligne suivante pour supprimer toutes les tables avant de les recréer
    await dropAllChatTables();

    await createConversationsTable();
    await createMessagesTable();
    await createChatIndexes();

    console.log("Initialisation des tables de messagerie terminée");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation des tables de messagerie:",
      error
    );
    throw error;
  }
};

// Fonction pour tester la connexion à la base de données de messagerie
const testChatDatabaseConnection = async () => {
  try {
    const client = await chatPool.connect();
    console.log("Connexion à la base de données de messagerie réussie");
    client.release();
    return true;
  } catch (error) {
    console.error(
      "Erreur de connexion à la base de données de messagerie:",
      error
    );
    return false;
  }
};

export {
  createConversationsTable,
  createMessagesTable,
  createChatIndexes,
  dropAllChatTables,
  initChatTables,
  testChatDatabaseConnection,
};

export default initChatTables;
