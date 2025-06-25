import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";
import PageWrapper from "../../../components/PageWrapper";

const EditEmail = () => {
  const navigate = useNavigate();
  const { user, updateUserInfo, loading } = useUserContext();
  const { currentUser } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que les emails correspondent
    if (newEmail !== confirmEmail) {
      setError("Les adresses e-mail ne correspondent pas");
      return;
    }

    // Vérifier que l'email est différent de l'actuel
    if (newEmail === user?.email) {
      setError("La nouvelle adresse e-mail est identique à l'actuelle");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Appeler l'API pour mettre à jour l'email
      await updateUserInfo(currentUser.id, { email: newEmail });
      navigate("/settings#connexion");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de l'adresse e-mail"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
            Impossible de charger les informations de l'utilisateur.
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiMail className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-semibold">
              Modifier l'adresse e-mail
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            Votre adresse e-mail actuelle : {user.email}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouvelle adresse e-mail
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer la nouvelle adresse e-mail
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/settings#connexion")}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "En cours..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditEmail;
