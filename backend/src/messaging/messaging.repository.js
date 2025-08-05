import { chatPool, pool } from "../config/db.js";

class MessagingRepository {
  // === CONVERSATIONS ===

  // Créer une nouvelle conversation
  async createConversation(patientId, doctorId) {
    const query = `
      INSERT INTO conversations (patient_id, doctor_id)
      VALUES ($1, $2)
      ON CONFLICT (patient_id, doctor_id) DO UPDATE SET 
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const { rows } = await chatPool.query(query, [patientId, doctorId]);
    return rows[0];
  }

  // Récupérer une conversation par ID
  async getConversationById(conversationId) {
    // Récupérer la conversation depuis la base de messagerie
    const conversationQuery = `
      SELECT * FROM conversations WHERE id = $1
    `;
    const { rows: conversationRows } = await chatPool.query(conversationQuery, [
      conversationId,
    ]);

    if (conversationRows.length === 0) {
      return null;
    }

    const conversation = conversationRows[0];

    // Récupérer les informations utilisateur depuis la base principale
    const userQuery = `
      SELECT id, nom, prenom, chemin_photo FROM utilisateur WHERE id IN ($1, $2)
    `;
    const { rows: userRows } = await pool.query(userQuery, [
      conversation.patient_id,
      conversation.doctor_id,
    ]);

    // Associer les informations utilisateur
    const patient = userRows.find((u) => u.id === conversation.patient_id);
    const doctor = userRows.find((u) => u.id === conversation.doctor_id);

    return {
      ...conversation,
      patient_nom: patient?.nom,
      patient_prenom: patient?.prenom,
      doctor_nom: doctor?.nom,
      doctor_prenom: doctor?.prenom,
    };
  }

  // Récupérer toutes les conversations d'un utilisateur
  async getUserConversations(userId, userRole) {
    let conversationQuery;
    if (userRole === "patient") {
      conversationQuery = `
        SELECT c.*, 
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.sender_id != $1) as unread_count,
               (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) as last_message
        FROM conversations c
        WHERE c.patient_id = $1
        ORDER BY c.updated_at DESC
      `;
    } else if (userRole === "medecin") {
      conversationQuery = `
        SELECT c.*, 
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.sender_id != $1) as unread_count,
               (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) as last_message
        FROM conversations c
        WHERE c.doctor_id = $1
        ORDER BY c.updated_at DESC
      `;
    } else {
      throw new Error("Rôle non autorisé pour la messagerie");
    }

    const { rows: conversations } = await chatPool.query(conversationQuery, [
      userId,
    ]);

    if (conversations.length === 0) {
      return [];
    }

    // Récupérer les IDs des utilisateurs pour récupérer leurs informations
    const userIds = [];
    if (userRole === "patient") {
      conversations.forEach((conv) => userIds.push(conv.doctor_id));
    } else {
      conversations.forEach((conv) => userIds.push(conv.patient_id));
    }

    // Récupérer les informations utilisateur depuis la base principale
    const userQuery = `
      SELECT id, nom, prenom, chemin_photo FROM utilisateur WHERE id = ANY($1)
    `;
    const { rows: users } = await pool.query(userQuery, [userIds]);

    // Associer les informations utilisateur aux conversations
    return conversations.map((conversation) => {
      const otherUser = users.find((u) =>
        userRole === "patient"
          ? u.id === conversation.doctor_id
          : u.id === conversation.patient_id
      );

      return {
        ...conversation,
        ...(userRole === "patient"
          ? {
              doctor_nom: otherUser?.nom,
              doctor_prenom: otherUser?.prenom,
              doctor_photo: otherUser?.chemin_photo,
            }
          : {
              patient_nom: otherUser?.nom,
              patient_prenom: otherUser?.prenom,
              patient_photo: otherUser?.chemin_photo,
            }),
      };
    });
  }

  // Vérifier si une conversation existe entre patient et médecin
  async conversationExists(patientId, doctorId) {
    const query = `
      SELECT id FROM conversations 
      WHERE patient_id = $1 AND doctor_id = $2
    `;
    const { rows } = await chatPool.query(query, [patientId, doctorId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  // Mettre à jour le timestamp du dernier message
  async updateLastMessageTime(conversationId) {
    const query = `
      UPDATE conversations 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await chatPool.query(query, [conversationId]);
  }

  // === MESSAGES ===

  // Créer un nouveau message
  async createMessage(conversationId, senderId, content) {
    const query = `
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await chatPool.query(query, [
      conversationId,
      senderId,
      content,
    ]);

    // Mettre à jour le timestamp du dernier message de la conversation
    await this.updateLastMessageTime(conversationId);

    return rows[0];
  }

  // Récupérer les messages d'une conversation
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    // Récupérer les messages depuis la base de messagerie
    const messageQuery = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY sent_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows: messages } = await chatPool.query(messageQuery, [
      conversationId,
      limit,
      offset,
    ]);

    if (messages.length === 0) {
      return [];
    }

    // Récupérer les IDs des expéditeurs
    const senderIds = [...new Set(messages.map((m) => m.sender_id))];

    // Récupérer les informations utilisateur depuis la base principale
    const userQuery = `
      SELECT id, nom, prenom, chemin_photo FROM utilisateur WHERE id = ANY($1)
    `;
    const { rows: users } = await pool.query(userQuery, [senderIds]);

    // Associer les informations utilisateur aux messages
    return messages.reverse().map((message) => {
      const sender = users.find((u) => u.id === message.sender_id);
      return {
        ...message,
        nom: sender?.nom,
        prenom: sender?.prenom,
        chemin_photo: sender?.chemin_photo,
      };
    });
  }

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId, userId) {
    const query = `
      UPDATE messages 
      SET is_read = true
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
    `;
    const { rowCount } = await chatPool.query(query, [conversationId, userId]);
    return rowCount;
  }

  // Compter les messages non lus pour un utilisateur
  async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.is_read = false 
        AND m.sender_id != $1
        AND (
          (c.patient_id = $1) OR (c.doctor_id = $1)
        )
    `;
    const { rows } = await chatPool.query(query, [userId]);
    return parseInt(rows[0].unread_count);
  }

  // === RELATIONS PATIENT-MEDECIN ===

  // Récupérer les médecins liés à un patient
  async getPatientDoctors(patientId) {
    const query = `
      SELECT m.utilisateur_id as doctor_id, 
             u.nom, u.prenom, u.email, u.chemin_photo,
             m.specialite
      FROM patient_doctor pd
      JOIN medecin m ON m.utilisateur_id = pd.doctor_id
      JOIN utilisateur u ON u.id = m.utilisateur_id
      WHERE pd.patient_id = $1 AND pd.status = 'actif'
      ORDER BY u.nom, u.prenom
    `;
    const { rows } = await pool.query(query, [patientId]);
    return rows;
  }

  // Récupérer les patients liés à un médecin
  async getDoctorPatients(doctorId) {
    const query = `
      SELECT p.utilisateur_id as patient_id, 
             u.nom, u.prenom, u.email, u.chemin_photo
      FROM patient_doctor pd
      JOIN patient p ON p.utilisateur_id = pd.patient_id
      JOIN utilisateur u ON u.id = p.utilisateur_id
      WHERE pd.doctor_id = $1 AND pd.status = 'actif'
      ORDER BY u.nom, u.prenom
    `;
    const { rows } = await pool.query(query, [doctorId]);
    return rows;
  }

  // Vérifier si un lien patient-médecin existe
  async patientDoctorRelationshipExists(patientId, doctorId) {
    const query = `
      SELECT 1 FROM patient_doctor 
      WHERE patient_id = $1 AND doctor_id = $2 AND status = 'actif'
    `;
    const { rows } = await pool.query(query, [patientId, doctorId]);
    return rows.length > 0;
  }

  // === RECHERCHE UTILISATEURS ===

  // Rechercher des médecins pour un patient
  async searchDoctorsForPatient(patientId, searchTerm = "") {
    const query = `
      SELECT m.utilisateur_id as doctor_id, 
             u.nom, u.prenom, u.email, u.chemin_photo,
             m.specialite,
             CASE WHEN pd.patient_id IS NOT NULL THEN true ELSE false END as is_linked
      FROM medecin m
      JOIN utilisateur u ON u.id = m.utilisateur_id
      LEFT JOIN patient_doctor pd ON pd.doctor_id = m.utilisateur_id AND pd.patient_id = $1 AND pd.status = 'actif'
      WHERE (u.nom ILIKE $2 OR u.prenom ILIKE $2 OR m.specialite ILIKE $2)
      ORDER BY is_linked DESC, u.nom, u.prenom
    `;
    const { rows } = await pool.query(query, [patientId, `%${searchTerm}%`]);
    return rows;
  }

  // Rechercher des patients pour un médecin
  async searchPatientsForDoctor(doctorId, searchTerm = "") {
    const query = `
      SELECT p.utilisateur_id as patient_id, 
             u.nom, u.prenom, u.email, u.chemin_photo,
             CASE WHEN pd.doctor_id IS NOT NULL THEN true ELSE false END as is_linked
      FROM patient p
      JOIN utilisateur u ON u.id = p.utilisateur_id
      LEFT JOIN patient_doctor pd ON pd.patient_id = p.utilisateur_id AND pd.doctor_id = $1 AND pd.status = 'actif'
      WHERE (u.nom ILIKE $2 OR u.prenom ILIKE $2)
      ORDER BY is_linked DESC, u.nom, u.prenom
    `;
    const { rows } = await pool.query(query, [doctorId, `%${searchTerm}%`]);
    return rows;
  }
}

export default new MessagingRepository();
