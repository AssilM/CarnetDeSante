const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

async function testEndpoints() {
  console.log("🧪 Test des endpoints de disponibilité...\n");

  try {
    // Test 1: Récupérer les disponibilités d'un médecin (route publique)
    console.log("1. Test GET /disponibilite/medecin/1");
    try {
      const response = await axios.get(`${BASE_URL}/disponibilite/medecin/1`);
      console.log("✅ Succès:", response.status, response.data);
    } catch (error) {
      console.log(
        "❌ Erreur:",
        error.response?.status,
        error.response?.data || error.message
      );
    }

    console.log("\n");

    // Test 2: Récupérer les créneaux disponibles (route publique)
    console.log("2. Test GET /disponibilite/medecin/1/creneaux");
    try {
      const response = await axios.get(
        `${BASE_URL}/disponibilite/medecin/1/creneaux`
      );
      console.log("✅ Succès:", response.status, response.data);
    } catch (error) {
      console.log(
        "❌ Erreur:",
        error.response?.status,
        error.response?.data || error.message
      );
    }

    console.log("\n");

    // Test 3: Récupérer les créneaux avec une date
    console.log(
      "3. Test GET /disponibilite/medecin/1/creneaux?date=2024-01-20"
    );
    try {
      const response = await axios.get(
        `${BASE_URL}/disponibilite/medecin/1/creneaux?date=2024-01-20`
      );
      console.log("✅ Succès:", response.status, response.data);
    } catch (error) {
      console.log(
        "❌ Erreur:",
        error.response?.status,
        error.response?.data || error.message
      );
    }

    console.log("\n");

    // Test 4: Test avec un ID invalide
    console.log("4. Test GET /disponibilite/medecin/abc (ID invalide)");
    try {
      const response = await axios.get(`${BASE_URL}/disponibilite/medecin/abc`);
      console.log("✅ Succès:", response.status, response.data);
    } catch (error) {
      console.log(
        "❌ Erreur attendue:",
        error.response?.status,
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error("Erreur générale:", error.message);
  }
}

testEndpoints();
