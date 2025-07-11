import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaSpinner,
  FaCheck,
  FaPlayCircle,
  FaStopCircle,
  FaFileMedical,
  FaFileAlt,
  FaChevronRight,
  FaNotesMedical,
  FaArrowLeft,
} from "react-icons/fa";
import { useDoctorAppointmentContext } from "../../../context/DoctorAppointmentContext";

const AppointmentModals = ({
  showDetail,
  selectedAppointment,
  handleCloseDetail,
  formatDateTimeFr,
  handleCancel,
  cancelLoading,
  showDayDetail,
  selectedDate,
  handleCloseDayDetail,
  getDayAppointments,
  formatDateFr,
  handleShowDetail,
  handleStartAppointment,
  handleFinishAppointment,
  actionLoading,
}) => {
  const [activeTab, setActiveTab] = useState("infos"); // 'infos', 'notes', 'documents'
  const [localAppointment, setLocalAppointment] = useState(null);
  const { updateDoctorNotes, updateCancelReason } =
    useDoctorAppointmentContext();
  const [notesMedecin, setNotesMedecin] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [notesError, setNotesError] = useState("");

  // Nouveaux états pour les modales
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Synchroniser l'état local avec l'appointment sélectionné
  useEffect(() => {
    if (selectedAppointment) {
      setLocalAppointment({ ...selectedAppointment });
    }
  }, [selectedAppointment]);

  // Synchroniser l'état local avec la note du rendez-vous sélectionné
  useEffect(() => {
    if (
      selectedAppointment &&
      selectedAppointment.rawData?.notes_medecin !== undefined
    ) {
      setNotesMedecin(selectedAppointment.rawData.notes_medecin || "");
    }
  }, [selectedAppointment]);

  // Mise à jour locale immédiate du statut lors des actions
  const handleLocalStart = (id) => {
    handleStartAppointment(id);
    if (localAppointment && localAppointment.id === id) {
      setLocalAppointment({ ...localAppointment, status: "en_cours" });
    }
  };

  const handleLocalFinish = (id) => {
    handleFinishAppointment(id);
    if (localAppointment && localAppointment.id === id) {
      setLocalAppointment({ ...localAppointment, status: "terminé" });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmé":
        return <FaCheckCircle className="text-green-500" />;
      case "annulé":
        return <FaTimesCircle className="text-red-500" />;
      case "en_attente":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "en_cours":
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case "terminé":
        return <FaCheck className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmé":
        return "bg-green-100 text-green-800 border-green-200";
      case "annulé":
        return "bg-red-100 text-red-800 border-red-200";
      case "en_attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "terminé":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fonctions pour afficher conditionnellement les boutons d'action
  const showStartButton = (status) => {
    return status === "confirmé" || status === "planifié";
  };

  const showFinishButton = (status) => {
    return status === "en_cours";
  };

  // Format le nom du patient avec première lettre en majuscule pour chaque mot
  const formatPatientName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  // Gestion de l'enregistrement des notes du médecin
  const handleSaveNotes = async () => {
    setNotesLoading(true);
    setNotesSuccess(false);
    setNotesError("");
    try {
      await updateDoctorNotes(selectedAppointment.id, notesMedecin);
      setNotesSuccess(true);
    } catch {
      setNotesError("Erreur lors de l'enregistrement des notes.");
    } finally {
      setNotesLoading(false);
      setTimeout(() => setNotesSuccess(false), 2000);
    }
  };

  // Gestion du démarrage du rendez-vous
  const handleStartWithConfirmation = () => {
    if (localAppointment) {
      handleLocalStart(localAppointment.id);
      setShowStartModal(false);
    }
  };

  // Gestion de la fin du rendez-vous
  const handleFinishWithConfirmation = () => {
    if (localAppointment) {
      handleLocalFinish(localAppointment.id);
      setShowFinishModal(false);
    }
  };

  // Gestion de l'annulation avec raison
  const handleCancelWithReason = async () => {
    if (!cancelReason.trim()) return;
    try {
      await updateCancelReason(selectedAppointment.id, cancelReason);
      handleCancel();
      setShowCancelModal(false);
      setCancelReason("");
    } catch (err) {
      console.error("Erreur lors de l'annulation :", err);
      setNotesError(
        "Erreur lors de l'enregistrement de la raison d'annulation."
      );
    }
  };

  // Effet pour bloquer le scroll quand une modale est ouverte
  useEffect(() => {
    const isModalOpen =
      showDetail ||
      showDayDetail ||
      showCancelModal ||
      showStartModal ||
      showFinishModal;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup lors du démontage du composant
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    showDetail,
    showDayDetail,
    showCancelModal,
    showStartModal,
    showFinishModal,
  ]);

  // Si pas d'appointment local, ne rien afficher
  if (showDetail && !localAppointment) {
    return null;
  }

  return (
    <>
      {/* Modal pour afficher tous les RDV d'un jour - inchangé */}
      {showDayDetail && selectedDate && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseDayDetail}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative border border-[#E9ECEF] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-6 right-6 text-[#6C757D] hover:text-[#343A40]"
              onClick={handleCloseDayDetail}
            >
              <FaTimesCircle size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#343A40] mb-2 text-center">
                Rendez-vous du {formatDateFr(selectedDate)}
              </h2>
              <p className="text-center text-[#6C757D]">
                {getDayAppointments(selectedDate).length} rendez-vous programmés
              </p>
            </div>

            <div className="space-y-4">
              {getDayAppointments(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-[#6C757D]">
                  <FaCalendarAlt className="mx-auto text-4xl text-[#E9ECEF] mb-4" />
                  <p>Aucun rendez-vous ce jour-là</p>
                </div>
              ) : (
                getDayAppointments(selectedDate)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-[#E9ECEF] rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        handleCloseDayDetail();
                        handleShowDetail(appointment);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-[#E8F4FD] rounded-full p-3">
                            <FaUser className="text-[#4A90E2]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#343A40] mb-1">
                              {appointment.patient.name}
                            </h3>
                            <p className="text-[#6C757D] text-sm mb-1">
                              {appointment.title}
                            </p>
                            <div className="flex items-center text-sm text-[#6C757D]">
                              <FaClock className="mr-1" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                          <button className="text-[#4A90E2] hover:text-[#2E5BBA] p-2 rounded-lg hover:bg-[#E8F4FD] transition-colors">
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail - AMÉLIORÉ */}
      {showDetail && localAppointment && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-5xl relative border border-[#E9ECEF] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête du modal avec info patient */}
            <div className="bg-[#002846] text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-2">
                  <FaUser className="text-[#002846] text-xl" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Patient</p>
                  <h2 className="text-xl font-bold">
                    {formatPatientName(localAppointment.patient.name)}
                  </h2>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={handleCloseDetail}
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>
            </div>

            {/* Corps du modal - Responsive */}
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              {/* Barre latérale avec statut - devient horizontale sur mobile */}
              <div className="w-full md:w-64 border-b md:border-r md:border-b-0 border-[#E9ECEF] p-4 md:p-5 bg-[#F8FAFC] flex flex-col">
                <h3 className="text-sm text-[#64748B] uppercase tracking-wider font-medium mb-3">
                  Statut du rendez-vous
                </h3>

                <div className="flex md:flex-col space-x-3 md:space-x-0 md:space-y-3">
                  {/* Options de statut - seulement "en cours" et "terminé" */}
                  <div
                    className={`flex-1 md:flex-none p-2 md:p-3 rounded-lg border flex items-center justify-center md:justify-start space-x-2 md:space-x-3 ${
                      localAppointment.status === "en_cours"
                        ? "border-blue-500 bg-blue-50"
                        : "border-[#E9ECEF]"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        localAppointment.status === "en_cours"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm">En consultation</span>
                  </div>

                  <div
                    className={`flex-1 md:flex-none p-2 md:p-3 rounded-lg border flex items-center justify-center md:justify-start space-x-2 md:space-x-3 ${
                      localAppointment.status === "terminé"
                        ? "border-blue-500 bg-blue-50"
                        : "border-[#E9ECEF]"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        localAppointment.status === "terminé"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm">Terminé</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-8">
                  <h3 className="text-sm text-[#64748B] uppercase tracking-wider font-medium mb-3">
                    Actions
                  </h3>

                  <div className="flex flex-col space-y-2">
                    {/* Boutons d'action avec texte complet */}
                    {showStartButton(localAppointment.status) && (
                      <button
                        onClick={() => setShowStartModal(true)}
                        disabled={actionLoading}
                        className="w-full py-2 px-3 md:px-4 text-xs md:text-sm rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center"
                      >
                        <FaPlayCircle className="mr-2" />
                        {actionLoading
                          ? "Démarrage..."
                          : "Commencer le rendez-vous"}
                      </button>
                    )}

                    {showFinishButton(localAppointment.status) && (
                      <button
                        onClick={() => setShowFinishModal(true)}
                        disabled={actionLoading}
                        className="w-full py-2 px-3 md:px-4 text-xs md:text-sm rounded-lg border border-gray-500 text-gray-500 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                      >
                        <FaStopCircle className="mr-2" />
                        {actionLoading
                          ? "Finalisation..."
                          : "Terminer le rendez-vous"}
                      </button>
                    )}

                    {localAppointment.status !== "annulé" &&
                      localAppointment.status !== "terminé" && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          disabled={cancelLoading || actionLoading}
                          className="w-full py-2 px-3 md:px-4 text-xs md:text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 flex items-center justify-center"
                        >
                          <FaTimesCircle className="mr-2" />
                          {cancelLoading
                            ? "Annulation..."
                            : "Annuler le rendez-vous"}
                        </button>
                      )}
                  </div>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Onglets */}
                <div className="border-b border-[#E9ECEF] flex">
                  <button
                    className={`flex-1 px-4 md:px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "infos"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-[#64748B]"
                    }`}
                    onClick={() => setActiveTab("infos")}
                  >
                    Informations
                  </button>
                  <button
                    className={`flex-1 px-4 md:px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "notes"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-[#64748B]"
                    }`}
                    onClick={() => setActiveTab("notes")}
                  >
                    Notes
                  </button>
                  <button
                    className={`flex-1 px-4 md:px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "documents"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-[#64748B]"
                    }`}
                    onClick={() => setActiveTab("documents")}
                  >
                    Documents
                  </button>
                </div>

                {/* Contenu des onglets */}
                <div className="p-4 md:p-6 overflow-y-auto">
                  {/* Onglet Informations */}
                  {activeTab === "infos" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6">
                        <div className="border-b border-[#E9ECEF] pb-4">
                          <p className="text-sm text-[#64748B] mb-1">
                            Date et heure
                          </p>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-[#4A90E2] mr-3" />
                            <p className="text-[#1E293B] font-medium">
                              {formatDateTimeFr(
                                localAppointment.dateRaw,
                                localAppointment.time
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="border-b border-[#E9ECEF] pb-4">
                          <p className="text-sm text-[#64748B] mb-1">Statut</p>
                          <div className="flex items-center">
                            <div
                              className={`px-4 py-1.5 rounded-full text-sm flex items-center ${getStatusColor(
                                localAppointment.status
                              )}`}
                            >
                              {getStatusIcon(localAppointment.status)}
                              <span className="ml-2">
                                {localAppointment.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-b border-[#E9ECEF] pb-4">
                          <p className="text-sm text-[#64748B] mb-1">Motif</p>
                          <div className="flex items-center">
                            <FaEdit className="text-[#4A90E2] mr-3" />
                            <p className="text-[#1E293B]">
                              {localAppointment.title || "Non spécifié"}
                            </p>
                          </div>
                        </div>

                        <div className="border-b border-[#E9ECEF] pb-4">
                          <p className="text-sm text-[#64748B] mb-1">Lieu</p>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-[#4A90E2] mr-3" />
                            <p className="text-[#1E293B]">
                              {localAppointment.location || "Non spécifié"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-6">
                        <h3 className="font-medium text-[#1E293B] mb-4">
                          Informations du patient
                        </h3>
                        <div className="bg-[#F8FAFC] border border-[#E9ECEF] rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="bg-[#E8F4FD] rounded-full p-3 mr-4">
                              <FaUser className="text-[#4A90E2]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#1E293B]">
                                {formatPatientName(
                                  localAppointment.patient.name
                                )}
                              </p>
                              <p className="text-sm text-[#64748B] mt-1">
                                Patient ID: {localAppointment.patient.id}
                              </p>
                            </div>
                          </div>
                          {/* On pourrait ajouter des liens vers le dossier patient, l'historique, etc. */}
                          <div className="flex mt-4">
                            <button className="text-[#4A90E2] hover:underline text-sm flex items-center">
                              Voir le dossier complet{" "}
                              <FaChevronRight className="ml-1 text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Notes */}
                  {activeTab === "notes" && (
                    <div className="h-full flex flex-col">
                      <h3 className="font-medium text-[#1E293B] mb-4">
                        Notes de consultation
                      </h3>
                      <div className="flex-1">
                        <textarea
                          className="w-full border border-[#E9ECEF] rounded-lg p-4 h-40 md:h-64 resize-none focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2]"
                          placeholder="Ajoutez vos notes de consultation ici..."
                          value={notesMedecin}
                          onChange={(e) => setNotesMedecin(e.target.value)}
                          disabled={notesLoading}
                        ></textarea>
                      </div>
                      <div className="mt-4 flex justify-end items-center space-x-4">
                        {notesSuccess && (
                          <span className="text-green-600 text-sm">
                            Notes enregistrées !
                          </span>
                        )}
                        {notesError && (
                          <span className="text-red-600 text-sm">
                            {notesError}
                          </span>
                        )}
                        <button
                          className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] text-sm disabled:opacity-50"
                          onClick={handleSaveNotes}
                          disabled={
                            notesLoading ||
                            notesMedecin ===
                              (selectedAppointment?.rawData?.notes_medecin ||
                                "")
                          }
                        >
                          {notesLoading
                            ? "Enregistrement..."
                            : "Enregistrer les notes"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Onglet Documents */}
                  {activeTab === "documents" && (
                    <div className="h-full">
                      <h3 className="font-medium text-[#1E293B] mb-4">
                        Documents du rendez-vous
                      </h3>
                      <div className="flex flex-col items-center justify-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-lg p-6 md:p-8 h-40 md:h-64">
                        <FaFileAlt className="text-[#CBD5E1] text-3xl md:text-4xl mb-3 md:mb-4" />
                        <p className="text-[#64748B] mb-2 text-center">
                          Aucun document associé à ce rendez-vous
                        </p>
                        <button className="mt-3 md:mt-4 px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] text-sm flex items-center">
                          <FaFileMedical className="mr-2" /> Ajouter un document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de démarrage */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative border border-[#E9ECEF]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#343A40]">
                Démarrer le rendez-vous
              </h3>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-[#6C757D] hover:text-[#343A40]"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaPlayCircle className="text-blue-500 text-xl" />
                </div>
                <div>
                  <p className="text-[#343A40] font-medium">
                    {localAppointment?.patient?.name}
                  </p>
                  <p className="text-[#6C757D] text-sm">
                    {localAppointment?.title}
                  </p>
                </div>
              </div>
              <p className="text-[#6C757D]">
                Êtes-vous sûr de vouloir démarrer ce rendez-vous ? Le statut
                passera à "en cours".
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-[#6C757D] hover:text-[#343A40] rounded-lg border border-[#E9ECEF] hover:bg-gray-50"
                onClick={() => setShowStartModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] disabled:opacity-50 flex items-center"
                onClick={handleStartWithConfirmation}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <FaPlayCircle className="mr-2" />
                    Démarrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de fin */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative border border-[#E9ECEF]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#343A40]">
                Terminer le rendez-vous
              </h3>
              <button
                onClick={() => setShowFinishModal(false)}
                className="text-[#6C757D] hover:text-[#343A40]"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaStopCircle className="text-purple-500 text-xl" />
                </div>
                <div>
                  <p className="text-[#343A40] font-medium">
                    {localAppointment?.patient?.name}
                  </p>
                  <p className="text-[#6C757D] text-sm">
                    {localAppointment?.title}
                  </p>
                </div>
              </div>
              <p className="text-[#6C757D]">
                Êtes-vous sûr de vouloir terminer ce rendez-vous ? Cette action
                est définitive.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-[#6C757D] hover:text-[#343A40] rounded-lg border border-[#E9ECEF] hover:bg-gray-50"
                onClick={() => setShowFinishModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] disabled:opacity-50 flex items-center"
                onClick={handleFinishWithConfirmation}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Finalisation...
                  </>
                ) : (
                  <>
                    <FaStopCircle className="mr-2" />
                    Terminer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative border border-[#E9ECEF]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#343A40]">
                Annuler le rendez-vous
              </h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="text-[#6C757D] hover:text-[#343A40]"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaTimesCircle className="text-red-500 text-xl" />
                </div>
                <div>
                  <p className="text-[#343A40] font-medium">
                    {localAppointment?.patient?.name}
                  </p>
                  <p className="text-[#6C757D] text-sm">
                    {localAppointment?.title}
                  </p>
                </div>
              </div>
              <p className="text-[#6C757D] mb-4">
                Veuillez indiquer la raison de l'annulation :
              </p>
              <textarea
                className="w-full border border-[#E9ECEF] rounded-lg p-3 h-32 resize-none focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2]"
                placeholder="Raison de l'annulation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              {notesError && (
                <p className="text-red-500 text-sm mt-2">{notesError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-[#6C757D] hover:text-[#343A40] rounded-lg border border-[#E9ECEF] hover:bg-gray-50"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center"
                onClick={handleCancelWithReason}
                disabled={!cancelReason.trim() || cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Annulation...
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="mr-2" />
                    Confirmer l'annulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentModals;
