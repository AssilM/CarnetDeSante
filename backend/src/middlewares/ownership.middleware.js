import pool from "../config/db.js";

/**
 * Crée un middleware qui empêche un patient d'accéder aux ressources d'un autre utilisateur.
 * Si l'utilisateur est admin ou medecin, le contrôle est ignoré.
 *
 * @param {...string} paramNames -  Le(s) nom(s) des paramètres d'URL contenant l'id utilisateur à vérifier.
 *                                  Exemple : "id", "patient_id".
 */
export const restrictPatientToSelf = (...paramNames) => {
  return async (req, res, next) => {
    try {
      // Les administrateurs et médecins ne sont pas restreints par la propriété
      if (req.userRole === "admin" || req.userRole === "medecin") {
        return next();
      }

      if (req.userRole !== "patient") {
        // Pour tout autre rôle inconnu, refuser par sécurité « fail-closed »
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      // Vérifier chacun des paramètres d'URL fournis
      const mismatched = paramNames.some((param) => {
        const value = req.params[param];
        if (!value) return false; // si le paramètre n'existe pas dans l'URL, ignorer
        return Number(value) !== Number(req.userId);
      });

      if (mismatched) {
        return res
          .status(403)
          .json({ message: "Accès non autorisé (propriété)" });
      }

      // Tout est en ordre
      next();
    } catch (error) {
      console.error("Erreur dans restrictPatientToSelf:", error);
      next(error);
    }
  };
};

/**
 * Vérifie que le document appartient bien au patient authentifié.
 * Autorise toujours les rôles admin et medecin.
 * Exige que le paramètre d'URL s'appelle `document_id`.
 */
export const checkDocumentOwnership = async (req, res, next) => {
  try {
    // Admins et médecins passent
    if (req.userRole === "admin" || req.userRole === "medecin") {
      return next();
    }

    if (req.userRole !== "patient") {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { document_id } = req.params;
    if (!document_id) {
      return res.status(400).json({ message: "ID du document manquant" });
    }

    const query = "SELECT patient_id FROM document WHERE id = $1";
    const result = await pool.query(query, [document_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    const patientId = result.rows[0].patient_id;
    if (Number(patientId) !== Number(req.userId)) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé (propriété doc)" });
    }

    next();
  } catch (error) {
    console.error("Erreur dans checkDocumentOwnership:", error);
    next(error);
  }
};

/**
 * Restreint un médecin à accéder uniquement à ses propres ressources.
 * @param {...string} paramNames - noms de paramètres contenant un ID utilisateur médecin.
 */
export const restrictDoctorToSelf = (...paramNames) => {
  return async (req, res, next) => {
    try {
      if (req.userRole === "admin") return next();
      if (req.userRole !== "medecin") {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      const mismatched = paramNames.some((p) => {
        const val = req.params[p];
        if (!val) return false;
        return Number(val) !== Number(req.userId);
      });

      if (mismatched) {
        return res
          .status(403)
          .json({ message: "Accès non autorisé (propriété)" });
      }
      next();
    } catch (e) {
      console.error("restrictDoctorToSelf error", e);
      next(e);
    }
  };
};

/**
 * Vérifie qu'un rendez-vous appartient au patient ou au médecin connecté.
 * Paramètre d'URL : id (rendez_vous.id)
 */
export const checkRendezVousOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userRole, userId } = req;
    if (userRole === "admin") return next();

    const query = `SELECT patient_id, medecin_id FROM rendez_vous WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    const rv = result.rows[0];
    if (
      (userRole === "patient" && Number(rv.patient_id) === Number(userId)) ||
      (userRole === "medecin" && Number(rv.medecin_id) === Number(userId))
    ) {
      return next();
    }
    return res
      .status(403)
      .json({ message: "Accès non autorisé (rendez-vous)" });
  } catch (e) {
    console.error("checkRendezVousOwnership", e);
    next(e);
  }
};

/**
 * Vérifie que req.body.medecin_id correspond au médecin connecté
 */
export const checkDoctorBodyOwnership = (field = "medecin_id") => {
  return (req, res, next) => {
    if (req.userRole === "admin") return next();
    if (req.userRole !== "medecin")
      return res.status(403).json({ message: "Accès non autorisé" });
    const id = req.body[field];
    if (id && Number(id) !== Number(req.userId)) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé (propriété)" });
    }
    next();
  };
};

/**
 * Vérifie que la disponibilité (disponibilite_medecin) appartient au médecin connecté.
 * Paramètre d'URL : id (disponibilite_medecin.id)
 */
export const checkDisponibiliteOwnership = async (req, res, next) => {
  try {
    if (req.userRole === "admin") return next();
    if (req.userRole !== "medecin") {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    const { id } = req.params;
    const query = `SELECT medecin_id FROM disponibilite_medecin WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Disponibilité non trouvée" });
    }
    const medecinId = result.rows[0].medecin_id;
    if (Number(medecinId) !== Number(req.userId)) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé (propriété)" });
    }
    next();
  } catch (e) {
    console.error("checkDisponibiliteOwnership", e);
    next(e);
  }
};
