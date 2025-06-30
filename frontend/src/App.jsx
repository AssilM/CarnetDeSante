import React from "react";
import AppRoutes from "./routes";
import { AuthProvider } from "./context";
import ConditionalProviders from "./providers/ConditionalProviders";
import Notification from "./components/Notification";

/**
 * Composant principal de l'application
 * AuthProvider est placé en premier pour rendre useAuth disponible
 * ConditionalProviders charge ensuite les providers selon le rôle
 */
const App = () => (
  <AuthProvider>
    <ConditionalProviders>
      <Notification />
      <AppRoutes />
    </ConditionalProviders>
  </AuthProvider>
);

export default App;
