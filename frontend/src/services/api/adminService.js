import { httpService } from "../http/index.js";

/**
 * Service pour la gestion des administrateurs côté frontend
 */

// ==================== GESTION DES ADMINISTRATEURS ====================

/**
 * Récupère tous les administrateurs
 */
export const getAllAdministrateurs = async () => {
  try {
    const response = await httpService.get("/admin/");
    return response.data.administrateurs;
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error);
    throw error;
  }
};

/**
 * Récupère un administrateur par son ID utilisateur
 */
export const getAdministrateurById = async (id) => {
  try {
    const response = await httpService.get(`/admin/${id}`);
    return response.data.administrateur;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'administrateur:", error);
    throw error;
  }
};

/**
 * Met à jour le niveau d'accès d'un administrateur
 */
export const updateAdministrateur = async (id, niveauAcces) => {
  try {
    const response = await httpService.put(`/admin/${id}`, {
      niveau_acces: niveauAcces,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'administrateur:", error);
    throw error;
  }
};

/**
 * Supprime un profil administrateur
 */
export const deleteAdministrateur = async (id) => {
  try {
    const response = await httpService.delete(`/admin/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'administrateur:", error);
    throw error;
  }
};

// ==================== GESTION DES UTILISATEURS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les utilisateurs
 */
export const getAllUsers = async () => {
  try {
    const response = await httpService.get("/admin/users");
    return response.data.users;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
};

/**
 * Récupère tous les utilisateurs avec leurs détails spécifiques
 */
export const getAllUsersWithDetails = async () => {
  try {
    const response = await httpService.get("/admin/users/details");
    return response.data.users;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs avec détails:",
      error
    );
    throw error;
  }
};

/**
 * Récupère un utilisateur par ID
 */
export const getUserById = async (id) => {
  try {
    const response = await httpService.get(`/admin/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
};

/**
 * Récupère un utilisateur par ID avec ses détails spécifiques
 */
export const getUserByIdWithDetails = async (id) => {
  try {
    const response = await httpService.get(`/admin/users/${id}/details`);
    return response.data.user;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur avec détails:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les utilisateurs par rôle
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await httpService.get(`/admin/users/role/${role}`);
    return response.data.users;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs par rôle:",
      error
    );
    throw error;
  }
};

/**
 * Met à jour un utilisateur
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await httpService.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur avec ses détails spécifiques
 */
export const updateUserWithDetails = async (id, userData) => {
  try {
    const response = await httpService.put(
      `/admin/users/${id}/details`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'utilisateur avec détails:",
      error
    );
    throw error;
  }
};

/**
 * Supprime un utilisateur
 */
export const deleteUser = async (id) => {
  try {
    const response = await httpService.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
};

// ==================== GESTION DES DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les documents
 */
export const getAllDocuments = async () => {
  try {
    const response = await httpService.get("/admin/documents");
    return response.data.documents;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    throw error;
  }
};

/**
 * Récupère un document par ID
 */
export const getDocumentById = async (id) => {
  try {
    const response = await httpService.get(`/admin/documents/${id}`);
    return response.data.document;
  } catch (error) {
    console.error("Erreur lors de la récupération du document:", error);
    throw error;
  }
};

/**
 * Télécharge un document pour visualisation
 */
export const downloadDocumentForView = async (documentId) => {
  try {
    const response = await httpService.get(
      `/admin/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Erreur lors du téléchargement du document pour visualisation:",
      error
    );
    throw error;
  }
};

/**
 * Télécharge un document
 */
export const downloadDocument = async (documentId) => {
  try {
    const response = await httpService.get(
      `/admin/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error("Erreur lors du téléchargement du document:", error);
    throw error;
  }
};

/**
 * Supprime un document
 */
export const deleteDocument = async (id) => {
  try {
    const response = await httpService.delete(`/admin/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    throw error;
  }
};

/**
 * Récupère les documents par type
 */
export const getDocumentsByType = async (typeId) => {
  try {
    const response = await httpService.get(`/admin/documents/type/${typeId}`);
    return response.data.documents;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des documents par type:",
      error
    );
    throw error;
  }
};

// ==================== GESTION DES LIENS PATIENT-MÉDECIN (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les liens patient-médecin
 */
export const getAllPatientDoctorRelationships = async () => {
  try {
    const response = await httpService.get("/admin/relationships");
    return response.data.relationships;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des liens patient-médecin:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les patients suivis par un médecin
 */
export const getPatientsByDoctor = async (doctorId) => {
  try {
    const response = await httpService.get(
      `/admin/relationships/doctor/${doctorId}`
    );
    return response.data.patients;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des patients du médecin:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les médecins suivant un patient
 */
export const getDoctorsByPatient = async (patientId) => {
  try {
    const response = await httpService.get(
      `/admin/relationships/patient/${patientId}`
    );
    return response.data.doctors;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médecins du patient:",
      error
    );
    throw error;
  }
};

/**
 * Crée un lien patient-médecin
 */
export const createPatientDoctorRelationship = async (patientId, doctorId) => {
  try {
    const response = await httpService.post("/admin/relationships", {
      patientId,
      doctorId,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du lien patient-médecin:", error);
    throw error;
  }
};

/**
 * Supprime un lien patient-médecin
 */
export const deletePatientDoctorRelationship = async (patientId, doctorId) => {
  try {
    const response = await httpService.delete(
      `/admin/relationships/${patientId}/${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du lien patient-médecin:",
      error
    );
    throw error;
  }
};

// ==================== GESTION DES PERMISSIONS DE DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupère toutes les permissions de documents
 */
export const getAllDocumentPermissions = async () => {
  try {
    const response = await httpService.get("/admin/permissions");
    return response.data.permissions;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des permissions de documents:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les permissions d'un document
 */
export const getDocumentPermissions = async (documentId) => {
  try {
    const response = await httpService.get(
      `/admin/permissions/document/${documentId}`
    );
    return response.data.permissions;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des permissions du document:",
      error
    );
    throw error;
  }
};

/**
 * Crée une permission d'accès à un document
 */
export const createDocumentPermission = async (
  documentId,
  userId,
  role,
  expiresAt = null
) => {
  try {
    const response = await httpService.post("/admin/permissions", {
      documentId,
      userId,
      role,
      expiresAt,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la création de la permission d'accès:",
      error
    );
    throw error;
  }
};

/**
 * Supprime une permission d'accès à un document
 */
export const deleteDocumentPermission = async (documentId, userId) => {
  try {
    const response = await httpService.delete(
      `/admin/permissions/${documentId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la permission d'accès:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les médecins qui ont accès à un document
 */
export const getDocumentDoctorsWithAccess = async (documentId) => {
  try {
    console.log(`[adminService] Récupération des permissions pour le document ${documentId}`);
    const response = await httpService.get(
      `/admin/permissions/document/${documentId}`
    );
    console.log(`[adminService] Réponse API:`, response.data);
    
    // Filtrer seulement les médecins et adapter le format
    const permissions = response.data.permissions || [];
    console.log(`[adminService] Permissions trouvées:`, permissions);
    
    const doctors = permissions
      .filter(permission => permission.role === "medecin")
      .map(permission => ({
        user_id: permission.user_id,
        nom: permission.nom,
        prenom: permission.prenom,
        email: permission.email,
        role: permission.role
      }));
    
    console.log(`[adminService] Médecins filtrés:`, doctors);
    return { doctors };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médecins avec accès au document:",
      error
    );
    throw error;
  }
};

/**
 * Révoque l'accès d'un médecin à un document
 */
export const revokeDocumentPermission = async (documentId, doctorId) => {
  try {
    const response = await httpService.delete(
      `/admin/permissions/${documentId}/${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la révocation de l'accès du médecin au document:",
      error
    );
    throw error;
  }
};

// ==================== GESTION DES RENDEZ-VOUS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les rendez-vous (pour l'administration)
 */
export const getAllAppointments = async () => {
  try {
    const response = await httpService.get("/rendez-vous");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    throw error;
  }
};

/**
 * Récupère les rendez-vous d'un patient spécifique
 */
export const getPatientAppointments = async (patientId) => {
  try {
    const response = await httpService.get(`/rendez-vous/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du patient:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les rendez-vous d'un médecin spécifique
 */
export const getDoctorAppointments = async (doctorId) => {
  try {
    const response = await httpService.get(`/rendez-vous/medecin/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du médecin:",
      error
    );
    throw error;
  }
};

/**
 * Récupère un rendez-vous par ID
 */
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await httpService.get(`/rendez-vous/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du rendez-vous:", error);
    throw error;
  }
};

/**
 * Met à jour un rendez-vous
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await httpService.put(
      `/rendez-vous/${appointmentId}`,
      appointmentData
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error);
    throw error;
  }
};

/**
 * Supprime un rendez-vous
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await httpService.delete(`/rendez-vous/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error);
    throw error;
  }
};

/**
 * Confirme un rendez-vous
 */
export const confirmAppointment = async (appointmentId) => {
  try {
    const response = await httpService.put(
      `/rendez-vous/${appointmentId}/confirm`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la confirmation du rendez-vous:", error);
    throw error;
  }
};

/**
 * Annule un rendez-vous
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await httpService.put(
      `/rendez-vous/${appointmentId}/annuler`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    throw error;
  }
};

/**
 * Démarre un rendez-vous
 */
export const startAppointment = async (appointmentId) => {
  try {
    const response = await httpService.put(
      `/rendez-vous/${appointmentId}/en-cours`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors du démarrage du rendez-vous:", error);
    throw error;
  }
};

/**
 * Termine un rendez-vous
 */
export const finishAppointment = async (appointmentId) => {
  try {
    const response = await httpService.put(
      `/rendez-vous/${appointmentId}/termine`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la finalisation du rendez-vous:", error);
    throw error;
  }
};

// ==================== TABLEAU DE BORD ====================

/**
 * Récupère les statistiques du tableau de bord
 */
export const getDashboardStats = async () => {
  try {
    const response = await httpService.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
};
