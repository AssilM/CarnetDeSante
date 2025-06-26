import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel, date_naissance, sexe, adresse, code_postal, ville FROM utilisateurs ORDER BY id"
    );

    res.status(200).json({
      users: result.rows,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel, date_naissance, sexe, adresse, code_postal, ville FROM utilisateurs WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
};

// Récupérer les informations de l'utilisateur connecté
export const getMe = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel, date_naissance, sexe, adresse, code_postal, ville FROM utilisateurs WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        tel: user.tel,
        date_naissance: user.date_naissance,
        sexe: user.sexe,
        adresse: user.adresse,
        code_postal: user.code_postal,
        ville: user.ville,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      nom,
      prenom,
      email,
      tel,
      date_naissance,
      sexe,
      adresse,
      code_postal,
      ville,
    } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const emailCheck = await pool.query(
        "SELECT * FROM utilisateurs WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Construire la requête de mise à jour dynamiquement
    let query = "UPDATE utilisateurs SET ";
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (nom) {
      updateFields.push(`nom = $${paramIndex++}`);
      values.push(nom);
    }
    if (prenom) {
      updateFields.push(`prenom = $${paramIndex++}`);
      values.push(prenom);
    }
    if (email) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (tel) {
      updateFields.push(`tel = $${paramIndex++}`);
      values.push(tel);
    }
    if (date_naissance) {
      updateFields.push(`date_naissance = $${paramIndex++}`);
      values.push(date_naissance);
    }
    if (sexe) {
      updateFields.push(`sexe = $${paramIndex++}`);
      values.push(sexe);
    }
    if (adresse !== undefined) {
      updateFields.push(`adresse = $${paramIndex++}`);
      values.push(adresse);
    }
    if (code_postal !== undefined) {
      updateFields.push(`code_postal = $${paramIndex++}`);
      values.push(code_postal);
    }
    if (ville !== undefined) {
      updateFields.push(`ville = $${paramIndex++}`);
      values.push(ville);
    }

    // Si aucun champ à mettre à jour
    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucune donnée fournie pour la mise à jour" });
    }

    query += updateFields.join(", ");
    query += ` WHERE id = $${paramIndex} RETURNING id, email, nom, prenom, role, tel, date_naissance, sexe, adresse, code_postal, ville`;
    values.push(userId);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

// Changer le mot de passe d'un utilisateur
export const updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    // Vérifier si l'utilisateur existe

    const userResult = await pool.query(
      "SELECT * FROM utilisateurs WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await pool.query("UPDATE utilisateurs SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du mot de passe" });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const userCheck = await pool.query(
      "SELECT * FROM utilisateurs WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer les refresh tokens associés
    await pool.query("DELETE FROM refresh_tokens WHERE utilisateur_id = $1", [
      userId,
    ]);

    // Supprimer l'utilisateur
    await pool.query("DELETE FROM utilisateurs WHERE id = $1", [userId]);

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};

// Récupérer les utilisateurs par rôle
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel, date_naissance, sexe, adresse, code_postal, ville FROM utilisateurs WHERE role = $1 ORDER BY nom, prenom",
      [role]
    );

    res.status(200).json({
      users: result.rows,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};
