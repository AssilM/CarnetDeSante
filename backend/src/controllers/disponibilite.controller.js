import pool from "../config/db.js";

// Récupérer les disponibilités d'un médecin
export const getDisponibilitesByMedecinId = async (req, res) => {
  const { medecinId } = req.params;

  try {
    const query = `
      SELECT id, medecin_id, jour, heure_debut, heure_fin
      FROM disponibilite_medecin
      WHERE medecin_id = $1
      ORDER BY 
        CASE 
          WHEN jour = 'lundi' THEN 1
          WHEN jour = 'mardi' THEN 2
          WHEN jour = 'mercredi' THEN 3
          WHEN jour = 'jeudi' THEN 4
          WHEN jour = 'vendredi' THEN 5
          WHEN jour = 'samedi' THEN 6
          WHEN jour = 'dimanche' THEN 7
        END,
        heure_debut
    `;
    const result = await pool.query(query, [medecinId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des disponibilités",
    });
  }
};

// Créer une nouvelle disponibilité
export const createDisponibilite = async (req, res) => {
  const { medecin_id, jour, heure_debut, heure_fin } = req.body;

  // Vérifier que l'utilisateur est bien le médecin concerné ou un administrateur
  if (req.userRole !== "admin" && req.userId !== parseInt(medecin_id)) {
    return res.status(403).json({
      message:
        "Vous n'êtes pas autorisé à créer des disponibilités pour ce médecin",
    });
  }

  try {
    // Vérifier si le médecin existe
    const checkMedecinQuery = `
      SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1
    `;
    const medecinResult = await pool.query(checkMedecinQuery, [medecin_id]);

    if (medecinResult.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Vérifier si la disponibilité existe déjà pour ce médecin, jour et créneau horaire
    const checkDispoQuery = `
      SELECT id FROM disponibilite_medecin
      WHERE medecin_id = $1 AND jour = $2 
      AND (
        (heure_debut <= $3 AND heure_fin > $3) OR
        (heure_debut < $4 AND heure_fin >= $4) OR
        (heure_debut >= $3 AND heure_fin <= $4)
      )
    `;
    const dispoResult = await pool.query(checkDispoQuery, [
      medecin_id,
      jour,
      heure_debut,
      heure_fin,
    ]);

    if (dispoResult.rows.length > 0) {
      return res.status(400).json({
        message:
          "Une disponibilité existe déjà pour ce médecin à ce jour et créneau horaire",
      });
    }

    // Créer la disponibilité
    const insertQuery = `
      INSERT INTO disponibilite_medecin (medecin_id, jour, heure_debut, heure_fin)
      VALUES ($1, $2, $3, $4)
      RETURNING id, medecin_id, jour, heure_debut, heure_fin
    `;
    const result = await pool.query(insertQuery, [
      medecin_id,
      jour,
      heure_debut,
      heure_fin,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la disponibilité:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la disponibilité" });
  }
};

// Mettre à jour une disponibilité
export const updateDisponibilite = async (req, res) => {
  const { id } = req.params;
  const { jour, heure_debut, heure_fin } = req.body;

  try {
    // Vérifier d'abord que la disponibilité existe et récupérer le medecin_id
    const checkQuery = `SELECT medecin_id FROM disponibilite_medecin WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Disponibilité non trouvée" });
    }

    const medecin_id = checkResult.rows[0].medecin_id;

    // Vérifier que l'utilisateur est bien le médecin concerné ou un administrateur
    if (req.userRole !== "admin" && req.userId !== medecin_id) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cette disponibilité",
      });
    }

    // Mettre à jour la disponibilité
    const updateQuery = `
      UPDATE disponibilite_medecin
      SET jour = $1, heure_debut = $2, heure_fin = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, medecin_id, jour, heure_debut, heure_fin
    `;
    const result = await pool.query(updateQuery, [
      jour,
      heure_debut,
      heure_fin,
      id,
    ]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la disponibilité",
    });
  }
};

// Supprimer une disponibilité
export const deleteDisponibilite = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier d'abord que la disponibilité existe et récupérer le medecin_id
    const checkQuery = `SELECT medecin_id FROM disponibilite_medecin WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Disponibilité non trouvée" });
    }

    const medecin_id = checkResult.rows[0].medecin_id;

    // Vérifier que l'utilisateur est bien le médecin concerné ou un administrateur
    if (req.userRole !== "admin" && req.userId !== medecin_id) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cette disponibilité",
      });
    }

    // Supprimer la disponibilité
    const deleteQuery = `DELETE FROM disponibilite_medecin WHERE id = $1`;
    await pool.query(deleteQuery, [id]);

    res.status(200).json({ message: "Disponibilité supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la disponibilité:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la disponibilité",
    });
  }
};

// Récupérer les créneaux disponibles pour un médecin à une date donnée
export const getCreneauxDisponibles = async (req, res) => {
  const { medecinId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "La date est requise" });
  }

  try {
    // Récupérer le jour de la semaine pour la date donnée
    const jourSemaineQuery = `
      SELECT TO_CHAR(DATE $1, 'day') as jour_semaine
    `;
    const jourSemaineResult = await pool.query(jourSemaineQuery, [date]);
    let jourSemaine = jourSemaineResult.rows[0].jour_semaine
      .trim()
      .toLowerCase();

    // Convertir le jour en français (supposant que la date est en format SQL standard)
    const joursMap = {
      monday: "lundi",
      tuesday: "mardi",
      wednesday: "mercredi",
      thursday: "jeudi",
      friday: "vendredi",
      saturday: "samedi",
      sunday: "dimanche",
    };
    jourSemaine = joursMap[jourSemaine] || jourSemaine;

    // Récupérer les disponibilités du médecin pour ce jour
    const dispoQuery = `
      SELECT heure_debut, heure_fin
      FROM disponibilite_medecin
      WHERE medecin_id = $1 AND jour = $2
    `;
    const dispoResult = await pool.query(dispoQuery, [medecinId, jourSemaine]);

    if (dispoResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    // Récupérer les rendez-vous déjà pris pour ce médecin à cette date
    const rdvQuery = `
      SELECT heure, duree
      FROM rendez_vous
      WHERE medecin_id = $1 AND date = $2
      AND statut IN ('planifié', 'confirmé')
    `;
    const rdvResult = await pool.query(rdvQuery, [medecinId, date]);

    // Calculer les créneaux disponibles
    const creneauxDisponibles = [];
    const dureeConsultation = 30; // Durée d'une consultation en minutes

    dispoResult.rows.forEach((dispo) => {
      const heureDebut = new Date(`1970-01-01T${dispo.heure_debut}Z`);
      const heureFin = new Date(`1970-01-01T${dispo.heure_fin}Z`);
      let currentSlot = new Date(heureDebut);

      while (
        currentSlot.getTime() + dureeConsultation * 60000 <=
        heureFin.getTime()
      ) {
        // Vérifier si ce créneau est disponible (non réservé)
        const creneauHeure = `${currentSlot
          .getUTCHours()
          .toString()
          .padStart(2, "0")}:${currentSlot
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}`;

        // Vérifier si ce créneau n'est pas déjà réservé
        const isReserved = rdvResult.rows.some((rdv) => {
          const rdvDebut = new Date(`1970-01-01T${rdv.heure}Z`);
          const rdvFin = new Date(rdvDebut.getTime() + rdv.duree * 60000);
          const slotDebut = currentSlot;
          const slotFin = new Date(
            slotDebut.getTime() + dureeConsultation * 60000
          );

          return (
            (slotDebut >= rdvDebut && slotDebut < rdvFin) ||
            (slotFin > rdvDebut && slotFin <= rdvFin) ||
            (slotDebut <= rdvDebut && slotFin >= rdvFin)
          );
        });

        if (!isReserved) {
          creneauxDisponibles.push(creneauHeure);
        }

        // Passer au créneau suivant
        currentSlot = new Date(
          currentSlot.getTime() + dureeConsultation * 60000
        );
      }
    });

    res.status(200).json(creneauxDisponibles);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créneaux disponibles:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des créneaux disponibles",
    });
  }
};
