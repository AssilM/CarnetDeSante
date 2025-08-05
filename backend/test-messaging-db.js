import { chatPool } from "./src/config/db.js";

async function testMessagingDB() {
  try {
    console.log("🔍 Test de connexion à la base de données de messagerie...");

    // Test de connexion
    const result = await chatPool.query("SELECT NOW() as current_time");
    console.log("✅ Connexion réussie:", result.rows[0]);

    // Vérifier si les tables existent
    const tablesResult = await chatPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('conversations', 'messages')
    `);

    console.log(
      "📋 Tables trouvées:",
      tablesResult.rows.map((row) => row.table_name)
    );

    // Vérifier la structure de la table conversations
    const conversationsStructure = await chatPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
    `);

    console.log("🏗️ Structure de la table conversations:");
    conversationsStructure.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Vérifier la structure de la table messages
    const messagesStructure = await chatPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
    `);

    console.log("🏗️ Structure de la table messages:");
    messagesStructure.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await chatPool.end();
  }
}

testMessagingDB();
