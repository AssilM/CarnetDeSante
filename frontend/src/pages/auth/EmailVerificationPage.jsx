import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo-C.svg";
import Footer from "../../components/Footer";
import OTPInput from "../../components/common/OTPInput";
import authService from "../../services/api/authService";
import { useAppContext } from "../../context/AppContext";

const EmailVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useAppContext();

  useEffect(() => {
    // Récupérer l'email depuis l'URL ou les paramètres
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError("Veuillez saisir votre email et le code de vérification");
      return;
    }

    if (otp.length !== 6) {
      setError("Veuillez saisir le code à 6 chiffres");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.verifyEmailOTP(email, otp);
      setSuccess(true);
      showSuccess(
        "Email vérifié avec succès ! Vous pouvez maintenant vous connecter."
      );

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      setError(
        error.response?.data?.message ||
          "Code incorrect ou expiré. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      await authService.resendVerificationOTP(email);
      setResendSuccess(true);
      showSuccess("Code de vérification renvoyé par email");

      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors du renvoi:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors du renvoi du code. Veuillez réessayer."
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="h-10 w-10" />
              <span className="ml-2 text-xl font-medium text-blue-800">
                Carnet de <span className="text-blue-500">Santé Virtuel</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4 text-center">
              <div className="flex justify-center mb-2">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">Email vérifié !</h2>
              <p className="text-green-100">
                Votre compte a été activé avec succès
              </p>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                Votre adresse email a été vérifiée. Vous allez être redirigé
                vers la page de connexion...
              </p>

              <Link
                to="/auth/login"
                className="inline-block bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Aller à la connexion
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <span className="ml-2 text-xl font-medium text-blue-800">
              Carnet de <span className="text-blue-500">Santé Virtuel</span>
            </span>
          </Link>
          <Link
            to="/auth/login"
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
            Retour à la connexion
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4 text-center">
            <div className="flex justify-center mb-2">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Vérification de l'email</h2>
            <p className="text-blue-100">
              Activez votre compte en saisissant le code reçu
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6 text-center">
              <p className="text-gray-600 mb-4">
                Nous avons envoyé un code de vérification à votre adresse email.
                Veuillez le saisir ci-dessous pour activer votre compte.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                Code de vérification renvoyé avec succès !
              </div>
            )}

            <form onSubmit={handleVerifyOTP}>
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
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Code de vérification à 6 chiffres
                </label>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  error={error}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400 mb-4"
              >
                {isLoading ? "Vérification en cours..." : "Vérifier l'email"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 underline disabled:text-gray-400"
                >
                  {resendLoading ? "Envoi en cours..." : "Renvoyer le code"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">Vous avez déjà un compte ?</span>{" "}
              <Link
                to="/auth/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmailVerificationPage;
