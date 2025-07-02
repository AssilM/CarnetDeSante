import pool from "../config/db.js";

// Récupérer tous les patients
export const getAllPatients = async (req, res) => {
  try {
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      ORDER BY u.nom, u.prenom
    `;
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des patients" });
  }
};

// Récupérer le profil du patient connecté
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Récupéré du middleware d'authentification

    // Récupérer les informations du patient
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE p.utilisateur_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil patient non trouvé" });
    }

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil patient" });
  }
};

// Récupérer le profil d'un patient spécifique par ID utilisateur
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer les informations du patient
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE p.utilisateur_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil patient non trouvé" });
    }

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil patient" });
  }
};

// Créer ou mettre à jour le profil d'un patient
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { utilisateur_id, groupe_sanguin, taille, poids } = req.body;

    // Vérifier si l'utilisateur a le droit de modifier ce profil
    if (req.userId !== parseInt(utilisateur_id) && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce profil" });
    }

    // Vérifier si un profil patient existe déjà pour cet utilisateur
    const checkQuery = `SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1`;
    const checkResult = await pool.query(checkQuery, [utilisateur_id]);

    if (checkResult.rows.length === 0) {
      // Créer un nouveau profil
      const insertQuery = `
        INSERT INTO patient (utilisateur_id, groupe_sanguin, taille, poids)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertQuery, [
        utilisateur_id,
        groupe_sanguin,
        taille,
        poids,
      ]);
    } else {
      // Mettre à jour le profil existant
      const updateQuery = `
        UPDATE patient
        SET groupe_sanguin = COALESCE($1, groupe_sanguin),
            taille = COALESCE($2, taille),
            poids = COALESCE($3, poids),
            updated_at = CURRENT_TIMESTAMP
        WHERE utilisateur_id = $4
      `;
      await pool.query(updateQuery, [
        groupe_sanguin,
        taille,
        poids,
        utilisateur_id,
      ]);
    }

    // Récupérer le profil mis à jour
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
             u.adresse, u.code_postal, u.ville
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE p.utilisateur_id = $1
    `;
    const result = await pool.query(query, [utilisateur_id]);

    res.status(200).json({ patient: result.rows[0] });
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour du profil patient:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la création/mise à jour du profil patient",
    });
  }
};

// Récupérer les informations médicales du patient connecté
export const getMedicalInfo = async (req, res) => {
  try {
    const userId = req.userId; // Récupéré du middleware d'authentification

    console.log(
      "getMedicalInfo: Récupération des infos médicales pour l'utilisateur",
      {
        userId,
        role: req.userRole,
      }
    );

    // Vérifier que l'utilisateur est bien un patient
    let userRole = null;

    try {
      // Essayer d'abord avec la table "utilisateur"
      const userQuery = `SELECT role FROM utilisateur WHERE id = $1`;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length > 0) {
        userRole = userResult.rows[0].role;
        console.log(
          "getMedicalInfo: Rôle trouvé dans la table 'utilisateur':",
          userRole
        );
      }
    } catch (error) {
      console.log(
        "getMedicalInfo: Erreur lors de la requête sur 'utilisateur':",
        error.message
      );
    }

    // Si pas trouvé, essayer avec la table "utilisateurs"
    if (!userRole) {
      try {
        const usersQuery = `SELECT role FROM utilisateurs WHERE id = $1`;
        const usersResult = await pool.query(usersQuery, [userId]);

        if (usersResult.rows.length > 0) {
          userRole = usersResult.rows[0].role;
          console.log(
            "getMedicalInfo: Rôle trouvé dans la table 'utilisateurs':",
            userRole
          );
        }
      } catch (error) {
        console.log(
          "getMedicalInfo: Erreur lors de la requête sur 'utilisateurs':",
          error.message
        );
      }
    }

    // Si utilisateur non trouvé dans aucune des tables
    if (!userRole) {
      console.log("getMedicalInfo: Utilisateur non trouvé dans les tables");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier que l'utilisateur a le rôle patient
    if (userRole !== "patient") {
      console.log(
        `getMedicalInfo: L'utilisateur a le rôle '${userRole}' au lieu de 'patient'`
      );
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Construire une requête qui fonctionne avec la nouvelle structure
    let patientInfo = null;

    try {
      const query = `
        SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
               u.nom, u.prenom, u.date_naissance, u.sexe
        FROM patient p
        INNER JOIN utilisateur u ON p.utilisateur_id = u.id
        WHERE p.utilisateur_id = $1
      `;
      const result = await pool.query(query, [userId]);

      if (result.rows.length > 0) {
        patientInfo = result.rows[0];
        console.log("getMedicalInfo: Infos patient trouvées");
      }
    } catch (error) {
      console.log(
        "getMedicalInfo: Erreur lors de la requête sur la table patient:",
        error.message
      );
    }

    if (!patientInfo) {
      console.log("getMedicalInfo: Profil patient non trouvé");
      return res.status(404).json({ message: "Profil patient non trouvé" });
    }

    // Renvoyer les informations trouvées
    console.log("getMedicalInfo: Infos médicales envoyées avec succès");
    res.status(200).json(patientInfo);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des informations médicales:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des informations médicales",
    });
  }
};

// Récupérer un patient par son ID utilisateur
export const getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.id as utilisateur_id, u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, 
             u.date_naissance, u.sexe, u.adresse, u.code_postal, u.ville
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE p.utilisateur_id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du patient" });
  }
};

// Récupérer l'ID patient à partir de l'ID utilisateur
export const getPatientIdByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Patient non trouvé pour cet utilisateur" });
    }

    res.status(200).json({ id: result.rows[0].utilisateur_id });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'ID du patient" });
  }
};

// Créer un profil patient pour un utilisateur existant
export const createPatient = async (req, res) => {
  const { utilisateur_id, groupe_sanguin, taille, poids } = req.body;

  try {
    // Vérifier si l'utilisateur existe et a le rôle 'patient'
    const checkUserQuery = `SELECT * FROM utilisateur WHERE id = $1 AND role = 'patient'`;
    const userResult = await pool.query(checkUserQuery, [utilisateur_id]);

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Utilisateur non trouvé ou n'a pas le rôle patient" });
    }

    // Vérifier si un profil patient existe déjà pour cet utilisateur
    const checkPatientQuery = `SELECT * FROM patient WHERE utilisateur_id = $1`;
    const patientResult = await pool.query(checkPatientQuery, [utilisateur_id]);

    if (patientResult.rows.length > 0) {
      return res.status(400).json({
        message: "Un profil patient existe déjà pour cet utilisateur",
      });
    }

    // Créer le profil patient
    const insertQuery = `
      INSERT INTO patient (utilisateur_id, groupe_sanguin, taille, poids)
      VALUES ($1, $2, $3, $4)
      RETURNING utilisateur_id, groupe_sanguin, taille, poids
    `;
    const result = await pool.query(insertQuery, [
      utilisateur_id,
      groupe_sanguin,
      taille,
      poids,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du profil patient" });
  }
};

// Mettre à jour un profil patient
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { groupe_sanguin, taille, poids } = req.body;

  try {
    const query = `
      UPDATE patient
      SET groupe_sanguin = $1, taille = $2, poids = $3, updated_at = CURRENT_TIMESTAMP
      WHERE utilisateur_id = $4
      RETURNING utilisateur_id, groupe_sanguin, taille, poids
    `;
    const result = await pool.query(query, [groupe_sanguin, taille, poids, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil patient" });
  }
};

// Supprimer un profil patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM patient WHERE utilisateur_id = $1 RETURNING utilisateur_id`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json({ message: "Profil patient supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du profil patient:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du profil patient" });
  }
};

// Rechercher des patients
export const searchPatients = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: "Paramètre de recherche requis" });
  }

  try {
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.email, u.date_naissance
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE 
        u.nom ILIKE $1 OR 
        u.prenom ILIKE $1 OR 
        u.email ILIKE $1
      ORDER BY u.nom, u.prenom
    `;
    const result = await pool.query(query, [`%${q}%`]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la recherche de patients:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche de patients" });
  }
};

// ==================== GESTION DES DOCUMENTS MÉDICAUX ====================

// Ajouter un document médical
export const addDocument = async (req, res) => {
  try {
    console.log('📄 Début de l\'ajout de document');
    console.log('📄 Utilisateur:', { id: req.userId, role: req.userRole });
    console.log('📄 Fichier reçu:', req.file);
    console.log('📄 Données du formulaire:', req.body);

    const { titre, type_document, description, date_creation } = req.body;
    const file = req.file;

    // Validation des données requises
    if (!titre || !type_document || !file) {
      console.error('❌ Données manquantes:', { titre, type_document, file: !!file });
      return res.status(400).json({
        success: false,
        message: 'Titre, type de document et fichier sont requis',
        notification: {
          type: 'error',
          title: 'Données manquantes',
          message: 'Veuillez remplir tous les champs obligatoires et sélectionner un fichier'
        }
      });
    }

    // Déterminer le patient_id selon le rôle
    let patient_id;
    let medecin_id = null;

    if (req.userRole === 'patient') {
      // Le patient ajoute un document pour lui-même
      patient_id = req.userId;
      console.log('👤 Patient ajoute un document pour lui-même, patient_id:', patient_id);
    } else if (req.userRole === 'medecin') {
      // Le médecin ajoute un document pour un patient
      patient_id = req.body.patient_id;
      medecin_id = req.userId;
      
      if (!patient_id) {
        console.error('❌ patient_id manquant pour un médecin');
        return res.status(400).json({
          success: false,
          message: 'patient_id requis pour un médecin',
          notification: {
            type: 'error',
            title: 'Patient manquant',
            message: 'Veuillez spécifier le patient pour lequel ajouter le document'
          }
        });
      }
      console.log('👨‍⚕️ Médecin ajoute un document, patient_id:', patient_id, 'medecin_id:', medecin_id);
    }

    // Vérifier que le patient existe
    const patientCheck = await pool.query(
      'SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1',
      [patient_id]
    );

    if (patientCheck.rows.length === 0) {
      console.error('❌ Patient non trouvé:', patient_id);
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé',
        notification: {
          type: 'error',
          title: 'Patient introuvable',
          message: 'Le patient spécifié n\'existe pas dans la base de données'
        }
      });
    }

    // Préparer les données du document
    const documentData = {
      patient_id: parseInt(patient_id),
      medecin_id: medecin_id ? parseInt(medecin_id) : null,
      titre: titre.trim(),
      type_document: type_document.trim(),
      nom_fichier: file.originalname,
      chemin_fichier: file.path,
      type_mime: file.mimetype,
      taille_fichier: file.size,
      date_creation: date_creation || new Date().toISOString().split('T')[0],
      description: description ? description.trim() : null
    };

    console.log('💾 Données à insérer:', documentData);

    // Insérer le document dans la base de données
    const insertQuery = `
      INSERT INTO document (
        patient_id, medecin_id, titre, type_document, nom_fichier, 
        chemin_fichier, type_mime, taille_fichier, date_creation, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      documentData.patient_id,
      documentData.medecin_id,
      documentData.titre,
      documentData.type_document,
      documentData.nom_fichier,
      documentData.chemin_fichier,
      documentData.type_mime,
      documentData.taille_fichier,
      documentData.date_creation,
      documentData.description
    ];

    const result = await pool.query(insertQuery, values);
    const insertedDocument = result.rows[0];

    console.log('✅ Document inséré avec succès:', insertedDocument);

    res.status(201).json({
      success: true,
      message: 'Document ajouté avec succès',
      document: insertedDocument,
      notification: {
        type: 'success',
        title: 'Document ajouté',
        message: `Le document "${titre}" a été ajouté avec succès`
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      notification: {
        type: 'error',
        title: 'Erreur système',
        message: 'Une erreur est survenue lors de l\'ajout du document'
      }
    });
  }
};

// Récupérer les documents d'un patient
export const getPatientDocuments = async (req, res) => {
  try {
    const { patient_id } = req.params;
    console.log('📄 Récupération des documents pour le patient:', patient_id);

    // Vérification des autorisations
    if (req.userRole === 'patient' && req.userId !== parseInt(patient_id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
        notification: {
          type: 'error',
          title: 'Accès refusé',
          message: 'Vous ne pouvez consulter que vos propres documents'
        }
      });
    }

    const query = `
      SELECT d.*, u.nom as medecin_nom, u.prenom as medecin_prenom
      FROM document d
      LEFT JOIN utilisateur u ON d.medecin_id = u.id
      WHERE d.patient_id = $1
      ORDER BY d.date_creation DESC, d.created_at DESC
    `;

    const result = await pool.query(query, [patient_id]);

    console.log(`✅ ${result.rows.length} documents trouvés pour le patient ${patient_id}`);

    res.status(200).json({
      success: true,
      documents: result.rows
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      notification: {
        type: 'error',
        title: 'Erreur système',
        message: 'Impossible de récupérer les documents'
      }
    });
  }
};

// Récupérer un document spécifique
export const getDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    console.log('📄 Récupération du document:', document_id);

    const query = `
      SELECT d.*, u.nom as medecin_nom, u.prenom as medecin_prenom
      FROM document d
      LEFT JOIN utilisateur u ON d.medecin_id = u.id
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [document_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
        notification: {
          type: 'error',
          title: 'Document introuvable',
          message: 'Le document demandé n\'existe pas'
        }
      });
    }

    const document = result.rows[0];

    // Vérification des autorisations
    if (req.userRole === 'patient' && req.userId !== document.patient_id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
        notification: {
          type: 'error',
          title: 'Accès refusé',
          message: 'Vous ne pouvez consulter que vos propres documents'
        }
      });
    }

    console.log('✅ Document trouvé:', document.titre);

    res.status(200).json({
      success: true,
      document: document
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      notification: {
        type: 'error',
        title: 'Erreur système',
        message: 'Impossible de récupérer le document'
      }
    });
  }
};

// Supprimer un document
export const deleteDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    console.log('🗑️ Suppression du document:', document_id);

    // Récupérer les informations du document avant suppression
    const getDocQuery = 'SELECT * FROM document WHERE id = $1';
    const docResult = await pool.query(getDocQuery, [document_id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
        notification: {
          type: 'error',
          title: 'Document introuvable',
          message: 'Le document à supprimer n\'existe pas'
        }
      });
    }

    const document = docResult.rows[0];

    // Vérification des autorisations (seul le médecin créateur ou un admin peut supprimer)
    if (req.userRole === 'medecin' && req.userId !== document.medecin_id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
        notification: {
          type: 'error',
          title: 'Accès refusé',
          message: 'Seul le médecin qui a ajouté le document peut le supprimer'
        }
      });
    }

    // Supprimer le document de la base de données
    const deleteQuery = 'DELETE FROM document WHERE id = $1';
    await pool.query(deleteQuery, [document_id]);

    // TODO: Supprimer aussi le fichier physique
    // import fs from 'fs';
    // if (fs.existsSync(document.chemin_fichier)) {
    //   fs.unlinkSync(document.chemin_fichier);
    // }

    console.log('✅ Document supprimé:', document.titre);

    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès',
      notification: {
        type: 'success',
        title: 'Document supprimé',
        message: `Le document "${document.titre}" a été supprimé avec succès`
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      notification: {
        type: 'error',
        title: 'Erreur système',
        message: 'Impossible de supprimer le document'
      }
    });
  }
};

// Télécharger/servir un fichier de document
export const downloadDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    console.log('📥 Téléchargement du document:', document_id);

    // Récupérer les informations du document
    const query = 'SELECT * FROM document WHERE id = $1';
    const result = await pool.query(query, [document_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
        notification: {
          type: 'error',
          title: 'Document introuvable',
          message: 'Le document demandé n\'existe pas'
        }
      });
    }

    const document = result.rows[0];

    // Vérification des autorisations
    if (req.userRole === 'patient' && req.userId !== document.patient_id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
        notification: {
          type: 'error',
          title: 'Accès refusé',
          message: 'Vous ne pouvez télécharger que vos propres documents'
        }
      });
    }

    // Vérifier que le fichier existe
    const fs = await import('fs');
    const path = await import('path');
    
    if (!fs.existsSync(document.chemin_fichier)) {
      console.error('❌ Fichier physique non trouvé:', document.chemin_fichier);
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur',
        notification: {
          type: 'error',
          title: 'Fichier manquant',
          message: 'Le fichier n\'existe plus sur le serveur'
        }
      });
    }

    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Type', document.type_mime);
    res.setHeader('Content-Disposition', `attachment; filename="${document.nom_fichier}"`);
    res.setHeader('Content-Length', document.taille_fichier);

    console.log('✅ Envoi du fichier:', document.nom_fichier);

    // Envoyer le fichier
    res.sendFile(path.resolve(document.chemin_fichier));

  } catch (error) {
    console.error('❌ Erreur lors du téléchargement du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement',
      notification: {
        type: 'error',
        title: 'Erreur système',
        message: 'Impossible de télécharger le document'
      }
    });
  }
};

// Visualiser/servir un fichier de document dans le navigateur
export const viewDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    console.log('👁️ Visualisation du document:', document_id);

    // Récupérer les informations du document
    const query = 'SELECT * FROM document WHERE id = $1';
    const result = await pool.query(query, [document_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
        notification: {
          type: 'error',
          title: 'Document introuvable',
          message: 'Le document demandé n\'existe pas'
        }
      });
    }

    const document = result.rows[0];

    // Vérification des autorisations
    if (req.userRole === 'patient' && req.userId !== document.patient_id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
        notification: {
          type: 'error',
          title: 'Accès refusé',
          message: 'Vous ne pouvez visualiser que vos propres documents'
        }
      });
    }

    // Vérifier que le fichier existe
    const fs = await import('fs');
    const path = await import('path');
    
    if (!fs.existsSync(document.chemin_fichier)) {
      console.error('❌ Fichier physique non trouvé:', document.chemin_fichier);
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur',
        notification: {
          type: 'error',
          title: 'Fichier manquant',
          message: 'Le fichier n\'existe plus sur le serveur'
        }
      });
    }

    // Définir les en-têtes pour la visualisation inline
    res.setHeader('Content-Type', document.type_mime);
    res.setHeader('Content-Disposition', `inline; filename="${document.nom_fichier}"`);
    res.setHeader('Content-Length', document.taille_fichier);
    
    // Headers supplémentaires pour la sécurité et la mise en cache
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache 1 heure

    console.log('✅ Visualisation du fichier:', document.nom_fichier);

    // Envoyer le fichier pour visualisation
    res.sendFile(path.resolve(document.chemin_fichier));

  } catch (error) {
    console.error('❌ Erreur lors de la visualisation du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la visualisation',
      notification: {
        type: 'error',
        title: 'Erreur système',
        message: 'Impossible de visualiser le document'
      }
    });
  }
};
