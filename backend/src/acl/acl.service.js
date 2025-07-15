import aclRepository from "./acl.repository.js";

class ACLService {
  // Vérifie si l'utilisateur a la permission requise sur un document
  async checkDocumentPermission(userId, documentId, requiredRole = "shared") {
    const permissions = await aclRepository.getDocumentPermissions(documentId);
    const perm = permissions.find((p) => p.user_id === userId);
    if (!perm) return false;
    // owner > author > shared
    const hierarchy = { owner: 3, author: 2, shared: 1 };
    return hierarchy[perm.role] >= hierarchy[requiredRole];
  }

  // Accorde une permission à un utilisateur sur un document
  async grantDocumentPermission(documentId, userId, role) {
    // On ne permet pas d'accorder owner/author à n'importe qui
    if (role !== "shared")
      throw new Error('Seul le rôle "shared" peut être accordé via partage.');
    return await aclRepository.createDocumentPermission(
      documentId,
      userId,
      role
    );
  }

  // Révoque une permission (seulement shared)
  async revokeDocumentPermission(documentId, userId, byUserId) {
    // Seul le owner peut révoquer un accès shared
    const permissions = await aclRepository.getDocumentPermissions(documentId);
    const owner = permissions.find((p) => p.role === "owner");
    if (!owner || owner.user_id !== byUserId)
      throw new Error("Seul le propriétaire peut révoquer un partage.");
    const perm = permissions.find(
      (p) => p.user_id === userId && p.role === "shared"
    );
    if (!perm)
      throw new Error(
        "Aucune permission shared à révoquer pour cet utilisateur."
      );
    return await aclRepository.deleteDocumentPermission(documentId, userId);
  }

  // Liste les médecins disponibles pour le partage (médecins suivis par le patient)
  async getAvailableDoctorsForPatient(patientId) {
    return await aclRepository.getFollowedDoctors(patientId);
  }

  // Liste les documents partagés pour un utilisateur
  async getSharedDocumentsForUser(userId) {
    return await aclRepository.getUserDocuments(userId);
  }

  // Permet à un médecin de suivre un patient via identité
  async followPatientByIdentity(doctorId, nom, prenom, telephone) {
    // Recherche du patient
    const patients = await aclRepository.searchPatientByIdentity(
      nom,
      prenom,
      telephone
    );
    if (!patients.length)
      throw new Error("Aucun patient trouvé avec cette identité.");
    const patient = patients[0];
    // Création du lien de suivi
    return await aclRepository.createFollowRelationship(
      patient.utilisateur_id,
      doctorId
    );
  }

  // Liste les patients suivis par un médecin
  async getFollowedPatientsForDoctor(doctorId) {
    return await aclRepository.getFollowedPatients(doctorId);
  }
}

export default new ACLService();
