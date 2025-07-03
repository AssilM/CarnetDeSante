import pool from '../config/db.js';

const createPatientRecord = async () => {
  try {
    console.log('🔄 Création d\'un enregistrement patient pour l\'utilisateur de test...');
    
    // Vérifier si l'utilisateur patient@gmail.com existe
    const userQuery = 'SELECT id FROM utilisateur WHERE email = $1';
    const userResult = await pool.query(userQuery, ['patient@gmail.com']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Utilisateur patient@gmail.com non trouvé');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Utilisateur trouvé avec ID: ${userId}`);
    
    // Vérifier si l'enregistrement patient existe déjà
    const patientCheckQuery = 'SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1';
    const patientResult = await pool.query(patientCheckQuery, [userId]);
    
    if (patientResult.rows.length > 0) {
      console.log('✅ Enregistrement patient existe déjà');
      return;
    }
    
    // Créer l'enregistrement patient
    const insertQuery = `
      INSERT INTO patient (utilisateur_id, groupe_sanguin, taille, poids)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [userId, 'O+', 175, 70]; // Données par défaut
    const result = await pool.query(insertQuery, values);
    
    console.log('✅ Enregistrement patient créé:', result.rows[0]);
    console.log('🎉 Script terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'enregistrement patient:', error);
  } finally {
    process.exit(0);
  }
};

// Exécuter le script
createPatientRecord();
