import React, { createContext, useContext, useState } from "react";

// Factory function pour créer des contextes spécifiques
export function createItemContext(itemName) {
  // Créer un contexte spécifique au type d'élément
  const Context = createContext(null);

  // Provider component
  const Provider = ({ children }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);

    // Actions communes
    const selectItem = (item) => setSelectedItem(item);
    const clearSelectedItem = () => setSelectedItem(null);
    const addItem = (item) => setItems((prev) => [...prev, item]);
    const updateItem = (id, updatedItem) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        )
      );
    };
    const removeItem = (id) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const value = {
      selectedItem,
      setSelectedItem,
      selectItem,
      clearSelectedItem,
      items,
      setItems,
      addItem,
      updateItem,
      removeItem,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  // Hook personnalisé pour accéder au contexte
  const useItemContext = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        `use${itemName}Context doit être utilisé dans un ${itemName}Provider`
      );
    }
    return context;
  };

  return {
    Provider,
    useItemContext,
  };
}
