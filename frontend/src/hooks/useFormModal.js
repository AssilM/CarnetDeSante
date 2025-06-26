import { useState } from "react";

/**
 * Hook personnalisé pour gérer l'état d'un formulaire modal
 * @param {Function} onSubmitCallback - Fonction à appeler lors de la soumission du formulaire
 * @returns {Object} - État et fonctions pour gérer le formulaire modal
 */
export default function useFormModal(onSubmitCallback) {
  const [isOpen, setIsOpen] = useState(false);

  const openForm = () => setIsOpen(true);
  const closeForm = () => setIsOpen(false);

  const handleSubmit = (data) => {
    onSubmitCallback?.(data);
    closeForm();
  };

  return {
    isOpen,
    openForm,
    closeForm,
    handleSubmit,
  };
}
