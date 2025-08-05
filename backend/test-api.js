import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// Créer un token de test pour un médecin
const createTestToken = () => {
  const payload = {
    id: 3, // ID du médecin dans les données de test
    email: "medecin1@example.com",
    role: "medecin",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  console.log("🔑 Token généré:", token);
  console.log("📋 Payload:", payload);

  return token;
};

// Tester l'API de messagerie
const testMessagingAPI = async () => {
  const token = createTestToken();

  try {
    console.log("\n🧪 Test de l'API /messaging/contacts...");

    const response = await axios.get(
      "http://localhost:5001/api/messaging/contacts",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Réponse réussie:", response.status);
    console.log("📋 Données:", response.data);
  } catch (error) {
    console.error(
      "❌ Erreur API:",
      error.response?.status,
      error.response?.data
    );
    console.error("❌ Message d'erreur:", error.message);
  }
};

testMessagingAPI();
