import pool from '../config/db.js';

const dropAllTablesComplete = async () => {
  try {
    console.log('🗑️  Suppression complète de toutes les tables...');
    
    // Requête pour obtenir toutes les tables de la base de données
    const getAllTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const result = await pool.query(getAllTablesQuery);
    const tables = result.rows;
    
    if (tables.length === 0) {
      console.log('ℹ️  Aucune table trouvée dans la base de données');
      return;
    }
    
    console.log(`📋 ${tables.length} table(s) trouvée(s):`, tables.map(t => t.table_name).join(', '));
    
    // Supprimer toutes les tables avec CASCADE pour gérer les dépendances
    for (const table of tables) {
      const dropQuery = `DROP TABLE IF EXISTS ${table.table_name} CASCADE`;
      try {
        await pool.query(dropQuery);
        console.log(`✅ Table ${table.table_name} supprimée`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${table.table_name}:`, error.message);
      }
    }
    
    // Vérifier qu'il ne reste plus de tables
    const remainingResult = await pool.query(getAllTablesQuery);
    const remainingTables = remainingResult.rows;
    
    if (remainingTables.length === 0) {
      console.log('🎉 Toutes les tables ont été supprimées avec succès !');
    } else {
      console.log(`⚠️  ${remainingTables.length} table(s) restante(s):`, remainingTables.map(t => t.table_name).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression complète des tables:', error);
    process.exit(1);
  }
};

// Exécuter la suppression complète
dropAllTablesComplete();

export default dropAllTablesComplete;
