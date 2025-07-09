const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

// Token de test - vous devrez le remplacer par un vrai token
const TEST_TOKEN = "your-jwt-token-here";

async function testModification() {
  console.log("🧪 Test des opérations de modification...\n");

  try {
    // Configuration des headers avec token
    const config = {
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    // Test 1: Créer une disponibilité
    console.log("1. Test POST /disponibilite - Création");
    const createData = {
      medecin_id: 1,
      jour: "lundi",
      heure_debut: "09:00",
      heure_fin: "12:00",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/disponibilite`,
        createData,
        config
      );
      console.log("✅ Création réussie:", response.status, response.data);

      const availabilityId = response.data.id;

      // Test 2: Modifier la disponibilité créée
      console.log("\n2. Test PUT /disponibilite/:id - Modification");
      const updateData = {
        jour: "mardi",
        heure_debut: "10:00",
        heure_fin: "13:00",
      };

      try {
        const updateResponse = await axios.put(
          `${BASE_URL}/disponibilite/${availabilityId}`,
          updateData,
          config
        );
        console.log(
          "✅ Modification réussie:",
          updateResponse.status,
          updateResponse.data
        );

        // Test 3: Supprimer la disponibilité
        console.log("\n3. Test DELETE /disponibilite/:id - Suppression");
        try {
          const deleteResponse = await axios.delete(
            `${BASE_URL}/disponibilite/${availabilityId}`,
            config
          );
          console.log(
            "✅ Suppression réussie:",
            deleteResponse.status,
            deleteResponse.data
          );
        } catch (error) {
          console.log(
            "❌ Erreur suppression:",
            error.response?.status,
            error.response?.data
          );
        }
      } catch (error) {
        console.log(
          "❌ Erreur modification:",
          error.response?.status,
          error.response?.data
        );
      }
    } catch (error) {
      console.log(
        "❌ Erreur création:",
        error.response?.status,
        error.response?.data
      );
    }

    console.log("\n");

    // Test 4: Test avec des données invalides
    console.log("4. Test avec format d'heure invalide");
    const invalidData = {
      medecin_id: 1,
      jour: "lundi",
      heure_debut: "25:00", // Heure invalide
      heure_fin: "12:00",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/disponibilite`,
        invalidData,
        config
      );
      console.log("✅ Réponse:", response.status, response.data);
    } catch (error) {
      console.log(
        "❌ Erreur attendue:",
        error.response?.status,
        error.response?.data
      );
    }

    console.log("\n");

    // Test 5: Test avec jour invalide
    console.log("5. Test avec jour invalide");
    const invalidDayData = {
      medecin_id: 1,
      jour: "invalidday",
      heure_debut: "09:00",
      heure_fin: "12:00",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/disponibilite`,
        invalidDayData,
        config
      );
      console.log("✅ Réponse:", response.status, response.data);
    } catch (error) {
      console.log(
        "❌ Erreur attendue:",
        error.response?.status,
        error.response?.data
      );
    }
  } catch (error) {
    console.error("Erreur générale:", error.message);
  }
}

// Instructions pour utiliser le script
console.log("📋 Instructions:");
console.log(
  "1. Assurez-vous que le serveur backend est démarré sur le port 5001"
);
console.log("2. Connectez-vous en tant que médecin dans l'application");
console.log("3. Récupérez le token JWT depuis les outils de développement");
console.log('4. Remplacez "your-jwt-token-here" par votre token');
console.log("5. Exécutez: node test-modification.js\n");

// Vérifier si un token est fourni
if (TEST_TOKEN === "your-jwt-token-here") {
  console.log(
    "⚠️  Veuillez d'abord configurer un token JWT valide dans le script."
  );
} else {
  testModification();
}
