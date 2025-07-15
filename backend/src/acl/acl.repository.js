// Repository ACL : accès aux tables document_permission et patient_doctor
// Toutes les méthodes sont asynchrones et retournent des promesses

import pool from "../config/db.js";

class ACLRepository {
  // Récupérer toutes les permissions d'un document
  async getDocumentPermissions(documentId) {
    const { rows } = await pool.query(
      `SELECT * FROM document_permission WHERE document_id = $1`,
      [documentId]
    );
    return rows;
  }

  // Récupérer les documents accessibles à un utilisateur
  async getUserDocuments(userId) {
    const { rows } = await pool.query(
      `SELECT d.* , dp.role as permission_role
       FROM document_permission dp
       JOIN document d ON d.id = dp.document_id
       WHERE dp.user_id = $1`,
      [userId]
    );
    return rows;
  }

  // Créer une permission
  async createDocumentPermission(documentId, userId, role) {
    const { rows } = await pool.query(
      `INSERT INTO document_permission (document_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (document_id, user_id) DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [documentId, userId, role]
    );
    return rows[0];
  }

  // Supprimer une permission
  async deleteDocumentPermission(documentId, userId) {
    const { rowCount } = await pool.query(
      `DELETE FROM document_permission WHERE document_id = $1 AND user_id = $2`,
      [documentId, userId]
    );
    return rowCount > 0;
  }

  // Récupérer les médecins suivis par un patient
  async getFollowedDoctors(patientId) {
    const { rows } = await pool.query(
      `SELECT m.*, u.nom, u.prenom, u.email
       FROM patient_doctor pd
       JOIN medecin m ON m.utilisateur_id = pd.doctor_id
       JOIN utilisateur u ON u.id = m.utilisateur_id
       WHERE pd.patient_id = $1 AND pd.status = 'actif'`,
      [patientId]
    );
    return rows;
  }

  // Récupérer les patients suivis par un médecin
  async getFollowedPatients(doctorId) {
    const { rows } = await pool.query(
      `SELECT p.*, u.nom, u.prenom, u.email
       FROM patient_doctor pd
       JOIN patient p ON p.utilisateur_id = pd.patient_id
       JOIN utilisateur u ON u.id = p.utilisateur_id
       WHERE pd.doctor_id = $1 AND pd.status = 'actif'`,
      [doctorId]
    );
    return rows;
  }

  // Créer un lien de suivi patient-médecin
  async createFollowRelationship(patientId, doctorId) {
    const { rows } = await pool.query(
      `INSERT INTO patient_doctor (patient_id, doctor_id, status)
       VALUES ($1, $2, 'actif')
       ON CONFLICT (patient_id, doctor_id) DO UPDATE SET status = 'actif'
       RETURNING *`,
      [patientId, doctorId]
    );
    return rows[0];
  }

  // Supprimer un lien de suivi patient-médecin
  async removeFollowRelationship(patientId, doctorId) {
    const { rowCount } = await pool.query(
      `DELETE FROM patient_doctor WHERE patient_id = $1 AND doctor_id = $2`,
      [patientId, doctorId]
    );
    return rowCount > 0;
  }

  // Rechercher un patient par identité (nom, prénom, téléphone)
  async searchPatientByIdentity(nom, prenom, telephone) {
    const { rows } = await pool.query(
      `SELECT p.*, u.nom, u.prenom, u.tel_numero, u.email
       FROM patient p
       JOIN utilisateur u ON u.id = p.utilisateur_id
       WHERE LOWER(u.nom) = LOWER($1)
         AND LOWER(u.prenom) = LOWER($2)
         AND u.tel_numero = $3`,
      [nom, prenom, telephone]
    );
    return rows;
  }
}

export default new ACLRepository();
