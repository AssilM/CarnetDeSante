import pool from "../config/db.js";

// Fonction pour créer les triggers de notifications
const createNotificationTriggers = async () => {
  try {
    // 1. Fonction pour notifier lors d'une nouvelle notification
    await pool.query(`
      CREATE OR REPLACE FUNCTION notify_on_notification_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Envoie une notification avec l'ID de l'utilisateur
        PERFORM pg_notify('new_notification', NEW.utilisateur_id::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Fonction notify_on_notification_insert créée");

    // 2. Trigger pour les nouvelles notifications
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_notification_insert ON notifications;
      CREATE TRIGGER trigger_notification_insert
        AFTER INSERT ON notifications
        FOR EACH ROW
        EXECUTE FUNCTION notify_on_notification_insert();
    `);
    console.log("✅ Trigger trigger_notification_insert créé");

    // 3. Fonction pour notifier lors d'un nouveau rendez-vous
    await pool.query(`
      CREATE OR REPLACE FUNCTION notify_rendez_vous_created()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Notification pour le patient
        INSERT INTO notifications (utilisateur_id, type, titre, contenu)
        VALUES (
          NEW.patient_id,
          'rendez_vous_creer',
          'Nouveau rendez-vous',
          'Votre rendez-vous du ' || NEW.date || ' à ' || NEW.heure || ' a été créé.'
        );
        
        -- Notification pour le médecin
        INSERT INTO notifications (utilisateur_id, type, titre, contenu)
        VALUES (
          NEW.medecin_id,
          'rendez_vous_creer',
          'Nouveau rendez-vous',
          'Un nouveau rendez-vous a été pris pour le ' || NEW.date || ' à ' || NEW.heure || '.'
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Fonction notify_rendez_vous_created créée");

    // 4. Trigger pour les nouveaux rendez-vous
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_rendez_vous_created ON rendez_vous;
      CREATE TRIGGER trigger_rendez_vous_created
        AFTER INSERT ON rendez_vous
        FOR EACH ROW
        EXECUTE FUNCTION notify_rendez_vous_created();
    `);
    console.log("✅ Trigger trigger_rendez_vous_created créé");

    // 5. Fonction pour notifier lors d'un document uploadé par un médecin
    await pool.query(`
      CREATE OR REPLACE FUNCTION notify_document_uploaded_by_doctor()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Si c'est un médecin qui upload (medecin_id IS NOT NULL)
        IF NEW.medecin_id IS NOT NULL AND NEW.uploader_id = NEW.medecin_id THEN
          -- Notification pour le patient
          INSERT INTO notifications (utilisateur_id, type, titre, contenu)
          VALUES (
            NEW.patient_id,
            'document_medecin_upload',
            'Nouveau document médical',
            'Le Dr. ' || (SELECT nom || ' ' || prenom FROM utilisateur WHERE id = NEW.medecin_id) || 
            ' a ajouté un nouveau document médical : ' || NEW.titre
          );
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Fonction notify_document_uploaded_by_doctor créée");

    // 6. Trigger pour les documents uploadés par un médecin
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_document_uploaded_by_doctor ON document;
      CREATE TRIGGER trigger_document_uploaded_by_doctor
        AFTER INSERT ON document
        FOR EACH ROW
        EXECUTE FUNCTION notify_document_uploaded_by_doctor();
    `);
    console.log("✅ Trigger trigger_document_uploaded_by_doctor créé");

    // 7. Fonction pour notifier lors du partage d'un document
    await pool.query(`
      CREATE OR REPLACE FUNCTION notify_document_shared()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Notification pour le médecin
        INSERT INTO notifications (utilisateur_id, type, titre, contenu)
        VALUES (
          NEW.user_id,
          'document_patient_shared',
          'Document partagé par un patient',
          'Un patient a partagé un document médical avec vous'
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Fonction notify_document_shared créée");

    // 8. Trigger pour le partage de documents
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_document_shared ON document_permission;
      CREATE TRIGGER trigger_document_shared
        AFTER INSERT ON document_permission
        FOR EACH ROW
        WHEN (NEW.role = 'shared')
        EXECUTE FUNCTION notify_document_shared();
    `);
    console.log("✅ Trigger trigger_document_shared créé");

    console.log(
      "🎉 Tous les triggers de notifications ont été créés avec succès"
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création des triggers de notifications:",
      error
    );
    throw error;
  }
};

// Fonction pour supprimer les triggers (utile pour les tests)
const dropNotificationTriggers = async () => {
  try {
    const triggers = [
      "trigger_notification_insert",
      "trigger_rendez_vous_created",
      "trigger_document_uploaded_by_doctor",
      "trigger_document_shared",
    ];

    for (const trigger of triggers) {
      await pool.query(`DROP TRIGGER IF EXISTS ${trigger} ON notifications`);
      await pool.query(`DROP TRIGGER IF EXISTS ${trigger} ON rendez_vous`);
      await pool.query(`DROP TRIGGER IF EXISTS ${trigger} ON document`);
      await pool.query(
        `DROP TRIGGER IF EXISTS ${trigger} ON document_permission`
      );
    }

    const functions = [
      "notify_on_notification_insert",
      "notify_rendez_vous_created",
      "notify_document_uploaded_by_doctor",
      "notify_document_shared",
    ];

    for (const func of functions) {
      await pool.query(`DROP FUNCTION IF EXISTS ${func}() CASCADE`);
    }

    console.log("🗑️ Tous les triggers de notifications ont été supprimés");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des triggers:", error);
    throw error;
  }
};

export { createNotificationTriggers, dropNotificationTriggers };
