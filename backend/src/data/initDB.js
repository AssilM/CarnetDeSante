import { initTables } from "./createTables.js";
import createMessagingTables from "./createMessagingTables.js";
import { initNotificationFunctions } from "./notificationFunctions.js";
import { createNotificationTriggers } from "./notificationTriggers.js";
import pool from "../config/db.js";

const initializeDatabase = async () => {
  try {
    console.log("🚀 Initialisation de la base de données...");

    // 1. Créer les tables principales
    console.log("📋 Création des tables principales...");
    await initTables();
    console.log("✅ Tables principales créées avec succès");

    // 2. Initialiser les tables de messagerie
    console.log("💬 Initialisation des tables de messagerie...");
    await createMessagingTables();
    console.log("✅ Tables de messagerie créées avec succès");

    // 3. Créer les fonctions de notification
    console.log("🔔 Création des fonctions de notification...");
    await initNotificationFunctions();
    console.log("✅ Fonctions de notification créées avec succès");

    // 4. Créer les triggers de notification
    console.log("⚡ Création des triggers de notification...");
    await createNotificationTriggers();
    console.log("✅ Triggers de notification créés avec succès");

    console.log("🎉 Base de données initialisée avec succès !");
    
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
    throw error;
  }
};

export default initializeDatabase;
