import React, { useState, useRef, useEffect } from "react";

/**
 * Composant de saisie d'OTP avec 6 chiffres
 * @param {Object} props - Propriétés du composant
 * @param {string} props.value - Valeur actuelle de l'OTP
 * @param {Function} props.onChange - Fonction appelée quand l'OTP change
 * @param {boolean} props.disabled - Si le champ est désactivé
 * @param {string} props.error - Message d'erreur à afficher
 * @param {string} props.placeholder - Placeholder pour les champs
 */
const OTPInput = ({
  value = "",
  onChange,
  disabled = false,
  error = "",
  placeholder = "0",
}) => {
  // Fonction pour convertir une chaîne en tableau de longueur fixe
  const toArray = (str) => Array.from({ length: 6 }, (_, i) => str[i] || "");

  const [otpArr, setOtpArr] = useState(toArray(value));
  const inputRefs = useRef([]);

  // Mettre à jour l'état local quand la prop value change
  useEffect(() => {
    setOtpArr(toArray(value));
  }, [value]);

  // Initialiser les refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index, digit) => {
    if (disabled) return;

    // Ne permettre que les chiffres
    if (!/^\d$/.test(digit) && digit !== "") return;

    const newOtp = [...otpArr];
    newOtp[index] = digit;
    const newOtpString = newOtp.join("");

    setOtpArr(newOtp);
    onChange?.(newOtpString);

    // Passer au champ suivant si un chiffre a été saisi
    if (digit !== "" && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    // Gérer la touche Backspace
    if (e.key === "Backspace") {
      e.preventDefault(); // Empêcher le comportement par défaut

      // Si le champ actuel a une valeur, la supprimer
      if (otpArr[index] !== "") {
        const newOtp = [...otpArr];
        newOtp[index] = "";
        setOtpArr(newOtp);
        onChange?.(newOtp.join(""));
      }
      // Si le champ actuel est vide et qu'il y a un champ précédent
      else if (index > 0) {
        // D'abord reculer le focus
        inputRefs.current[index - 1]?.focus();

        // Puis effacer la case précédente
        setTimeout(() => {
          const newOtp = [...otpArr];
          newOtp[index - 1] = "";
          setOtpArr(newOtp);
          onChange?.(newOtp.join(""));
        }, 0);
      }
    }

    // Gérer les flèches
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length === 6) {
      setOtpArr(toArray(digits));
      onChange?.(digits);
      // Focus sur le dernier champ
      inputRefs.current[5]?.focus();
    }
  };

  const handleClick = (index) => {
    if (disabled) return;

    // Focus sur le champ cliqué
    inputRefs.current[index]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            value={otpArr[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onClick={() => handleClick(index)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg bg-white transition-all duration-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-gray-300"
            } ${
              disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            } placeholder-gray-400 sm:w-10 sm:h-12 sm:text-lg`}
            autoComplete="one-time-code"
          />
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center mt-2">{error}</div>
      )}
    </div>
  );
};

export default OTPInput;
