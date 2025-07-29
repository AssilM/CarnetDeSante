import React, { useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { usePatientContext } from "../../../context/patient/PatientContext";
import { authService } from "../../../services/api";
import BMIChart from "./BMIChart";

const InfoSection = ({ onModify }) => {
  const { currentUser } = useAuth();
  const { user } = useUserContext();
  const { patientProfile, medicalInfo, refreshMedicalInfo } =
    usePatientContext();
  const navigate = useNavigate();

  // Fonction de diagnostic d'authentification
  const runAuthDiagnostic = async () => {
    try {
      console.log("Exécution du diagnostic d'authentification...");
      const result = await authService.checkAuth();
      console.log("Résultat du diagnostic:", result);
      alert("Diagnostic terminé. Vérifiez la console pour les détails.");
    } catch (error) {
      console.error("Erreur lors du diagnostic:", error);
      alert("Erreur lors du diagnostic. Vérifiez la console pour les détails.");
    }
  };

  // Mémoriser la fonction refreshMedicalInfo pour éviter les re-rendus
  const memoizedRefreshMedicalInfo = useCallback(async () => {
    if (currentUser?.role !== "patient") return;
    
    try {
      await refreshMedicalInfo();
    } catch (error) {
      console.error(
        "Impossible de charger les informations médicales",
        error
      );
    }
  }, [currentUser?.role, refreshMedicalInfo]);

  // Charger les informations médicales si elles ne sont pas déjà chargées
  useEffect(() => {
    if (!medicalInfo && currentUser?.role === "patient") {
      memoizedRefreshMedicalInfo();
    }
  }, [medicalInfo, memoizedRefreshMedicalInfo]);

  // Fonction pour afficher correctement le genre
  const displayGender = (gender) => {
    if (gender === "H" || gender === "M" || gender === "homme")
      return "Masculin";
    if (gender === "F" || gender === "femme") return "Féminin";
    return "Non renseigné";
  };

  // Calculer l'âge à partir de la date de naissance si disponible
  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return "Non renseigné";

    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Formater l'adresse complète
  const formatAddress = () => {
    const parts = [];

    // Utiliser les données de user en priorité, sinon currentUser
    const adresse = user?.adresse || currentUser?.adresse;
    const codePostal = user?.codePostal || currentUser?.code_postal;
    const ville = user?.ville || currentUser?.ville;

    if (adresse) parts.push(adresse);
    if (codePostal) parts.push(codePostal);
    if (ville) parts.push(ville);

    return parts.length > 0 ? parts.join(", ") : "Non renseignée";
  };

  const handleModify = () => {
    if (onModify) {
      onModify();
    } else {
      navigate("/medical-profile/edit");
    }
  };

  // Récupérer les informations médicales
  const groupeSanguin =
    patientProfile?.groupe_sanguin ||
    medicalInfo?.groupe_sanguin ||
    "Non disponible";
  const taille =
    patientProfile?.taille || medicalInfo?.taille
      ? `${patientProfile?.taille || medicalInfo?.taille} cm`
      : "Non disponible";
  const poids =
    patientProfile?.poids || medicalInfo?.poids
      ? `${patientProfile?.poids || medicalInfo?.poids} kg`
      : "Non disponible";

  // Calculer l'IMC
  const calculateBMI = () => {
    const tailleValue = patientProfile?.taille || medicalInfo?.taille;
    const poidsValue = patientProfile?.poids || medicalInfo?.poids;
    
    if (!tailleValue || !poidsValue) {
      return "Non disponible";
    }
    
    // Convertir la taille de cm en mètres
    const tailleEnMetres = tailleValue / 100;
    const imc = poidsValue / (tailleEnMetres * tailleEnMetres);
    
    // Arrondir à 1 décimale
    return `${imc.toFixed(1)} kg/m²`;
  };

  const imc = calculateBMI();

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Informations personnelles
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleModify}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nom</p>
            <p className="font-medium">
              {user?.lastName || currentUser?.nom || "Non renseigné"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Prénom</p>
            <p className="font-medium">
              {user?.firstName || currentUser?.prenom || "Non renseigné"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Âge</p>
            <p className="font-medium">
              {calculateAge(user?.dateNaissance || currentUser?.date_naissance)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Genre</p>
            <p className="font-medium">
              {displayGender(user?.sexe || currentUser?.sexe)}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Adresse</p>
            <p className="font-medium">{formatAddress()}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Groupe sanguin</p>
            <p
              className={`font-medium ${
                groupeSanguin === "Non disponible" ? "text-gray-400" : ""
              }`}
            >
              {groupeSanguin}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Taille</p>
            <p
              className={`font-medium ${
                taille === "Non disponible" ? "text-gray-400" : ""
              }`}
            >
              {taille}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Poids</p>
            <p
              className={`font-medium ${
                poids === "Non disponible" ? "text-gray-400" : ""
              }`}
            >
              {poids}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">IMC</p>
            <p
              className={`font-medium ${
                imc === "Non disponible" ? "text-gray-400" : ""
              }`}
            >
              {imc}
            </p>
          </div>
        </div>
      </div>

      {/* Graphique IMC */}
      <BMIChart 
        height={patientProfile?.taille || medicalInfo?.taille}
        weight={patientProfile?.poids || medicalInfo?.poids}
      />
    </div>
  );
};

export default InfoSection;
