/**
 * Script de test pour les améliorations de sécurité avancées
 * - Contrôle d'accès aux données médecins
 * - Validation des durées maximales
 * - Logs de sécurité
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Configuration des tests
const testConfig = {
  // Tokens JWT pour différents utilisateurs (à remplacer par de vrais tokens)
  tokens: {
    admin: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin_token",
    medecin1: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.medecin1_token",
    medecin2: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.medecin2_token",
    patient: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.patient_token",
  },
  userIds: {
    admin: 999,
    medecin1: 1,
    medecin2: 2,
    patient: 100,
  },
};

// Fonction utilitaire pour faire des requêtes
async function makeRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {},
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return {
      status: response.status,
      data: response.data,
      success: true,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: error.response?.data || { message: error.message },
      success: false,
    };
  }
}

// Tests de contrôle d'accès aux données médecins
async function testAccessControl() {
  console.log("\n🔐 === TESTS DE CONTRÔLE D'ACCÈS ===");

  // Test 1: Médecin créant ses propres disponibilités (AUTORISÉ)
  console.log("\n1. Test: Médecin créant ses propres disponibilités");
  const ownData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "lundi",
    heure_debut: "09:00",
    heure_fin: "17:00",
  };

  const ownResult = await makeRequest(
    "POST",
    "/disponibilite",
    ownData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${ownResult.status} - ${
      ownResult.success ? "✅ AUTORISÉ" : "❌ REFUSÉ"
    }`
  );
  if (!ownResult.success) {
    console.log(`   Erreur: ${ownResult.data.message}`);
  }

  // Test 2: Médecin essayant de créer pour un autre médecin (REFUSÉ)
  console.log("\n2. Test: Médecin créant pour un autre médecin");
  const otherData = {
    medecin_id: testConfig.userIds.medecin2,
    jour: "mardi",
    heure_debut: "10:00",
    heure_fin: "18:00",
  };

  const otherResult = await makeRequest(
    "POST",
    "/disponibilite",
    otherData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${otherResult.status} - ${
      otherResult.success ? "❌ AUTORISÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!otherResult.success) {
    console.log(`   Message: ${otherResult.data.message}`);
  }

  // Test 3: Admin créant pour n'importe quel médecin (AUTORISÉ)
  console.log("\n3. Test: Admin créant pour un médecin");
  const adminData = {
    medecin_id: testConfig.userIds.medecin2,
    jour: "mercredi",
    heure_debut: "08:00",
    heure_fin: "16:00",
  };

  const adminResult = await makeRequest(
    "POST",
    "/disponibilite",
    adminData,
    testConfig.tokens.admin
  );
  console.log(
    `   Résultat: ${adminResult.status} - ${
      adminResult.success ? "✅ AUTORISÉ" : "❌ REFUSÉ"
    }`
  );
  if (!adminResult.success) {
    console.log(`   Erreur: ${adminResult.data.message}`);
  }

  // Test 4: Patient essayant de créer (REFUSÉ)
  console.log("\n4. Test: Patient essayant de créer");
  const patientData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "jeudi",
    heure_debut: "09:00",
    heure_fin: "17:00",
  };

  const patientResult = await makeRequest(
    "POST",
    "/disponibilite",
    patientData,
    testConfig.tokens.patient
  );
  console.log(
    `   Résultat: ${patientResult.status} - ${
      patientResult.success ? "❌ AUTORISÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!patientResult.success) {
    console.log(`   Message: ${patientResult.data.message}`);
  }
}

// Tests de validation des durées maximales
async function testDurationValidation() {
  console.log("\n⏰ === TESTS DE VALIDATION DES DURÉES ===");

  // Test 1: Durée normale (8h) - AUTORISÉ
  console.log("\n1. Test: Durée normale (8 heures)");
  const normalData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "vendredi",
    heure_debut: "08:00",
    heure_fin: "16:00",
  };

  const normalResult = await makeRequest(
    "POST",
    "/disponibilite",
    normalData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${normalResult.status} - ${
      normalResult.success ? "✅ ACCEPTÉ" : "❌ REFUSÉ"
    }`
  );
  if (!normalResult.success) {
    console.log(`   Erreur: ${normalResult.data.message}`);
  }

  // Test 2: Durée limite (10h exactement) - AUTORISÉ
  console.log("\n2. Test: Durée limite (10 heures exactement)");
  const limitData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "samedi",
    heure_debut: "08:00",
    heure_fin: "18:00",
  };

  const limitResult = await makeRequest(
    "POST",
    "/disponibilite",
    limitData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${limitResult.status} - ${
      limitResult.success ? "✅ ACCEPTÉ" : "❌ REFUSÉ"
    }`
  );
  if (!limitResult.success) {
    console.log(`   Erreur: ${limitResult.data.message}`);
  }

  // Test 3: Durée excessive (12h) - REFUSÉ
  console.log("\n3. Test: Durée excessive (12 heures)");
  const excessiveData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "dimanche",
    heure_debut: "06:00",
    heure_fin: "18:00",
  };

  const excessiveResult = await makeRequest(
    "POST",
    "/disponibilite",
    excessiveData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${excessiveResult.status} - ${
      excessiveResult.success ? "❌ ACCEPTÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!excessiveResult.success) {
    console.log(`   Message: ${excessiveResult.data.message}`);
    console.log(`   Champ: ${excessiveResult.data.field}`);
    console.log(`   Durée max: ${excessiveResult.data.maxDuration}`);
  }

  // Test 4: Durée irréaliste (16h) - REFUSÉ
  console.log("\n4. Test: Durée irréaliste (16 heures)");
  const unrealisticData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "lundi",
    heure_debut: "06:00",
    heure_fin: "22:00",
  };

  const unrealisticResult = await makeRequest(
    "POST",
    "/disponibilite",
    unrealisticData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${unrealisticResult.status} - ${
      unrealisticResult.success ? "❌ ACCEPTÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!unrealisticResult.success) {
    console.log(`   Message: ${unrealisticResult.data.message}`);
  }
}

// Tests de validation des IDs
async function testIdValidation() {
  console.log("\n🔢 === TESTS DE VALIDATION DES IDs ===");

  // Test 1: ID médecin invalide (non numérique)
  console.log("\n1. Test: ID médecin non numérique");
  const invalidIdData = {
    medecin_id: "invalid-id",
    jour: "mardi",
    heure_debut: "09:00",
    heure_fin: "17:00",
  };

  const invalidIdResult = await makeRequest(
    "POST",
    "/disponibilite",
    invalidIdData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${invalidIdResult.status} - ${
      invalidIdResult.success ? "❌ ACCEPTÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!invalidIdResult.success) {
    console.log(`   Message: ${invalidIdResult.data.message}`);
  }

  // Test 2: ID médecin négatif
  console.log("\n2. Test: ID médecin négatif");
  const negativeIdData = {
    medecin_id: -1,
    jour: "mercredi",
    heure_debut: "09:00",
    heure_fin: "17:00",
  };

  const negativeIdResult = await makeRequest(
    "POST",
    "/disponibilite",
    negativeIdData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${negativeIdResult.status} - ${
      negativeIdResult.success ? "❌ ACCEPTÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!negativeIdResult.success) {
    console.log(`   Message: ${negativeIdResult.data.message}`);
  }

  // Test 3: ID médecin zéro
  console.log("\n3. Test: ID médecin zéro");
  const zeroIdData = {
    medecin_id: 0,
    jour: "jeudi",
    heure_debut: "09:00",
    heure_fin: "17:00",
  };

  const zeroIdResult = await makeRequest(
    "POST",
    "/disponibilite",
    zeroIdData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${zeroIdResult.status} - ${
      zeroIdResult.success ? "❌ ACCEPTÉ (ERREUR!)" : "✅ REFUSÉ"
    }`
  );
  if (!zeroIdResult.success) {
    console.log(`   Message: ${zeroIdResult.data.message}`);
  }
}

// Tests de cas d'usage réalistes
async function testRealisticUseCases() {
  console.log("\n🏥 === TESTS DE CAS D'USAGE RÉALISTES ===");

  // Test 1: Matinée (4h)
  console.log("\n1. Test: Matinée de consultation (4h)");
  const matineeData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "lundi",
    heure_debut: "08:00",
    heure_fin: "12:00",
  };

  const matineeResult = await makeRequest(
    "POST",
    "/disponibilite",
    matineeData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${matineeResult.status} - ${
      matineeResult.success ? "✅ ACCEPTÉ" : "❌ REFUSÉ"
    }`
  );

  // Test 2: Après-midi (4h)
  console.log("\n2. Test: Après-midi de consultation (4h)");
  const apresmidiData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "mardi",
    heure_debut: "14:00",
    heure_fin: "18:00",
  };

  const apresmidiResult = await makeRequest(
    "POST",
    "/disponibilite",
    apresmidiData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${apresmidiResult.status} - ${
      apresmidiResult.success ? "✅ ACCEPTÉ" : "❌ REFUSÉ"
    }`
  );

  // Test 3: Journée complète avec pause (9h)
  console.log("\n3. Test: Journée complète avec pause (9h)");
  const journeeData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "mercredi",
    heure_debut: "08:00",
    heure_fin: "17:00",
  };

  const journeeResult = await makeRequest(
    "POST",
    "/disponibilite",
    journeeData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${journeeResult.status} - ${
      journeeResult.success ? "✅ ACCEPTÉ" : "❌ REFUSÉ"
    }`
  );

  // Test 4: Consultation courte (2h) - limite inférieure
  console.log("\n4. Test: Consultation courte (2h)");
  const courteData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "jeudi",
    heure_debut: "10:00",
    heure_fin: "12:00",
  };

  const courteResult = await makeRequest(
    "POST",
    "/disponibilite",
    courteData,
    testConfig.tokens.medecin1
  );
  console.log(
    `   Résultat: ${courteResult.status} - ${
      courteResult.success ? "✅ ACCEPTÉ" : "❌ REFUSÉ"
    }`
  );
}

// Test de consultation publique (sans authentification)
async function testPublicAccess() {
  console.log("\n🌐 === TESTS D'ACCÈS PUBLIC ===");

  // Test 1: Consultation des disponibilités (public)
  console.log("\n1. Test: Consultation des disponibilités (sans token)");
  const publicResult = await makeRequest(
    "GET",
    `/disponibilite/medecin/${testConfig.userIds.medecin1}`
  );
  console.log(
    `   Résultat: ${publicResult.status} - ${
      publicResult.success ? "✅ ACCESSIBLE" : "❌ BLOQUÉ"
    }`
  );

  // Test 2: Consultation des créneaux (public)
  console.log("\n2. Test: Consultation des créneaux (sans token)");
  const creneauxResult = await makeRequest(
    "GET",
    `/disponibilite/medecin/${testConfig.userIds.medecin1}/creneaux`
  );
  console.log(
    `   Résultat: ${creneauxResult.status} - ${
      creneauxResult.success ? "✅ ACCESSIBLE" : "❌ BLOQUÉ"
    }`
  );

  // Test 3: Création sans token (doit être bloqué)
  console.log("\n3. Test: Création sans authentification");
  const createWithoutTokenData = {
    medecin_id: testConfig.userIds.medecin1,
    jour: "vendredi",
    heure_debut: "09:00",
    heure_fin: "17:00",
  };

  const createWithoutTokenResult = await makeRequest(
    "POST",
    "/disponibilite",
    createWithoutTokenData
  );
  console.log(
    `   Résultat: ${createWithoutTokenResult.status} - ${
      createWithoutTokenResult.success ? "❌ ACCESSIBLE (ERREUR!)" : "✅ BLOQUÉ"
    }`
  );
}

// Fonction principale
async function runAllTests() {
  console.log("🧪 === TESTS DE SÉCURITÉ AVANCÉE - MODULE DISPONIBILITÉS ===");
  console.log("🔗 URL de base:", BASE_URL);
  console.log(
    "⚠️  Note: Ce script nécessite que le serveur soit démarré sur le port 3000"
  );

  try {
    await testAccessControl();
    await testDurationValidation();
    await testIdValidation();
    await testRealisticUseCases();
    await testPublicAccess();

    console.log("\n✅ === TESTS TERMINÉS ===");
    console.log(
      "📋 Vérifiez les logs du serveur pour voir les messages de sécurité"
    );
    console.log("🔍 Recherchez les patterns suivants dans les logs:");
    console.log("   - [SECURITY] Tentative d'accès non autorisé");
    console.log("   - [AUDIT] Disponibilité créée/modifiée/supprimée");
    console.log("   - [VALIDATION] Durée excessive rejetée");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error.message);
    console.log("💡 Assurez-vous que le serveur backend est démarré");
  }
}

// Instructions d'utilisation
function showUsageInstructions() {
  console.log("\n📖 === INSTRUCTIONS D'UTILISATION ===");
  console.log("1. Démarrez le serveur backend:");
  console.log("   cd backend && npm start");
  console.log("");
  console.log("2. Dans un autre terminal, exécutez ce script:");
  console.log("   node test-enhanced-security.js");
  console.log("");
  console.log("3. Remplacez les tokens JWT par de vrais tokens si nécessaire");
  console.log("   (Les tokens actuels sont des exemples)");
  console.log("");
  console.log("4. Vérifiez les logs du serveur pour les messages de sécurité");
  console.log("");
  console.log("⚠️  IMPORTANT: Ces tests nécessitent que les utilisateurs test");
  console.log(
    "   (admin, medecin1, medecin2, patient) existent dans la base de données"
  );
}

// Vérification des arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showUsageInstructions();
  process.exit(0);
}

// Exécution des tests
runAllTests().catch(console.error);

module.exports = {
  makeRequest,
  testAccessControl,
  testDurationValidation,
  testIdValidation,
  testRealisticUseCases,
  testPublicAccess,
};
