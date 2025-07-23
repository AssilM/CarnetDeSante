// Service pour gérer les redirections basées sur les notifications
export const getNotificationRedirect = (notification) => {
  const { type, contenu } = notification;

  switch (type) {
    case "rendez_vous_creer":
    case "rendez_vous_confirme":
    case "rendez_vous_annule":
    case "rendez_vous_termine":
      return getRendezVousRedirect(contenu);

    case "document_medecin_upload":
    case "document_patient_shared":
    case "document_access_revoked":
    case "document_deleted":
      return getDocumentRedirect(contenu);

    default:
      return null; // Pas de redirection pour les autres types
  }
};

// Extraire les informations de rendez-vous du contenu
const getRendezVousRedirect = (contenu) => {
  // Exemples de contenu :
  // "Votre rendez-vous du 2025-01-15 à 14:30 a été créé."
  // "Un nouveau rendez-vous a été pris pour le 2025-01-15 à 14:30."

  const dateMatch = contenu.match(/(\d{4}-\d{2}-\d{2})/);
  const timeMatch = contenu.match(/(\d{2}:\d{2})/);

  if (dateMatch && timeMatch) {
    const date = dateMatch[1];
    const time = timeMatch[1];

    // Rediriger vers la page des rendez-vous avec filtres
    return {
      path: "/appointments",
      search: `?date=${date}&time=${time}`,
      title: "Voir le rendez-vous",
    };
  }

  // Fallback vers la page des rendez-vous
  return {
    path: "/appointments",
    title: "Voir les rendez-vous",
  };
};

// Extraire les informations de document du contenu
const getDocumentRedirect = (contenu) => {
  // Exemples de contenu :
  // "Le Dr. Martin Dupont a ajouté un nouveau document médical : Ordonnance"
  // "Un patient a partagé un document médical avec vous"

  // Chercher le nom du document dans le contenu
  const documentMatch = contenu.match(/document médical : (.+?)(?:\.|$)/);

  if (documentMatch) {
    const documentName = documentMatch[1].trim();

    // Rediriger vers la page des documents avec recherche
    return {
      path: "/documents",
      search: `?search=${encodeURIComponent(documentName)}`,
      title: `Voir le document : ${documentName}`,
    };
  }

  // Fallback vers la page des documents
  return {
    path: "/documents",
    title: "Voir les documents",
  };
};

// Fonction utilitaire pour naviguer vers la redirection
export const navigateToNotification = (notification, navigate) => {
  const redirect = getNotificationRedirect(notification);

  if (redirect) {
    const fullPath = redirect.search
      ? `${redirect.path}${redirect.search}`
      : redirect.path;
    navigate(fullPath);
    return true;
  }

  return false;
};
