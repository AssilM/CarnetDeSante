import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";
import initTables from "./data/createTables.js";
import seedDatabase from "./data/seedData.js";

dotenv.config();

const port = process.env.PORT || 3001;

// Créer les tables et générer des données de test
const initDatabase = async () => {
  try {
    // Initialiser les tables
    await initTables();
    console.log("Base de données initialisée avec succès");

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

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
