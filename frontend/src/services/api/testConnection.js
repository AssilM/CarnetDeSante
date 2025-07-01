import { httpService } from "../http/httpService";

/**
 * Service de test pour vérifier la connexion au backend
 */
export const testBackendConnection = async () => {
  try {
    console.log("[testConnection] Test de connexion au backend...");

    // Test 1: Vérifier si le serveur répond
    const healthResponse = await httpService.get("/");
    console.log("[testConnection] Serveur accessible:", healthResponse.data);

    // Test 2: Vérifier l'authentification
    const token = localStorage.getItem("accessToken");
    console.log("[testConnection] Token présent:", !!token);

    if (token) {
      try {
        // Test 3: Vérifier si le token est valide
        const userResponse = await httpService.get("/user/profile");
        console.log(
          "[testConnection] Utilisateur authentifié:",
          userResponse.data
        );
        return {
          success: true,
          server: "accessible",
          auth: "valid",
          user: userResponse.data,
        };
      } catch (authError) {
        console.error(
          "[testConnection] Erreur d'authentification:",
          authError.response?.status
        );
        return {
          success: false,
          server: "accessible",
          auth: "invalid",
          error: authError.response?.data?.message || authError.message,
        };
      }
    } else {
      return {
        success: false,
        server: "accessible",
        auth: "no_token",
        error: "Aucun token d'authentification trouvé",
      };
    }
  } catch (error) {
    console.error("[testConnection] Erreur de connexion:", error);

    if (error.code === "ECONNREFUSED") {
      return {
        success: false,
        server: "unreachable",
        auth: "unknown",
        error:
          "Le serveur backend n'est pas accessible. Vérifiez qu'il est démarré sur le port 5001.",
      };
    }

    return {
      success: false,
      server: "error",
      auth: "unknown",
      error: error.message,
    };
  }
};

/**
 * Test spécifique pour les rendez-vous d'un médecin
 */
export const testDoctorAppointments = async (doctorId) => {
  try {
    console.log(
      `[testConnection] Test des rendez-vous pour le médecin ${doctorId}...`
    );

    const response = await httpService.get(`/rendez-vous/medecin/${doctorId}`);
    console.log("[testConnection] Rendez-vous récupérés:", response.data);

    return {
      success: true,
      appointments: response.data,
      count: response.data.length,
    };
  } catch (error) {
    console.error(
      "[testConnection] Erreur lors du test des rendez-vous:",
      error
    );
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

/**
 * Créer des données de test pour un médecin
 */
export const createTestAppointments = async (doctorId) => {
  try {
    console.log(
      `[testConnection] Création de données de test pour le médecin ${doctorId}...`
    );

    // Données de test
    const testAppointments = [
      {
        patient_id: 1, // Assurez-vous que ce patient existe
        medecin_id: doctorId,
        date: "2024-12-20",
        heure: "09:00",
        duree: 30,
        motif: "Consultation de routine",
        adresse: "Cabinet médical",
      },
      {
        patient_id: 2, // Assurez-vous que ce patient existe
        medecin_id: doctorId,
        date: "2024-12-20",
        heure: "10:00",
        duree: 30,
        motif: "Suivi traitement",
        adresse: "Cabinet médical",
      },
      {
        patient_id: 1,
        medecin_id: doctorId,
        date: "2024-12-21",
        heure: "14:00",
        duree: 30,
        motif: "Consultation urgente",
        adresse: "Cabinet médical",
      },
    ];

    const results = [];

    for (const appointment of testAppointments) {
      try {
        const response = await httpService.post("/rendez-vous", appointment);
        console.log(
          "[testConnection] Rendez-vous de test créé:",
          response.data
        );
        results.push({ success: true, appointment: response.data });
      } catch (error) {
        console.error(
          "[testConnection] Erreur lors de la création du rendez-vous de test:",
          error.response?.data
        );
        results.push({
          success: false,
          error: error.response?.data?.message || error.message,
        });
      }
    }

    return {
      success: true,
      results,
      created: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  } catch (error) {
    console.error(
      "[testConnection] Erreur lors de la création des données de test:",
      error
    );
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  testBackendConnection,
  testDoctorAppointments,
  createTestAppointments,
};
