import pool from "../config/db.js";

// Récupérer tous les administrateurs
export const getAllAdministrateurs = async (req, res) => {
  //async permet d'autoriser la fonction à utiliser await pour gerer des opérations asynchrones
  try {
    const query = `
      SELECT a.id, a.niveau_acces, u.nom, u.prenom, u.email, u.tel
      FROM administrateur a
      INNER JOIN utilisateur u ON a.utilisateur_id = u.id
    `;
    const result = await pool.query(query);
    //await permet d'attendre la fin de la promesse et renvoie un tableau de résultats
    //query ne fait pas ca car c'est une promesse

    //res c'est la reponse, .json transforme result.rows qui est le résultat de la requête en json
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
  //
  const { id } = req.params;
  //extrait l'id de l'url (req.params)

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

    //.json transforme ce qu'il y a dans result.rows[0] en json mais pas result.rows
    //qui est toujours un tableau, pour ca qu'on fait result.rows[0] qui lui est un objet
    //.json transforme tout en json, meme string, object, array, number, boolean, null
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
    res.status(500).json({
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
    res.status(500).json({
      message: "Erreur lors de la suppression du profil administrateur",
    });
  }
};

// Récupérer les statistiques pour le tableau de bord administrateur
export const getDashboardStats = async (req, res) => {
  try {
    // Requête pour compter le nombre de patients
    const patientsQuery = `SELECT COUNT(*) as total_patients FROM patient`;
    const patientsResult = await pool.query(patientsQuery);

    // Requête pour compter le nombre de médecins
    const medecinsQuery = `SELECT COUNT(*) as total_medecins FROM medecin`;
    const medecinsResult = await pool.query(medecinsQuery);

    // Requête pour compter le nombre de rendez-vous
    const rdvQuery = `SELECT COUNT(*) as total_rdv FROM rendez_vous`;
    const rdvResult = await pool.query(rdvQuery);

    // Requête pour compter le nombre de rendez-vous par statut
    const rdvStatusQuery = `
      SELECT statut, COUNT(*) as count 
      FROM rendez_vous 
      GROUP BY statut
    `;
    const rdvStatusResult = await pool.query(rdvStatusQuery);

    // Requête pour obtenir les rendez-vous récents
    const recentRdvQuery = `
      SELECT rv.id, rv.date, rv.heure, rv.statut,
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom
      FROM rendez_vous rv
      INNER JOIN utilisateur p_user ON rv.patient_id = p_user.id
      INNER JOIN utilisateur m_user ON rv.medecin_id = m_user.id
      ORDER BY rv.date DESC, rv.heure DESC
      LIMIT 10
    `;
    const recentRdvResult = await pool.query(recentRdvQuery);

    const stats = {
      patients: {
        total: parseInt(patientsResult.rows[0].total_patients),
      },
      medecins: {
        total: parseInt(medecinsResult.rows[0].total_medecins),
      },
      rendezVous: {
        total: parseInt(rdvResult.rows[0].total_rdv),
        parStatut: rdvStatusResult.rows.reduce((acc, curr) => {
          acc[curr.statut] = parseInt(curr.count);
          return acc;
        }, {}),
      },
      recents: {
        rendezVous: recentRdvResult.rows,
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques" });
  }
};

// Récupérer l'état du système
export const getSystemStatus = async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    const dbQuery = `SELECT NOW() as time`;
    const dbResult = await pool.query(dbQuery);

    // Vérifier l'espace disque (simulé)
    const diskSpace = {
      total: "100GB",
      used: "45GB",
      available: "55GB",
    };

    // Vérifier la mémoire (simulé)
    const memory = {
      total: "16GB",
      used: "8GB",
      available: "8GB",
    };

    // Vérifier l'état des services (simulé)
    const services = {
      database: "running",
      api: "running",
      auth: "running",
      email: "running",
    };

    const status = {
      timestamp: dbResult.rows[0].time,
      database: {
        status: "connected",
        responseTime: "5ms",
      },
      system: {
        diskSpace,
        memory,
        uptime: "14 days",
      },
      services,
    };

    res.status(200).json(status);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'état du système:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération de l'état du système",
      error: error.message,
      database: {
        status: "disconnected",
      },
    });
  }
};

// Gérer les utilisateurs (activer/désactiver, changer les rôles)
export const manageUsers = async (req, res) => {
  const { userId, action, newRole, isActive } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ message: "userId et action sont requis" });
  }

  try {
    let result;

    switch (action) {
      case "changeRole":
        if (!newRole) {
          return res
            .status(400)
            .json({ message: "newRole est requis pour l'action changeRole" });
        }

        const updateRoleQuery = `
          UPDATE utilisateur
          SET role = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, nom, prenom, email, role
        `;
        result = await pool.query(updateRoleQuery, [newRole, userId]);
        break;

      case "toggleActive":
        if (isActive === undefined) {
          return res.status(400).json({
            message: "isActive est requis pour l'action toggleActive",
          });
        }

        const updateActiveQuery = `
          UPDATE utilisateur
          SET is_active = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, nom, prenom, email, is_active
        `;
        result = await pool.query(updateActiveQuery, [isActive, userId]);
        break;

      default:
        return res.status(400).json({ message: "Action non reconnue" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la gestion des utilisateurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la gestion des utilisateurs" });
  }
};
