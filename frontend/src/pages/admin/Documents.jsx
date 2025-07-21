import React, { useState, useEffect } from "react";
import {
  FaFileMedical,
  FaLink,
  FaShieldAlt,
  FaPlus,
  FaSearch,
  FaUser,
  FaUserMd,
} from "react-icons/fa";
import {
  DocumentCard,
  RelationshipCard,
} from "../../components/admin/documents";
import PageWrapper from "../../components/PageWrapper";
import {
  getAllDocuments,
  getAllPatientDoctorRelationships,
  getAllUsers,
  getPatientsByDoctor,
  getDoctorsByPatient,
  deletePatientDoctorRelationship,
} from "../../services/api/adminService";

const Documents = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserData();
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);

      let docsData = [];
      let relsData = [];

      if (selectedUser.role === "patient") {
        // Pour un patient, on récupère ses documents et les médecins qui le suivent
        docsData = await getAllDocuments();
        docsData = docsData.filter((doc) => doc.patient_id === selectedUser.id);
        relsData = await getDoctorsByPatient(selectedUser.id);
      } else if (selectedUser.role === "medecin") {
        // Pour un médecin, on récupère ses documents et ses patients
        docsData = await getAllDocuments();
        docsData = docsData.filter((doc) => doc.medecin_id === selectedUser.id);
        relsData = await getPatientsByDoctor(selectedUser.id);
      } else {
        // Pour un admin, on récupère tout
        [docsData, relsData] = await Promise.all([
          getAllDocuments(),
          getAllPatientDoctorRelationships(),
        ]);
      }

      console.log("Données chargées:", {
        documents: docsData.length,
        relationships: relsData.length,
        user: selectedUser,
      });
      setDocuments(docsData);
      setRelationships(relsData);
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

  const handleViewPermissions = (documentId) => {
    console.log("Voir les permissions pour le document:", documentId);
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
    };

    console.log("Filtrage des données:", {
      searchTerm,
      totalRelationships: relationships.length,
      filteredRelationships: filtered.relationships.length,
      relationships: relationships,
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
      id: "documents",
      label: "Documents",
      icon: <FaFileMedical />,
      count: filteredData.documents.length,
    },
    {
      id: "relationships",
      label: "Liens Patient-Médecin",
      icon: <FaLink />,
      count: filteredData.relationships.length,
    },
  ];

  if (loading && !selectedUser) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error && !selectedUser) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Réessayer
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Si aucun utilisateur n'est sélectionné, afficher la liste des utilisateurs
  if (!selectedUser) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Documents
              </h1>
              <p className="text-gray-600">
                Sélectionnez un utilisateur pour voir ses documents et liens
              </p>
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Utilisateurs (
                  {
                    users.filter(
                      (user) =>
                        user.nom
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        user.prenom
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        user.email
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }
                  )
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users
                    .filter(
                      (user) =>
                        user.nom
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        user.prenom
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        user.email
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            {getUserIcon(user.role)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {user.nom} {user.prenom}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
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
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Affichage des données de l'utilisateur sélectionné
  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header avec utilisateur sélectionné */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-primary hover:text-primary-dark mb-2 flex items-center space-x-2"
                >
                  <span>← Retour à la liste</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedUser.nom} {selectedUser.prenom}
                </h1>
                <p className="text-gray-600">
                  {getUserRoleLabel(selectedUser.role)} • {selectedUser.email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getUserIcon(selectedUser.role)}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedUser.role === "patient"
                      ? "bg-blue-100 text-blue-800"
                      : selectedUser.role === "medecin"
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {getUserRoleLabel(selectedUser.role)}
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
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
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
                      {relationships.length > 0 &&
                        ` (${relationships.length} liens non filtrés)`}
                    </p>
                    {relationships.length > 0 && (
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Relationships brutes: {relationships.length}</p>
                        <p>Search term: "{searchTerm}"</p>
                      </div>
                    )}
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
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Documents;
