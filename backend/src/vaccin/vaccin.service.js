import vaccinRepository from "./vaccin.repository.js";

// Créer un nouveau vaccin (patient)
export const createVaccinByPatientService = async (
  userId,
  userRole,
  vaccinData,
  file = null
) => {
  // 1. Validation des données
  const {
    nom_vaccin,
    nom_medecin,
    lieu_vaccination,
    type_vaccin,
    fabricant,
    date_vaccination,
    lot_vaccin,
    statut,
    notes,
  } = vaccinData;

  if (!nom_vaccin || !date_vaccination) {
    const error = new Error("Nom du vaccin et date de vaccination sont requis");
    error.code = "MISSING_DATA";
    throw error;
  }

  // 2. Déterminer patient_id
  let patient_id = userId;

  if (userRole !== "patient") {
    const error = new Error("Seuls les patients peuvent ajouter des vaccins");
    error.code = "FORBIDDEN";
    throw error;
  }

  // 3. Vérifier que le patient existe
  const patientExists = await vaccinRepository.findPatientById(patient_id);
  if (!patientExists) {
    const error = new Error("Patient non trouvé");
    error.code = "PATIENT_NOT_FOUND";
    throw error;
  }

  // 4. Préparer les données
  const vaccinDataToInsert = {
    patient_id: parseInt(patient_id),
    nom_vaccin: nom_vaccin.trim(),
    nom_medecin: nom_medecin ? nom_medecin.trim() : null,
    lieu_vaccination: lieu_vaccination ? lieu_vaccination.trim() : null,
    type_vaccin: type_vaccin ? type_vaccin.trim() : null,
    fabricant: fabricant ? fabricant.trim() : null,
    date_vaccination: date_vaccination,
    lot_vaccin: lot_vaccin ? lot_vaccin.trim() : null,
    statut: statut || "effectué",
    notes: notes ? notes.trim() : null,
  };

  // 5. Insérer le vaccin
  const insertedVaccin = await vaccinRepository.createVaccin(vaccinDataToInsert);
  return insertedVaccin;
};

// Récupérer tous les vaccins d'un patient
export const getVaccinsByPatientService = async (patientId) => {
  return await vaccinRepository.getVaccinsByPatient(patientId);
};

// Récupérer un vaccin par son ID
export const getVaccinByIdService = async (userId, userRole, vaccinId) => {
  const vaccin = await vaccinRepository.getVaccinById(vaccinId);
  
  // Vérifier que l'utilisateur est le propriétaire du vaccin
  if (vaccin && vaccin.patient_id !== userId && userRole !== "admin") {
    const error = new Error("Accès non autorisé à ce vaccin");
    error.code = "FORBIDDEN";
    throw error;
  }
  
  return vaccin;
};

// Supprimer un vaccin
export const deleteVaccinService = async (userId, userRole, vaccinId) => {
  const vaccin = await vaccinRepository.getVaccinById(vaccinId);
  
  // Vérifier que l'utilisateur est le propriétaire du vaccin
  if (vaccin && vaccin.patient_id !== userId && userRole !== "admin") {
    const error = new Error("Accès non autorisé à la suppression");
    error.code = "FORBIDDEN";
    throw error;
  }
  
  return await vaccinRepository.deleteVaccin(vaccinId);
};

// Mettre à jour un vaccin
export const updateVaccinService = async (userId, userRole, vaccinId, updates) => {
  const vaccin = await vaccinRepository.getVaccinById(vaccinId);
  
  // Vérifier que l'utilisateur est le propriétaire du vaccin
  if (vaccin && vaccin.patient_id !== userId && userRole !== "admin") {
    const error = new Error("Accès non autorisé à la modification");
    error.code = "FORBIDDEN";
    throw error;
  }
  
  return await vaccinRepository.updateVaccin(vaccinId, updates);
};
