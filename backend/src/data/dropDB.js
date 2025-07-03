import { dropAllTables } from './createTables.js';
import pool from '../config/db.js';

const dropDatabase = async () => {
  try {
    console.log('🗑️  Suppression de toutes les tables...');
    
    // Supprimer toutes les tables
    await dropAllTables();
    console.log('✅ Toutes les tables ont été supprimées avec succès');
    
    console.log('🎉 Base de données nettoyée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des tables:', error);
    process.exit(1);
  }
};

// Exécuter la suppression directement
dropDatabase();

export default dropDatabase;
