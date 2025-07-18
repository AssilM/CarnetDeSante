import pool from "../config/db.js";

/**
 * Repository pour la gestion des administrateurs
 * Centralise toutes les opérations de base de données liées aux administrateurs
 */

/**
 * Récupère tous les administrateurs avec leurs informations utilisateur
 * @returns {Promise<Array>} Liste des administrateurs
 */
export const findAllAdministrateurs = async () => {
  try {
    const query = `
      SELECT a.utilisateur_id as id, a.niveau_acces, u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero
      FROM administrateur a
      INNER JOIN utilisateur u ON a.utilisateur_id = u.id
      ORDER BY u.nom, u.prenom
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des administrateurs:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des administrateurs");
  }
};

/**
 * Récupère un administrateur par son ID utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'administrateur trouvé ou undefined
 */
export const findAdministrateurByUserId = async (userId) => {
  try {
    const query = `
      SELECT a.utilisateur_id as id, a.niveau_acces, u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero
      FROM administrateur a
      INNER JOIN utilisateur u ON a.utilisateur_id = u.id
      WHERE a.utilisateur_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche d'administrateur par ID ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'administrateur");
  }
};

/**
 * Vérifie si un utilisateur est administrateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} True si l'utilisateur est administrateur
 */
export const isUserAdministrateur = async (userId) => {
  try {
    const query = `SELECT 1 FROM administrateur WHERE utilisateur_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la vérification du statut administrateur pour l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la vérification du statut administrateur");
  }
};

/**
 * Met à jour le niveau d'accès d'un administrateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} niveauAcces - Nouveau niveau d'accès
 * @returns {Promise<Object|undefined>} L'administrateur mis à jour ou undefined
 */
export const updateAdministrateurNiveauAcces = async (userId, niveauAcces) => {
  try {
    const query = `
      UPDATE administrateur
      SET niveau_acces = $1, updated_at = CURRENT_TIMESTAMP
      WHERE utilisateur_id = $2
      RETURNING utilisateur_id as id, niveau_acces
    `;
    const result = await pool.query(query, [niveauAcces, userId]);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la mise à jour du niveau d'accès pour l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la mise à jour du niveau d'accès");
  }
};

/**
 * Supprime un profil administrateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export const deleteAdministrateur = async (userId) => {
  try {
    const query = `DELETE FROM administrateur WHERE utilisateur_id = $1 RETURNING utilisateur_id`;
    const result = await pool.query(query, [userId]);
    console.warn(
      `[SECURITY] Profil administrateur supprimé - ID utilisateur: ${userId}`
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la suppression du profil administrateur pour l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression du profil administrateur");
  }
};

/**
 * Récupère les statistiques pour le tableau de bord administrateur
 * @returns {Promise<Object>} Statistiques du système
 */
export const getDashboardStats = async () => {
  try {
    // Compter les patients
    const patientsResult = await pool.query(
      `SELECT COUNT(*) as total FROM patient`
    );

    // Compter les médecins
    const medecinsResult = await pool.query(
      `SELECT COUNT(*) as total FROM medecin`
    );

    // Compter les rendez-vous
    const rdvResult = await pool.query(
      `SELECT COUNT(*) as total FROM rendez_vous`
    );

    // Compter les documents
    const documentsResult = await pool.query(
      `SELECT COUNT(*) as total FROM document`
    );

    // Rendez-vous par statut
    const rdvStatusResult = await pool.query(`
      SELECT statut, COUNT(*) as count 
      FROM rendez_vous 
      GROUP BY statut
    `);

    // Rendez-vous récents (10 derniers)
    const recentRdvResult = await pool.query(`
      SELECT rv.id, rv.date, rv.heure, rv.statut,
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom
      FROM rendez_vous rv
      INNER JOIN utilisateur p_user ON rv.patient_id = p_user.id
      INNER JOIN utilisateur m_user ON rv.medecin_id = m_user.id
      ORDER BY rv.date DESC, rv.heure DESC
      LIMIT 10
    `);

    return {
      patients: parseInt(patientsResult.rows[0].total),
      medecins: parseInt(medecinsResult.rows[0].total),
      rendezVous: parseInt(rdvResult.rows[0].total),
      documents: parseInt(documentsResult.rows[0].total),
      rendezVousParStatut: rdvStatusResult.rows.reduce((acc, curr) => {
        acc[curr.statut] = parseInt(curr.count);
        return acc;
      }, {}),
      rendezVousRecents: recentRdvResult.rows,
    };
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des statistiques:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des statistiques");
  }
};

// ==================== FONCTIONS GESTION DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les documents avec informations détaillées (pour l'administration)
 * @returns {Promise<Array>} Liste des documents avec informations utilisateurs
 */
export const findAllDocumentsAdmin = async () => {
  try {
    const query = `
      SELECT d.*, 
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom,
             u_user.nom as uploader_nom, u_user.prenom as uploader_prenom,
             dt.label as type_document_label
      FROM document d
      LEFT JOIN utilisateur p_user ON d.patient_id = p_user.id
      LEFT JOIN utilisateur m_user ON d.medecin_id = m_user.id
      LEFT JOIN utilisateur u_user ON d.uploader_id = u_user.id
      LEFT JOIN document_type dt ON d.type_id = dt.id
      ORDER BY d.date_creation DESC, d.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des documents:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des documents");
  }
};

/**
 * Récupère un document par ID avec informations détaillées (pour l'administration)
 * @param {number} documentId - ID du document
 * @returns {Promise<Object|undefined>} Document avec informations utilisateurs ou undefined
 */
export const findDocumentByIdAdmin = async (documentId) => {
  try {
    const query = `
      SELECT d.*, 
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom,
             u_user.nom as uploader_nom, u_user.prenom as uploader_prenom,
             dt.label as type_document_label
      FROM document d
      LEFT JOIN utilisateur p_user ON d.patient_id = p_user.id
      LEFT JOIN utilisateur m_user ON d.medecin_id = m_user.id
      LEFT JOIN utilisateur u_user ON d.uploader_id = u_user.id
      LEFT JOIN document_type dt ON d.type_id = dt.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [documentId]);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche du document ${documentId}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération du document");
  }
};

/**
 * Supprime un document (pour l'administration)
 * @param {number} documentId - ID du document
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export const deleteDocumentAdmin = async (documentId) => {
  try {
    const query = `DELETE FROM document WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [documentId]);
    console.warn(`[SECURITY] Document supprimé par admin - ID: ${documentId}`);
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la suppression du document ${documentId}:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression du document");
  }
};

/**
 * Récupère les documents par type (pour l'administration)
 * @param {number} typeId - ID du type de document
 * @returns {Promise<Array>} Liste des documents du type spécifié
 */
export const findDocumentsByTypeAdmin = async (typeId) => {
  try {
    const query = `
      SELECT d.*, 
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom,
             u_user.nom as uploader_nom, u_user.prenom as uploader_prenom,
             dt.label as type_document_label
      FROM document d
      LEFT JOIN utilisateur p_user ON d.patient_id = p_user.id
      LEFT JOIN utilisateur m_user ON d.medecin_id = m_user.id
      LEFT JOIN utilisateur u_user ON d.uploader_id = u_user.id
      LEFT JOIN document_type dt ON d.type_id = dt.id
      WHERE d.type_id = $1
      ORDER BY d.date_creation DESC, d.created_at DESC
    `;
    const result = await pool.query(query, [typeId]);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche des documents par type ${typeId}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des documents par type");
  }
};

// ==================== FONCTIONS GESTION RENDEZ-VOUS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les rendez-vous avec informations détaillées (pour l'administration)
 * @returns {Promise<Array>} Liste des rendez-vous avec informations utilisateurs
 */
export const findAllRendezVousAdmin = async () => {
  try {
    const query = `
      SELECT rv.*, 
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom,
             m.specialite
      FROM rendez_vous rv
      INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
      INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
      INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      ORDER BY rv.date DESC, rv.heure DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des rendez-vous:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des rendez-vous");
  }
};

/**
 * Récupère un rendez-vous par ID avec informations détaillées (pour l'administration)
 * @param {number} rendezVousId - ID du rendez-vous
 * @returns {Promise<Object|undefined>} Rendez-vous avec informations utilisateurs ou undefined
 */
export const findRendezVousByIdAdmin = async (rendezVousId) => {
  try {
    const query = `
      SELECT rv.*, 
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom,
             m.specialite
      FROM rendez_vous rv
      INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
      INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
      INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      WHERE rv.id = $1
    `;
    const result = await pool.query(query, [rendezVousId]);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche du rendez-vous ${rendezVousId}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération du rendez-vous");
  }
};

/**
 * Supprime un rendez-vous (pour l'administration)
 * @param {number} rendezVousId - ID du rendez-vous
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export const deleteRendezVousAdmin = async (rendezVousId) => {
  try {
    const query = `DELETE FROM rendez_vous WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [rendezVousId]);
    console.warn(
      `[SECURITY] Rendez-vous supprimé par admin - ID: ${rendezVousId}`
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la suppression du rendez-vous ${rendezVousId}:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression du rendez-vous");
  }
};

/**
 * Récupère les rendez-vous par statut (pour l'administration)
 * @param {string} statut - Statut des rendez-vous
 * @returns {Promise<Array>} Liste des rendez-vous avec ce statut
 */
export const findRendezVousByStatutAdmin = async (statut) => {
  try {
    const query = `
      SELECT rv.*, 
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom,
             m.specialite
      FROM rendez_vous rv
      INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
      INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
      INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      WHERE rv.statut = $1
      ORDER BY rv.date DESC, rv.heure DESC
    `;
    const result = await pool.query(query, [statut]);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche des rendez-vous par statut ${statut}:`,
      error.message
    );
    throw new Error(
      "Erreur lors de la récupération des rendez-vous par statut"
    );
  }
};
