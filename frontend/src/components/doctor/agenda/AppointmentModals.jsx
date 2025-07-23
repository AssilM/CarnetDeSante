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
  FaDownload,
} from "react-icons/fa";
import { useDoctorAppointmentContext } from "../../../context/DoctorAppointmentContext";
import createDocumentService from "../../../services/api/documentService";
import { httpService } from "../../../services";

const documentService = createDocumentService(httpService);

// --- Composant de prévisualisation de document (copié de PatientsList.jsx) ---
const PreviewDocumentModal = ({ doc, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  useEffect(() => {
    if (!doc) return;
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await httpService.get(
          `/documents/${doc.id}/download`,
          { responseType: "blob" }
        );
        const contentType =
          response.headers["content-type"] || "application/octet-stream";
        setDocumentType(contentType);
        const blob = new Blob([response.data], { type: contentType });
        const blobUrl = window.URL.createObjectURL(blob);
        setDocumentUrl(blobUrl);
      } catch {
        setError("Impossible de charger le document pour la prévisualisation");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
    return () => {
      if (documentUrl) window.URL.revokeObjectURL(documentUrl);
    };
    // eslint-disable-next-line
  }, [doc?.id]);

  const renderContent = () => {
    if (loading) return <div className="text-center p-8">Chargement...</div>;
    if (error)
      return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!documentUrl || !documentType)
      return <div className="text-center p-8">Document non disponible</div>;
    if (documentType.includes("pdf")) {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-[80vh] border-0 rounded"
          title={`Document: ${doc.titre}`}
        >
          <p>Votre navigateur ne supporte pas l'affichage PDF.</p>
        </iframe>
      );
    }
    if (documentType.includes("image/")) {
      return (
        <div className="flex justify-center">
          <img
            src={documentUrl}
            alt={doc.titre}
            className="max-w-full max-h-[80vh] object-contain rounded shadow"
          />
        </div>
      );
    }
    return (
      <div className="text-center p-8">
        Aperçu non disponible pour ce type de fichier
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] relative animate-fade-in overflow-hidden border border-gray-200">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-2xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Prévisualisation du document
          </h2>
          <div
            style={{
              width: "80vw",
              maxWidth: "80vw",
              height: "80vh",
              maxHeight: "80vh",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Documents liés au rendez-vous
  const [rdvDocuments, setRdvDocuments] = useState([]);
  const [showAddDocModal, setShowAddDocModal] = useState(false); // NOUVEAU : contrôle la modale
  const [docLoading, setDocLoading] = useState(false);
  const [docNotification, setDocNotification] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // NOUVEAU : doc à prévisualiser

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

  // Charger les documents liés au RDV
  const loadRdvDocuments = async () => {
    if (!localAppointment?.id) return;
    try {
      const response = await documentService.getDocumentsByRendezVous(
        localAppointment.id
      );
      setRdvDocuments(response.documents || []);
    } catch {
      setDocNotification({
        type: "error",
        message: "Erreur lors du chargement des documents du rendez-vous.",
      });
    }
  };

  useEffect(() => {
    if (showDetail && localAppointment?.id) {
      loadRdvDocuments();
    }
    // eslint-disable-next-line
  }, [showDetail, localAppointment?.id]);

  // Notification auto-disparition
  useEffect(() => {
    if (docNotification) {
      const timer = setTimeout(() => setDocNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [docNotification]);

  // Soumission du document
  const handleAddDoc = async (formData) => {
    try {
      setDocLoading(true);
      const data = new FormData();
      data.append("titre", formData.titre);
      data.append("type_document", formData.type_document);
      data.append("date_creation", formData.date_creation);
      data.append("description", formData.description || "");
      data.append("patient_id", localAppointment.patient.id);
      data.append("rendez_vous_id", localAppointment.id);
      data.append("document", formData.file);
      await documentService.createDocumentByDoctorWithRdv(data);
      setDocNotification({
        type: "success",
        message: "Document ajouté avec succès.",
      });
      setShowAddDocModal(false); // FERMER LA MODALE
      await loadRdvDocuments();
    } catch {
      setDocNotification({
        type: "error",
        message: "Erreur lors de l'ajout du document.",
      });
    } finally {
      setDocLoading(false);
    }
  };

  // Formulaire d'ajout (même UX que AddDocumentForm patient)
  const AddRdvDocumentForm = ({ onSubmit, onCancel }) => {
    const [titre, setTitre] = useState("");
    const [typeDocument, setTypeDocument] = useState("");
    const [dateCreation, setDateCreation] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    // Charger les types de documents depuis l'API
    useEffect(() => {
      const fetchDocumentTypes = async () => {
        try {
          setLoadingTypes(true);
          const response = await httpService.get("/documents/types");
          if (response.data && response.data.types) {
            setDocumentTypes(response.data.types);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des types de documents:", error);
          // Fallback avec des types par défaut en cas d'erreur
          setDocumentTypes([
            { id: 1, label: "Ordonnance", code: "ORDONNANCE" },
            { id: 2, label: "Analyse", code: "ANALYSE" },
            { id: 3, label: "Vaccination", code: "VACCINATION" },
            { id: 4, label: "Imagerie/Radio", code: "IMAGERIE" },
            { id: 5, label: "Antécédent", code: "ANTECEDENT" },
            { id: 6, label: "Autre", code: "AUTRE" }
          ]);
        } finally {
          setLoadingTypes(false);
        }
      };

      fetchDocumentTypes();
    }, []);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!titre || !typeDocument || !file) {
        return;
      }
      onSubmit({
        titre,
        type_document: typeDocument,
        date_creation: dateCreation,
        description,
        file,
      });
    };
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Type de document *
          </label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={typeDocument}
            onChange={(e) => setTypeDocument(e.target.value)}
            required
            disabled={loadingTypes}
          >
            <option value="">
              {loadingTypes ? "Chargement..." : "Sélectionnez un type"}
            </option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.label}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Date de création
          </label>
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            value={dateCreation}
            onChange={(e) => setDateCreation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fichier *</label>
          <div className="flex items-center gap-2">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 border border-blue-200 text-sm font-medium"
            >
              Choisir un fichier
            </label>
            <span className="text-gray-700 text-sm">
              {file ? file.name : "Aucun fichier choisi"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={docLoading}
          >
            Ajouter
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Annuler
          </button>
        </div>
      </form>
    );
  };

  // Effet pour bloquer le scroll quand une modale est ouverte
  useEffect(() => {
    const isModalOpen =
      showDetail ||
      showDayDetail ||
      showCancelModal ||
      showStartModal ||
      showFinishModal ||
      showAddDocModal ||
      previewDoc; // Ajouter showAddDocModal et previewDoc

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
    showAddDocModal, // Ajouter showAddDocModal
    previewDoc, // Ajouter previewDoc
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
            className="bg-white rounded-xl shadow-xl w-full max-w-5xl relative max-h-[90vh] overflow-hidden flex flex-col"
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
                      {docNotification && (
                        <div
                          className={`mb-4 px-4 py-2 rounded text-white ${
                            docNotification.type === "success"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {docNotification.message}
                        </div>
                      )}
                      {docLoading && (
                        <div className="mb-4 text-blue-600">
                          Ajout du document en cours...
                        </div>
                      )}
                      <button
                        className="mt-3 mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                        onClick={() => setShowAddDocModal(true)}
                      >
                        <FaFileAlt className="mr-2" /> Ajouter un document
                      </button>
                      <div className="mt-4">
                        {rdvDocuments.length === 0 ? (
                          <div className="text-center py-8 text-[#6C757D]">
                            <FaFileAlt className="mx-auto text-4xl text-[#E9ECEF] mb-4" />
                            <p>Aucun document associé à ce rendez-vous</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {rdvDocuments.map((doc) => (
                              <li
                                key={doc.id}
                                className="py-3 flex flex-wrap items-center gap-3"
                              >
                                <FaFileAlt className="text-gray-400" />
                                <span
                                  className="font-medium max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                                  title={doc.titre}
                                >
                                  {doc.titre.length > 40
                                    ? doc.titre.slice(0, 40) + "…"
                                    : doc.titre}
                                </span>
                                <span className="ml-2 text-gray-700">
                                  {doc.type_document}
                                </span>
                                <span className="ml-2 text-gray-500 text-sm">
                                  {new Date(
                                    doc.date_creation
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                                <div className="ml-auto flex gap-2">
                                  <button
                                    className="p-2 rounded hover:bg-gray-200 text-gray-700"
                                    onClick={() => setPreviewDoc(doc)}
                                    title="Prévisualiser"
                                  >
                                    <FaEye />
                                  </button>
                                  <a
                                    href={`/api/documents/${doc.id}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                    title="Télécharger"
                                  >
                                    <FaDownload />
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
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
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
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
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
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
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
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

      {/* MODALE D'AJOUT DE DOCUMENT */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#343A40]">
                Ajouter un document au rendez-vous
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-[#6C757D] hover:text-[#343A40]"
              >
                <FaTimesCircle size={22} />
              </button>
            </div>
            <AddRdvDocumentForm
              onSubmit={handleAddDoc}
              onCancel={() => setShowAddDocModal(false)}
            />
          </div>
        </div>
      )}

      {/* MODALE DE PREVISUALISATION DE DOCUMENT */}
      {previewDoc && (
        <PreviewDocumentModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </>
  );
};

export default AppointmentModals;
