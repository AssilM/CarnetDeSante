import messagingPool from "../config/messagingDb.js";
import pool from "../config/db.js";

class MessagingService {
  // Créer une conversation pour un rendez-vous
  async createConversation(rendezVousId, patientId, medecinId) {
    console.log(`🔍 [MESSAGING SERVICE] createConversation appelé:`, {
      rendezVousId,
      patientId,
      medecinId
    });

    // D'abord, vérifier s'il existe déjà une conversation entre ce patient et ce médecin
    const existingConversationQuery = `
      SELECT id, rendez_vous_id
      FROM conversations 
      WHERE patient_id = $1 AND medecin_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const existingResult = await messagingPool.query(existingConversationQuery, [patientId, medecinId]);
      
      if (existingResult.rows.length > 0) {
        const existingConversation = existingResult.rows[0];
        console.log(`🔍 [MESSAGING SERVICE] Conversation existante trouvée:`, existingConversation);
        
        // Si une conversation existe déjà, on l'utilise
        // On peut optionnellement mettre à jour le rendez_vous_id si nécessaire
        if (!existingConversation.rendez_vous_id) {
          const updateQuery = `
            UPDATE conversations 
            SET rendez_vous_id = $1 
            WHERE id = $2
          `;
          await messagingPool.query(updateQuery, [rendezVousId, existingConversation.id]);
          console.log(`🔍 [MESSAGING SERVICE] Rendez-vous associé à la conversation existante`);
        }
        
        return existingConversation;
      }
      
      // Si aucune conversation n'existe, créer une nouvelle
      console.log(`🔍 [MESSAGING SERVICE] Aucune conversation existante, création d'une nouvelle`);
      const queryText = `
        INSERT INTO conversations (rendez_vous_id, patient_id, medecin_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (rendez_vous_id) DO NOTHING
        RETURNING id
      `;
      
      const result = await messagingPool.query(queryText, [rendezVousId, patientId, medecinId]);
      console.log(`🔍 [MESSAGING SERVICE] Nouvelle conversation créée:`, result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ [MESSAGING SERVICE] Erreur lors de la création de la conversation:", error);
      throw error;
    }
  }

  // Obtenir une conversation par ID de rendez-vous
  async getConversationByRendezVous(rendezVousId) {
    // Récupérer la conversation depuis la base Messagerie
    const conversationQuery = `
      SELECT * FROM conversations 
      WHERE rendez_vous_id = $1
    `;
    
    try {
      const conversationResult = await messagingPool.query(conversationQuery, [rendezVousId]);
      const conversation = conversationResult.rows[0];
      
      if (!conversation) {
        return null;
      }
      
      // Récupérer les informations utilisateur depuis la base Database
      const patientQuery = `
        SELECT nom, prenom 
        FROM utilisateur 
        WHERE id = $1
      `;
      const medecinQuery = `
        SELECT nom, prenom 
        FROM utilisateur 
        WHERE id = $1
      `;
      
      const [patientResult, medecinResult] = await Promise.all([
        pool.query(patientQuery, [conversation.patient_id]),
        pool.query(medecinQuery, [conversation.medecin_id])
      ]);
      
      const patient = patientResult.rows[0];
      const medecin = medecinResult.rows[0];
      
      // Construire l'objet enrichi
      const enrichedConversation = {
        ...conversation,
        patient_nom: patient?.nom,
        patient_prenom: patient?.prenom,
        medecin_nom: medecin?.nom,
        medecin_prenom: medecin?.prenom
      };
      
      return enrichedConversation;
    } catch (error) {
      console.error("Erreur lors de la récupération de la conversation:", error);
      throw error;
    }
  }

  // Obtenir toutes les conversations d'un utilisateur
  async getUserConversations(userId, userRole) {
    // Vérifier d'abord si les tables existent
    try {
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'conversations'
        ) as conversations_exist,
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'messages'
        ) as messages_exist
      `;
      
      const tableCheck = await messagingPool.query(tableCheckQuery);
      const { conversations_exist, messages_exist } = tableCheck.rows[0];
      
      if (!conversations_exist || !messages_exist) {
        console.log("Tables de messagerie non trouvées, retour d'une liste vide");
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des tables:", error);
      return [];
    }

    // D'abord, récupérer les conversations de la base Messagerie
    let conversationsQuery;
    let conversationsParams;

    if (userRole === 'patient') {
      conversationsQuery = `
        SELECT * FROM conversations 
        WHERE patient_id = $1 
        ORDER BY created_at DESC
      `;
      conversationsParams = [userId];
    } else if (userRole === 'medecin') {
      conversationsQuery = `
        SELECT * FROM conversations 
        WHERE medecin_id = $1 
        ORDER BY created_at DESC
      `;
      conversationsParams = [userId];
    } else {
      return [];
    }

    try {
      // Récupérer les conversations depuis la base Messagerie
      const conversationsResult = await messagingPool.query(conversationsQuery, conversationsParams);
      const conversations = conversationsResult.rows;

      // Enrichir les conversations avec les informations utilisateur depuis la base Database
      const enrichedConversations = [];
      
      for (const conversation of conversations) {
        let userQuery;
        let userParams;
        
        if (userRole === 'patient') {
          // Pour un patient, récupérer les infos du médecin
          userQuery = `
            SELECT nom, prenom, chemin_photo 
            FROM utilisateur 
            WHERE id = $1
          `;
          userParams = [conversation.medecin_id];
        } else {
          // Pour un médecin, récupérer les infos du patient
          userQuery = `
            SELECT nom, prenom, chemin_photo 
            FROM utilisateur 
            WHERE id = $1
          `;
          userParams = [conversation.patient_id];
        }

        const userResult = await pool.query(userQuery, userParams);
        const user = userResult.rows[0];

        // Récupérer les infos du rendez-vous si il existe
        let rendezVousInfo = null;
        if (conversation.rendez_vous_id) {
          const rvQuery = `
            SELECT date, heure, statut 
            FROM rendez_vous 
            WHERE id = $1
          `;
          const rvResult = await pool.query(rvQuery, [conversation.rendez_vous_id]);
          rendezVousInfo = rvResult.rows[0];
        }

        // Construire l'objet enrichi
        const enrichedConversation = {
          ...conversation,
          ...(userRole === 'patient' ? {
            medecin_nom: user?.nom,
            medecin_prenom: user?.prenom,
            medecin_photo: user?.chemin_photo
          } : {
            patient_nom: user?.nom,
            patient_prenom: user?.prenom,
            patient_photo: user?.chemin_photo
          }),
          ...(rendezVousInfo ? {
            date_rdv: rendezVousInfo.date,
            heure_rdv: rendezVousInfo.heure,
            rdv_statut: rendezVousInfo.statut
          } : {})
        };

        enrichedConversations.push(enrichedConversation);
      }

      return enrichedConversations;
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      return [];
    }
  }

  // Envoyer un message
  async sendMessage(conversationId, senderId, content, type = 'text') {
    const queryText = `
      INSERT INTO messages (conversation_id, sender_id, content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await messagingPool.query(queryText, [conversationId, senderId, content, type]);
    
    // Mettre à jour la date de mise à jour de la conversation
    await messagingPool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );
    
    return result.rows[0];
    
  }

  // Obtenir les messages d'une conversation
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    console.log(`🔍 [MESSAGING SERVICE] getConversationMessages appelé:`);
    console.log(`  - conversationId: ${conversationId}`);
    console.log(`  - limit: ${limit}`);
    console.log(`  - offset: ${offset}`);
    
    // Vérifier d'abord si les tables existent
    try {
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'messages'
        ) as messages_exist
      `;
      
      const tableCheck = await messagingPool.query(tableCheckQuery);
      const { messages_exist } = tableCheck.rows[0];
      
      console.log(`  - table messages existe: ${messages_exist}`);
      
      if (!messages_exist) {
        console.log("❌ [MESSAGING SERVICE] Table messages non trouvée, retour d'une liste vide");
        return [];
      }
    } catch (error) {
      console.error("❌ [MESSAGING SERVICE] Erreur lors de la vérification de la table messages:", error);
      return [];
    }

    // Récupérer les messages depuis la base Messagerie
    const messagesQuery = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      console.log(`  - Exécution de la requête SQL avec conversationId: ${conversationId}`);
      const messagesResult = await messagingPool.query(messagesQuery, [conversationId, limit, offset]);
      const messages = messagesResult.rows;
      
      console.log(`  - Messages trouvés: ${messages.length}`);
      
      // Enrichir les messages avec les informations utilisateur
      const enrichedMessages = [];
      
      for (const message of messages) {
        const userQuery = `
          SELECT nom, prenom, role, email 
          FROM utilisateur 
          WHERE id = $1
        `;
        const userResult = await pool.query(userQuery, [message.sender_id]);
        const user = userResult.rows[0];
        
        const enrichedMessage = {
          ...message,
          nom: user?.nom,
          prenom: user?.prenom,
          role: user?.role,
          email: user?.email
        };
        
        enrichedMessages.push(enrichedMessage);
      }
      
      console.log(`  - Messages enrichis:`, enrichedMessages);
      return enrichedMessages;
    } catch (error) {
      console.error("❌ [MESSAGING SERVICE] Erreur lors de la récupération des messages:", error);
      return [];
    }
  }

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId, userId) {
    const queryText = `
      UPDATE messages 
      SET is_read = TRUE 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE
    `;
    
    try {
      await messagingPool.query(queryText, [conversationId, userId]);
    } catch (error) {
      console.error("Erreur lors du marquage des messages comme lus:", error);
      throw error;
    }
  }

  // Obtenir le nombre de messages non lus
  async getUnreadMessagesCount(userId) {
    // Vérifier d'abord si les tables existent
    try {
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'conversations'
        ) as conversations_exist,
        EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'messages'
        ) as messages_exist
      `;
      
      const tableCheck = await messagingPool.query(tableCheckQuery);
      const { conversations_exist, messages_exist } = tableCheck.rows[0];
      
      if (!conversations_exist || !messages_exist) {
        console.log("Tables de messagerie non trouvées, retour de 0 messages non lus");
        return 0;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des tables:", error);
      return 0;
    }

    const queryText = `
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.patient_id = $1 OR c.medecin_id = $1)
      AND m.sender_id != $1
      AND m.is_read = FALSE
    `;
    
    try {
      const result = await messagingPool.query(queryText, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Erreur lors du comptage des messages non lus:", error);
      return 0;
    }
  }

  // Vérifier si un utilisateur peut accéder à une conversation
  async canAccessConversation(conversationId, userId) {
    const queryText = `
      SELECT COUNT(*) as count
      FROM conversations
      WHERE id = $1 AND (patient_id = $2 OR medecin_id = $2)
    `;
    
    try {
      const result = await messagingPool.query(queryText, [conversationId, userId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Erreur lors de la vérification d'accès à la conversation:", error);
      throw error;
    }
  }

  // Obtenir les informations du destinataire d'un message
  async getMessageRecipient(conversationId, senderId) {
    // Récupérer la conversation depuis la base Messagerie
    const conversationQuery = `
      SELECT patient_id, medecin_id 
      FROM conversations 
      WHERE id = $1
    `;
    
    try {
      const conversationResult = await messagingPool.query(conversationQuery, [conversationId]);
      const conversation = conversationResult.rows[0];
      
      if (!conversation) {
        throw new Error("Conversation non trouvée");
      }
      
      // Déterminer le destinataire
      const recipientId = conversation.patient_id === senderId 
        ? conversation.medecin_id 
        : conversation.patient_id;
      
      // Récupérer les informations du destinataire depuis la base Database
      const userQuery = `
        SELECT nom, prenom, role 
        FROM utilisateur 
        WHERE id = $1
      `;
      
      const userResult = await pool.query(userQuery, [recipientId]);
      const user = userResult.rows[0];
      
      return {
        recipient_id: recipientId,
        nom: user?.nom,
        prenom: user?.prenom,
        role: user?.role
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du destinataire:", error);
      throw error;
    }
  }
}

export default new MessagingService(); 