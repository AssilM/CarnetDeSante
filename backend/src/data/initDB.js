import { initTables } from './createTables.js';
import pool from '../config/db.js';

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Créer les tables
    await initTables();
    console.log('✅ Tables créées avec succès');
    
    // Ne pas ajouter de données de test
    console.log('ℹ️  Base de données initialisée sans données de test');
    
    console.log('🎉 Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
};

// Exécuter l'initialisation directement
initializeDatabase();

export default initializeDatabase;
