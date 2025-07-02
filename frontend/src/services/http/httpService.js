import axios from "axios";

// URL de base de l'API
const BASE_URL = "http://localhost:5001/api";

// Client HTTP de base sans authentification
export const httpService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Ajouter un intercepteur pour ajouter automatiquement le token d'accès s'il existe
httpService.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    console.log("[HTTP Service] Ajout du token d'accès à la requête", {
      url: config.url,
    });
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Ajouter des intercepteurs globaux pour la gestion des erreurs
httpService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log des erreurs pour le debugging
    console.error("Erreur HTTP:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    if (error.response?.status === 403) {
      // Redirige vers la page interdite
      if (typeof window !== "undefined") {
        window.location = "/403";
      }
    }
    return Promise.reject(error);
  }
);

export default httpService;
