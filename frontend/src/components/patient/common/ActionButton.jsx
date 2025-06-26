import React from "react";
import PropTypes from "prop-types";

/**
 * Composant de bouton d'action réutilisable avec différentes variantes
 * @param {string} variant - Style du bouton (primary, secondary, outline)
 * @param {Function} onClick - Fonction appelée au clic
 * @param {ReactNode} children - Contenu du bouton
 * @param {string} className - Classes CSS additionnelles
 */
const ActionButton = ({
  variant = "primary",
  onClick,
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
    secondary:
      "bg-secondary text-primary hover:bg-secondary/80 focus:ring-primary",
    outline:
      "border border-primary text-primary bg-white hover:bg-secondary focus:ring-primary",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

ActionButton.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ActionButton;
