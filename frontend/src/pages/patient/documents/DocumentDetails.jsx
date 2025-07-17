import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaFileAlt,
  FaArrowLeft,
  FaDownload,
  FaShareAlt,
  FaUserMd,
  FaTimes,
  FaEyeSlash,
} from "react-icons/fa";
import { useDocumentContext } from "../../../context/DocumentContext";
import { httpService } from "../../../services";
import PageWrapper from "../../../components/PageWrapper";
import createDocumentService from "../../../services/api/documentService";
import Notification from "../../../components/Notification";

const ShareModal = ({
  doctors,
  onShare,
  loading,
  onClose,
  selectedDoctor,
  setSelectedDoctor,
  shareDuration,
  setShareDuration,
  accessList,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative animate-fade-in overflow-hidden border border-gray-200">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-2xl"
        onClick={onClose}
        aria-label="Fermer"
      >
        <FaTimes />
      </button>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FaShareAlt className="mr-2" />
          Partager le document à un médecin
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Sélectionner un médecin :
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Choisir un médecin</option>
            {doctors.map((doc) => {
              const docId = doc.id || doc.utilisateur_id;
              const alreadyHasAccess = accessList.some(
                (acc) => acc.user_id === docId
              );
              return (
                <option key={docId} value={docId} disabled={alreadyHasAccess}>
                  {doc.nom} {doc.prenom}
                  {alreadyHasAccess ? " (a déjà accès)" : ""}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Durée de partage (en jours, optionnel) :
          </label>
          <input
            type="number"
            min="1"
            placeholder="Ex: 7"
            value={shareDuration}
            onChange={(e) => {
              // Ne garder que les chiffres
              const val = e.target.value.replace(/\D/g, "");
              setShareDuration(val);
            }}
            onKeyDown={(e) => {
              // Autoriser uniquement les chiffres, backspace, delete, tab, flèches
              if (
                !(
                  (e.key >= "0" && e.key <= "9") ||
                  [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                  ].includes(e.key)
                )
              ) {
                e.preventDefault();
              }
            }}
            className="border rounded px-2 py-1 w-full"
          />
          <span className="text-xs text-gray-500">
            Laisser vide pour un accès sans limite de durée.
          </span>
        </div>
        <button
          onClick={onShare}
          disabled={
            !selectedDoctor ||
            loading ||
            accessList.some((acc) => String(acc.user_id) === selectedDoctor)
          }
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
        >
          <FaShareAlt className="mr-2" />
          {loading ? "Partage..." : "Partager"}
        </button>
      </div>
    </div>
  </div>
);

const AccessModal = ({
  accessList,
  onRevoke,
  loadingRevoke,
  onClose,
  currentUserId,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative animate-fade-in overflow-hidden border border-gray-200">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-2xl"
        onClick={onClose}
        aria-label="Fermer"
      >
        <FaTimes />
      </button>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FaUserMd className="mr-2" />
          Médecins ayant accès
        </h2>
        {accessList.length === 0 ? (
          <div className="text-gray-500">
            Aucun médecin n'a accès à ce document.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {accessList.map((acc) => (
              <li
                key={acc.user_id}
                className="py-2 flex items-center justify-between"
              >
                <span>
                  {acc.nom} {acc.prenom}{" "}
                  <span className="text-xs text-gray-500 ml-2">
                    ({acc.role})
                  </span>
                </span>
                {acc.role === "shared" && acc.user_id !== currentUserId && (
                  <button
                    onClick={() => onRevoke(acc.user_id)}
                    disabled={loadingRevoke === acc.user_id}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex items-center"
                  >
                    <FaEyeSlash className="mr-1" />
                    {loadingRevoke === acc.user_id
                      ? "Révocation..."
                      : "Révoquer"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

const DocumentDetails = () => {
  const navigate = useNavigate();
  const { document_id } = useParams();
  const { selectedItem, clearSelectedItem, selectItem } = useDocumentContext();
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  // Ajout pour le partage
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareNotification, setShareNotification] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [loadingRevoke, setLoadingRevoke] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [shareDuration, setShareDuration] = useState("");

  const documentService = createDocumentService(httpService);

  // Déplacer tous les useEffect en haut du composant, jamais dans une condition
  useEffect(() => {
    const fetchDoc = async () => {
      if (!document_id) return;
      if (selectedItem && Number(selectedItem.id) === Number(document_id))
        return;
      try {
        setLoading(true);
        const response = await documentService.getDocumentById(document_id);
        const doc = {
          id: response.document.id,
          name: response.document.titre,
          date: new Date(response.document.date_creation).toLocaleDateString(
            "fr-FR"
          ),
          type: response.document.type_document,
          description: response.document.description,
          issuedBy: response.document.medecin_nom
            ? `Dr. ${response.document.medecin_nom} ${response.document.medecin_prenom}`
            : "Auto-ajouté",
          originalFileName: response.document.nom_fichier,
          url: `/api/documents/${response.document.id}/download`,
        };
        selectItem(doc);
      } catch (error) {
        console.error("Erreur chargement document:", error);
        if (error.response?.status === 403) {
          navigate("/403", { replace: true });
        } else if (error.response?.status === 404) {
          navigate("/documents", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
    // eslint-disable-next-line
  }, [document_id]);

  useEffect(() => {
    if (selectedItem && selectedItem.id) {
      loadDocument();
    }
    // eslint-disable-next-line
  }, [selectedItem?.id]);

  const loadDocument = async () => {
    if (!selectedItem || !selectedItem.id) return;
    try {
      setLoading(true);
      setError(null);
      console.log(
        "📄 Chargement du document pour visualisation:",
        selectedItem.id
      );

      // Récupérer le document avec les en-têtes d'authentification
      const response = await httpService.get(
        `/documents/${selectedItem.id}/download`,
        {
          responseType: "blob",
        }
      );

      // Récupérer le type MIME
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      setDocumentType(contentType);
      console.log("📄 Type MIME du document:", contentType);

      // Créer un URL blob pour l'affichage
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      setDocumentUrl(blobUrl);
    } catch (error) {
      console.error("❌ Erreur lors du chargement du document:", error);
      setError("Impossible de charger le document pour la visualisation");
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer l'URL blob au démontage
  useEffect(() => {
    return () => {
      if (documentUrl) {
        window.URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  // Charger la liste des médecins suivis au montage
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await httpService.get("/acl/followed-doctors");
        setDoctors(response.data.doctors || response.data || []);
      } catch {
        /* ignore error */
      }
    };
    fetchDoctors();
  }, []);

  // Charger l'ID utilisateur courant (pour la révocation, si besoin)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await httpService.get("/auth/me");
        setCurrentUserId(response.data?.id || response.data?.utilisateur_id);
      } catch {
        /* ignore error */
      }
    };
    fetchMe();
  }, []);

  // Charger la liste des accès au document
  const loadAccessList = async () => {
    if (!selectedItem?.id) return;
    try {
      const response = await documentService.getDocumentDoctorsWithAccess(
        selectedItem.id
      );
      setAccessList(response.doctors || []);
    } catch {
      /* ignore error */
    }
  };

  const handleShare = async () => {
    if (!selectedDoctor) {
      setShareNotification({
        type: "error",
        message: "Veuillez sélectionner un médecin.",
      });
      return;
    }
    if (!selectedItem?.id) return;
    setShareLoading(true);
    setShareNotification(null);
    try {
      await httpService.post("/documents/share", {
        documentId: selectedItem.id,
        doctorId: selectedDoctor,
        duration: shareDuration ? Number(shareDuration) : undefined,
      });
      setShareNotification({
        type: "success",
        message: "Document partagé avec succès au médecin !",
      });
      setShowShareModal(false);
      setSelectedDoctor("");
      setShareDuration("");
    } catch (error) {
      setShareNotification({
        type: "error",
        message:
          error.response?.data?.message || "Erreur lors du partage du document",
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleOpenShareModal = async () => {
    await loadAccessList();
    setShowShareModal(true);
  };

  const handleOpenAccessModal = async () => {
    setShowAccessModal(true);
    await loadAccessList();
  };

  const handleRevoke = async (doctorId) => {
    if (!selectedItem?.id || !doctorId) return;
    setLoadingRevoke(doctorId);
    try {
      await httpService.post("/documents/revoke", {
        documentId: selectedItem.id,
        doctorId,
      });
      await loadAccessList();
    } catch {
      /* ignore error */
    }
    setLoadingRevoke(null);
  };

  const handleBack = () => {
    clearSelectedItem();
    navigate(-1);
  };

  const handleDownload = async () => {
    if (!selectedItem || !selectedItem.id) return;
    try {
      console.log("📥 Téléchargement du document:", selectedItem);

      // Faire l'appel avec les en-têtes d'authentification
      const response = await httpService.get(
        `/documents/${selectedItem.id}/download`,
        {
          responseType: "blob", // Important pour les fichiers
        }
      );

      // Récupérer le type MIME depuis les en-têtes de réponse
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      console.log("📄 Type MIME du fichier:", contentType);
      console.log("📄 En-têtes de réponse:", response.headers);
      // Récupérer le nom de fichier depuis les en-têtes Content-Disposition si disponible
      let fileName = selectedItem.originalFileName;

      if (!fileName) {
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }
        }
      }
      // Si toujours pas de nom de fichier, utiliser un nom par défaut avec l'extension appropriée
      if (!fileName) {
        const extension = contentType.includes("pdf")
          ? ".pdf"
          : contentType.includes("image/jpeg")
          ? ".jpg"
          : contentType.includes("image/png")
          ? ".png"
          : contentType.includes("image")
          ? ".jpg"
          : ".pdf";
        fileName = `${selectedItem.name || "document"}${extension}`;
      }

      console.log("📁 Nom de fichier final pour téléchargement:", fileName);

      // Créer un lien de téléchargement avec le bon type MIME
      const blob = new Blob([response.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ Téléchargement initié");
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement:", error);
      alert("Erreur lors du téléchargement du document");
    }
  };

  // Fonction pour rendre le contenu du document selon son type
  const renderDocumentContent = () => {
    if (!selectedItem) return null;
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <FaFileAlt className="text-6xl mx-auto mb-2" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadDocument}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    if (!documentUrl || !documentType) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Document non disponible</p>
          </div>
        </div>
      );
    }

    // Rendu selon le type de document
    if (documentType.includes("pdf")) {
      return (
        <div className="w-full h-screen max-h-[80vh]">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0 rounded-lg"
            title={`Document: ${selectedItem.name}`}
          >
            <p>
              Votre navigateur ne supporte pas l'affichage des PDF.
              <button
                onClick={handleDownload}
                className="text-blue-600 underline ml-2"
              >
                Télécharger le document
              </button>
            </p>
          </iframe>
        </div>
      );
    }

    if (documentType.includes("image/")) {
      return (
        <div className="flex justify-center">
          <img
            src={documentUrl}
            alt={selectedItem.name}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-sm"
            onError={() => setError("Impossible de charger l'image")}
          />
        </div>
      );
    }

    // Pour les autres types de fichiers
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Aperçu non disponible pour ce type de fichier
          </p>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <FaDownload className="mr-2" />
            Télécharger le document
          </button>
        </div>
      </div>
    );
  };

  // Notification auto-disparition
  useEffect(() => {
    if (shareNotification) {
      const timer = setTimeout(() => {
        setShareNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shareNotification]);

  return !selectedItem ? null : (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour et téléchargement */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </button>
          <div className="flex gap-2">
            {/* Bouton partager à un médecin (ouvre la modale) */}
            <button
              onClick={handleOpenShareModal}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FaShareAlt className="mr-1" />
              Partager à un médecin
            </button>
            {/* Bouton voir accès */}
            <button
              onClick={handleOpenAccessModal}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
            >
              <FaUserMd className="mr-1" />
              Voir les médecins ayant accès
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <FaDownload className="mr-2" />
              Télécharger
            </button>
          </div>
        </div>
        {/* Notification de partage (en haut, auto-disparition) */}
        {shareNotification && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center text-base font-medium ${
              shareNotification.type === "success"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
            style={{ minWidth: 280, maxWidth: 400 }}
          >
            {shareNotification.message}
          </div>
        )}
        {/* Modales */}
        {showShareModal && (
          <ShareModal
            doctors={doctors}
            onShare={handleShare}
            loading={shareLoading}
            onClose={() => setShowShareModal(false)}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            shareDuration={shareDuration}
            setShareDuration={setShareDuration}
            accessList={accessList}
          />
        )}
        {showAccessModal && (
          <AccessModal
            accessList={accessList}
            onRevoke={handleRevoke}
            loadingRevoke={loadingRevoke}
            onClose={() => setShowAccessModal(false)}
            currentUserId={currentUserId}
          />
        )}
        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* En-tête de la carte */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedItem?.name}
                </h1>
                <p className="text-gray-500">{selectedItem?.date}</p>
              </div>
            </div>
          </div>

          {/* Informations du document */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Type de document
                </h2>
                <p className="text-gray-900">{selectedItem?.type}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Émis par
                </h2>
                <p className="text-gray-900">{selectedItem?.issuedBy}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Date</h2>
                <p className="text-gray-900">{selectedItem?.date}</p>
              </div>

              {selectedItem?.description && (
                <div className="md:col-span-3">
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900">{selectedItem?.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Aperçu du document */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Aperçu du document
            </h2>
            {renderDocumentContent()}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DocumentDetails;
