import React from "react";
import ItemCard from "./ItemCard";

/**
 * Composant de liste réutilisable pour afficher une collection d'éléments
 * @param {Array} items - Liste des éléments à afficher
 * @param {string} type - Type d'éléments ('document' ou 'vaccine')
 * @param {string} title - Titre de la section
 * @param {string} description - Description de la section
 * @param {Function} onAdd - Fonction appelée pour ajouter un élément
 * @param {Function} onViewDetails - Fonction appelée pour voir les détails d'un élément
 * @param {string} addButtonText - Texte du bouton d'ajout
 */
const ItemsList = ({
  items,
  type,
  title,
  description,
  onAdd,
  onViewDetails,
  addButtonText,
  rightAction,
}) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            {rightAction && rightAction}
            <button
              onClick={onAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {addButtonText}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-4">
            {items.length}{" "}
            {items.length > 1 ? "documents disponibles" : "document disponible"}
          </p>
          <div className="space-y-4">
            {items.map((item, index) => (
              <ItemCard
                key={index}
                type={type}
                title={item.title || item.name}
                date={item.date}
                subtitle={item.subtitle || item.doctor}
                onViewDetails={() => onViewDetails(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
