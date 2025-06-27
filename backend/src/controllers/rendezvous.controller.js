import pool from "../config/db.js";

// Récupérer tous les rendez-vous d'un patient
export const getRendezVousByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             m.id AS medecin_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom, m.specialite
      FROM rendez_vous rv
      INNER JOIN medecins m ON rv.medecin_id = m.id
      INNER JOIN utilisateurs u ON m.utilisateur_id = u.id
      WHERE rv.patient_id = $1
      ORDER BY rv.date DESC, rv.heure DESC
    `;
    const result = await pool.query(query, [patientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des rendez-vous" });
  }
};

// Récupérer tous les rendez-vous d'un médecin
export const getRendezVousByMedecin = async (req, res) => {
  const { medecinId } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             p.id AS patient_id, u.nom AS patient_nom, u.prenom AS patient_prenom
      FROM rendez_vous rv
      INNER JOIN patients p ON rv.patient_id = p.id
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE rv.medecin_id = $1
      ORDER BY rv.date, rv.heure
    `;
    const result = await pool.query(query, [medecinId]);

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
      SELECT rv.id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             p.id AS patient_id, up.nom AS patient_nom, up.prenom AS patient_prenom,
             m.id AS medecin_id, um.nom AS medecin_nom, um.prenom AS medecin_prenom, m.specialite
      FROM rendez_vous rv
      INNER JOIN patients p ON rv.patient_id = p.id
      INNER JOIN utilisateurs up ON p.utilisateur_id = up.id
      INNER JOIN medecins m ON rv.medecin_id = m.id
      INNER JOIN utilisateurs um ON m.utilisateur_id = um.id
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

// Récupérer les rendez-vous à venir pour un médecin
export const getUpcomingRendezVousByMedecin = async (req, res) => {
  const { medecinId } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             p.id AS patient_id, u.nom AS patient_nom, u.prenom AS patient_prenom
      FROM rendez_vous rv
      INNER JOIN patients p ON rv.patient_id = p.id
      INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
      WHERE rv.medecin_id = $1 AND rv.date >= CURRENT_DATE 
            AND (rv.date > CURRENT_DATE OR (rv.date = CURRENT_DATE AND rv.heure >= CURRENT_TIME))
            AND rv.statut != 'annulé'
      ORDER BY rv.date, rv.heure
    `;
    const result = await pool.query(query, [medecinId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des rendez-vous" });
  }
};

// Récupérer les rendez-vous à venir pour un patient
export const getUpcomingRendezVousByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const query = `
      SELECT rv.id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
             m.id AS medecin_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom, m.specialite
      FROM rendez_vous rv
      INNER JOIN medecins m ON rv.medecin_id = m.id
      INNER JOIN utilisateurs u ON m.utilisateur_id = u.id
      WHERE rv.patient_id = $1 AND rv.date >= CURRENT_DATE 
            AND (rv.date > CURRENT_DATE OR (rv.date = CURRENT_DATE AND rv.heure >= CURRENT_TIME))
            AND rv.statut != 'annulé'
      ORDER BY rv.date, rv.heure
    `;
    const result = await pool.query(query, [patientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des rendez-vous" });
  }
};

// Créer un nouveau rendez-vous
export const createRendezVous = async (req, res) => {
  const { patient_id, medecin_id, date, heure, duree, motif, adresse } =
    req.body;

  // Validation des données
  if (!patient_id || !medecin_id || !date || !heure) {
    return res
      .status(400)
      .json({
        message: "Les champs patient_id, medecin_id, date et heure sont requis",
      });
  }

  try {
    // Vérifier si le patient existe
    const patientQuery = `SELECT id FROM patients WHERE id = $1`;
    const patientResult = await pool.query(patientQuery, [patient_id]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Vérifier si le médecin existe
    const medecinQuery = `SELECT id FROM medecins WHERE id = $1`;
    const medecinResult = await pool.query(medecinQuery, [medecin_id]);

    if (medecinResult.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Vérifier les disponibilités du médecin
    const jour = await getJourSemaine(date);

    // Vérifier si le médecin a des disponibilités ce jour-là
    const dispoQuery = `
      SELECT * FROM disponibilites_medecin 
      WHERE medecin_id = $1 AND jour = $2 
      AND heure_debut <= $3 AND heure_fin > $3
    `;
    const dispoResult = await pool.query(dispoQuery, [medecin_id, jour, heure]);

    if (dispoResult.rows.length === 0) {
      return res
        .status(400)
        .json({
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
        SELECT * FROM disponibilites_medecin 
        WHERE medecin_id = $1 AND jour = $2 
        AND heure_debut <= $3 AND heure_fin > $3
      `;
      const dispoResult = await pool.query(dispoQuery, [
        medecin_id,
        jour,
        heure,
      ]);

      if (dispoResult.rows.length === 0) {
        return res
          .status(400)
          .json({
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
