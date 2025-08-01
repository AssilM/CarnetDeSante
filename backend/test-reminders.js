import {
  testHourlyReminders,
  testDailyReminders,
} from "./src/utils/cron.service.js";

console.log("🧪 Test manuel des reminders de rendez-vous");
console.log("==========================================");

// Test des rappels horaires
console.log("\n📧 Test des rappels horaires (RDV dans l'heure)...");
try {
  const hourlyResult = await testHourlyReminders();
  console.log("✅ Test horaire terminé");
} catch (error) {
  console.error("❌ Erreur lors du test horaire:", error.message);
}

// Test des rappels quotidiens (désactivé - logique unifiée)
console.log("\n📧 Test des rappels quotidiens (désactivé)...");
console.log("ℹ️ Fonction désactivée - logique unifiée dans les rappels 24h");

console.log("\n🏁 Tests terminés");
process.exit(0);
