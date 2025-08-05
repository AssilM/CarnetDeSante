import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserMd,
  FaMapMarkerAlt,
  FaClock,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaCheck,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaTrash,
  FaNotesMedical,
} from "react-icons/fa";
import PageWrapper from "../../../components/PageWrapper";
import { useAppContext } from "../../../context/AppContext";
import { useAppointmentContext } from "../../../context/AppointmentContext";
import { useAuth } from "../../../context/AuthContext";
import createDocumentService from "../../../services/api/documentService";
import { httpService } from "../../../services/http";
import DeleteDocumentModal from "../../../components/admin/appointments/DeleteDocumentModal";

// Composant de modale de confirmation
const ConfirmationModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirmer l'annulation</h2>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir annuler ce rendez-vous ?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition flex items-center disabled:opacity-50"
          >
            <FaTimes className="mr-2" /> Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center disabled:opacity-50"
          >
            {loading ? (
              "Annulation en cours..."
            ) : (
              <>
                <FaCheck className="mr-2" /> Confirmer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { selectedAppointment, deleteAppointment, getAppointmentById } =
    useAppointmentContext();
  const { showNotification } = useAppContext();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Créer le service de documents une seule fois

  const documentService = React.useMemo(
    () => createDocumentService(httpService),
    []
  );

  // Récupérer l'ID du rendez-vous depuis les paramètres d'URL
  const appointmentId = params.id;

  // Vérifier si on arrive depuis la page de confirmation
  useEffect(() => {
    if (location.state?.fromConfirmation) {
      setShowConfirmationMessage(true);
      // Masquer le message après 5 secondes
      const timer = setTimeout(() => {
        setShowConfirmationMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Charger les détails du rendez-vous si on a un ID dans l'URL
  useEffect(() => {
    const loadAppointmentDetails = async () => {
      if (appointmentId) {
        setLoading(true);
        try {
          // Si la fonction getAppointmentById existe dans le contexte
          if (getAppointmentById) {
            const appointmentData = await getAppointmentById(appointmentId);
            if (appointmentData) {
              setAppointment(appointmentData);
            } else {
              setError("Impossible de trouver ce rendez-vous");
              navigate("/appointments");
            }
          } else {
            // Sinon utiliser le rendez-vous sélectionné dans le contexte
            if (
              selectedAppointment &&
              selectedAppointment.id === appointmentId
            ) {
              setAppointment(selectedAppointment);
            } else {
              setError("Impossible de charger les détails du rendez-vous");
            }
          }
        } catch (err) {
          console.error("Erreur lors du chargement du rendez-vous:", err);
          setError("Une erreur est survenue lors du chargement du rendez-vous");
        } finally {
          setLoading(false);
        }
      } else if (selectedAppointment) {
        // Utiliser le rendez-vous sélectionné dans le contexte si pas d'ID
        setAppointment(selectedAppointment);
      } else {
        navigate("/appointments");
      }
    };

    loadAppointmentDetails();
  }, [appointmentId, selectedAppointment, getAppointmentById, navigate]);

  // Charger les documents du rendez-vous
  useEffect(() => {
    const loadDocuments = async () => {
      if (!appointment?.id || !documentService || !currentUser) {
        console.log("[AppointmentDetails] Conditions non remplies:", {
          hasAppointmentId: !!appointment?.id,
          hasDocumentService: !!documentService,
          hasUser: !!currentUser,
          appointmentId: appointment?.id,

          userId: currentUser?.id,
        });
        return;
      }

      console.log(
        "[AppointmentDetails] Chargement des documents pour le rendez-vous:",
        appointment.id
      );
      console.log("[AppointmentDetails] Informations utilisateur:", {
        userId: currentUser.id,
        userRole: currentUser.role,
        userName: currentUser.nom,
      });

      setLoadingDocuments(true);
      try {
        const response = await documentService.getDocumentsByRendezVous(
          appointment.id
        );
        console.log(
          "[AppointmentDetails] Réponse complète de l'API documents:",
          response
        );

        // Vérifier si la réponse contient les documents
        const documentsData = response.documents || response || [];
        console.log("[AppointmentDetails] Documents extraits:", documentsData);
        console.log(
          "[AppointmentDetails] Nombre de documents trouvés:",
          documentsData.length
        );

        // Debug: afficher les détails de chaque document
        documentsData.forEach((doc, index) => {
          console.log(`[AppointmentDetails] Document ${index + 1}:`, {
            id: doc.id,
            titre: doc.titre,
            nom: doc.nom,
            type_document: doc.type_document,
            date_creation: doc.date_creation,
            patient_id: doc.patient_id,

            medecin_id: doc.medecin_id,
          });
        });

        setDocuments(documentsData);
      } catch (err) {
        console.error(
          "[AppointmentDetails] Erreur lors du chargement des documents:",
          err
        );
        console.error("[AppointmentDetails] Détails de l'erreur:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        // Ne pas afficher d'erreur si aucun document n'est trouvé
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    // Éviter les appels répétés si on est déjà en train de charger
    if (!loadingDocuments) {
      loadDocuments();
    }
  }, [appointment?.id, currentUser]); // ✅ Ajout de currentUser dans les dépendances

  // Si aucun rendez-vous n'est disponible et en cours de chargement, afficher un indicateur
  if (loading && !appointment) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p>Chargement des détails du rendez-vous...</p>
        </div>
      </PageWrapper>
    );
  }

  // Si aucun rendez-vous n'est disponible, rediriger vers la liste
  if (!loading && !appointment) {
    return null;
  }

  // Gérer l'annulation du rendez-vous
  const handleCancelAppointment = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await deleteAppointment(appointment.id);
      if (success) {
        showNotification({
          type: "success",
          message: "Rendez-vous annulé avec succès !",
        });
        navigate("/appointments?tab=past");
      } else {
        setError("Impossible de supprimer le rendez-vous");
        showNotification({
          type: "error",
          message: "Impossible de supprimer le rendez-vous",
        });
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du rendez-vous:", err);
      setError("Une erreur est survenue lors de la suppression");
      showNotification({
        type: "error",
        message: "Une erreur est survenue lors de la suppression",
      });
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Télécharger un document
  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "document.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: "success",
        message: "Document téléchargé avec succès !",
      });
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
      showNotification({
        type: "error",
        message: "Impossible de télécharger le document",
      });
    }
  };

  // Visualiser un document
  const handleViewDocument = async (documentId) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors de la visualisation:", err);
      showNotification({
        type: "error",
        message: "Impossible de visualiser le document",
      });
    }
  };

  // Supprimer un document
  const handleDeleteDocument = async (documentId, documentName) => {
    setDocumentToDelete({ id: documentId, titre: documentName, nom: documentName });
    setShowDeleteModal(true);
  };

  // Confirmer la suppression d'un document
  const handleConfirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    setDeleteLoading(true);
    try {
      await documentService.deleteDocument(documentToDelete.id);
      
      // Recharger les documents après suppression
      const response = await documentService.getDocumentsByRendezVous(appointment.id);
      const documentsData = response.documents || response || [];
      setDocuments(documentsData);

      showNotification({
        type: "success",
        message: "Document supprimé avec succès !",
      });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      showNotification({
        type: "error",
        message: "Impossible de supprimer le document",
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  // Déterminer si le rendez-vous est passé ou à venir
  const isPast = () => {
    if (!appointment) return false;

    // Debug: afficher les informations de date
    console.log("[AppointmentDetails] Debug statut:", {
      appointmentId: appointment.id,
      date: appointment.date,
      time: appointment.time,
      timestamp: appointment.timestamp,
      status: appointment.status,

      rawData: appointment.rawData,
    });

    // Si le statut est "terminé" dans la BDD, considérer comme passé
    if (appointment.status === "terminé") {
      console.log(
        "[AppointmentDetails] Rendez-vous marqué comme terminé dans la BDD"
      );

      return true;
    }

    // Si le statut est "annulé", considérer comme passé
    if (appointment.status === "annulé") {
      console.log("[AppointmentDetails] Rendez-vous marqué comme annulé");
      return true;
    }

    // Calculer le timestamp si pas disponible
    let timestamp = appointment.timestamp;
    if (!timestamp && appointment.date) {
      try {
        if (appointment.time) {
          // Combiner date et heure

          const dateTimeStr =
            appointment.date + "T" + appointment.time.substring(0, 5);

          timestamp = new Date(dateTimeStr).getTime();
        } else {
          // Date seule
          timestamp = new Date(appointment.date).getTime();
        }
        console.log("[AppointmentDetails] Timestamp calculé:", timestamp);
      } catch (err) {
        console.error("[AppointmentDetails] Erreur calcul timestamp:", err);
        timestamp = Date.now();
      }
    }

    const now = new Date().getTime();
    const isPast = timestamp < now;

    console.log("[AppointmentDetails] Comparaison:", {
      timestamp,
      now,
      isPast,

      diffHours: (now - timestamp) / (1000 * 60 * 60),
    });

    return isPast;
  };

  const isPastValue = isPast();
  const isCancelled = appointment?.status === "annulé";
  let statusClass = "bg-green-100 text-green-800";
  let statusText = "À venir";
  if (isCancelled) {
    statusClass = "bg-red-100 text-red-800";
    statusText = "Annulé";
  } else if (isPastValue) {
    statusClass = "bg-gray-200 text-gray-700";
    statusText = "Terminé";
  }

  // Fonction utilitaire pour formater la date et l'heure
  const formatDateTimeFr = (dateStr, timeStr) => {
    if (!dateStr) return "";
    let d;
    try {
      d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
    } catch {
      return "";
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let time = timeStr ? timeStr.substring(0, 5) : "";
    return `${day}/${month}/${year}${time ? " à " + time : ""}`;
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Message de confirmation après création du rendez-vous */}
        {showConfirmationMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center animate-fadeIn">
            <FaCheckCircle className="mr-2 text-green-500" />
            <div>
              <p className="font-medium">Rendez-vous créé avec succès !</p>
              <p className="text-sm">
                Votre rendez-vous a bien été enregistré. Vous recevrez un rappel
                avant la date.
              </p>
            </div>
          </div>
        )}

        {/* Affichage de l'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* En-tête de la carte */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-2xl text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {appointment.title}
                </h1>
                <p className="text-gray-500">
                  {formatDateTimeFr(appointment.date, appointment.time)}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
              >
                {statusText}
              </div>
            </div>
          </div>

          {/* Corps de la carte */}
          <div className="p-6 space-y-6">
            {/* Informations sur le rendez-vous */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaUserMd className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
                  <p className="text-base text-gray-900">
                    {appointment.doctor.name}
                  </p>
                  {appointment.doctor.specialty && (
                    <p className="text-sm text-gray-600">
                      {appointment.doctor.specialty}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                  <p className="text-base text-gray-900">
                    {appointment.location ||
                      appointment.doctor.address ||
                      "Non spécifié"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                  <p className="text-base text-gray-900">
                    {appointment.time || "Heure non précisée"}
                  </p>
                </div>
              </div>

              {appointment.description && (
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Détails
                    </h3>
                    <p className="text-base text-gray-900">
                      {appointment.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions disponibles */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {!isPastValue && appointment.status !== "annulé" && (
                  <>
                    {/* <button
                      onClick={() =>
                        navigate(`/book-appointment/edit/${appointment.id}`)
                      }
                      className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Modifier
                    </button> */}
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                    >
                      {loading ? "Annulation en cours..." : "Annuler"}
                    </button>
                  </>
                )}
                {appointment.status !== "annulé" && (
                  <button
                    onClick={() =>
                      navigate(
                        "/documents/add?type=appointment&id=" + appointment.id
                      )
                    }
                    className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Ajouter un document
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Notes de consultation */}
        {appointment.rawData?.notes_medecin && (
          <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaNotesMedical className="text-primary text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notes de consultation
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaUserMd className="text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Notes du Dr. {appointment.doctor.name}
                    </p>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {appointment.rawData.notes_medecin}
                    </div>
                    {appointment.rawData.updated_at && (
                      <p className="text-xs text-blue-600 mt-3">
                        Dernière mise à jour :{" "}
                        {new Date(
                          appointment.rawData.updated_at
                        ).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Documents du rendez-vous */}
        {appointment.status !== "annulé" && (
          <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-primary text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Documents du rendez-vous
                </h2>
                {loadingDocuments && (
                  <div className="ml-2 text-sm text-gray-500">
                    Chargement...
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {loadingDocuments ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Chargement des documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-6">
                  {/* Documents ajoutés par le médecin */}
                  {documents.filter((doc) => doc.uploader_role === "medecin")
                    .length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaUserMd className="text-primary" />
                        Documents ajoutés par le médecin
                      </h3>
                      <div className="space-y-3">
                        {documents
                          .filter((doc) => doc.uploader_role === "medecin")
                          .map((document) => (
                            <div
                              key={document.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-blue-50"
                            >
                              <div className="flex items-center gap-3">
                                <FaFileAlt className="text-primary text-lg" />
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {document.titre ||
                                      document.nom ||
                                      "Document sans titre"}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {document.type_document ||
                                      "Type non spécifié"}
                                  </p>
                                  {document.uploader_nom &&
                                    document.uploader_prenom && (
                                      <p className="text-xs text-gray-500">
                                        Ajouté par Dr.{" "}
                                        {document.uploader_prenom}{" "}
                                        {document.uploader_nom}
                                      </p>
                                    )}
                                  {document.date_creation && (
                                    <p className="text-xs text-gray-500">
                                      Créé le{" "}
                                      {new Date(
                                        document.date_creation
                                      ).toLocaleDateString("fr-FR")}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleViewDocument(document.id)
                                  }
                                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                                  title="Visualiser"
                                >
                                  <FaEye className="text-lg" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadDocument(
                                      document.id,
                                      document.titre || document.nom
                                    )
                                  }
                                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                                  title="Télécharger"
                                >
                                  <FaDownload className="text-lg" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Documents ajoutés par le patient */}
                  {documents.filter((doc) => doc.uploader_role === "patient")
                    .length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaUserMd className="text-primary" />
                        Documents ajoutés par vous
                      </h3>
                      <div className="space-y-3">
                        {documents
                          .filter((doc) => doc.uploader_role === "patient")
                          .map((document) => (
                            <div
                              key={document.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-black-50"
                            >
                              <div className="flex items-center gap-3">
                                <FaFileAlt className="text-primary text-lg" />
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {document.titre ||
                                      document.nom ||
                                      "Document sans titre"}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {document.type_document ||
                                      "Type non spécifié"}
                                  </p>
                                  {document.date_creation && (
                                    <p className="text-xs text-gray-500">
                                      Créé le{" "}
                                      {new Date(
                                        document.date_creation
                                      ).toLocaleDateString("fr-FR")}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleViewDocument(document.id)
                                  }
                                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                                  title="Visualiser"
                                >
                                  <FaEye className="text-lg" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadDocument(
                                      document.id,
                                      document.titre || document.nom
                                    )
                                  }
                                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                                  title="Télécharger"
                                >
                                  <FaDownload className="text-lg" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteDocument(
                                      document.id,
                                      document.titre || document.nom
                                    )
                                  }
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  title="Supprimer"
                                >
                                  <FaTrash className="text-lg" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaFileAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">
                    Aucun document n'a été partagé pour ce rendez-vous
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Les documents ajoutés par le médecin ou vous-même
                    apparaîtront ici
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <button
            onClick={() => navigate("/appointments")}
            className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Retour à mes rendez-vous
          </button>
          <button
            onClick={() => navigate("/patient/home")}
            className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>

      {/* Modale de confirmation */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCancelAppointment}
        loading={loading}
      />

      {/* Modale de confirmation de suppression de document */}
      <DeleteDocumentModal
        document={documentToDelete}
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteDocument}
        loading={deleteLoading}
      />
    </PageWrapper>
  );
};

export default AppointmentDetails;
