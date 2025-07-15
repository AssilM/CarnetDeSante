import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { httpService } from "../../services/http";
import createDoctorService from "../../services/api/doctorService";
import ItemsList from "../../components/patient/common/ItemsList";

const doctorService = createDoctorService(httpService);

const PatientsList = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const data = await doctorService.getPatients();
        setPatients(data);
      } catch {
        setError("Erreur lors du chargement des patients.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement des patients...
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <ItemsList
      items={patients}
      type="patient"
      title="Mes patients suivis"
      description="Liste de tous les patients que vous suivez via un rendez-vous."
      itemNameField="nomComplet"
      itemSubtitleField="email"
      detailsText="Détails"
      onViewDetails={(patient) => {
        // TODO: Naviguer vers la fiche patient ou afficher un modal
        alert(`Patient: ${patient.nomComplet}`);
      }}
      showPinnedSection={false}
    />
  );
};

export default PatientsList;
