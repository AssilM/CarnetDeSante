import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js"
import initTables, { dropAllTables } from "./data/createTables.js";
import { createNotificationTriggers } from "./data/notificationTriggers.js";
import seedDatabase from "./data/seedData.js";
import cors from "cors";
import { checkAppointmentsStatus } from "./appointment/rendezvous.service.js";
import notificationListener from "./notification/notificationListener.js";
import { createServer } from 'http';
import SocketServer from './websocket/socketServer.js';
import initMessagingTables from './data/initMessagingTables.js';
import { createMessagingTables, cleanupMessagingTables } from './data/createMessagingTables.js';


dotenv.config();

const port = process.env.PORT || 5001;

// Réinitialiser complètement les deux bases de données
const initDatabase = async () => {
  try {
    console.log("🔄 Réinitialisation complète des bases de données...");
    
    // 1. Réinitialiser la base "Database"
    console.log("📋 Réinitialisation de la base 'Database'...");
    await dropAllTables();
    await initTables();
    await createNotificationTriggers();
    await seedDatabase(true); // Mode force pour créer les données de test
    console.log("✅ Base 'Database' réinitialisée avec succès");

    // 2. Réinitialiser la base "Messagerie"
    console.log("📋 Réinitialisation de la base 'Messagerie'...");
    await cleanupMessagingTables(); // Supprimer les tables existantes    await createMessagingTables(); // Recréer les tables

    console.log("✅ Base 'Messagerie' réinitialisée avec succès");

    console.log("🎉 Toutes les bases de données ont été réinitialisées");
  } catch (err) {
    console.error("❌ Erreur lors de la réinitialisation des bases de données:", err);
  }
};

// Pour réinitialiser complètement les deux bases de données, décommentez la ligne suivante :
//initDatabase();
app.use(cors());

// Créer le serveur HTTP
const server = createServer(app);

// Initialiser le serveur WebSocket
const socketServer = new SocketServer(server);

<<<<<<< Updated upstream
=======
// Créer les tables et générer des données de test
const initDatabase = async () => {
  try {
    // Pour réinitialiser complètement la base de données, décommentez la ligne suivante
    await dropAllTables();

    // Initialiser les tables
    await initTables();
    console.log("Base de données principale initialisée avec succès");

    // Créer les triggers de notifications
    await createNotificationTriggers();
    console.log("Triggers de notifications créés avec succès");

    // Générer des données de test
    await seedDatabase();
    console.log("Données de test générées avec succès");
  } catch (err) {
    console.error(
      "Erreur lors de l'initialisation de la base de données principale:",
      err
    );
  }
};

// Initialiser la base de données de messagerie
const initChatDatabase = async () => {
  try {
    // Pour réinitialiser complètement la base de données de messagerie, décommentez la ligne suivante
    await dropAllChatTables();

    // Initialiser les tables de messagerie
    await initChatTables();
    console.log("Base de données de messagerie initialisée avec succès");
  } catch (err) {
    console.error(
      "Erreur lors de l'initialisation de la base de données de messagerie:",
      err
    );
  }
};

// Initialiser la base de données
//CREER UN SCRIPT D INITIALISATION DE LA BASE DE DONNEES
initDatabase();
initChatDatabase();
app.use(cors(
  {
    origin: ["http://localhost", "http://localhost:5173"]
  }
));
>>>>>>> Stashed changes
// Démarrer le serveur
server.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  // Initialiser les tables de messagerie
  try {
    await initMessagingTables();
    console.log("💬 Tables de messagerie initialisées");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des tables de messagerie:", error);
  }

  // Démarrer le NotificationListener
  try {
    notificationListener.connect();
    console.log("🔔 NotificationListener démarré avec succès");
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du NotificationListener:", error);
  }

  // Démarrer la vérification périodique des statuts des rendez-vous
  console.log(
    "Démarrage de la vérification périodique des statuts de rendez-vous..."
  );

  // Exécuter immédiatement une première fois
  checkAppointmentsStatus()
    .then((result) => {
      console.log("Vérification initiale des statuts terminée:", {
        enCoursUpdated: result.enCoursUpdated,
        termineUpdated: result.termineUpdated,
      });
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la vérification initiale des statuts:",
        error
      );
    });

  // Configurer l'interval pour vérifier toutes les minutes
  const CHECK_INTERVAL = 60 * 1000; // 60 secondes
  setInterval(async () => {
    try {
      const result = await checkAppointmentsStatus();
      if (result.enCoursUpdated > 0 || result.termineUpdated > 0) {
        console.log(`[${new Date().toISOString()}] Mise à jour des statuts:`, {
          enCoursUpdated: result.enCoursUpdated,
          termineUpdated: result.termineUpdated,
        });
      }
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Erreur lors de la vérification périodique des statuts:`,
        error
      );
    }
  }, CHECK_INTERVAL);
});
<<<<<<< Updated upstream

=======
export { initDatabase, initChatDatabase, server };
>>>>>>> Stashed changes
