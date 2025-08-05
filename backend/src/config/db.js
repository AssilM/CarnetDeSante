import pkg from "pg"; //permet la connexion à la base de données postgres
import dotenv from "dotenv"; //Pour charger les variables d'environnement
const { Pool } = pkg; //Pool est un gestionnaire de connexions à la base de données

dotenv.config();

// Vérifier que les variables d'environnement nécessaires sont définies
const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
];

// Variables d'environnement pour la base de données de messagerie
const requiredChatEnvVars = [
  "CHAT_DB_HOST",
  "CHAT_DB_USER",
  "CHAT_DB_PASSWORD",
  "CHAT_DB_NAME",
  "CHAT_DB_PORT",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
); //Fonction pour vérifier si les variables d'environnement sont définies
// ! Négation, envoie l'inverse d'un boolean

const missingChatEnvVars = requiredChatEnvVars.filter(
  (varName) => !process.env[varName]
);

//Si les variables d'environnement sont définies, on affiche un message de succès

if (missingEnvVars.length === 0) {
  console.log("Variables d'environnement principales chargées avec succès");
}

if (missingChatEnvVars.length === 0) {
  console.log("Variables d'environnement de messagerie chargées avec succès");
}

//Si les variables d'environnement sont manquantes, on affiche un message d'erreur
if (missingEnvVars.length > 0) {
  console.error(
    `Variables d'environnement principales manquantes: ${missingEnvVars.join(
      ", "
    )}`
  );
  console.error("Veuillez vérifier votre fichier .env");
}

if (missingChatEnvVars.length > 0) {
  console.error(
    `Variables d'environnement de messagerie manquantes: ${missingChatEnvVars.join(
      ", "
    )}`
  );
  console.error("Veuillez vérifier votre fichier .env");
}
//join transforme un tableau en une chaîne de caractères avec le séparateur
//fournit en parametre

// Configuration de la connexion à la base de données principale
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // Paramètres supplémentaires pour améliorer la stabilité
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // Temps maximum d'inactivité d'un client avant d'être libéré
  connectionTimeoutMillis: 2000, // Temps maximum pour établir une connexion
});

// Configuration de la connexion à la base de données de messagerie
const chatPool = new Pool({
  host: process.env.CHAT_DB_HOST || process.env.DB_HOST,
  user: process.env.CHAT_DB_USER || process.env.DB_USER,
  password: process.env.CHAT_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.CHAT_DB_NAME || process.env.DB_NAME,
  port: process.env.CHAT_DB_PORT || process.env.DB_PORT,
  // Paramètres supplémentaires pour améliorer la stabilité
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // Temps maximum d'inactivité d'un client avant d'être libéré
  connectionTimeoutMillis: 2000, // Temps maximum pour établir une connexion
});

// Événements du pool de connexions principal
pool.on("connect", () => {
  console.log("Connexion à la base de données principale établie");
});
//pool.on se déclenche quand ce qu'il y a en parametre se produit
//Ici c'est "connect" dond quand une connexion physique est établie

pool.on("error", (err) => {
  console.error("Erreur inattendue du pool de connexions principal:", err);
  // En cas d'erreur grave, on peut choisir de terminer le processus
  // process.exit(-1);
});

// Événements du pool de connexions de messagerie
chatPool.on("connect", () => {
  console.log("Connexion à la base de données de messagerie établie");
});

chatPool.on("error", (err) => {
  console.error("Erreur inattendue du pool de connexions de messagerie:", err);
});

// Fonction pour tester la connexion à la base de données principale
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Connexion à la base de données principale réussie");
    client.release();
    return true;
  } catch (error) {
    console.error(
      "Erreur de connexion à la base de données principale:",
      error
    );
    return false;
  }
};

// Fonction pour tester la connexion à la base de données de messagerie
const testChatDatabaseConnection = async () => {
  try {
    const client = await chatPool.connect();
    console.log("Connexion à la base de données de messagerie réussie");
    client.release();
    return true;
  } catch (error) {
    console.error(
      "Erreur de connexion à la base de données de messagerie:",
      error
    );
    return false;
  }
};

// Tester les connexions au démarrage
testDatabaseConnection();
testChatDatabaseConnection();

export { pool, chatPool };
export default pool;
