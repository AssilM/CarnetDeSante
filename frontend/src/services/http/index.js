/**
 * Point d'entrée pour tous les services HTTP
 * Permet d'importer facilement tous les services depuis un seul fichier
 */

import httpService from "./httpService";
import createAuthConnector from "./apiConnector";
import errorHandler from "./errorHandler";

export { httpService, createAuthConnector, errorHandler };
