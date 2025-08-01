import { testHourlyReminders } from "./src/utils/cron.service.js";

console.log("🧪 Test manuel du cron de rappels");
console.log("==================================");

// Afficher l'heure actuelle
const now = new Date();
console.log(`🕐 Heure actuelle: ${now.toLocaleString("fr-FR")}`);

// Calculer l'heure dans 24h
const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
console.log(
  `🕐 Heure dans 24h: ${twentyFourHoursFromNow.toLocaleString("fr-FR")}`
);

console.log("\n📧 Test du cron de rappels 24h...");
console.log("Recherche des RDV confirmés dans les 24h qui suivent...");

try {
  const result = await testHourlyReminders();

  console.log("\n📊 Résultats du test :");
  console.log(`   - RDV trouvés: ${result.total}`);
  console.log(`   - Emails envoyés: ${result.sent}`);

  if (result.total === 0) {
    console.log("\n💡 Aucun RDV trouvé. Vérifiez que :");
    console.log("   - Il y a des RDV avec statut = 'confirmé'");
    console.log("   - Les RDV sont dans les 24h qui suivent");
    console.log(
      "   - Les RDV n'ont pas encore reçu de rappel (reminder_sent = false)"
    );
    console.log("   - Les patients ont un email valide");
  } else if (result.sent === 0) {
    console.log("\n⚠️ RDV trouvés mais aucun email envoyé. Vérifiez :");
    console.log("   - La configuration email");
    console.log("   - Les templates d'email");
  } else {
    console.log("\n✅ Test réussi ! Rappels envoyés avec succès.");
  }
} catch (error) {
  console.error("❌ Erreur lors du test:", error.message);
  console.error("Stack trace:", error.stack);
}

console.log("\n🏁 Test terminé");
process.exit(0);
