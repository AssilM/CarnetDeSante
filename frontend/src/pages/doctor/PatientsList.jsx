import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { httpService } from "../../services/http";
import createDoctorService from "../../services/api/doctorService";
import createAppointmentService from "../../services/api/appointmentService";
import createDocumentService from "../../services/api/documentService";
import AppointmentModals from "../../components/doctor/agenda/AppointmentModals";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaChevronRight,
  FaFileAlt,
  FaStickyNote,
  FaDownload,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import { formatDateTimeFr } from "../../utils/date.utils";

const doctorService = createDoctorService(httpService);
const appointmentService = createAppointmentService(httpService);
const documentService = createDocumentService(httpService);

// Badge de statut réutilisable
const StatusBadge = ({ status }) => {
  let color = "bg-gray-100 text-gray-800 border-gray-200";
  let icon = <FaClock className="text-gray-500" />;
  let label = status;
  switch (status) {
    case "confirmé":
      color = "bg-green-100 text-green-800 border-green-200";
      icon = <FaCheckCircle className="text-green-500" />;
      label = "Confirmé";
      break;
    case "annulé":
      color = "bg-red-100 text-red-800 border-red-200";
      icon = <FaTimesCircle className="text-red-500" />;
      label = "Annulé";
      break;
    case "en_attente":
      color = "bg-yellow-100 text-yellow-800 border-yellow-200";
      icon = <FaExclamationTriangle className="text-yellow-500" />;
      label = "En attente";
      break;
    case "en_cours":
      color = "bg-blue-100 text-blue-800 border-blue-200";
      icon = <FaClock className="text-blue-500 animate-pulse" />;
      label = "En cours";
      break;
    case "terminé":
      color = "bg-purple-100 text-purple-800 border-purple-200";
      icon = <FaCheckCircle className="text-purple-500" />;
      label = "Terminé";
      break;
    default:
      break;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {icon}
      {label}
    </span>
  );
};

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
          <FaTimes />
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

const PatientDetailsModal = ({ patient, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("infos");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorDocs, setErrorDocs] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Blocage du scroll arrière-plan comme dans AppointmentModals
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!patient) return;
    setLoading(true);
    setError(null);
    appointmentService
      .getPatientAppointments(patient.utilisateur_id)
      .then((data) => setAppointments(data))
      .catch(() => setError("Erreur lors du chargement des rendez-vous."))
      .finally(() => setLoading(false));

    // Charger les documents partagés par le patient au médecin connecté
    setLoadingDocs(true);
    setErrorDocs(null);
    documentService
      .getDocumentsSharedByPatient(patient.utilisateur_id)
      .then((data) => {
        setSharedDocuments(data.documents || []);
      })
      .catch(() =>
        setErrorDocs("Erreur lors du chargement des documents partagés.")
      )
      .finally(() => setLoadingDocs(false));
  }, [patient]);

  if (!patient) return null;

  // --- LOGIQUE PROCHAIN RDV & HISTORIQUE ---
  // On veut :
  // - Prochain RDV = le plus proche dans le futur (statut != 'annulé')
  // - Historique = tous les RDV statut 'terminé' (triés du plus récent au plus ancien)

  // Construction d'un timestamp pour chaque RDV (date+heure)
  // Fonction utilitaire pour normaliser la date (ISO ou DD/MM/YYYY)
  function normalizeDate(dateStr) {
    if (!dateStr) return "";
    // Si déjà au format ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Si format français DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateStr; // fallback
  }
  const addTimestamp = (rdv) => {
    if (!rdv.date) return 0;
    const dateIso = normalizeDate(rdv.date);
    if (!rdv.heure) return new Date(dateIso).getTime();
    // Supporte HH:mm ou HH:mm:ss
    const heure = rdv.heure.length === 5 ? rdv.heure : rdv.heure.slice(0, 5);
    return new Date(`${dateIso}T${heure}`).getTime();
  };
  const appointmentsWithTs = appointments.map((rdv) => ({
    ...rdv,
    _ts: addTimestamp(rdv),
  }));

  // Historique : tous les RDV statut 'terminé', triés du plus récent au plus ancien
  const history = appointmentsWithTs
    .filter((rdv) => rdv.statut === "terminé")
    .sort((a, b) => b._ts - a._ts);

  // --- FIN LOGIQUE ---

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative animate-fade-in overflow-hidden mx-2 sm:mx-0">
        {/* Header bleu foncé harmonisé */}
        <div className="bg-[#002846] text-white p-6 flex items-center gap-4">
          <FaUserCircle className="text-5xl" />
          <div>
            <h2 className="text-2xl font-bold">
              {patient.nom} {patient.prenom}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <FaEnvelope /> <span>{patient.email}</span>
              {patient.tel_numero && (
                <>
                  <span className="mx-2">·</span>
                  <FaPhone /> <span>{patient.tel_numero}</span>
                </>
              )}
            </div>
          </div>
          <button
            className="ml-auto text-white/80 hover:text-white text-2xl"
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: "none", border: "none" }}
          >
            ×
          </button>
        </div>
        {/* Onglets */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "infos"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("infos")}
          >
            <FaUserCircle className="inline mr-2" /> Infos générales
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "rdv"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("rdv")}
          >
            <FaCalendarAlt className="inline mr-2" /> Rendez-vous
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "docs"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("docs")}
          >
            <FaFileAlt className="inline mr-2" /> Documents
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "notes"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            <FaStickyNote className="inline mr-2" /> Notes
          </button>
        </div>
        {/* Contenu des onglets */}
        <div className="p-6 bg-white max-h-[70vh] overflow-y-auto">
          {activeTab === "infos" && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Identité du patient
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-4xl text-primary" />
                  <div>
                    <div className="font-bold text-lg">
                      {patient.nom} {patient.prenom}
                    </div>
                    <div className="text-gray-600 text-sm">{patient.email}</div>
                    {patient.tel_numero && (
                      <div className="text-gray-600 text-sm">
                        {patient.tel_numero}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1" />
                {/* Placeholder pour infos complémentaires */}
              </div>
            </div>
          )}
          {activeTab === "rdv" && (
            <div>
              {/* <h3 className="text-lg font-semibold mb-4 text-primary">
                Prochain rendez-vous
              </h3>
              {loading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : upcoming ? (
                <div className="flex items-center gap-3 bg-blue-50 rounded p-3 mb-6">
                  <FaCalendarAlt className="text-blue-500 text-xl" />
                  <span className="font-medium">
                    {formatDateTimeFr(upcoming.date, upcoming.heure)}
                  </span>
                  <span className="ml-2 text-gray-700">{upcoming.motif}</span>
                  <StatusBadge status={upcoming.statut} />
                </div>
              ) : (
                <div className="text-gray-500 mb-6">
                  Aucun rendez-vous à venir
                </div>
              )} */}
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Rendez-vous terminés
              </h3>
              {loading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : history.length === 0 ? (
                <div className="text-gray-500">Aucun rendez-vous terminé</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {history.map((rdv) => (
                    <li
                      key={rdv.id}
                      className="py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded"
                      onClick={() => {
                        setSelectedAppointment({
                          ...rdv,
                          // Adapter les champs pour AppointmentModals
                          id: rdv.id,
                          title: rdv.motif,
                          date: rdv.date,
                          dateRaw: rdv.date,
                          time: rdv.heure,
                          status: rdv.statut,
                          location: rdv.lieu || "",
                          patient: {
                            id: patient.utilisateur_id,
                            name: `${patient.nom} ${patient.prenom}`,
                          },
                          rawData: rdv,
                        });
                        setShowAppointmentModal(true);
                      }}
                    >
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="font-medium">
                        {formatDateTimeFr(rdv.date, rdv.heure)}
                      </span>
                      <span className="ml-2 text-gray-700">{rdv.motif}</span>
                      <StatusBadge status={rdv.statut} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === "docs" && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Documents partagés par le patient
              </h3>
              {loadingDocs ? (
                <div className="text-gray-500">Chargement...</div>
              ) : errorDocs ? (
                <div className="text-red-500">{errorDocs}</div>
              ) : sharedDocuments.length === 0 ? (
                <div className="text-gray-500">
                  Aucun document partagé par ce patient.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {sharedDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      className="py-3 flex flex-wrap items-center gap-3 group"
                    >
                      <FaFileAlt className="text-gray-400" />
                      <span
                        className="font-medium cursor-pointer hover:underline max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                        onClick={() => setPreviewDoc(doc)}
                        title={doc.titre}
                      >
                        {doc.titre.length > 40
                          ? doc.titre.slice(0, 40) + "…"
                          : doc.titre}
                      </span>
                      <span className="ml-2 text-gray-700 text-sm">
                        {doc.type_document}
                      </span>
                      <span className="ml-2 text-gray-500 text-xs">
                        {new Date(doc.date_creation).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                      <div className="ml-auto flex gap-2">
                        <button
                          className="p-2 rounded hover:bg-gray-200 text-gray-700"
                          onClick={() => setPreviewDoc(doc)}
                          title="Prévisualiser"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-blue-100 text-blue-600"
                          onClick={async () => {
                            try {
                              const response = await httpService.get(
                                `/documents/${doc.id}/download`,
                                { responseType: "blob" }
                              );
                              const contentType =
                                response.headers["content-type"] ||
                                "application/octet-stream";
                              let fileName =
                                doc.nom_fichier ||
                                doc.titre ||
                                `document-${doc.id}`;
                              const contentDisposition =
                                response.headers["content-disposition"];
                              if (contentDisposition) {
                                const match =
                                  contentDisposition.match(
                                    /filename="([^"]+)"/
                                  );
                                if (match) fileName = match[1];
                              }
                              const blob = new Blob([response.data], {
                                type: contentType,
                              });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", fileName);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                            } catch {
                              alert(
                                "Erreur lors du téléchargement du document"
                              );
                            }
                          }}
                          title="Télécharger"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === "notes" && (
            <div className="text-gray-500 flex flex-col items-center justify-center h-32">
              <FaStickyNote className="text-3xl mb-2" />
              <span>Pas encore de notes pour ce patient.</span>
            </div>
          )}
        </div>
      </div>
      {previewDoc && (
        <PreviewDocumentModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
      {/* Modal de détail du rendez-vous */}
      {showAppointmentModal && selectedAppointment && (
        <AppointmentModals
          showDetail={true}
          selectedAppointment={selectedAppointment}
          handleCloseDetail={() => setShowAppointmentModal(false)}
          formatDateTimeFr={formatDateTimeFr}
          // Props non utilisés dans ce contexte mais requis par le composant
          handleCancel={() => {}}
          cancelLoading={false}
          showDayDetail={false}
          selectedDate={null}
          handleCloseDayDetail={() => {}}
          getDayAppointments={() => []}
          formatDateFr={formatDateTimeFr}
          handleShowDetail={() => {}}
          handleStartAppointment={() => {}}
          handleFinishAppointment={() => {}}
          actionLoading={false}
        />
      )}
    </div>
  );
};

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    doctorService
      .getPatients()
      .then((data) => setPatients(data))
      .catch(() => setError("Erreur lors du chargement des patients."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mes patients suivis
        </h1>
        <p className="text-gray-600 mb-6">
          Retrouvez ici la liste de tous les patients que vous suivez via un
          rendez-vous.
        </p>
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Chargement des patients...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : patients.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Aucun patient suivi pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div
                key={patient.utilisateur_id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-transparent hover:border-primary"
              >
                <FaUserCircle className="text-5xl text-primary mb-2" />
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {patient.nom} {patient.prenom}
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  {patient.email}
                </div>
                <button
                  className="mt-auto px-4 py-2 bg-primary text-white rounded-md font-medium shadow hover:bg-primary/90 transition-colors"
                  onClick={() => setSelectedPatient(patient)}
                >
                  Détails
                </button>
              </div>
            ))}
          </div>
        )}
        {selectedPatient && (
          <PatientDetailsModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default PatientsList;
