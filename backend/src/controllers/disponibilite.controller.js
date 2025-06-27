import pool from "../config/db.js";

// Récupérer toutes les disponibilités d'un médecin
export const getDisponibilitesForMedecin = async (req, res) => {
  const { medecinId } = req.params;

  try {
    const query = `
      SELECT id, medecin_id, jour, heure_debut, heure_fin
      FROM disponibilites_medecin
      WHERE medecin_id = $1
      ORDER BY 
        CASE jour 
          WHEN 'lundi' THEN 1 
          WHEN 'mardi' THEN 2 
          WHEN 'mercredi' THEN 3 
          WHEN 'jeudi' THEN 4 
          WHEN 'vendredi' THEN 5 
          WHEN 'samedi' THEN 6 
          WHEN 'dimanche' THEN 7 
        END,
        heure_debut
    `;
    const result = await pool.query(query, [medecinId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des disponibilités" });
  }
};

// Ajouter une nouvelle disponibilité pour un médecin
export const addDisponibilite = async (req, res) => {
  const { medecin_id, jour, heure_debut, heure_fin } = req.body;

  // Validation des données
  if (!medecin_id || !jour || !heure_debut || !heure_fin) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Validation du jour
  const joursValides = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];
  if (!joursValides.includes(jour.toLowerCase())) {
    return res.status(400).json({ message: "Jour invalide" });
  }

  try {
    // Vérifier si le médecin existe
    const medecinQuery = `SELECT id FROM medecins WHERE id = $1`;
    const medecinResult = await pool.query(medecinQuery, [medecin_id]);

    if (medecinResult.rows.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Vérifier les conflits de disponibilité
    const conflitQuery = `
      SELECT id FROM disponibilites_medecin
      WHERE medecin_id = $1 AND jour = $2 AND 
      ((heure_debut <= $3 AND heure_fin > $3) OR 
       (heure_debut < $4 AND heure_fin >= $4) OR
       (heure_debut >= $3 AND heure_fin <= $4))
    `;
    const conflitResult = await pool.query(conflitQuery, [
      medecin_id,
      jour,
      heure_debut,
      heure_fin,
    ]);

    if (conflitResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Conflit avec une disponibilité existante" });
    }

    // Insérer la nouvelle disponibilité
    const insertQuery = `
      INSERT INTO disponibilites_medecin (medecin_id, jour, heure_debut, heure_fin)
      VALUES ($1, $2, $3, $4)
      RETURNING id, medecin_id, jour, heure_debut, heure_fin
    `;
    const insertResult = await pool.query(insertQuery, [
      medecin_id,
      jour.toLowerCase(),
      heure_debut,
      heure_fin,
    ]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la disponibilité:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de la disponibilité" });
  }
};

// Mettre à jour une disponibilité
export const updateDisponibilite = async (req, res) => {
  const { id } = req.params;
  const { jour, heure_debut, heure_fin } = req.body;

  // Validation des données
  if (!jour || !heure_debut || !heure_fin) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Validation du jour
  const joursValides = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];
  if (!joursValides.includes(jour.toLowerCase())) {
    return res.status(400).json({ message: "Jour invalide" });
  }

  try {
    // Récupérer la disponibilité actuelle
    const getQuery = `SELECT medecin_id FROM disponibilites_medecin WHERE id = $1`;
    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: "Disponibilité non trouvée" });
    }

    const medecin_id = getResult.rows[0].medecin_id;

    // Vérifier les conflits de disponibilité
    const conflitQuery = `
      SELECT id FROM disponibilites_medecin
      WHERE medecin_id = $1 AND jour = $2 AND id <> $3 AND 
      ((heure_debut <= $4 AND heure_fin > $4) OR 
       (heure_debut < $5 AND heure_fin >= $5) OR
       (heure_debut >= $4 AND heure_fin <= $5))
    `;
    const conflitResult = await pool.query(conflitQuery, [
      medecin_id,
      jour,
      id,
      heure_debut,
      heure_fin,
    ]);

    if (conflitResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Conflit avec une disponibilité existante" });
    }

    // Mettre à jour la disponibilité
    const updateQuery = `
      UPDATE disponibilites_medecin
      SET jour = $1, heure_debut = $2, heure_fin = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, medecin_id, jour, heure_debut, heure_fin
    `;
    const updateResult = await pool.query(updateQuery, [
      jour.toLowerCase(),
      heure_debut,
      heure_fin,
      id,
    ]);

    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la disponibilité" });
  }
};

// Supprimer une disponibilité
export const deleteDisponibilite = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si la disponibilité existe
    const checkQuery = `SELECT id FROM disponibilites_medecin WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Disponibilité non trouvée" });
    }

    // Supprimer la disponibilité
    const deleteQuery = `DELETE FROM disponibilites_medecin WHERE id = $1 RETURNING id`;
    await pool.query(deleteQuery, [id]);

    res.status(200).json({ message: "Disponibilité supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la disponibilité:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la disponibilité" });
  }
};

// Récupérer les créneaux horaires disponibles pour un médecin à une date donnée
export const getCreneauxDisponibles = async (req, res) => {
  const { medecinId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "La date est requise" });
  }

  try {
    // Déterminer le jour de la semaine pour la date donnée
    const jourQuery = `SELECT TO_CHAR(DATE $1, 'day') as jour`;
    const jourResult = await pool.query(jourQuery, [date]);
    const jourSemaine = jourResult.rows[0].jour.trim().toLowerCase();

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

    const jourFrancais = jourMap[jourSemaine] || jourSemaine;

    // Récupérer les disponibilités du médecin pour ce jour
    const disponibilitesQuery = `
      SELECT heure_debut, heure_fin
      FROM disponibilites_medecin
      WHERE medecin_id = $1 AND jour = $2
    `;
    const disponibilitesResult = await pool.query(disponibilitesQuery, [
      medecinId,
      jourFrancais,
    ]);

    // Récupérer les rendez-vous existants pour ce médecin à cette date
    const rendezVousQuery = `
      SELECT heure, duree
      FROM rendez_vous
      WHERE medecin_id = $1 AND date = $2 AND statut != 'annulé'
    `;
    const rendezVousResult = await pool.query(rendezVousQuery, [
      medecinId,
      date,
    ]);

    // Générer les créneaux disponibles (par défaut 30 minutes)
    const creneaux = [];
    const dureeConsultation = 30; // en minutes

    for (const dispo of disponibilitesResult.rows) {
      // Convertir les heures de début et de fin en minutes
      const debutMinutes =
        parseInt(dispo.heure_debut.split(":")[0]) * 60 +
        parseInt(dispo.heure_debut.split(":")[1]);
      const finMinutes =
        parseInt(dispo.heure_fin.split(":")[0]) * 60 +
        parseInt(dispo.heure_fin.split(":")[1]);

      // Générer tous les créneaux possibles
      for (let i = debutMinutes; i < finMinutes; i += dureeConsultation) {
        const heureDebut = `${Math.floor(i / 60)
          .toString()
          .padStart(2, "0")}:${(i % 60).toString().padStart(2, "0")}`;
        const heureFin = `${Math.floor((i + dureeConsultation) / 60)
          .toString()
          .padStart(2, "0")}:${((i + dureeConsultation) % 60)
          .toString()
          .padStart(2, "0")}`;

        // Vérifier si ce créneau est disponible (non déjà réservé)
        const creneauDisponible = !rendezVousResult.rows.some((rdv) => {
          const rdvHeureMinutes =
            parseInt(rdv.heure.split(":")[0]) * 60 +
            parseInt(rdv.heure.split(":")[1]);
          const rdvFinMinutes = rdvHeureMinutes + rdv.duree;
          return (
            (i >= rdvHeureMinutes && i < rdvFinMinutes) || // Le début du créneau est dans un RDV
            (i + dureeConsultation > rdvHeureMinutes &&
              i + dureeConsultation <= rdvFinMinutes) || // La fin du créneau est dans un RDV
            (i <= rdvHeureMinutes && i + dureeConsultation >= rdvFinMinutes)
          ); // Le créneau englobe un RDV
        });

        if (creneauDisponible) {
          creneaux.push({ heureDebut, heureFin });
        }
      }
    }

    res.status(200).json(creneaux);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créneaux disponibles:",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des créneaux disponibles",
      });
  }
};
