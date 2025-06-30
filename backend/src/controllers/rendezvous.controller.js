import pool from "../config/db.js";

// Récupérer tous les rendez-vous
export const getAllRendezVous = async (req, res) => {
  try {
    const query = `
      SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite
      FROM rendez_vous rv
      INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
      INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
      INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      ORDER BY rv.date DESC, rv.heure DESC
    `;
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des rendez-vous" });
  }
};

// Récupérer un rendez-vous par son ID
export const getRendezVousById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             p_user.nom as patient_nom, p_user.prenom as patient_prenom,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite
      FROM rendez_vous rv
      INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
      INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
      INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      WHERE rv.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du rendez-vous" });
  }
};

// Récupérer les rendez-vous par patient ID
export const getRendezVousByPatientId = async (req, res) => {
  const { patientId } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite
      FROM rendez_vous rv
      INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      WHERE rv.patient_id = $1
      ORDER BY rv.date DESC, rv.heure DESC
    `;
    const result = await pool.query(query, [patientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du patient:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous du patient",
    });
  }
};

// Récupérer les rendez-vous par médecin ID
export const getRendezVousByMedecinId = async (req, res) => {
  const { medecinId } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             p_user.nom as patient_nom, p_user.prenom as patient_prenom
      FROM rendez_vous rv
      INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
      INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
      WHERE rv.medecin_id = $1
      ORDER BY rv.date DESC, rv.heure DESC
    `;
    const result = await pool.query(query, [medecinId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du médecin:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous du médecin",
    });
  }
};

// Créer un nouveau rendez-vous
export const createRendezVous = async (req, res) => {
  const { patient_id, medecin_id, date, heure, duree, motif, adresse } =
    req.body;

  // Validation des données
  if (!patient_id || !medecin_id || !date || !heure) {
    return res.status(400).json({
      message: "Les champs patient_id, medecin_id, date et heure sont requis",
    });
  }

  try {
    // Vérifier si le patient existe
    const patientQuery = `SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1`;
    const patientResult = await pool.query(patientQuery, [patient_id]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Vérifier si le médecin existe
    const medecinQuery = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
    const medecinResult = await pool.query(medecinQuery, [medecin_id]);

    if (medecinResult.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Vérifier les disponibilités du médecin
    const jour = await getJourSemaine(date);

    // Vérifier si le médecin a des disponibilités ce jour-là
    const dispoQuery = `
      SELECT * FROM disponibilite_medecin 
      WHERE medecin_id = $1 AND jour = $2 
      AND heure_debut <= $3 AND heure_fin > $3
    `;
    const dispoResult = await pool.query(dispoQuery, [medecin_id, jour, heure]);

    if (dispoResult.rows.length === 0) {
      return res.status(400).json({
        message: "Le médecin n'est pas disponible à cette date et heure",
      });
    }

    // Vérifier s'il y a un conflit avec un autre rendez-vous
    const dureeValue = duree || 30; // durée par défaut : 30 minutes
    const conflitQuery = `
      SELECT * FROM rendez_vous
      WHERE medecin_id = $1 AND date = $2 
      AND statut != 'annulé'
      AND (
        (heure <= $3 AND (heure + (duree || ' minutes')::interval) > $3) OR
        (heure < ($3 + ($4 || ' minutes')::interval) AND (heure + (duree || ' minutes')::interval) >= ($3 + ($4 || ' minutes')::interval)) OR
        (heure >= $3 AND (heure + (duree || ' minutes')::interval) <= ($3 + ($4 || ' minutes')::interval))
      )
    `;
    const conflitResult = await pool.query(conflitQuery, [
      medecin_id,
      date,
      heure,
      dureeValue,
    ]);

    if (conflitResult.rows.length > 0) {
      return res.status(400).json({ message: "Ce créneau est déjà réservé" });
    }

    // Créer le rendez-vous
    const insertQuery = `
      INSERT INTO rendez_vous (patient_id, medecin_id, date, heure, duree, motif, adresse)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, patient_id, medecin_id, date, heure, duree, statut, motif, adresse
    `;
    const insertResult = await pool.query(insertQuery, [
      patient_id,
      medecin_id,
      date,
      heure,
      dureeValue,
      motif || null,
      adresse || null,
    ]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du rendez-vous" });
  }
};

// Mettre à jour un rendez-vous
export const updateRendezVous = async (req, res) => {
  const { id } = req.params;
  const { date, heure, duree, statut, motif, adresse } = req.body;

  try {
    // Vérifier si le rendez-vous existe
    const checkQuery = `
      SELECT patient_id, medecin_id FROM rendez_vous WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    // Si la date ou l'heure sont modifiées, vérifier les disponibilités
    if (date && heure) {
      const { medecin_id } = checkResult.rows[0];

      // Vérifier les disponibilités du médecin
      const jour = await getJourSemaine(date);

      // Vérifier si le médecin a des disponibilités ce jour-là
      const dispoQuery = `
        SELECT * FROM disponibilite_medecin 
        WHERE medecin_id = $1 AND jour = $2 
        AND heure_debut <= $3 AND heure_fin > $3
      `;
      const dispoResult = await pool.query(dispoQuery, [
        medecin_id,
        jour,
        heure,
      ]);

      if (dispoResult.rows.length === 0) {
        return res.status(400).json({
          message: "Le médecin n'est pas disponible à cette date et heure",
        });
      }

      // Vérifier s'il y a un conflit avec un autre rendez-vous
      const dureeValue = duree || 30;
      const conflitQuery = `
        SELECT * FROM rendez_vous
        WHERE medecin_id = $1 AND date = $2 AND id <> $3
        AND statut != 'annulé'
        AND (
          (heure <= $4 AND (heure + (duree || ' minutes')::interval) > $4) OR
          (heure < ($4 + ($5 || ' minutes')::interval) AND (heure + (duree || ' minutes')::interval) >= ($4 + ($5 || ' minutes')::interval)) OR
          (heure >= $4 AND (heure + (duree || ' minutes')::interval) <= ($4 + ($5 || ' minutes')::interval))
        )
      `;
      const conflitResult = await pool.query(conflitQuery, [
        medecin_id,
        date,
        id,
        heure,
        dureeValue,
      ]);

      if (conflitResult.rows.length > 0) {
        return res.status(400).json({ message: "Ce créneau est déjà réservé" });
      }
    }

    // Construire la requête de mise à jour dynamique
    let updateQuery = "UPDATE rendez_vous SET ";
    const updateValues = [];
    let paramCounter = 1;

    if (date) {
      updateQuery += `date = $${paramCounter}, `;
      updateValues.push(date);
      paramCounter++;
    }

    if (heure) {
      updateQuery += `heure = $${paramCounter}, `;
      updateValues.push(heure);
      paramCounter++;
    }

    if (duree) {
      updateQuery += `duree = $${paramCounter}, `;
      updateValues.push(duree);
      paramCounter++;
    }

    if (statut) {
      updateQuery += `statut = $${paramCounter}, `;
      updateValues.push(statut);
      paramCounter++;
    }

    if (motif !== undefined) {
      updateQuery += `motif = $${paramCounter}, `;
      updateValues.push(motif);
      paramCounter++;
    }

    if (adresse !== undefined) {
      updateQuery += `adresse = $${paramCounter}, `;
      updateValues.push(adresse);
      paramCounter++;
    }

    updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCounter} RETURNING *`;
    updateValues.push(id);

    const updateResult = await pool.query(updateQuery, updateValues);

    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du rendez-vous" });
  }
};

// Annuler un rendez-vous
export const cancelRendezVous = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE rendez_vous 
      SET statut = 'annulé', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, patient_id, medecin_id, date, heure, statut
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json({
      message: "Rendez-vous annulé avec succès",
      rendezVous: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'annulation du rendez-vous" });
  }
};

// Supprimer un rendez-vous (réservé aux administrateurs)
export const deleteRendezVous = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = `DELETE FROM rendez_vous WHERE id = $1 RETURNING id`;
    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du rendez-vous" });
  }
};

// Fonction utilitaire pour obtenir le jour de la semaine d'une date
const getJourSemaine = async (dateStr) => {
  try {
    const query = `SELECT TO_CHAR(DATE $1, 'day') as jour`;
    const result = await pool.query(query, [dateStr]);
    const jourSemaine = result.rows[0].jour.trim().toLowerCase();

    // Mapper le jour anglais au jour français
    const jourMap = {
      monday: "lundi",
      tuesday: "mardi",
      wednesday: "mercredi",
      thursday: "jeudi",
      friday: "vendredi",
      saturday: "samedi",
      sunday: "dimanche",
    };

    return jourMap[jourSemaine] || jourSemaine;
  } catch (error) {
    console.error(
      "Erreur lors de la détermination du jour de la semaine:",
      error
    );
    throw error;
  }
};
