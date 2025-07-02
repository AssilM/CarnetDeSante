import pool from "../../config/db.js";

/**
 * Middleware pour vérifier la disponibilité d'un médecin à une date et heure données
 */
export const checkDoctorAvailability = async (req, res, next) => {
  console.log(
    "[checkDoctorAvailability] Vérification de la disponibilité:",
    req.body
  );
  const { medecin_id, date, heure } = req.body;

  if (!medecin_id || !date || !heure) {
    console.log(
      "[checkDoctorAvailability] Données incomplètes, passage au middleware suivant"
    );
    return next();
  }

  try {
    // Extraire le jour de la semaine
    const jourQuery = "SELECT EXTRACT(DOW FROM $1::date) as jour_num";
    console.log(
      "[checkDoctorAvailability] Exécution de la requête jour:",
      jourQuery,
      [date]
    );

    const jourResult = await pool.query(jourQuery, [date]);
    console.log(
      "[checkDoctorAvailability] Résultat de la requête jour:",
      jourResult.rows[0]
    );

    const jourNum = jourResult.rows[0].jour_num;

    // Convertir le numéro du jour en nom du jour en français
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
    console.log("[checkDoctorAvailability] Jour de la semaine:", jour);

    // Vérifier si le médecin a des disponibilités ce jour-là
    const dispoQuery = `
      SELECT * FROM disponibilite_medecin 
      WHERE medecin_id = $1 AND jour = $2 
      AND heure_debut <= $3 AND heure_fin > $3
    `;
    console.log(
      "[checkDoctorAvailability] Exécution de la requête disponibilité:",
      {
        query: dispoQuery,
        params: [medecin_id, jour, heure],
      }
    );

    const dispoResult = await pool.query(dispoQuery, [medecin_id, jour, heure]);
    console.log(
      "[checkDoctorAvailability] Résultat de la requête disponibilité:",
      {
        rows: dispoResult.rows,
        count: dispoResult.rows.length,
      }
    );

    if (dispoResult.rows.length === 0) {
      console.log("[checkDoctorAvailability] Médecin non disponible:", {
        medecin_id,
        jour,
        heure,
      });
      return res.status(400).json({
        message: "Le médecin n'est pas disponible à cette date et heure",
      });
    }

    // Ajouter les infos de disponibilité à la requête pour le contrôleur
    req.doctorAvailability = {
      jour,
      disponible: true,
    };
    console.log(
      "[checkDoctorAvailability] Médecin disponible, passage au middleware suivant"
    );

    next();
  } catch (error) {
    console.error(
      "[checkDoctorAvailability] Erreur lors de la vérification de la disponibilité:",
      error
    );
    console.error("[checkDoctorAvailability] Message d'erreur:", error.message);
    console.error("[checkDoctorAvailability] Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
