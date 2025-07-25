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

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
); //Fonction pour vérifier si les variables d'environnement sont définies
// ! Négation, envoie l'inverse d'un boolean

//Si les variables d'environnement sont définies, on affiche un message de succès

if (missingEnvVars.length === 0) {
  console.log("Variables d'environnement chargées avec succès");
}

//Si les variables d'environnement sont manquantes, on affiche un message d'erreur
if (missingEnvVars.length > 0) {
  console.error(
    `Variables d'environnement manquantes: ${missingEnvVars.join(", ")}`
  );
  console.error("Veuillez vérifier votre fichier .env");
}
//join transforme un tableau en une chaîne de caractères avec le séparateur
//fournit en parametre

// Configuration de la connexion à la base de données
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

// Événements du pool de connexions
pool.on("connect", () => {
  console.log("Connexion à la base de données établie");
});
//pool.on se déclenche quand ce qu'il y a en parametre se produit
//Ici c'est "connect" dond quand une connexion physique est établie

pool.on("error", (err) => {
  console.error("Erreur inattendue du pool de connexions:", err);
  // En cas d'erreur grave, on peut choisir de terminer le processus
  // process.exit(-1);
});

// Fonction pour tester la connexion à la base de données
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Connexion à la base de données réussie");
    client.release();
    return true;
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    return false;
  }
};

// Tester la connexion au démarrage
testDatabaseConnection();

export default pool;
