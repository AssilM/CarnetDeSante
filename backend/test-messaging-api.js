import axios from "axios";

const BASE_URL = "http://localhost:5001/api";

async function testMessagingAPI() {
  try {
    console.log("🔍 Test de l'API de messagerie...");

    // Test de base - vérifier que le serveur répond
    const baseResponse = await axios.get(`${BASE_URL}/auth/test`);
    console.log("✅ Serveur accessible:", baseResponse.status);

    // Test de l'endpoint de messagerie (sans token pour voir l'erreur)
    try {
      const messagingResponse = await axios.get(
        `${BASE_URL}/messaging/conversations`
      );
      console.log("✅ API de messagerie accessible:", messagingResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(
          "✅ API de messagerie accessible (401 attendu - pas de token)"
        );
      } else {
        console.error(
          "❌ Erreur API de messagerie:",
          error.response?.status,
          error.response?.data
        );
      }
    }

    // Test de l'endpoint available-users
    try {
      const availableUsersResponse = await axios.get(
        `${BASE_URL}/messaging/available-users`
      );
      console.log(
        "✅ Available users accessible:",
        availableUsersResponse.status
      );
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(
          "✅ Available users accessible (401 attendu - pas de token)"
        );
      } else {
        console.error(
          "❌ Erreur available users:",
          error.response?.status,
          error.response?.data
        );
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  }
}

testMessagingAPI();
