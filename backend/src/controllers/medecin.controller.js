import pool from "../config/db.js";

// Récupérer tous les médecins
export const getAllMedecins = async (req, res) => {
  try {
    const query = `
      SELECT m.utilisateur_id, m.specialite, m.description, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero,
             u.adresse, u.ville, u.latitude, u.longitude, u.description_localisation
      FROM medecin m
      INNER JOIN utilisateur u ON m.utilisateur_id = u.id
      ORDER BY u.nom, u.prenom
    `;
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des médecins:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des médecins" });
  }
};

// Récupérer un médecin par son ID utilisateur
export const getMedecinById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT m.utilisateur_id, m.specialite, m.description, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville, u.latitude, u.longitude, u.description_localisation
      FROM medecin m
      INNER JOIN utilisateur u ON m.utilisateur_id = u.id
      WHERE m.utilisateur_id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du médecin" });
  }
};

// Récupérer le profil du médecin connecté
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Récupéré du middleware d'authentification

    const query = `
      SELECT m.utilisateur_id, m.specialite, m.description, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville, u.latitude, u.longitude, u.description_localisation
      FROM medecin m
      INNER JOIN utilisateur u ON m.utilisateur_id = u.id
      WHERE m.utilisateur_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil médecin non trouvé" });
    }

    res.status(200).json({ medecin: result.rows[0] });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil médecin" });
  }
};

// Créer ou mettre à jour le profil d'un médecin
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { utilisateur_id, specialite, description } = req.body;

    // Vérifier si l'utilisateur a le droit de modifier ce profil
    if (req.userId !== parseInt(utilisateur_id) && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce profil" });
    }

    // Vérifier si un profil médecin existe déjà pour cet utilisateur
    const checkQuery = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
    const checkResult = await pool.query(checkQuery, [utilisateur_id]);

    if (checkResult.rows.length === 0) {
      // Créer un nouveau profil
      const insertQuery = `
      INSERT INTO medecin (utilisateur_id, specialite, description)
      VALUES ($1, $2, $3)
      `;
      await pool.query(insertQuery, [utilisateur_id, specialite, description]);
    } else {
      // Mettre à jour le profil existant
      const updateQuery = `
        UPDATE medecin
        SET specialite = $1, description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE utilisateur_id = $3
      `;
      await pool.query(updateQuery, [specialite, description, utilisateur_id]);
    }

    // Récupérer le profil mis à jour
    const query = `
      SELECT m.utilisateur_id, m.specialite, m.description, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville, u.latitude, u.longitude, u.description_localisation
      FROM medecin m
      INNER JOIN utilisateur u ON m.utilisateur_id = u.id
      WHERE m.utilisateur_id = $1
    `;
    const result = await pool.query(query, [utilisateur_id]);

    res.status(200).json({ medecin: result.rows[0] });
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour du profil médecin:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la création/mise à jour du profil médecin",
    });
  }
};

// Rechercher des médecins par spécialité, nom ou prénom
export const searchMedecins = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Paramètre de recherche requis" });
  }

  try {
    const query = `
      SELECT m.utilisateur_id, m.specialite, m.description, 
             u.nom, u.prenom, u.email
      FROM medecin m
      INNER JOIN utilisateur u ON m.utilisateur_id = u.id
      WHERE 
        m.specialite ILIKE $1 OR 
        u.nom ILIKE $1 OR 
        u.prenom ILIKE $1
      ORDER BY u.nom, u.prenom
    `;
    const result = await pool.query(query, [`%${q}%`]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la recherche de médecins:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche de médecins" });
  }
};

// Récupérer l'ID médecin à partir de l'ID utilisateur
export const getMedecinIdByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Médecin non trouvé pour cet utilisateur" });
    }

    res.status(200).json({ id: result.rows[0].utilisateur_id });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'ID du médecin" });
  }
};

// Récupérer les médecins par spécialité
export const getMedecinsBySpecialite = async (req, res) => {
  const { specialite } = req.params;

  try {
    const query = `
      SELECT m.utilisateur_id as id, m.specialite, m.description, u.nom, u.prenom, u.email, u.ville,
             u.adresse, u.code_postal, CONCAT(u.tel_indicatif, u.tel_numero) as tel
      FROM medecin m
      INNER JOIN utilisateur u ON m.utilisateur_id = u.id
      WHERE LOWER(m.specialite) = LOWER($1)
    `;
    const result = await pool.query(query, [specialite]);

    res.status(200).json({ medecins: result.rows });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médecins par spécialité:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des médecins par spécialité",
    });
  }
};

// Récupérer toutes les spécialités disponibles
export const getAllSpecialites = async (req, res) => {
  try {
    const query = `SELECT DISTINCT specialite FROM medecin ORDER BY specialite`;
    const result = await pool.query(query);

    const specialites = result.rows.map((row) => row.specialite);

    res.status(200).json(specialites);
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des spécialités" });
  }
};
