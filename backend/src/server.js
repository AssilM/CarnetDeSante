import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";
import initTables, { dropAllTables } from "./data/createTables.js";
import { createNotificationTriggers } from "./data/notificationTriggers.js";
import seedDatabase from "./data/seedData.js";
import cors from "cors";
import { checkAppointmentsStatus } from "./appointment/rendezvous.service.js";
import notificationListener from "./notification/notificationListener.js";

dotenv.config();

const port = process.env.PORT || 5001;

// Créer les tables et générer des données de test
const initDatabase = async () => {
  try {
    // Pour réinitialiser complètement la base de données, décommentez la ligne suivante
    await dropAllTables();

    // Initialiser les tables
    await initTables();
    console.log("Base de données initialisée avec succès");

    // Créer les triggers de notifications
    await createNotificationTriggers();
    console.log("Triggers de notifications créés avec succès");

    // Générer des données de test
    await seedDatabase();
    console.log("Données de test générées avec succès");
  } catch (err) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      err
    );
  }
};

// Initialiser la base de données
initDatabase();
app.use(cors());
// Démarrer le serveur
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  // Démarrer le listener de notifications
  try {
    await notificationListener.connect();
    console.log("🔔 NotificationListener démarré avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors du démarrage du NotificationListener:",
      error
    );
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
