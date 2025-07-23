// Script de test pour vérifier l'API des documents
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Fonction pour tester l'API des documents
async function testDocumentsAPI() {
  try {
    console.log('🔍 Test de l\'API des documents...\n');

    // 1. Test de connexion basique
    console.log('1. Test de connexion basique...');
    try {
      const response = await axios.get(`${BASE_URL}/user/profile`);
      console.log('❌ Erreur attendue (pas d\'authentification):', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Serveur accessible (401 Unauthorized attendu)');
      } else {
        console.log('❌ Serveur non accessible:', error.message);
        return;
      }
    }

    // 2. Test de récupération des types de documents (sans auth)
    console.log('\n2. Test de récupération des types de documents...');
    try {
      const typesResponse = await axios.get(`${BASE_URL}/documents/types`);
      console.log('✅ Types de documents:', typesResponse.data);
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des types:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // 3. Test de récupération des documents par rendez-vous (sans auth)
    console.log('\n3. Test de récupération des documents par rendez-vous...');
    
    // Remplacer par un vrai ID de rendez-vous de votre base de données
    const testRendezVousId = 1; // À adapter selon votre BDD
    
    try {
      const documentsResponse = await axios.get(`${BASE_URL}/documents/by-rendezvous/${testRendezVousId}`);
      console.log('✅ Documents récupérés:', documentsResponse.data);
      console.log('📄 Nombre de documents:', documentsResponse.data.documents?.length || 0);
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des documents:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // 4. Test de récupération d'un rendez-vous spécifique (sans auth)
    console.log('\n4. Test de récupération d\'un rendez-vous...');
    try {
      const rdvResponse = await axios.get(`${BASE_URL}/rendez-vous/${testRendezVousId}`);
      console.log('✅ Rendez-vous récupéré:', rdvResponse.data);
    } catch (error) {
      console.log('❌ Erreur lors de la récupération du rendez-vous:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // 5. Test avec authentification (si vous avez un token)
    console.log('\n5. Test avec authentification...');
    const token = process.env.TEST_TOKEN; // Vous pouvez définir cette variable d'environnement
    if (token) {
      try {
        const authResponse = await axios.get(`${BASE_URL}/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Authentification réussie:', authResponse.data);
        
        // Test des documents avec auth
        const authDocumentsResponse = await axios.get(`${BASE_URL}/documents/by-rendezvous/${testRendezVousId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Documents avec auth:', authDocumentsResponse.data);
      } catch (error) {
        console.log('❌ Erreur avec authentification:');
        console.log('   Status:', error.response?.status);
        console.log('   Message:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('ℹ️  Pas de token de test fourni (TEST_TOKEN)');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testDocumentsAPI(); 