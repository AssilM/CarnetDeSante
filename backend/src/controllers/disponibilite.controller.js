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

    // Vérifier si l'heure de fin est après l'heure de début
    if (heure_fin <= heure_debut) {
      return res.status(400).json({
        message: "L'heure de fin doit être postérieure à l'heure de début",
      });
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
    res.status(500).json({
      message: "Erreur lors de la création de la disponibilité",
    });
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

    // Vérifier si l'heure de fin est après l'heure de début
    if (heure_fin <= heure_debut) {
      return res.status(400).json({
        message: "L'heure de fin doit être postérieure à l'heure de début",
      });
    }

    // Vérifier si la modification créerait un chevauchement avec une autre disponibilité
    const checkDispoQuery = `
      SELECT id FROM disponibilite_medecin
      WHERE medecin_id = $1 AND jour = $2 AND id != $3
      AND (
        (heure_debut <= $4 AND heure_fin > $4) OR
        (heure_debut < $5 AND heure_fin >= $5) OR
        (heure_debut >= $4 AND heure_fin <= $5)
      )
    `;
    const dispoResult = await pool.query(checkDispoQuery, [
      medecin_id,
      jour,
      id,
      heure_debut,
      heure_fin,
    ]);

    if (dispoResult.rows.length > 0) {
      return res.status(400).json({
        message:
          "Cette modification créerait un chevauchement avec une autre disponibilité",
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
    // Vérifier si le médecin existe
    const checkMedecinQuery = `
      SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1
    `;
    const medecinResult = await pool.query(checkMedecinQuery, [medecinId]);

    if (medecinResult.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Déterminer le jour de la semaine pour la date donnée
    const jourSemaine = await getJourSemaine(date);

    // Récupérer les disponibilités du médecin pour ce jour
    const dispoQuery = `
      SELECT id, heure_debut, heure_fin
      FROM disponibilite_medecin
      WHERE medecin_id = $1 AND jour = $2
      ORDER BY heure_debut
    `;
    const dispoResult = await pool.query(dispoQuery, [medecinId, jourSemaine]);

    if (dispoResult.rows.length === 0) {
      return res.status(200).json({
        disponible: false,
        message: "Aucune disponibilité pour ce jour",
        creneaux: [],
        jour: jourSemaine,
        date: date,
      });
    }

    // Récupérer les rendez-vous existants pour cette date
    const rdvQuery = `
      SELECT heure, duree
      FROM rendez_vous
      WHERE medecin_id = $1 AND date = $2 AND statut != 'annulé'
      ORDER BY heure
    `;
    const rdvResult = await pool.query(rdvQuery, [medecinId, date]);

    // Générer les créneaux disponibles (par défaut toutes les 30 minutes)
    const creneauxDisponibles = [];
    const dureeConsultation = 30; // minutes

    // Pour chaque plage de disponibilité
    for (const dispo of dispoResult.rows) {
      // Convertir les heures en minutes depuis minuit
      const debutMinutes = convertTimeToMinutes(dispo.heure_debut);
      const finMinutes = convertTimeToMinutes(dispo.heure_fin);

      // Générer des créneaux de 30 minutes
      for (
        let minute = debutMinutes;
        minute < finMinutes - dureeConsultation + 1;
        minute += dureeConsultation
      ) {
        const creneauHeure = formatMinutesToTime(minute);
        const creneauFin = formatMinutesToTime(minute + dureeConsultation);

        // Vérifier si ce créneau est déjà pris par un rendez-vous
        const estDisponible = !rdvResult.rows.some((rdv) => {
          const rdvDebut = convertTimeToMinutes(rdv.heure);
          const rdvFin = rdvDebut + parseInt(rdv.duree);
          return (
            (minute >= rdvDebut && minute < rdvFin) ||
            (minute + dureeConsultation > rdvDebut &&
              minute + dureeConsultation <= rdvFin) ||
            (rdvDebut >= minute && rdvDebut < minute + dureeConsultation)
          );
        });

        if (estDisponible) {
          creneauxDisponibles.push({
            heure: creneauHeure,
            heure_fin: creneauFin,
            duree: dureeConsultation,
            disponible: true,
          });
        }
      }
    }

    res.status(200).json({
      disponible: creneauxDisponibles.length > 0,
      message:
        creneauxDisponibles.length > 0
          ? `${creneauxDisponibles.length} créneaux disponibles`
          : "Aucun créneau disponible pour cette date",
      creneaux: creneauxDisponibles,
      jour: jourSemaine,
      date: date,
      disponibilites: dispoResult.rows.map((dispo) => ({
        debut: dispo.heure_debut,
        fin: dispo.heure_fin,
      })),
    });
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

// Fonction utilitaire pour obtenir le jour de la semaine à partir d'une date
const getJourSemaine = async (dateStr) => {
  const date = new Date(dateStr);
  const joursSemaine = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  return joursSemaine[date.getDay()];
};

// Convertir une heure au format HH:MM:SS en minutes depuis minuit
const convertTimeToMinutes = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convertir des minutes en format HH:MM:SS
const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
};
