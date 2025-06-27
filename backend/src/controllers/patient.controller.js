import pool from "../config/db.js";

// Récupérer tous les patients
export const getAllPatients = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel, u.date_naissance, u.sexe
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
    `;
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des patients" });
  }
};

// Récupérer le profil du patient connecté
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Récupéré du middleware d'authentification

    // Récupérer les informations du patient
    const query = `
      SELECT p.id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil patient non trouvé" });
    }

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil patient" });
  }
};

// Récupérer le profil d'un patient spécifique par ID utilisateur
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer les informations du patient
    const query = `
      SELECT p.id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil patient non trouvé" });
    }

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil patient" });
  }
};

// Créer ou mettre à jour le profil d'un patient
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { utilisateur_id, groupe_sanguin, taille, poids } = req.body;

    // Vérifier si l'utilisateur a le droit de modifier ce profil
    if (req.userId !== parseInt(utilisateur_id) && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce profil" });
    }

    // Vérifier si un profil patient existe déjà pour cet utilisateur
    const checkQuery = `SELECT id FROM patients WHERE utilisateur_id = $1`;
    const checkResult = await pool.query(checkQuery, [utilisateur_id]);

    let patientId;

    if (checkResult.rows.length === 0) {
      // Créer un nouveau profil
      const insertQuery = `
        INSERT INTO patients (utilisateur_id, groupe_sanguin, taille, poids)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const insertResult = await pool.query(insertQuery, [
        utilisateur_id,
        groupe_sanguin,
        taille,
        poids,
      ]);
      patientId = insertResult.rows[0].id;
    } else {
      // Mettre à jour le profil existant
      patientId = checkResult.rows[0].id;
      const updateQuery = `
        UPDATE patients
        SET groupe_sanguin = COALESCE($1, groupe_sanguin),
            taille = COALESCE($2, taille),
            poids = COALESCE($3, poids),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `;
      await pool.query(updateQuery, [groupe_sanguin, taille, poids, patientId]);
    }

    // Récupérer le profil mis à jour
    const query = `
      SELECT p.id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [patientId]);

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour du profil patient:",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la création/mise à jour du profil patient",
      });
  }
};

// Récupérer les informations médicales du patient connecté
export const getMedicalInfo = async (req, res) => {
  try {
    const userId = req.userId; // Récupéré du middleware d'authentification

    // Vérifier que l'utilisateur est bien un patient
    const userQuery = `SELECT role FROM utilisateurs WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (userResult.rows[0].role !== "patient") {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Récupérer les informations médicales du patient
    const query = `
      SELECT p.id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.date_naissance, u.sexe
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil patient non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des informations médicales:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des informations médicales",
    });
  }
};

// Récupérer un patient par son ID
export const getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT p.id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du patient" });
  }
};

// Récupérer l'ID patient à partir de l'ID utilisateur
export const getPatientIdByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `SELECT id FROM patients WHERE utilisateur_id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Patient non trouvé pour cet utilisateur" });
    }

    res.status(200).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'ID du patient" });
  }
};

// Créer un profil patient pour un utilisateur existant
export const createPatient = async (req, res) => {
  const { utilisateur_id, groupe_sanguin, taille, poids } = req.body;

  try {
    // Vérifier si l'utilisateur existe et a le rôle 'patient'
    const checkUserQuery = `SELECT * FROM utilisateurs WHERE id = $1 AND role = 'patient'`;
    const userResult = await pool.query(checkUserQuery, [utilisateur_id]);

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Utilisateur non trouvé ou n'a pas le rôle patient" });
    }

    // Vérifier si un profil patient existe déjà pour cet utilisateur
    const checkPatientQuery = `SELECT * FROM patients WHERE utilisateur_id = $1`;
    const patientResult = await pool.query(checkPatientQuery, [utilisateur_id]);

    if (patientResult.rows.length > 0) {
      return res.status(400).json({
        message: "Un profil patient existe déjà pour cet utilisateur",
      });
    }

    // Créer le profil patient
    const insertQuery = `
      INSERT INTO patients (utilisateur_id, groupe_sanguin, taille, poids)
      VALUES ($1, $2, $3, $4)
      RETURNING id, utilisateur_id, groupe_sanguin, taille, poids
    `;
    const result = await pool.query(insertQuery, [
      utilisateur_id,
      groupe_sanguin,
      taille,
      poids,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du profil patient" });
  }
};

// Mettre à jour un profil patient
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { groupe_sanguin, taille, poids } = req.body;

  try {
    const query = `
      UPDATE patients
      SET groupe_sanguin = COALESCE($1, groupe_sanguin), 
          taille = COALESCE($2, taille), 
          poids = COALESCE($3, poids),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, utilisateur_id, groupe_sanguin, taille, poids
    `;
    const result = await pool.query(query, [groupe_sanguin, taille, poids, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil patient" });
  }
};

// Supprimer un profil patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM patients WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json({ message: "Profil patient supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du profil patient" });
  }
};

// Rechercher des patients par nom ou prénom
export const searchPatients = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ message: "Un terme de recherche est requis" });
  }

  try {
    const searchQuery = `
      SELECT p.id, p.groupe_sanguin, u.nom, u.prenom, u.email, u.tel, u.date_naissance
      FROM patients p
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE u.nom ILIKE $1 OR u.prenom ILIKE $1
      LIMIT 20
    `;
    const result = await pool.query(searchQuery, [`%${query}%`]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la recherche de patients:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche de patients" });
  }
};
