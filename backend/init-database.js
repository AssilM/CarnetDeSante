import pool from "./src/config/db.js";
import initTables, { dropAllTables } from "./src/data/createTables.js";
import { createNotificationTriggers } from "./src/data/notificationTriggers.js";
import seedDatabase from "./src/data/seedData.js";
import { createMessagingTables, cleanupMessagingTables } from './src/data/createMessagingTables.js';

const initDatabase = async () => {
  try {
    console.log("🔄 Initialisation de la base de données...");
    
    // 1. Réinitialiser la base "Database"
    console.log("📋 Création des tables principales...");
    await dropAllTables();
    await initTables();
    await createNotificationTriggers();
    await seedDatabase(true); // Mode force pour créer les données de test
    console.log("✅ Tables principales créées avec succès");

    // 2. Réinitialiser la base "Messagerie"
    console.log("📋 Création des tables de messagerie...");
    await cleanupMessagingTables(); // Supprimer les tables existantes
    await createMessagingTables(); // Recréer les tables
    console.log("✅ Tables de messagerie créées avec succès");

    console.log("🎉 Toutes les bases de données ont été initialisées");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation des bases de données:", err);
    process.exit(1);
  }
};

// Exécuter l'initialisation
initDatabase(); 