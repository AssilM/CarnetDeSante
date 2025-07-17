import pool from "../config/db.js";

class DocumentRepository {
  async createDocument(documentData) {
    const {
      patient_id,
      medecin_id,
      uploader_id,
      type_id,
      titre,
      nom_fichier,
      chemin_fichier,
      type_mime,
      taille_fichier,
      date_creation,
      description,
    } = documentData;
    const query = `
      INSERT INTO document (
        patient_id, medecin_id, uploader_id, type_id, titre, nom_fichier, chemin_fichier, type_mime, taille_fichier, date_creation, description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;
    const values = [
      patient_id,
      medecin_id,
      uploader_id,
      type_id,
      titre,
      nom_fichier,
      chemin_fichier,
      type_mime,
      taille_fichier,
      date_creation,
      description,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getDocumentById(id) {
    const result = await pool.query("SELECT * FROM document WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  async getDocumentsByPatient(patientId) {
    const result = await pool.query(
      `SELECT * FROM document WHERE patient_id = $1 ORDER BY date_creation DESC, created_at DESC`,
      [patientId]
    );
    return result.rows;
  }

  async getDocumentsByMedecin(medecinId) {
    const result = await pool.query(
      `SELECT * FROM document WHERE medecin_id = $1 ORDER BY date_creation DESC, created_at DESC`,
      [medecinId]
    );
    return result.rows;
  }

  async updateDocument(id, updates) {
    // À compléter selon besoins
  }

  async deleteDocument(id) {
    const result = await pool.query(
      "DELETE FROM document WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // ACL
  async createDocumentPermission(documentId, userId, role, expiresAt = null) {
    await pool.query(
      `INSERT INTO document_permission (document_id, user_id, role, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (document_id, user_id) DO UPDATE SET role = $3, expires_at = $4`,
      [documentId, userId, role, expiresAt]
    );
    return { success: true };
  }

  async getDocumentPermissions(documentId) {
    const { rows } = await pool.query(
      `SELECT * FROM document_permission WHERE document_id = $1`,
      [documentId]
    );
    return rows;
  }

  async getUserDocuments(userId) {
    const { rows } = await pool.query(
      `SELECT d.*, dp.role as permission_role
       FROM document_permission dp
       JOIN document d ON d.id = dp.document_id
       WHERE dp.user_id = $1`,
      [userId]
    );
    return rows;
  }

  async deleteDocumentPermission(documentId, userId) {
    const { rowCount } = await pool.query(
      `DELETE FROM document_permission WHERE document_id = $1 AND user_id = $2`,
      [documentId, userId]
    );
    return rowCount > 0;
  }

  // Retourne tous les documents où le patient est owner et le médecin a la permission 'shared'
  async getDocumentsSharedByPatientToDoctor(patientId, doctorId) {
    const { rows } = await pool.query(
      `SELECT d.*
       FROM document d
       JOIN document_permission dp_patient ON dp_patient.document_id = d.id AND dp_patient.role = 'owner' AND dp_patient.user_id = $1
       JOIN document_permission dp_doctor ON dp_doctor.document_id = d.id AND dp_doctor.role = 'shared' AND dp_doctor.user_id = $2
       ORDER BY d.date_creation DESC, d.created_at DESC`,
      [patientId, doctorId]
    );
    return rows;
  }

  async getDocumentDoctorsWithAccess(documentId) {
    const { rows } = await pool.query(
      `SELECT u.id as user_id, u.nom, u.prenom, dp.role
       FROM document_permission dp
       JOIN utilisateur u ON u.id = dp.user_id
       WHERE dp.document_id = $1
       AND (SELECT COUNT(*) FROM medecin m WHERE m.utilisateur_id = u.id) > 0
       ORDER BY dp.role, u.nom, u.prenom`,
      [documentId]
    );
    return rows;
  }

  // Lier un document à un rendez-vous
  async linkDocumentToRendezVous(documentId, rendezVousId) {
    await pool.query(
      `INSERT INTO documents_rendez_vous (document_id, rendez_vous_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [documentId, rendezVousId]
    );
    return { success: true };
  }

  // Récupérer tous les documents liés à un rendez-vous
  async getDocumentsByRendezVous(rendezVousId) {
    const { rows } = await pool.query(
      `SELECT d.*
       FROM document d
       JOIN documents_rendez_vous drv ON drv.document_id = d.id
       WHERE drv.rendez_vous_id = $1
       ORDER BY d.date_creation DESC, d.created_at DESC`,
      [rendezVousId]
    );
    return rows;
  }

  // Vérifie l'existence d'un patient par son utilisateur_id
  async findPatientById(patientId) {
    const { rows } = await pool.query(
      "SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1",
      [patientId]
    );
    return rows.length > 0;
  }
}

export default new DocumentRepository();
