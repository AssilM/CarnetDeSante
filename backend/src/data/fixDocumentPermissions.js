import pool from "../config/db.js";

/**
 * Script pour corriger les permissions des documents existants
 * Donne automatiquement accès aux médecins sur les documents liés à leurs rendez-vous
 */
const fixDocumentPermissions = async () => {
  try {
    console.log("Début de la correction des permissions de documents...");

    // 1. Récupérer tous les documents liés à des rendez-vous
    const { rows: documentsRendezVous } = await pool.query(`
      SELECT drv.document_id, drv.rendez_vous_id, rv.medecin_id, rv.patient_id
      FROM documents_rendez_vous drv
      JOIN rendez_vous rv ON drv.rendez_vous_id = rv.id
    `);

    console.log(`Trouvé ${documentsRendezVous.length} documents liés à des rendez-vous`);

    let permissionsCreated = 0;
    let permissionsSkipped = 0;

    for (const docRdv of documentsRendezVous) {
      const { document_id, rendez_vous_id, medecin_id, patient_id } = docRdv;

      // 2. Vérifier si le médecin a déjà une permission sur ce document
      const { rows: existingPermissions } = await pool.query(`
        SELECT * FROM document_permission 
        WHERE document_id = $1 AND user_id = $2
      `, [document_id, medecin_id]);

      if (existingPermissions.length === 0) {
        // 3. Créer la permission pour le médecin
        await pool.query(`
          INSERT INTO document_permission (document_id, user_id, role)
          VALUES ($1, $2, 'shared')
        `, [document_id, medecin_id]);

        console.log(`Permission créée: Médecin ${medecin_id} -> Document ${document_id}`);
        permissionsCreated++;
      } else {
        console.log(`Permission déjà existante: Médecin ${medecin_id} -> Document ${document_id}`);
        permissionsSkipped++;
      }

      // 4. Vérifier si le patient a déjà une permission sur ce document
      const { rows: existingPatientPermissions } = await pool.query(`
        SELECT * FROM document_permission 
        WHERE document_id = $1 AND user_id = $2
      `, [document_id, patient_id]);

      if (existingPatientPermissions.length === 0) {
        // 5. Créer la permission pour le patient
        await pool.query(`
          INSERT INTO document_permission (document_id, user_id, role)
          VALUES ($1, $2, 'shared')
        `, [document_id, patient_id]);

        console.log(`Permission créée: Patient ${patient_id} -> Document ${document_id}`);
        permissionsCreated++;
      } else {
        console.log(`Permission déjà existante: Patient ${patient_id} -> Document ${document_id}`);
        permissionsSkipped++;
      }
    }

    console.log(`\nRésumé:`);
    console.log(`- Permissions créées: ${permissionsCreated}`);
    console.log(`- Permissions déjà existantes: ${permissionsSkipped}`);
    console.log(`- Total de documents traités: ${documentsRendezVous.length}`);

  } catch (error) {
    console.error("Erreur lors de la correction des permissions:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Exécuter le script
fixDocumentPermissions()
  .then(() => {
    console.log("Correction des permissions terminée avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur lors de la correction des permissions:", error);
    process.exit(1);
  }); 