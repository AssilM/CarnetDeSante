import pool from '../../config/db.js';

/**
 * Migration pour ajouter les champs de géolocalisation à la table utilisateur
 * Spécifiquement pour les médecins dans le contexte africain (Lomé, Togo)
 */
const addLocationFieldsToUser = async () => {
  try {
    console.log('🔄 Début de la migration : ajout des champs de géolocalisation...');

    // Vérifier si les colonnes existent déjà
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'utilisateur' 
      AND column_name IN ('latitude', 'longitude', 'description_localisation')
    `;
    
    const existingColumns = await pool.query(checkColumnsQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);

    // Ajouter latitude si elle n'existe pas
    if (!existingColumnNames.includes('latitude')) {
      await pool.query(`
        ALTER TABLE utilisateur 
        ADD COLUMN latitude DECIMAL(10, 8)
      `);
      console.log('✅ Colonne latitude ajoutée');
    } else {
      console.log('⚠️ Colonne latitude existe déjà');
    }

    // Ajouter longitude si elle n'existe pas
    if (!existingColumnNames.includes('longitude')) {
      await pool.query(`
        ALTER TABLE utilisateur 
        ADD COLUMN longitude DECIMAL(11, 8)
      `);
      console.log('✅ Colonne longitude ajoutée');
    } else {
      console.log('⚠️ Colonne longitude existe déjà');
    }

    // Ajouter description_localisation si elle n'existe pas
    if (!existingColumnNames.includes('description_localisation')) {
      await pool.query(`
        ALTER TABLE utilisateur 
        ADD COLUMN description_localisation TEXT
      `);
      console.log('✅ Colonne description_localisation ajoutée');
    } else {
      console.log('⚠️ Colonne description_localisation existe déjà');
    }

    // Ajouter des commentaires pour la documentation
    await pool.query(`
      COMMENT ON COLUMN utilisateur.latitude IS 'Latitude de la localisation (pour les médecins)'
    `);
    
    await pool.query(`
      COMMENT ON COLUMN utilisateur.longitude IS 'Longitude de la localisation (pour les médecins)'
    `);
    
    await pool.query(`
      COMMENT ON COLUMN utilisateur.description_localisation IS 'Description de la localisation (quartier, points de repère) pour les médecins'
    `);

    console.log('✅ Migration terminée avec succès !');
    console.log('📍 Les médecins peuvent maintenant renseigner leur géolocalisation');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
};

// Fonction pour supprimer les champs (rollback)
const removeLocationFieldsFromUser = async () => {
  try {
    console.log('🔄 Rollback : suppression des champs de géolocalisation...');

    // Supprimer les colonnes une par une
    const columns = ['latitude', 'longitude', 'description_localisation'];
    
    for (const column of columns) {
      try {
        await pool.query(`
          ALTER TABLE utilisateur 
          DROP COLUMN IF EXISTS ${column}
        `);
        console.log(`✅ Colonne ${column} supprimée`);
      } catch (error) {
        console.log(`⚠️ Erreur lors de la suppression de ${column}:`, error.message);
      }
    }

    console.log('✅ Rollback terminé');

  } catch (error) {
    console.error('❌ Erreur lors du rollback:', error);
    throw error;
  }
};

// Exécuter la migration
const runMigration = async () => {
  const action = process.argv[2];
  
  try {
    if (action === 'rollback') {
      await removeLocationFieldsFromUser();
    } else {
      await addLocationFieldsToUser();
    }
  } catch (error) {
    console.error('Migration échouée:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Exécuter si ce fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

// Exécuter la migration automatiquement
runMigration();

export { addLocationFieldsToUser, removeLocationFieldsFromUser };
