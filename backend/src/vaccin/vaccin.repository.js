import pool from "../config/db.js";

class VaccinRepository {
  // Créer un nouveau vaccin
  async createVaccin(vaccinData) {
    const {
      patient_id,
      nom_vaccin,
      nom_medecin,
      lieu_vaccination,
      type_vaccin,
      fabricant,
      date_vaccination,
      lot_vaccin,
      statut,
      notes,
    } = vaccinData;

    const query = `
      INSERT INTO vaccin (
        patient_id, nom_vaccin, nom_medecin, lieu_vaccination, type_vaccin, fabricant, date_vaccination, lot_vaccin, statut, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      patient_id,
      nom_vaccin,
      nom_medecin,
      lieu_vaccination,
      type_vaccin,
      fabricant,
      date_vaccination,
      lot_vaccin,
      statut,
      notes,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Récupérer tous les vaccins d'un patient
  async getVaccinsByPatient(patientId) {
    const query = `
      SELECT * FROM vaccin 
      WHERE patient_id = $1 
      ORDER BY date_vaccination DESC, created_at DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }

  // Récupérer un vaccin par son ID
  async getVaccinById(id) {
    const query = `SELECT * FROM vaccin WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Supprimer un vaccin
  async deleteVaccin(id) {
    const query = "DELETE FROM vaccin WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Mettre à jour un vaccin
  async updateVaccin(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    
    const query = `
      UPDATE vaccin 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Vérifier l'existence d'un patient
  async findPatientById(patientId) {
    const { rows } = await pool.query(
      "SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1",
      [patientId]
    );
    return rows.length > 0;
  }
}

export default new VaccinRepository();
