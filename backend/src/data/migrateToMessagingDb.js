import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le répertoire backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

import createMessagingTables from "./createMessagingTables.js";
import migrateMessagingData from "./migrateMessagingData.js";
import cleanupMessagingTables from "./cleanupMessagingTables.js";

// Script principal pour migrer les tables de messagerie vers la base "Messagerie"
const migrateToMessagingDb = async () => {
  try {
    console.log("🚀 Début de la migration vers la base 'Messagerie'...");
    console.log("=".repeat(50));

    // Étape 1: Créer les tables dans la base "Messagerie"
    console.log("📋 Étape 1: Création des tables dans la base 'Messagerie'");
    await createMessagingTables();
    console.log("✅ Étape 1 terminée");
    console.log("");

    // Étape 2: Migrer les données existantes
    console.log("📥 Étape 2: Migration des données existantes");
    await migrateMessagingData();
    console.log("✅ Étape 2 terminée");
    console.log("");

    // Étape 3: Nettoyer les tables de la base "Database"
    console.log("🧹 Étape 3: Nettoyage des tables de la base 'Database'");
    await cleanupMessagingTables();
    console.log("✅ Étape 3 terminée");
    console.log("");

    console.log("🎉 Migration terminée avec succès !");
    console.log("💬 Le service de messagerie utilise maintenant la base 'Messagerie'");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  }
};

// Exécuter la migration si le script est appelé directement
if (process.argv[1] && process.argv[1].endsWith('migrateToMessagingDb.js')) {
  migrateToMessagingDb()
    .then(() => {
      console.log("✅ Migration terminée avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur lors de la migration:", error);
      process.exit(1);
    });
}

export default migrateToMessagingDb; 