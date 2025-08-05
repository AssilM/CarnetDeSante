import messagingRepository from "./messaging.repository.js";

// === SERVICES DE CONVERSATION ===

export const createConversationService = async (
  userId,
  userRole,
  otherUserId
) => {
  // Validation des rôles et des relations
  if (userRole === "patient") {
    // Un patient ne peut créer une conversation qu'avec un médecin lié
    const relationshipExists =
      await messagingRepository.patientDoctorRelationshipExists(
        userId,
        otherUserId
      );
    if (!relationshipExists) {
      const error = new Error(
        "Vous ne pouvez créer une conversation qu'avec un médecin qui vous suit"
      );
      error.code = "RELATIONSHIP_REQUIRED";
      throw error;
    }

    return await messagingRepository.createConversation(userId, otherUserId);
  } else if (userRole === "medecin") {
    // Un médecin ne peut créer une conversation qu'avec un patient qu'il suit
    const relationshipExists =
      await messagingRepository.patientDoctorRelationshipExists(
        otherUserId,
        userId
      );
    if (!relationshipExists) {
      const error = new Error(
        "Vous ne pouvez créer une conversation qu'avec un patient que vous suivez"
      );
      error.code = "RELATIONSHIP_REQUIRED";
      throw error;
    }

    return await messagingRepository.createConversation(otherUserId, userId);
  } else {
    const error = new Error("Rôle non autorisé pour la messagerie");
    error.code = "FORBIDDEN";
    throw error;
  }
};

export const getUserConversationsService = async (userId, userRole) => {
  // Validation du rôle
  if (!["patient", "medecin"].includes(userRole)) {
    const error = new Error("Rôle non autorisé pour la messagerie");
    error.code = "FORBIDDEN";
    throw error;
  }

  const conversations = await messagingRepository.getUserConversations(
    userId,
    userRole
  );

  // Filtrer les conversations qui ont au moins un message
  const conversationsWithMessages = conversations.filter(
    (conv) => conv.last_message !== null
  );

  return conversationsWithMessages;
};

export const getConversationByIdService = async (
  userId,
  userRole,
  conversationId
) => {
  const conversation = await messagingRepository.getConversationById(
    conversationId
  );

  if (!conversation) {
    const error = new Error("Conversation non trouvée");
    error.code = "NOT_FOUND";
    throw error;
  }

  // Vérifier que l'utilisateur a accès à cette conversation
  if (userRole === "patient" && conversation.patient_id !== userId) {
    const error = new Error("Accès non autorisé à cette conversation");
    error.code = "FORBIDDEN";
    throw error;
  }

  if (userRole === "medecin" && conversation.doctor_id !== userId) {
    const error = new Error("Accès non autorisé à cette conversation");
    error.code = "FORBIDDEN";
    throw error;
  }

  return conversation;
};

// === SERVICES DE MESSAGES ===

export const sendMessageService = async (
  userId,
  userRole,
  conversationId,
  content
) => {
  // Validation du contenu
  if (!content || content.trim().length === 0) {
    const error = new Error("Le contenu du message ne peut pas être vide");
    error.code = "INVALID_CONTENT";
    throw error;
  }

  if (content.length > 1000) {
    const error = new Error("Le message ne peut pas dépasser 1000 caractères");
    error.code = "CONTENT_TOO_LONG";
    throw error;
  }

  // Vérifier l'accès à la conversation
  const conversation = await getConversationByIdService(
    userId,
    userRole,
    conversationId
  );

  // Créer le message
  const message = await messagingRepository.createMessage(
    conversationId,
    userId,
    content.trim()
  );

  // Récupérer les informations de l'expéditeur
  const senderInfo = {
    id: userId,
    nom: conversation[userRole === "patient" ? "patient_nom" : "doctor_nom"],
    prenom:
      conversation[userRole === "patient" ? "patient_prenom" : "doctor_prenom"],
  };

  return {
    ...message,
    sender_info: senderInfo,
  };
};

export const getConversationMessagesService = async (
  userId,
  userRole,
  conversationId,
  limit = 50,
  offset = 0
) => {
  // Vérifier l'accès à la conversation
  await getConversationByIdService(userId, userRole, conversationId);

  // Récupérer les messages
  const messages = await messagingRepository.getConversationMessages(
    conversationId,
    limit,
    offset
  );

  // Marquer les messages comme lus
  await messagingRepository.markMessagesAsRead(conversationId, userId);

  return messages;
};

export const getUnreadCountService = async (userId) => {
  return await messagingRepository.getUnreadCount(userId);
};

// === SERVICES DE RECHERCHE UTILISATEURS ===

export const searchUsersForConversationService = async (
  userId,
  userRole,
  searchTerm = ""
) => {
  if (userRole === "patient") {
    // Un patient peut rechercher des médecins
    const doctors = await messagingRepository.searchDoctorsForPatient(
      userId,
      searchTerm
    );

    // Ne retourner que les médecins liés (is_linked = true)
    return doctors.filter((doctor) => doctor.is_linked);
  } else if (userRole === "medecin") {
    // Un médecin peut rechercher des patients
    const patients = await messagingRepository.searchPatientsForDoctor(
      userId,
      searchTerm
    );

    // Ne retourner que les patients liés (is_linked = true)
    return patients.filter((patient) => patient.is_linked);
  } else {
    const error = new Error("Rôle non autorisé pour la messagerie");
    error.code = "FORBIDDEN";
    throw error;
  }
};

export const getAvailableUsersService = async (userId, userRole) => {
  if (userRole === "patient") {
    // Récupérer tous les médecins liés au patient
    const doctors = await messagingRepository.getPatientDoctors(userId);
    // Normaliser les données pour avoir un champ 'id'
    return doctors.map((doctor) => ({
      ...doctor,
      id: doctor.doctor_id,
      role: "medecin",
    }));
  } else if (userRole === "medecin") {
    // Récupérer tous les patients liés au médecin
    const patients = await messagingRepository.getDoctorPatients(userId);
    // Normaliser les données pour avoir un champ 'id'
    return patients.map((patient) => ({
      ...patient,
      id: patient.patient_id,
      role: "patient",
    }));
  } else {
    const error = new Error("Rôle non autorisé pour la messagerie");
    error.code = "FORBIDDEN";
    throw error;
  }
};

// === SERVICES DE VALIDATION ===

export const validateConversationAccessService = async (
  userId,
  userRole,
  conversationId
) => {
  try {
    await getConversationByIdService(userId, userRole, conversationId);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateUserRelationshipService = async (
  userId,
  userRole,
  otherUserId
) => {
  if (userRole === "patient") {
    return await messagingRepository.patientDoctorRelationshipExists(
      userId,
      otherUserId
    );
  } else if (userRole === "medecin") {
    return await messagingRepository.patientDoctorRelationshipExists(
      otherUserId,
      userId
    );
  }
  return false;
};
