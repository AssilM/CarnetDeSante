import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";
import PageWrapper from "../../../components/PageWrapper";

const EditPhone = () => {
  const navigate = useNavigate();
  const { user, updateUserInfo, loading } = useUserContext();
  const { currentUser } = useAuth();
  const [indicatif, setIndicatif] = useState(user?.telIndicatif || "+33");
  const [numero, setNumero] = useState(user?.telNumero || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que le numéro est différent de l'actuel
    if (indicatif === user?.telIndicatif && numero === user?.telNumero) {
      setError("Le nouveau numéro est identique à l'actuel");
      return;
    }

    // Validation de l'indicatif
    if (!indicatif.startsWith("+")) {
      setError("L'indicatif doit commencer par +");
      return;
    }

    // Validation simple du format de numéro
    const numeroRegex = /^\d{9,15}$/;
    if (!numeroRegex.test(numero)) {
      setError(
        "Format de numéro de téléphone invalide (9 à 15 chiffres sans espaces)"
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Appeler l'API pour mettre à jour le numéro de téléphone
      await updateUserInfo(currentUser.id, {
        tel_indicatif: indicatif,
        tel_numero: numero,
      });
      navigate("/settings#connexion");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du numéro de téléphone"
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

  // Formatage du numéro de téléphone actuel avec indicatif
  const formatPhoneNumber = () => {
    if (!user.telIndicatif && !user.telNumero) return "Non renseigné";

    const userIndicatif = user.telIndicatif || "";
    const userNumero = user.telNumero || "";

    if (userIndicatif && userNumero) {
      return `${userIndicatif} ${userNumero}`;
    } else if (userNumero) {
      return userNumero;
    } else if (userIndicatif) {
      return userIndicatif;
    }

    return "Non renseigné";
  };

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiPhone className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-semibold">
              Modifier le numéro de téléphone
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            Votre numéro de téléphone actuel : {formatPhoneNumber()}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indicatif
                </label>
                <input
                  type="text"
                  value={indicatif}
                  onChange={(e) => setIndicatif(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+33"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="612345678"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: Indicatif avec + (ex: +33) et numéro sans espaces ni
              tirets (ex: 612345678)
            </p>

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

export default EditPhone;
