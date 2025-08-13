import dotenv from "dotenv";
import { resolve } from "path";

// Charger les variables d'environnement de test
dotenv.config({ path: resolve(process.cwd(), "test.env") });

// Configuration globale pour les tests
console.log("🧪 Configuration des tests backend");
console.log(
  `DB: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
);
