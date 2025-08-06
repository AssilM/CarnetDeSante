import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le répertoire backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";
import messagingPool from "../config/messagingDb.js";

// Migrer les données de messagerie de Database vers Messagerie
const migrateMessagingData = async () => {
  try {
    console.log("🔄 Migration des données de messagerie...");

    // 1. Récupérer les conversations existantes
    console.log("📥 Récupération des conversations...");
    const conversationsResult = await pool.query(`
      SELECT id, rendez_vous_id, patient_id, medecin_id, created_at, updated_at
      FROM conversations
      ORDER BY id
    `);

    const conversations = conversationsResult.rows;
    console.log(`📊 ${conversations.length} conversations trouvées`);

    // 2. Insérer les conversations dans la nouvelle base
    for (const conversation of conversations) {
      await messagingPool.query(`
        INSERT INTO conversations (id, rendez_vous_id, patient_id, medecin_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [
        conversation.id,
        conversation.rendez_vous_id,
        conversation.patient_id,
        conversation.medecin_id,
        conversation.created_at,
        conversation.updated_at
      ]);
    }
    console.log("✅ Conversations migrées");

    // 3. Récupérer les messages existants
    console.log("📥 Récupération des messages...");
    const messagesResult = await pool.query(`
      SELECT id, conversation_id, sender_id, content, type, is_read, created_at
      FROM messages
      ORDER BY id
    `);

    const messages = messagesResult.rows;
    console.log(`📊 ${messages.length} messages trouvés`);

    // 4. Insérer les messages dans la nouvelle base
    for (const message of messages) {
      await messagingPool.query(`
        INSERT INTO messages (id, conversation_id, sender_id, content, type, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [
        message.id,
        message.conversation_id,
        message.sender_id,
        message.content,
        message.type,
        message.is_read,
        message.created_at
      ]);
    }
    console.log("✅ Messages migrés");

    // 5. Vérifier la migration
    const conversationsCount = await messagingPool.query('SELECT COUNT(*) FROM conversations');
    const messagesCount = await messagingPool.query('SELECT COUNT(*) FROM messages');

    console.log("📊 Vérification de la migration:");
    console.log(`   - Conversations: ${conversationsCount.rows[0].count}`);
    console.log(`   - Messages: ${messagesCount.rows[0].count}`);

    console.log("🎉 Migration des données de messagerie terminée avec succès");

  } catch (error) {
    console.error("❌ Erreur lors de la migration des données:", error);
    throw error;
  }
};

// Exécuter la migration si le script est appelé directement
if (process.argv[1] && process.argv[1].endsWith('migrateMessagingData.js')) {
  migrateMessagingData()
    .then(() => {
      console.log("✅ Migration terminée");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

export default migrateMessagingData; 