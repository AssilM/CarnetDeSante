import React, { useState, useEffect } from "react";
import {
  FaFileMedical,
  FaLink,
  FaShieldAlt,
  FaPlus,
  FaSearch,
  FaUser,
  FaUserMd,
  FaArrowLeft,
  FaUserEdit,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  DocumentCard,
  RelationshipCard,
} from "../../components/admin/documents";
import {
  AppointmentCard,
  DeleteAppointmentModal,
  EditAppointmentModal,
} from "../../components/admin/appointments";
import { EditUserModal, DeleteUserModal } from "../../components/admin/users";
import PageWrapper from "../../components/PageWrapper";
import DocumentPermissionsModal from "../../components/admin/documents/DocumentPermissionsModal";
import {
  getAllDocuments,
  getAllPatientDoctorRelationships,
  getPatientsByDoctor,
  getDoctorsByPatient,
  deletePatientDoctorRelationship,
  getDocumentDoctorsWithAccess,
  revokeDocumentPermission,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  deleteAppointment,
  updateAppointment,
  confirmAppointment,
  cancelAppointment,
  startAppointment,
  finishAppointment,
} from "../../services/api/adminService";
import { adminService } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const UserDocuments = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [documents, setDocuments] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loadingRevoke, setLoadingRevoke] = useState(null);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [loadingAppointmentAction, setLoadingAppointmentAction] =
    useState(null);

  // États pour les modales d'édition utilisateur
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // États pour les modales de rendez-vous
  const [showEditAppointmentModal, setShowEditAppointmentModal] =
    useState(false);
  const [showDeleteAppointmentModal, setShowDeleteAppointmentModal] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModalLoading, setAppointmentModalLoading] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useAppContext();

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les informations de l'utilisateur avec détails
      const usersData = await adminService.getAllUsersWithDetails();
      const currentUser = usersData.find((u) => u.id == userId);

      if (!currentUser) {
        setError("Utilisateur non trouvé");
        return;
      }

      setUser(currentUser);

      let docsData = [];
      let relsData = [];
      let appsData = [];

      if (currentUser.role === "patient") {
        // Pour un patient, on récupère ses documents, les médecins qui le suivent et ses rendez-vous
        [docsData, relsData, appsData] = await Promise.all([
          getAllDocuments().then((docs) =>
            docs.filter((doc) => doc.patient_id == userId)
          ),
          getDoctorsByPatient(userId),
          getPatientAppointments(userId),
        ]);
      } else if (currentUser.role === "medecin") {
        // Pour un médecin, on récupère ses documents, ses patients et ses rendez-vous
        [docsData, relsData, appsData] = await Promise.all([
          getAllDocuments().then((docs) =>
            docs.filter((doc) => doc.medecin_id == userId)
          ),
          getPatientsByDoctor(userId),
          getDoctorAppointments(userId),
        ]);
      } else {
        // Pour un admin, on récupère tout
        [docsData, relsData, appsData] = await Promise.all([
          getAllDocuments(),
          getAllPatientDoctorRelationships(),
          getAllAppointments(),
        ]);
      }

      console.log("Données chargées:", {
        documents: docsData.length,
        relationships: relsData.length,
        appointments: appsData.length,
        user: currentUser,
      });
      setDocuments(docsData);
      setRelationships(relsData);
      setAppointments(appsData);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRelationship = async (patientId, doctorId) => {
    try {
      await deletePatientDoctorRelationship(patientId, doctorId);
      setRelationships((prev) =>
        prev.filter(
          (rel) => !(rel.patient_id === patientId && rel.doctor_id === doctorId)
        )
      );
    } catch (err) {
      console.error("Erreur lors de la suppression du lien:", err);
      setError("Erreur lors de la suppression du lien");
    }
  };

  const handleViewPermissions = async (documentId) => {
    setPermissionsModalOpen(true);
    setCurrentDocumentId(documentId);
    try {
      const data = await getDocumentDoctorsWithAccess(documentId);
      console.log("Permissions API response:", data);
      setPermissions(data.doctors || []);
    } catch {
      setPermissions([]);
    }
  };

  const handleViewDetails = (documentId) => {
    navigate(`/admin/documents/${documentId}`);
  };

  const handleRevoke = async (doctorId) => {
    if (!currentDocumentId || !doctorId) return;
    setLoadingRevoke(doctorId);
    try {
      await revokeDocumentPermission(currentDocumentId, doctorId);
      // Recharger la liste des permissions après révocation
      const data = await getDocumentDoctorsWithAccess(currentDocumentId);
      setPermissions(data.doctors || []);
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
    } finally {
      setLoadingRevoke(null);
    }
  };

  const handleEditUser = () => {
    setShowEditModal(true);
  };

  const handleSaveUser = async (userId, userData) => {
    try {
      setModalLoading(true);
      await adminService.updateUserWithDetails(userId, userData);

      // Mettre à jour l'utilisateur local
      setUser((prev) => ({ ...prev, ...userData }));

      // Message de succès personnalisé
      showSuccess("Utilisateur modifié avec succès");
    } catch (err) {
      console.error("Erreur lors de la modification:", err);

      // Message d'erreur personnalisé
      showError("Erreur lors de la modification de l'utilisateur");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      setModalLoading(true);
      await adminService.deleteUser(userId);

      // Message de succès personnalisé
      showSuccess("Utilisateur supprimé avec succès");

      setTimeout(() => {
        navigate("/admin/users");
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);

      // Message d'erreur personnalisé
      showError("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setModalLoading(false);
    }
  };

  // Fonctions de gestion des rendez-vous
  const handleDeleteAppointment = async (appointmentId) => {
    const appointment = appointments.find((app) => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowDeleteAppointmentModal(true);
    }
  };

  const handleConfirmDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setAppointmentModalLoading(true);
      await deleteAppointment(selectedAppointment.id);
      setAppointments((prev) =>
        prev.filter((app) => app.id !== selectedAppointment.id)
      );
      showSuccess("Rendez-vous supprimé avec succès");
      setShowDeleteAppointmentModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Erreur lors de la suppression du rendez-vous:", err);
      showError("Erreur lors de la suppression du rendez-vous");
    } finally {
      setAppointmentModalLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      setLoadingAppointmentAction(appointmentId);
      await confirmAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, statut: "confirmé" } : app
        )
      );
      showSuccess("Rendez-vous confirmé avec succès");
    } catch (err) {
      console.error("Erreur lors de la confirmation du rendez-vous:", err);
      showError("Erreur lors de la confirmation du rendez-vous");
    } finally {
      setLoadingAppointmentAction(null);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoadingAppointmentAction(appointmentId);
      await cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, statut: "annulé" } : app
        )
      );
      showSuccess("Rendez-vous annulé avec succès");
    } catch (err) {
      console.error("Erreur lors de l'annulation du rendez-vous:", err);
      showError("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setLoadingAppointmentAction(null);
    }
  };

  const handleStartAppointment = async (appointmentId) => {
    try {
      setLoadingAppointmentAction(appointmentId);
      await startAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, statut: "en_cours" } : app
        )
      );
      showSuccess("Rendez-vous démarré avec succès");
    } catch (err) {
      console.error("Erreur lors du démarrage du rendez-vous:", err);
      showError("Erreur lors du démarrage du rendez-vous");
    } finally {
      setLoadingAppointmentAction(null);
    }
  };

  const handleFinishAppointment = async (appointmentId) => {
    try {
      setLoadingAppointmentAction(appointmentId);
      await finishAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, statut: "terminé" } : app
        )
      );
      showSuccess("Rendez-vous terminé avec succès");
    } catch (err) {
      console.error("Erreur lors de la finalisation du rendez-vous:", err);
      showError("Erreur lors de la finalisation du rendez-vous");
    } finally {
      setLoadingAppointmentAction(null);
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditAppointmentModal(true);
  };

  const handleSaveAppointment = async (appointmentId, appointmentData) => {
    try {
      setAppointmentModalLoading(true);
      await updateAppointment(appointmentId, appointmentData);

      // Mettre à jour le rendez-vous dans la liste locale
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, ...appointmentData } : app
        )
      );

      showSuccess("Rendez-vous modifié avec succès");
      setShowEditAppointmentModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Erreur lors de la modification du rendez-vous:", err);
      showError("Erreur lors de la modification du rendez-vous");
    } finally {
      setAppointmentModalLoading(false);
    }
  };

  const getFilteredData = () => {
    const filtered = {
      documents: documents.filter(
        (doc) =>
          doc.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.patient_prenom?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      relationships: relationships.filter(
        (rel) =>
          rel.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.patient_prenom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          rel.doctor_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.doctor_prenom?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      appointments: appointments.filter(
        (app) =>
          app.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.patient_prenom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.medecin_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.medecin_prenom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.motif?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };

    console.log("Filtrage des données:", {
      searchTerm,
      totalRelationships: relationships.length,
      filteredRelationships: filtered.relationships.length,
      totalAppointments: appointments.length,
      filteredAppointments: filtered.appointments.length,
    });

    return filtered;
  };

  const filteredData = getFilteredData();

  const getUserIcon = (role) => {
    switch (role) {
      case "patient":
        return <FaUser className="text-blue-600" />;
      case "medecin":
        return <FaUserMd className="text-green-600" />;
      case "admin":
        return <FaShieldAlt className="text-purple-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getUserRoleLabel = (role) => {
    switch (role) {
      case "patient":
        return "Patient";
      case "medecin":
        return "Médecin";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profil",
      icon: <FaUserEdit />,
      count: null,
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FaFileMedical />,
      count: filteredData.documents.length,
    },
    {
      id: "appointments",
      label: "Rendez-vous",
      icon: <FaCalendarAlt />,
      count: filteredData.appointments.length,
    },
    {
      id: "relationships",
      label: "Liens Patient-Médecin",
      icon: <FaLink />,
      count: filteredData.relationships.length,
    },
  ];

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">
              Utilisateur non trouvé
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header avec utilisateur sélectionné */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="text-primary hover:text-primary-dark mb-2 flex items-center space-x-2"
                >
                  <FaArrowLeft />
                  <span>Retour à la liste</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.nom} {user.prenom}
                </h1>
                <p className="text-gray-600">
                  {getUserRoleLabel(user.role)} • {user.email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getUserIcon(user.role)}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.role === "patient"
                      ? "bg-blue-100 text-blue-800"
                      : user.role === "medecin"
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {getUserRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === "documents" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Documents ({filteredData.documents.length})
                  </h2>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    <FaPlus />
                    <span>Nouveau document</span>
                  </button>
                </div>

                {filteredData.documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFileMedical className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">Aucun document trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.documents.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onViewPermissions={handleViewPermissions}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rendez-vous ({filteredData.appointments.length})
                  </h2>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    <FaPlus />
                    <span>Nouveau rendez-vous</span>
                  </button>
                </div>

                {filteredData.appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">Aucun rendez-vous trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.appointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={handleEditAppointment}
                        onDelete={handleDeleteAppointment}
                        onConfirm={handleConfirmAppointment}
                        onCancel={handleCancelAppointment}
                        onStart={handleStartAppointment}
                        onFinish={handleFinishAppointment}
                        loading={loadingAppointmentAction === appointment.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "relationships" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Liens Patient-Médecin ({filteredData.relationships.length})
                  </h2>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    <FaPlus />
                    <span>Nouveau lien</span>
                  </button>
                </div>

                {filteredData.relationships.length === 0 ? (
                  <div className="text-center py-12">
                    <FaLink className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      Aucun lien patient-médecin trouvé
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.relationships.map((relationship) => (
                      <RelationshipCard
                        key={`${relationship.patient_id}-${relationship.doctor_id}`}
                        relationship={relationship}
                        onDelete={handleDeleteRelationship}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profil de l'utilisateur
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditUser}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <FaUserEdit />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaUserEdit />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nom
                        </label>
                        <p className="text-gray-900">{user.nom}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Prénom
                        </label>
                        <p className="text-gray-900">{user.prenom}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rôle
                        </label>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            user.role === "patient"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "medecin"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {getUserRoleLabel(user.role)}
                        </span>
                      </div>
                      {user.telephone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Téléphone
                          </label>
                          <p className="text-gray-900">{user.telephone}</p>
                        </div>
                      )}
                      {user.date_naissance && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Date de naissance
                          </label>
                          <p className="text-gray-900">
                            {new Date(user.date_naissance).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      )}
                      {user.genre && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Genre
                          </label>
                          <p className="text-gray-900">{user.genre}</p>
                        </div>
                      )}
                      {user.groupe_sanguin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Groupe sanguin
                          </label>
                          <p className="text-gray-900">{user.groupe_sanguin}</p>
                        </div>
                      )}
                      {user.poids && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Poids
                          </label>
                          <p className="text-gray-900">{user.poids} kg</p>
                        </div>
                      )}
                      {user.taille && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Taille
                          </label>
                          <p className="text-gray-900">{user.taille} cm</p>
                        </div>
                      )}
                      {user.adresse && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Adresse
                          </label>
                          <p className="text-gray-900">{user.adresse}</p>
                        </div>
                      )}
                      {user.ville && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Ville
                          </label>
                          <p className="text-gray-900">{user.ville}</p>
                        </div>
                      )}
                      {user.code_postal && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Code postal
                          </label>
                          <p className="text-gray-900">{user.code_postal}</p>
                        </div>
                      )}
                      {user.date_creation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Date de création du compte
                          </label>
                          <p className="text-gray-900">
                            {new Date(user.date_creation).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      )}
                      {user.derniere_connexion && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Dernière connexion
                          </label>
                          <p className="text-gray-900">
                            {new Date(
                              user.derniere_connexion
                            ).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      )}
                      {user.statut && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Statut
                          </label>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              user.statut === "actif"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.statut === "actif" ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DocumentPermissionsModal
        open={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        permissions={permissions}
        onRevoke={handleRevoke}
        loadingRevoke={loadingRevoke}
      />

      {/* Modale d'édition */}
      {showEditModal && user && (
        <EditUserModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(userId, userData) => handleSaveUser(user.id, userData)}
          loading={modalLoading}
        />
      )}

      {/* Modale de suppression */}
      {showDeleteModal && user && (
        <DeleteUserModal
          user={user}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleConfirmDelete(user.id)}
          loading={modalLoading}
        />
      )}

      {/* Modale de suppression de rendez-vous */}
      <DeleteAppointmentModal
        appointment={selectedAppointment}
        open={showDeleteAppointmentModal}
        onClose={() => {
          setShowDeleteAppointmentModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleConfirmDeleteAppointment}
        loading={appointmentModalLoading}
      />

      {/* Modale de modification de rendez-vous */}
      <EditAppointmentModal
        appointment={selectedAppointment}
        open={showEditAppointmentModal}
        onClose={() => {
          setShowEditAppointmentModal(false);
          setSelectedAppointment(null);
        }}
        onSave={handleSaveAppointment}
        loading={appointmentModalLoading}
      />
    </PageWrapper>
  );
};

export default UserDocuments;
