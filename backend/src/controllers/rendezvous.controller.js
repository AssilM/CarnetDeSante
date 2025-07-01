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

  console.log("[createRendezVous] Données reçues après middleware:", {
    patient_id,
    medecin_id,
    date,
    heure,
    duree,
    motif,
    adresse,
  });

  try {
    // Vérification : empêcher la prise de rendez-vous le jour même ou dans le passé
    const today = new Date().toISOString().split("T")[0];
    if (date <= today) {
      return res.status(400).json({
        message:
          "Impossible de prendre un rendez-vous pour aujourd'hui ou une date passée.",
      });
    }

    // Toutes les validations sont maintenant gérées par les middlewares:
    // - validateAppointmentData: vérifie que les champs requis sont présents et valides
    // - convertAppointmentTypes: convertit les types de données
    // - checkPatientExists: vérifie que le patient existe
    // - checkDoctorExists: vérifie que le médecin existe
    // - checkDoctorAvailability: vérifie la disponibilité du médecin
    // - checkAppointmentConflict: vérifie les conflits de rendez-vous

    // On peut directement créer le rendez-vous
    const dureeValue = duree || 30; // durée par défaut : 30 minutes
    const insertQuery = `
      INSERT INTO rendez_vous (patient_id, medecin_id, date, heure, duree, motif, adresse)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, patient_id, medecin_id, date, heure, duree, statut, motif, adresse
    `;

    console.log(
      "[createRendezVous] Préparation de l'insertion avec les paramètres:",
      {
        patient_id,
        medecin_id,
        date,
        heure,
        dureeValue,
        motif: motif || null,
        adresse: adresse || null,
      }
    );

    console.log("[createRendezVous] Exécution de la requête d'insertion");
    const insertResult = await pool.query(insertQuery, [
      patient_id,
      medecin_id,
      date,
      heure,
      dureeValue,
      motif || null,
      adresse || null,
    ]);

    console.log(
      "[createRendezVous] Rendez-vous créé avec succès:",
      insertResult.rows[0]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error(
      "[createRendezVous] Erreur lors de la création du rendez-vous:",
      error
    );
    console.error(
      "[createRendezVous] Message d'erreur détaillé:",
      error.message
    );
    console.error("[createRendezVous] Stack trace:", error.stack);

    // Vérifier si c'est une erreur de contrainte de clé étrangère
    if (error.code === "23503") {
      console.error("[createRendezVous] Erreur de clé étrangère. Détails:", {
        constraint: error.constraint,
        detail: error.detail,
        table: error.table,
      });

      return res.status(400).json({
        message:
          "Erreur de référence: un des identifiants (patient ou médecin) n'existe pas",
        detail: error.detail,
      });
    }

    // Vérifier si c'est une erreur de violation de contrainte unique
    if (error.code === "23505") {
      console.error(
        "[createRendezVous] Erreur de contrainte unique. Détails:",
        {
          constraint: error.constraint,
          detail: error.detail,
          table: error.table,
        }
      );

      return res.status(400).json({
        message: "Ce rendez-vous existe déjà",
        detail: error.detail,
      });
    }

    res.status(500).json({
      message: "Erreur lors de la création du rendez-vous",
      error: error.message,
    });
  }
};

// Fonction alternative pour vérifier la disponibilité d'un médecin
// sans utiliser la fonction getJourSemaine qui cause des problèmes
const verifierDisponibiliteMedecin = async (medecinId, dateStr, heure) => {
  try {
    console.log("[verifierDisponibiliteMedecin] Vérification pour:", {
      medecinId,
      dateStr,
      heure,
    });

    // Extraire le jour de la semaine directement avec une requête SQL robuste
    const jourQuery = "SELECT EXTRACT(DOW FROM DATE $1) as jour_num";
    const jourResult = await pool.query(jourQuery, [dateStr]);
    const jourNum = jourResult.rows[0].jour_num;

    // Convertir le numéro du jour (0=dimanche, 1=lundi, etc.) en nom du jour en français
    const joursSemaine = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    const jour = joursSemaine[jourNum];

    console.log("[verifierDisponibiliteMedecin] Jour de la semaine:", jour);

    // Vérifier si le médecin a des disponibilités ce jour-là
    const dispoQuery = `
      SELECT * FROM disponibilite_medecin 
      WHERE medecin_id = $1 AND jour = $2 
      AND heure_debut <= $3 AND heure_fin > $3
    `;
    const dispoResult = await pool.query(dispoQuery, [medecinId, jour, heure]);

    const disponible = dispoResult.rows.length > 0;
    console.log(
      "[verifierDisponibiliteMedecin] Médecin disponible:",
      disponible
    );

    return disponible;
  } catch (error) {
    console.error("[verifierDisponibiliteMedecin] Erreur:", error);
    // En cas d'erreur, on suppose que le médecin est disponible
    // pour ne pas bloquer la création du rendez-vous
    return true;
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

// Supprimer un rendez-vous (admin ou patient concerné)
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
    console.log(
      "[getJourSemaine] Date reçue:",
      dateStr,
      "Type:",
      typeof dateStr
    );

    // Vérification du format de la date
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("[getJourSemaine] Format de date invalide:", dateStr);
      throw new Error("Format de date invalide. Format attendu: YYYY-MM-DD");
    }

    // Utiliser une requête SQL plus simple et robuste
    const query = "SELECT TO_CHAR(DATE $1, 'day') as jour";
    console.log(
      "[getJourSemaine] Exécution de la requête:",
      query,
      "avec paramètre:",
      dateStr
    );

    const result = await pool.query(query, [dateStr]);
    const jourSemaine = result.rows[0].jour.trim().toLowerCase();
    console.log("[getJourSemaine] Jour obtenu:", jourSemaine);

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
      "[getJourSemaine] Erreur lors de la détermination du jour de la semaine:",
      error
    );
    console.error("[getJourSemaine] Message d'erreur:", error.message);
    console.error("[getJourSemaine] Stack trace:", error.stack);

    // En cas d'erreur, retourner un jour par défaut pour éviter de bloquer le processus
    console.log("[getJourSemaine] Retour d'un jour par défaut: lundi");
    return "lundi";
  }
};
