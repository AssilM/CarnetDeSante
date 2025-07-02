import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo-C.svg";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    tel_indicatif: "+228",
    tel_numero: "",
    dateNaissance: "",
    sexe: "",
    specialite: "", // Pour les médecins uniquement
    groupeSanguin: "", // Pour les patients uniquement
    poids: "", // Pour les patients uniquement
  });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  useEffect(() => {
    // Récupérer le rôle depuis l'URL
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam && ["patient", "medecin", "admin"].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [location.search]);

  const getRoleTitleAndDescription = () => {
    switch (role) {
      case "patient":
        return {
          title: "Inscription Patient",
          description: "Créez votre carnet de santé personnel",
          icon: (
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          ),
        };
      case "medecin":
        return {
          title: "Inscription Médecin",
          description: "Créez votre espace professionnel",
          icon: (
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          ),
        };
      case "admin":
        return {
          title: "Inscription Administrateur",
          description: "Créez votre compte d'administration",
          icon: (
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          ),
        };
      default:
        return {
          title: "Inscription",
          description: "Créez votre compte",
          icon: null,
        };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Réinitialiser les erreurs lors de la saisie
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Validation de la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Validation du numéro de téléphone
    if (formData.tel_numero) {
      const telRegex = /^\d{9,10}$/;
      if (!telRegex.test(formData.tel_numero.replace(/\s/g, ""))) {
        newErrors.tel_numero = "Format de numéro de téléphone invalide";
      }
    }

    // Validation de l'indicatif téléphonique
    if (formData.tel_indicatif) {
      const indicatifRegex = /^\+\d{1,3}$/;
      if (!indicatifRegex.test(formData.tel_indicatif)) {
        newErrors.tel_indicatif = "Format d'indicatif invalide (ex: +33)";
      }
    }

    // Validation de la date de naissance
    if (formData.dateNaissance) {
      const today = new Date();
      const birthDate = new Date(formData.dateNaissance);

      // Vérifier si la date est future
      if (birthDate > today) {
        newErrors.dateNaissance =
          "La date de naissance ne peut pas être future";
      }

      // Vérifier l'âge minimum (13 ans)
      const minAge = 13;
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - minAge);

      if (birthDate > minAgeDate) {
        newErrors.dateNaissance = `Vous devez avoir au moins ${minAge} ans pour vous inscrire`;
      }
    }

    // Validation de la spécialité pour les médecins
    if (role === "medecin" && !formData.specialite.trim()) {
      newErrors.specialite = "La spécialité est requise pour les médecins";
    }

    // Validation du poids pour les patients
    if (role === "patient" && formData.poids) {
      const poids = parseFloat(formData.poids);
      if (isNaN(poids) || poids <= 0 || poids > 500) {
        newErrors.poids = "Veuillez entrer un poids valide (entre 1 et 500 kg)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setRegisterError("");

      try {
        // Préparer les données d'inscription en fonction du rôle
        const userData = {
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          tel_indicatif: formData.tel_indicatif,
          tel_numero: formData.tel_numero,
          date_naissance: formData.dateNaissance,
          sexe: formData.sexe,
          role: role,
        };

        // Ajouter les données spécifiques au rôle
        if (role === "patient") {
          userData.patient_data = {
            groupe_sanguin: formData.groupeSanguin || null,
            poids: formData.poids ? parseFloat(formData.poids) : null,
          };
        } else if (role === "medecin") {
          userData.medecin_data = {
            specialite: formData.specialite,
            description: `Dr. ${formData.prenom} ${formData.nom}, ${formData.specialite}`,
          };
        }

        // Enregistrer l'utilisateur avec toutes les données
        await register(userData);

        // Ajouter un message de succès dans les paramètres de l'URL
        navigate(`/auth/login?role=${role}&registered=success`);
      } catch (error) {
        console.error("Erreur d'inscription:", error);
        setRegisterError(
          error.response?.data?.message ||
            "Échec de l'inscription. Veuillez réessayer."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const { title, description, icon } = getRoleTitleAndDescription();

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <span className="ml-2 text-xl font-medium text-blue-800">
              Carnet de <span className="text-blue-500">Santé Virtuel</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/auth/role-select"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Changer de profil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 flex-grow">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                {icon}
              </div>
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-blue-100">{description}</p>
          </div>

          <div className="p-6">
            {registerError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {registerError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label
                    htmlFor="prenom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.prenom ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Votre prénom"
                  />
                  {errors.prenom && (
                    <p className="mt-1 text-red-500 text-sm">{errors.prenom}</p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label
                    htmlFor="nom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.nom ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Votre nom"
                  />
                  {errors.nom && (
                    <p className="mt-1 text-red-500 text-sm">{errors.nom}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="exemple@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label
                    htmlFor="tel_numero"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Téléphone
                  </label>
                  <div className="flex space-x-2">
                    <div className="w-1/4">
                      <input
                        type="text"
                        id="tel_indicatif"
                        name="tel_indicatif"
                        value={formData.tel_indicatif}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.tel_indicatif
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="+228"
                      />
                      {errors.tel_indicatif && (
                        <p className="mt-1 text-red-500 text-xs">
                          {errors.tel_indicatif}
                        </p>
                      )}
                    </div>
                    <div className="w-3/4">
                      <input
                        type="tel"
                        id="tel_numero"
                        name="tel_numero"
                        value={formData.tel_numero}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          errors.tel_numero
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="612345678"
                      />
                      {errors.tel_numero && (
                        <p className="mt-1 text-red-500 text-xs">
                          {errors.tel_numero}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmation du mot de passe */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Confirmez votre mot de passe"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Date de naissance */}
                <div>
                  <label
                    htmlFor="dateNaissance"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    id="dateNaissance"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.dateNaissance
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.dateNaissance && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.dateNaissance}
                    </p>
                  )}
                </div>

                {/* Sexe */}
                <div>
                  <label
                    htmlFor="sexe"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sexe
                  </label>
                  <select
                    id="sexe"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Spécialité (pour les médecins uniquement) */}
                {role === "medecin" && (
                  <div>
                    <label
                      htmlFor="specialite"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Spécialité *
                    </label>
                    <select
                      id="specialite"
                      name="specialite"
                      value={formData.specialite}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.specialite ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Sélectionnez votre spécialité</option>
                      <option value="Médecine générale">Médecine générale</option>
                      <option value="Cardiologie">Cardiologie</option>
                      <option value="Dermatologie">Dermatologie</option>
                      <option value="Endocrinologie">Endocrinologie</option>
                      <option value="Gastro-entérologie">Gastro-entérologie</option>
                      <option value="Gynécologie">Gynécologie</option>
                      <option value="Neurologie">Neurologie</option>
                      <option value="Oncologie">Oncologie</option>
                      <option value="Ophtalmologie">Ophtalmologie</option>
                      <option value="ORL">ORL (Oto-rhino-laryngologie)</option>
                      <option value="Orthopédie">Orthopédie</option>
                      <option value="Pédiatrie">Pédiatrie</option>
                      <option value="Pneumologie">Pneumologie</option>
                      <option value="Psychiatrie">Psychiatrie</option>
                      <option value="Radiologie">Radiologie</option>
                      <option value="Rhumatologie">Rhumatologie</option>
                      <option value="Urologie">Urologie</option>
                      <option value="Anesthésie-Réanimation">Anesthésie-Réanimation</option>
                      <option value="Chirurgie générale">Chirurgie générale</option>
                      <option value="Chirurgie cardiaque">Chirurgie cardiaque</option>
                      <option value="Chirurgie orthopédique">Chirurgie orthopédique</option>
                      <option value="Chirurgie plastique">Chirurgie plastique</option>
                      <option value="Médecine d'urgence">Médecine d'urgence</option>
                      <option value="Médecine du travail">Médecine du travail</option>
                      <option value="Médecine du sport">Médecine du sport</option>
                      <option value="Gériatrie">Gériatrie</option>
                      <option value="Infectiologie">Infectiologie</option>
                      <option value="Néphrologie">Néphrologie</option>
                      <option value="Autre">Autre spécialité</option>
                    </select>
                    {errors.specialite && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.specialite}
                      </p>
                    )}
                  </div>
                )}

                {/* Groupe sanguin (pour les patients uniquement) */}
                {role === "patient" && (
                  <div>
                    <label
                      htmlFor="groupeSanguin"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Groupe sanguin
                    </label>
                    <select
                      id="groupeSanguin"
                      name="groupeSanguin"
                      value={formData.groupeSanguin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                )}

                {/* Poids (pour les patients uniquement) */}
                {role === "patient" && (
                  <div>
                    <label
                      htmlFor="poids"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      id="poids"
                      name="poids"
                      value={formData.poids}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.poids ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Votre poids en kg"
                      min="1"
                      max="500"
                      step="0.1"
                    />
                    {errors.poids && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.poids}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
                >
                  {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-gray-600">
                  Vous avez déjà un compte ?
                </span>{" "}
                <Link
                  to={`/auth/login?role=${role}`}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
