import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config();

// Configuration de la connexion à la base de données Messagerie
const messagingPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "Messagerie", // Base de données dédiée à la messagerie
  port: process.env.DB_PORT,
  // Paramètres supplémentaires pour améliorer la stabilité
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Événements du pool de connexions
messagingPool.on("connect", () => {
  console.log("Connexion à la base de données Messagerie établie");
});

messagingPool.on("error", (err) => {
  console.error("Erreur inattendue du pool de connexions Messagerie:", err);
});

// Fonction pour tester la connexion à la base de données Messagerie
const testMessagingDatabaseConnection = async () => {
  try {
    const client = await messagingPool.connect();
    console.log("Connexion à la base de données Messagerie réussie");
    client.release();
    return true;
  } catch (error) {
    console.error("Erreur de connexion à la base de données Messagerie:", error);
    return false;
  }
};

// Tester la connexion au démarrage
testMessagingDatabaseConnection();

export default messagingPool; 