/**
 * Point d'entrée pour tous les services HTTP
 * Permet d'importer facilement tous les services depuis un seul fichier
 */

import httpService from "./httpService";
import {
  clearAuth,
  getCurrentToken,
  forceResetAuth,
  setAccessToken,
  setForbiddenHandler,
} from "./httpService";
import errorHandler from "./errorHandler"; // ✅ Import par défaut

// Exporter les services HTTP essentiels
export {
  httpService,
  clearAuth,
  getCurrentToken,
  forceResetAuth,
  setAccessToken,
  setForbiddenHandler,
  errorHandler,
};
