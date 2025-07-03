import pool from './src/config/db.js';

const checkColumns = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'utilisateur' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colonnes de la table utilisateur:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Vérifier spécifiquement les colonnes de géolocalisation
    const locationColumns = result.rows.filter(row => 
      ['latitude', 'longitude', 'description_localisation'].includes(row.column_name)
    );
    
    console.log('\nColonnes de géolocalisation:');
    if (locationColumns.length > 0) {
      locationColumns.forEach(row => {
        console.log(`✅ ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('❌ Aucune colonne de géolocalisation trouvée');
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    process.exit(0);
  }
};

checkColumns();
