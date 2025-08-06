import messagingPool from "../config/messagingDb.js";

// Créer les tables de messagerie si elles n'existent pas
const initMessagingTables = async () => {
  try {
    console.log("🔧 Initialisation des tables de messagerie...");

    // Créer la table conversations
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        rendez_vous_id INTEGER REFERENCES rendez_vous(id) ON DELETE CASCADE,
        patient_id INTEGER NOT NULL REFERENCES patient(utilisateur_id) ON DELETE CASCADE,
        medecin_id INTEGER NOT NULL REFERENCES medecin(utilisateur_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(rendez_vous_id)
      )
    `;

    // Créer la table messages
    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Créer les index pour optimiser les performances
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_conversations_patient_id ON conversations(patient_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_medecin_id ON conversations(medecin_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_rendez_vous_id ON conversations(rendez_vous_id);
    `;

    // Exécuter les requêtes
    await messagingPool.query(createConversationsTable);
    console.log("✅ Table conversations créée/vérifiée");

    await messagingPool.query(createMessagesTable);
    console.log("✅ Table messages créée/vérifiée");

    await messagingPool.query(createIndexes);
    console.log("✅ Index créés/vérifiés");

    console.log("🎉 Tables de messagerie initialisées avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des tables de messagerie:", error);
    throw error;
  }
};

// Exécuter l'initialisation si le script est appelé directement
if (process.argv[1] && process.argv[1].endsWith('initMessagingTables.js')) {
  initMessagingTables()
    .then(() => {
      console.log("✅ Initialisation terminée");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

export default initMessagingTables; 