import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo-C.svg";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess } = useAppContext();

  useEffect(() => {
    // Récupérer le rôle depuis l'URL
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam && ["patient", "medecin", "admin"].includes(roleParam)) {
      setRole(roleParam);
    }

    // Vérifier si l'utilisateur vient de s'inscrire
    const registered = params.get("registered");
    if (registered === "success") {
      setSuccessMessage(
        "Inscription réussie ! Vous pouvez maintenant vous connecter."
      );
    }
  }, [location.search]);

  const getRoleTitleAndDescription = () => {
    switch (role) {
      case "patient":
        return {
          title: "Espace Patient",
          description: "Accédez à votre carnet de santé personnel",
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
          title: "Espace Médecin",
          description: "Accédez à votre espace professionnel",
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
          title: "Espace Administrateur",
          description: "Accédez à votre console d'administration",
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
          title: "Connexion",
          description: "Accédez à votre espace personnel",
          icon: null,
        };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    setSuccessMessage("");

    try {
      const user = await login(email, password);
      console.log("Connexion réussie:", user);

      // Vérifier si le rôle de l'utilisateur correspond au rôle sélectionné
      if (role && user.role !== role) {
        setLoginError(
          `Vous n'êtes pas autorisé à vous connecter en tant que ${role}. Votre compte est un compte ${user.role}.`
        );
        setIsLoading(false);
        return;
      }

      // Afficher un message de succès
      showSuccess(`Connexion réussie. Bienvenue, ${user.prenom} ${user.nom} !`);

      // Redirection en fonction du rôle
      if (user.role === "patient") {
        navigate("/patient/home");
      } else if (user.role === "medecin") {
        navigate("/doctor/home");
      } else if (user.role === "admin") {
        navigate("/admin/home");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setLoginError(
        error.response?.data?.message ||
          "Échec de la connexion. Veuillez vérifier vos identifiants."
      );
    } finally {
      setIsLoading(false);
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
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
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
            <h3 className="text-xl font-medium text-center mb-6">
              Se connecter
            </h3>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            {loginError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre email"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre mot de passe"
                    required
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
                <div className="flex justify-end mt-1">
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">Vous n'avez pas de compte ?</span>{" "}
              <Link
                to={`/auth/register?role=${role}`}
                className="text-blue-600 font-medium hover:underline"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
