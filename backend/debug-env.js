import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Vérification des variables d'environnement :");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? "***" + process.env.EMAIL_PASS.slice(-4)
    : "NON DÉFINI"
);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

// Vérification
const requiredVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.log("❌ Variables manquantes:", missingVars);
} else {
  console.log("✅ Toutes les variables sont définies");
}
