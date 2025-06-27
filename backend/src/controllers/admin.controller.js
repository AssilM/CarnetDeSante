import pool from "../config/db.js";

// Récupérer tous les administrateurs
export const getAllAdministrateurs = async (req, res) => {
  try {
    const query = `
      SELECT a.id, a.niveau_acces, u.nom, u.prenom, u.email, u.tel
      FROM administrateurs a
      INNER JOIN utilisateurs u ON a.utilisateur_id = u.id
    `;
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des administrateurs" });
  }
};

// Récupérer un administrateur par son ID
export const getAdministrateurById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT a.id, a.niveau_acces, u.nom, u.prenom, u.email, u.tel
      FROM administrateurs a
      INNER JOIN utilisateurs u ON a.utilisateur_id = u.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'administrateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'administrateur" });
  }
};

// Récupérer l'ID administrateur à partir de l'ID utilisateur
export const getAdminIdByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `SELECT id FROM administrateurs WHERE utilisateur_id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Administrateur non trouvé pour cet utilisateur" });
    }

    res.status(200).json({ id: result.rows[0].id });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'ID administrateur:",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération de l'ID administrateur",
      });
  }
};

// Mettre à jour le niveau d'accès d'un administrateur
export const updateAdministrateur = async (req, res) => {
  const { id } = req.params;
  const { niveau_acces } = req.body;

  try {
    const query = `
      UPDATE administrateurs
      SET niveau_acces = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, utilisateur_id, niveau_acces
    `;
    const result = await pool.query(query, [niveau_acces, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'administrateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'administrateur" });
  }
};

// Supprimer un administrateur
export const deleteAdministrateur = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM administrateurs WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    res
      .status(200)
      .json({ message: "Profil administrateur supprimé avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du profil administrateur:",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la suppression du profil administrateur",
      });
  }
};
