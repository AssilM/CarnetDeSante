import React from "react";
import AppRoutes from "./routes";
import { AuthProvider } from "./context";
import ConditionalProviders from "./providers/ConditionalProviders";

/**
 * Composant principal de l'application
 * AuthProvider est placé en premier pour rendre useAuth disponible
 * ConditionalProviders charge ensuite les providers selon le rôle
 */
const App = () => (
  <AuthProvider>
    <ConditionalProviders>
      <AppRoutes />
    </ConditionalProviders>
  </AuthProvider>
);

export default App;
