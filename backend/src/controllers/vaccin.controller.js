import pool from '../config/db.js';

// Obtenir tous les vaccins d'un patient
export const getVaccins = async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    const query = `
      SELECT 
        v.id,
        v.nom_vaccin,
        v.nom_medecin,
        v.lieu_vaccination,
        v.type_vaccin,
        v.fabricant,
        v.date_vaccination,
        v.lot_vaccin,
        v.statut,
        v.notes,
        v.created_at,
        v.updated_at
      FROM vaccin v
      WHERE v.patient_id = $1
      ORDER BY v.date_vaccination DESC
    `;
    
    const result = await pool.query(query, [patient_id]);
    
    res.json({
      success: true,
      data: result.rows,
      message: 'Vaccins récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des vaccins:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des vaccins'
    });
  }
};

// Obtenir un vaccin spécifique
export const getVaccinById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        v.id,
        v.nom_vaccin,
        v.nom_medecin,
        v.lieu_vaccination,
        v.type_vaccin,
        v.fabricant,
        v.date_vaccination,
        v.lot_vaccin,
        v.statut,
        v.notes,
        v.created_at,
        v.updated_at,
        u.nom,
        u.prenom
      FROM vaccin v
      JOIN patient p ON v.patient_id = p.utilisateur_id
      JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE v.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaccin non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Vaccin récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du vaccin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du vaccin'
    });
  }
};

// Créer un nouveau vaccin
export const createVaccin = async (req, res) => {
  try {
    const { 
      patient_id, 
      nom_vaccin, 
      nom_medecin, 
      lieu_vaccination, 
      type_vaccin, 
      fabricant, 
      date_vaccination, 
      lot_vaccin, 
      notes 
    } = req.body;
    
    console.log('Données reçues pour création du vaccin:', req.body);
    
    // Vérifier que le patient existe
    const patientCheckQuery = 'SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1';
    const patientResult = await pool.query(patientCheckQuery, [patient_id]);
    
    if (patientResult.rows.length === 0) {
      console.log(`Patient avec ID ${patient_id} non trouvé`);
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }
    
    // Déterminer automatiquement le statut en fonction de la date
    const today = new Date();
    const vaccinationDate = new Date(date_vaccination);
    const statut = vaccinationDate > today ? 'planifié' : 'administré';
    
    const query = `
      INSERT INTO vaccin (
        patient_id, nom_vaccin, nom_medecin, lieu_vaccination, 
        type_vaccin, fabricant, date_vaccination, lot_vaccin, 
        statut, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      patient_id, nom_vaccin, nom_medecin, lieu_vaccination,
      type_vaccin, fabricant, date_vaccination, lot_vaccin,
      statut, notes || null
    ];
    
    console.log('Requête SQL:', query);
    console.log('Valeurs:', values);
    
    const result = await pool.query(query, values);
    
    console.log('Vaccin créé avec succès:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Vaccin créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du vaccin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du vaccin',
      error: error.message
    });
  }
};

// Mettre à jour un vaccin
export const updateVaccin = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nom_vaccin, 
      nom_medecin, 
      lieu_vaccination, 
      type_vaccin, 
      fabricant, 
      date_vaccination, 
      lot_vaccin, 
      notes 
    } = req.body;
    
    // Déterminer automatiquement le statut en fonction de la date
    const today = new Date();
    const vaccinationDate = new Date(date_vaccination);
    const statut = vaccinationDate > today ? 'planifié' : 'administré';
    
    const query = `
      UPDATE vaccin 
      SET nom_vaccin = $1, nom_medecin = $2, lieu_vaccination = $3, 
          type_vaccin = $4, fabricant = $5, date_vaccination = $6, 
          lot_vaccin = $7, statut = $8, notes = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    
    const values = [
      nom_vaccin, nom_medecin, lieu_vaccination, type_vaccin,
      fabricant, date_vaccination, lot_vaccin, statut,
      notes, id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaccin non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Vaccin mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du vaccin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du vaccin'
    });
  }
};

// Supprimer un vaccin
export const deleteVaccin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM vaccin WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaccin non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Vaccin supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du vaccin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du vaccin'
    });
  }
};

// Obtenir les vaccins par statut
export const getVaccinsByStatut = async (req, res) => {
  try {
    const { patient_id, statut } = req.params;
    
    const query = `
      SELECT * FROM vaccin 
      WHERE patient_id = $1 AND statut = $2
      ORDER BY date_vaccination DESC
    `;
    
    const result = await pool.query(query, [patient_id, statut]);
    
    res.json({
      success: true,
      data: result.rows,
      message: `Vaccins avec statut "${statut}" récupérés avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des vaccins par statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des vaccins'
    });
  }
};