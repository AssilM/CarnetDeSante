import pool from "../config/db.js";

// Récupérer tous les médecins
export const getAllMedecins = async (req, res) => {
  try {
    const query = `
      SELECT m.id, m.specialite, m.description, u.nom, u.prenom, u.email, u.tel, u.ville
      FROM medecins m
      INNER JOIN utilisateurs u ON m.utilisateur_id = u.id
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

// Récupérer un médecin par son ID
export const getMedecinById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT m.id, m.specialite, m.description, u.nom, u.prenom, u.email, u.tel,
             u.adresse, u.ville, u.code_postal
      FROM medecins m
      INNER JOIN utilisateurs u ON m.utilisateur_id = u.id
      WHERE m.id = $1
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

// Récupérer l'ID médecin à partir de l'ID utilisateur
export const getMedecinIdByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `SELECT id FROM medecins WHERE utilisateur_id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Médecin non trouvé pour cet utilisateur" });
    }

    res.status(200).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'ID du médecin" });
  }
};

// Créer un profil médecin pour un utilisateur existant
export const createMedecin = async (req, res) => {
  const { utilisateur_id, specialite, description } = req.body;

  try {
    // Vérifier si l'utilisateur existe et a le rôle 'medecin'
    const checkUserQuery = `SELECT * FROM utilisateurs WHERE id = $1 AND role = 'medecin'`;
    const userResult = await pool.query(checkUserQuery, [utilisateur_id]);

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Utilisateur non trouvé ou n'a pas le rôle médecin" });
    }

    // Vérifier si un profil médecin existe déjà pour cet utilisateur
    const checkMedecinQuery = `SELECT * FROM medecins WHERE utilisateur_id = $1`;
    const medecinResult = await pool.query(checkMedecinQuery, [utilisateur_id]);

    if (medecinResult.rows.length > 0) {
      return res
        .status(400)
        .json({
          message: "Un profil médecin existe déjà pour cet utilisateur",
        });
    }

    // Créer le profil médecin
    const insertQuery = `
      INSERT INTO medecins (utilisateur_id, specialite, description)
      VALUES ($1, $2, $3)
      RETURNING id, utilisateur_id, specialite, description
    `;
    const result = await pool.query(insertQuery, [
      utilisateur_id,
      specialite,
      description,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création du profil médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du profil médecin" });
  }
};

// Mettre à jour un profil médecin
export const updateMedecin = async (req, res) => {
  const { id } = req.params;
  const { specialite, description } = req.body;

  try {
    const query = `
      UPDATE medecins
      SET specialite = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, utilisateur_id, specialite, description
    `;
    const result = await pool.query(query, [specialite, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil médecin" });
  }
};

// Supprimer un profil médecin
export const deleteMedecin = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM medecins WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    res.status(200).json({ message: "Profil médecin supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du profil médecin:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du profil médecin" });
  }
};

// Récupérer les médecins par spécialité
export const getMedecinsBySpecialite = async (req, res) => {
  const { specialite } = req.params;

  try {
    const query = `
      SELECT m.id, m.specialite, m.description, u.nom, u.prenom, u.email, u.ville
      FROM medecins m
      INNER JOIN utilisateurs u ON m.utilisateur_id = u.id
      WHERE LOWER(m.specialite) = LOWER($1)
    `;
    const result = await pool.query(query, [specialite]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médecins par spécialité:",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des médecins par spécialité",
      });
  }
};

// Récupérer toutes les spécialités disponibles
export const getAllSpecialites = async (req, res) => {
  try {
    const query = `SELECT DISTINCT specialite FROM medecins ORDER BY specialite`;
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
