import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useAppContext } from "../../../context/AppContext";
import PageWrapper from "../../../components/PageWrapper";
import AddDocumentForm from "../../../components/patient/documents/AddDocumentForm";
import createDocumentService from "../../../services/api/documentService";
import { httpService } from "../../../services/http";

const documentService = createDocumentService(httpService);

const AddDocument = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showNotification } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  // Récupérer les paramètres de l'URL
  useEffect(() => {
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    setDocumentType(type);
    setAppointmentId(id);
    
    console.log("[AddDocument] Paramètres:", { type, id });
    console.log("[AddDocument] État de l'utilisateur au chargement:", {
      user: currentUser,
      userId: currentUser?.id,
      userRole: currentUser?.role,
      isAuthenticated: !!currentUser
    });
  }, [searchParams, currentUser]);

  const handleSubmit = async (formData) => {
    console.log("[AddDocument] Début de handleSubmit");
    console.log("[AddDocument] État de l'utilisateur:", {
      user: currentUser,
      userId: currentUser?.id,
      userRole: currentUser?.role,
      isAuthenticated: !!currentUser
    });

    if (!currentUser) {
      console.error("[AddDocument] Utilisateur non connecté");
      showNotification({
        type: "error",
        message: "Vous devez être connecté pour ajouter un document",
      });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("titre", formData.titre);
      data.append("type_document", formData.type_document);
      data.append("date_creation", formData.date_creation);
      data.append("description", formData.description || "");
      data.append("document", formData.file);

      // Si c'est un document lié à un rendez-vous
      if (documentType === "appointment" && appointmentId) {
        data.append("rendez_vous_id", appointmentId);
        console.log("[AddDocument] Ajout de document lié au rendez-vous:", appointmentId);
      }

      console.log("[AddDocument] Envoi de la requête avec les données:", {
        titre: formData.titre,
        type_document: formData.type_document,
        date_creation: formData.date_creation,
        documentType,
        appointmentId
      });

      const response = await documentService.createDocument(data);
      
      console.log("[AddDocument] Réponse reçue:", response);
      
      showNotification({
        type: "success",
        message: "Document ajouté avec succès !",
      });

      // Rediriger vers la page appropriée
      if (documentType === "appointment" && appointmentId) {
        navigate(`/appointment-details/${appointmentId}`);
      } else {
        navigate("/documents");
      }
    } catch (error) {
      console.error("[AddDocument] Erreur lors de l'ajout:", error);
      console.error("[AddDocument] Détails de l'erreur:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showNotification({
        type: "error",
        message: "Erreur lors de l'ajout du document",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (documentType === "appointment" && appointmentId) {
      navigate(`/appointment-details/${appointmentId}`);
    } else {
      navigate("/documents");
    }
  };

  const getPageTitle = () => {
    if (documentType === "appointment") {
      return "Ajouter un document au rendez-vous";
    }
    return "Ajouter un document";
  };



  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          {documentType === "appointment" && appointmentId && (
            <p className="text-gray-600">
              Ce document sera lié au rendez-vous #{appointmentId}
            </p>
          )}
        </div>

        <AddDocumentForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
        />

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600">Ajout du document en cours...</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AddDocument; 