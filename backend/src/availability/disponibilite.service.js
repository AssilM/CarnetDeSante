import {
  findDisponibilitesByMedecinId,
  checkMedecinExists,
  checkDisponibiliteOverlap,
  createDisponibilite as createDisponibiliteRepo,
  findDisponibiliteById,
  updateDisponibilite as updateDisponibiliteRepo,
  deleteDisponibilite as deleteDisponibiliteRepo,
  findDisponibilitesByJour,
} from "./disponibilite.repository.js";
import {
  getJourSemaine,
  convertTimeToMinutes,
  formatMinutesToTime,
} from "../utils/date.utils.js";
import { findAppointmentsByMedecinAndDate } from "../appointment/rendezvous.repository.js";

/**
 * Service de gestion des disponibilités
 * Centralise toute la logique métier complexe des disponibilités et créneaux
 */

/**
 * Récupère les disponibilités d'un médecin
 * @param {string|number} medecinId - ID du médecin
 * @returns {Promise<Array>} Liste des disponibilités
 */
export const getDisponibilitesByMedecinService = async (medecinId) => {
  return await findDisponibilitesByMedecinId(medecinId);
};

/**
 * Crée une nouvelle disponibilité avec validations métier
 * @param {Object} disponibiliteData - Données de la disponibilité
 * @param {Object} auditInfo - Informations pour l'audit (userId, userRole)
 * @returns {Promise<Object>} Nouvelle disponibilité créée
 * @throws {Error} Si validation échoue
 */
export const createDisponibiliteService = async (
  disponibiliteData,
  auditInfo
) => {
  const { medecin_id, jour, heure_debut, heure_fin } = disponibiliteData;

  // Validation métier : vérifier si le médecin existe
  const medecinExists = await checkMedecinExists(medecin_id);
  if (!medecinExists) {
    throw new Error("Médecin non trouvé");
  }

  // Validation métier : vérifier les chevauchements
  const hasOverlap = await checkDisponibiliteOverlap(
    medecin_id,
    jour,
    heure_debut,
    heure_fin
  );
  if (hasOverlap) {
    throw new Error(
      "Une disponibilité existe déjà pour ce médecin à ce jour et créneau horaire"
    );
  }

  // Créer la disponibilité
  const newDisponibilite = await createDisponibiliteRepo(
    medecin_id,
    jour,
    heure_debut,
    heure_fin
  );

  // Log d'audit spécifique
  console.log(
    `[AUDIT] Disponibilité créée | ID=${newDisponibilite.id} | Médecin=${medecin_id} | ${jour} ${heure_debut}-${heure_fin} | Par user=${auditInfo.userId} role=${auditInfo.userRole}`
  );

  return newDisponibilite;
};

/**
 * Met à jour une disponibilité avec validations et audit
 * @param {string|number} id - ID de la disponibilité
 * @param {Object} updateData - Nouvelles données
 * @param {Object} auditInfo - Informations pour l'audit
 * @returns {Promise<Object>} Disponibilité mise à jour
 * @throws {Error} Si validation échoue ou disponibilité non trouvée
 */
export const updateDisponibiliteService = async (id, updateData, auditInfo) => {
  const { jour, heure_debut, heure_fin } = updateData;

  // Récupérer l'ancienne disponibilité pour l'audit
  const oldDispo = await findDisponibiliteById(id);
  if (!oldDispo) {
    throw new Error("Disponibilité non trouvée");
  }

  // Validation métier : vérifier les chevauchements
  const hasOverlap = await checkDisponibiliteOverlap(
    oldDispo.medecin_id,
    jour,
    heure_debut,
    heure_fin,
    id
  );
  if (hasOverlap) {
    throw new Error(
      "Cette modification créerait un chevauchement avec une autre disponibilité"
    );
  }

  // Mettre à jour la disponibilité
  const updatedDispo = await updateDisponibiliteRepo(
    id,
    jour,
    heure_debut,
    heure_fin
  );

  // Log d'audit détaillé
  console.log(
    `[AUDIT] Disponibilité modifiée | ID=${id} | Médecin=${oldDispo.medecin_id} | Ancien: ${oldDispo.jour} ${oldDispo.heure_debut}-${oldDispo.heure_fin} | Nouveau: ${jour} ${heure_debut}-${heure_fin} | Par user=${auditInfo.userId} role=${auditInfo.userRole}`
  );

  return updatedDispo;
};

/**
 * Supprime une disponibilité avec audit
 * @param {string|number} id - ID de la disponibilité
 * @param {Object} auditInfo - Informations pour l'audit
 * @returns {Promise<boolean>} Succès de l'opération
 * @throws {Error} Si disponibilité non trouvée
 */
export const deleteDisponibiliteService = async (id, auditInfo) => {
  // Récupérer les informations avant suppression pour l'audit
  const dispo = await findDisponibiliteById(id);
  if (!dispo) {
    throw new Error("Disponibilité non trouvée");
  }

  // Supprimer la disponibilité
  const success = await deleteDisponibiliteRepo(id);
  if (!success) {
    throw new Error("Erreur lors de la suppression");
  }

  // Log d'audit détaillé
  console.log(
    `[AUDIT] Disponibilité supprimée | ID=${id} | Médecin=${dispo.medecin_id} | ${dispo.jour} ${dispo.heure_debut}-${dispo.heure_fin} | Par user=${auditInfo.userId} role=${auditInfo.userRole}`
  );

  return true;
};

/**
 * ALGORITHME COMPLEXE : Génère les créneaux disponibles pour un médecin
 * @param {string|number} medecinId - ID du médecin
 * @param {string|null} date - Date spécifique ou null pour général
 * @param {string|null} clientIp - IP pour monitoring (optionnel)
 * @returns {Promise<Object>} Objet complexe avec créneaux et métadonnées
 * @throws {Error} Si médecin non trouvé
 */
export const getCreneauxDisponiblesService = async (
  medecinId,
  date = null,
  clientIp = null
) => {
  // Validation métier : vérifier si le médecin existe
  const medecinExists = await checkMedecinExists(medecinId);
  if (!medecinExists) {
    throw new Error("Médecin non trouvé");
  }

  // CAS 1: Aucune date fournie - retourner les disponibilités générales
  if (!date) {
    const dispoResult = await findDisponibilitesByMedecinId(medecinId);

    return {
      disponible: dispoResult.length > 0,
      message:
        dispoResult.length > 0
          ? `${dispoResult.length} plages de disponibilité trouvées`
          : "Aucune disponibilité configurée",
      creneaux: [],
      disponibilites: dispoResult.map((dispo) => ({
        id: dispo.id,
        jour: dispo.jour,
        debut: dispo.heure_debut,
        fin: dispo.heure_fin,
      })),
      date: null,
      jour: null,
    };
  }

  // CAS 2: Date spécifique - algorithme complexe de génération de créneaux

  // Déterminer le jour de la semaine pour la date donnée
  const jourSemaine = await getJourSemaine(date);

  // Récupérer les disponibilités du médecin pour ce jour
  const dispoResult = await findDisponibilitesByJour(medecinId, jourSemaine);

  if (dispoResult.length === 0) {
    return {
      disponible: false,
      message: "Aucune disponibilité pour ce jour",
      creneaux: [],
      jour: jourSemaine,
      date: date,
      disponibilites: [],
    };
  }

  // Récupérer les rendez-vous existants pour cette date
  const rdvRows = await findAppointmentsByMedecinAndDate(medecinId, date);

  // ALGORITHME PRINCIPAL : Générer les créneaux disponibles
  const creneauxDisponibles = await generateAvailableSlots(
    dispoResult,
    rdvRows
  );

  // Log pour monitoring des requêtes fréquentes
  if (clientIp) {
    console.log(
      `[MONITORING] Consultation créneaux | Médecin=${medecinId} | Date=${date} | ${creneauxDisponibles.length} créneaux | IP=${clientIp}`
    );
  }

  return {
    disponible: creneauxDisponibles.length > 0,
    message:
      creneauxDisponibles.length > 0
        ? `${creneauxDisponibles.length} créneaux disponibles`
        : "Aucun créneau disponible pour cette date",
    creneaux: creneauxDisponibles,
    jour: jourSemaine,
    date: date,
    disponibilites: dispoResult.map((dispo) => ({
      debut: dispo.heure_debut,
      fin: dispo.heure_fin,
    })),
  };
};

/**
 * ALGORITHME INTERNE : Génère les créneaux de 30 minutes disponibles
 * @param {Array} disponibilites - Plages de disponibilité du médecin
 * @param {Array} rendezvousExistants - RDV déjà pris
 * @returns {Promise<Array>} Liste des créneaux disponibles
 */
const generateAvailableSlots = async (disponibilites, rendezvousExistants) => {
  const creneauxDisponibles = [];
  const dureeConsultation = 30; // minutes par défaut

  // Pour chaque plage de disponibilité
  for (const dispo of disponibilites) {
    // Convertir les heures en minutes depuis minuit
    const debutMinutes = convertTimeToMinutes(dispo.heure_debut);
    const finMinutes = convertTimeToMinutes(dispo.heure_fin);

    // Générer des créneaux de 30 minutes
    for (
      let minute = debutMinutes;
      minute < finMinutes - dureeConsultation + 1;
      minute += dureeConsultation
    ) {
      const creneauHeure = formatMinutesToTime(minute);
      const creneauFin = formatMinutesToTime(minute + dureeConsultation);

      // Vérifier si ce créneau est déjà pris par un rendez-vous
      const estDisponible = isSlotAvailable(
        minute,
        dureeConsultation,
        rendezvousExistants
      );

      if (estDisponible) {
        creneauxDisponibles.push({
          heure: creneauHeure,
          heure_fin: creneauFin,
          duree: dureeConsultation,
          disponible: true,
        });
      }
    }
  }

  return creneauxDisponibles;
};

/**
 * ALGORITHME INTERNE : Vérifie si un créneau est disponible
 * @param {number} minute - Minute de début du créneau
 * @param {number} dureeConsultation - Durée de la consultation
 * @param {Array} rendezvousExistants - RDV existants
 * @returns {boolean} True si le créneau est libre
 */
const isSlotAvailable = (minute, dureeConsultation, rendezvousExistants) => {
  return !rendezvousExistants.some((rdv) => {
    const rdvDebut = convertTimeToMinutes(rdv.heure);
    const rdvFin = rdvDebut + parseInt(rdv.duree);

    // Vérifier les différents types de chevauchements
    return (
      (minute >= rdvDebut && minute < rdvFin) ||
      (minute + dureeConsultation > rdvDebut &&
        minute + dureeConsultation <= rdvFin) ||
      (rdvDebut >= minute && rdvDebut < minute + dureeConsultation)
    );
  });
};
