import { createItemContext } from "./ItemContext";

// Créer le contexte spécifique aux documents
const { Provider, useItemContext } = createItemContext("Document");

export const DocumentProvider = Provider;
export const useDocumentContext = useItemContext;
