// Script pour vérifier directement la base de données
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'carnet_sante',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...\n');

    // 1. Test de connexion
    console.log('1. Test de connexion à la base de données...');
    const client = await pool.connect();
    console.log('✅ Connexion réussie');

    // 2. Vérifier les rendez-vous
    console.log('\n2. Vérification des rendez-vous...');
    const rendezVousResult = await client.query(`
      SELECT id, patient_id, medecin_id, date, heure, statut, motif, adresse
      FROM rendez_vous 
      ORDER BY date DESC, heure DESC 
      LIMIT 5
    `);
    console.log('📅 Rendez-vous trouvés:', rendezVousResult.rows.length);
    rendezVousResult.rows.forEach((rdv, index) => {
      console.log(`   ${index + 1}. ID: ${rdv.id}, Date: ${rdv.date} ${rdv.heure}, Statut: ${rdv.statut}, Motif: ${rdv.motif}`);
    });

    // 3. Vérifier les documents
    console.log('\n3. Vérification des documents...');
    const documentsResult = await client.query(`
      SELECT id, titre, nom, type_id, patient_id, medecin_id, date_creation
      FROM document 
      ORDER BY date_creation DESC 
      LIMIT 5
    `);
    console.log('📄 Documents trouvés:', documentsResult.rows.length);
    documentsResult.rows.forEach((doc, index) => {
      console.log(`   ${index + 1}. ID: ${doc.id}, Titre: ${doc.titre || doc.nom}, Patient: ${doc.patient_id}, Médecin: ${doc.medecin_id}, Date: ${doc.date_creation}`);
    });

    // 4. Vérifier la table de liaison documents_rendez_vous
    console.log('\n4. Vérification de la table de liaison documents_rendez_vous...');
    const liaisonResult = await client.query(`
      SELECT drv.document_id, drv.rendez_vous_id, d.titre, d.nom, rv.date, rv.heure
      FROM documents_rendez_vous drv
      JOIN document d ON d.id = drv.document_id
      JOIN rendez_vous rv ON rv.id = drv.rendez_vous_id
      ORDER BY rv.date DESC, rv.heure DESC
    `);
    console.log('🔗 Liaisons documents-rendez-vous trouvées:', liaisonResult.rows.length);
    liaisonResult.rows.forEach((liaison, index) => {
      console.log(`   ${index + 1}. Document: ${liaison.document_id} (${liaison.titre || liaison.nom}), RDV: ${liaison.rendez_vous_id} (${liaison.date} ${liaison.heure})`);
    });

    // 5. Vérifier les permissions de documents
    console.log('\n5. Vérification des permissions de documents...');
    const permissionsResult = await client.query(`
      SELECT dp.document_id, dp.user_id, dp.role, d.titre, d.nom
      FROM document_permission dp
      JOIN document d ON d.id = dp.document_id
      ORDER BY dp.document_id, dp.role
      LIMIT 10
    `);
    console.log('🔐 Permissions trouvées:', permissionsResult.rows.length);
    permissionsResult.rows.forEach((perm, index) => {
      console.log(`   ${index + 1}. Document: ${perm.document_id} (${perm.titre || perm.nom}), User: ${perm.user_id}, Role: ${perm.role}`);
    });

    // 6. Vérifier les types de documents
    console.log('\n6. Vérification des types de documents...');
    const typesResult = await client.query(`
      SELECT id, label, code, description
      FROM document_type
      ORDER BY label
    `);
    console.log('🏷️  Types de documents trouvés:', typesResult.rows.length);
    typesResult.rows.forEach((type, index) => {
      console.log(`   ${index + 1}. ID: ${type.id}, Label: ${type.label}, Code: ${type.code}`);
    });

    // 7. Test spécifique pour un rendez-vous
    if (rendezVousResult.rows.length > 0) {
      const testRdvId = rendezVousResult.rows[0].id;
      console.log(`\n7. Test spécifique pour le rendez-vous #${testRdvId}...`);
      
      const testDocumentsResult = await client.query(`
        SELECT d.*
        FROM document d
        JOIN documents_rendez_vous drv ON drv.document_id = d.id
        WHERE drv.rendez_vous_id = $1
        ORDER BY d.date_creation DESC, d.created_at DESC
      `, [testRdvId]);
      
      console.log(`📄 Documents liés au RDV #${testRdvId}:`, testDocumentsResult.rows.length);
      testDocumentsResult.rows.forEach((doc, index) => {
        console.log(`   ${index + 1}. ID: ${doc.id}, Titre: ${doc.titre || doc.nom}, Type: ${doc.type_id}, Date: ${doc.date_creation}`);
      });
    }

    client.release();
    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Exécuter la vérification
checkDatabase(); 