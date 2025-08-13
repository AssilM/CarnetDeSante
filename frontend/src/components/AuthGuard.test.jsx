import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthGuard } from "./AuthGuard.jsx";

// Mock du contexte Auth
const mockUseAuth = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de Navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to, replace }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate" data-to={to} data-replace={replace} />;
    },
  };
});

// Wrapper pour les tests
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AuthGuard", () => {
  const TestComponent = () => (
    <div data-testid="test-content">Test Content</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("état de chargement", () => {
    it("affiche un spinner pendant le chargement", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: null,
        loading: true,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });
  });

  describe("utilisateur non connecté", () => {
    it("affiche le contenu enfant quand aucun utilisateur connecté", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: null,
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
    });
  });

  describe("redirection selon le rôle", () => {
    it("redirige un patient vers /patient/home", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: {
          id: 1,
          email: "patient@test.com",
          role: "patient",
        },
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-to", "/patient/home");
      expect(navigate).toHaveAttribute("data-replace", "true");
      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("redirige un médecin vers /doctor/home", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: {
          id: 2,
          email: "medecin@test.com",
          role: "medecin",
        },
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-to", "/doctor/home");
      expect(navigate).toHaveAttribute("data-replace", "true");
    });

    it("redirige un admin vers /admin/home", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: {
          id: 3,
          email: "admin@test.com",
          role: "admin",
        },
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-to", "/admin/home");
      expect(navigate).toHaveAttribute("data-replace", "true");
    });

    it("redirige vers login pour un rôle inconnu", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: {
          id: 4,
          email: "unknown@test.com",
          role: "unknown-role",
        },
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-to", "/auth/login");
      expect(navigate).toHaveAttribute("data-replace", "true");
    });

    it("redirige vers login si currentUser sans rôle", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: {
          id: 5,
          email: "norole@test.com",
          // Pas de propriété role
        },
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-to", "/auth/login");
      expect(navigate).toHaveAttribute("data-replace", "true");
    });
  });

  describe("gestion des cas limites", () => {
    it("gère le cas où currentUser est un objet vide", () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        currentUser: {},
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-to", "/auth/login");
    });

    it("utilise replace=true pour toutes les redirections", () => {
      // Arrange - Test un rôle spécifique
      mockUseAuth.mockReturnValue({
        currentUser: { id: 1, role: "patient" },
        loading: false,
      });

      // Act
      renderWithRouter(
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      );

      // Assert
      const navigate = screen.getByTestId("navigate");
      expect(navigate).toHaveAttribute("data-replace", "true");
    });
  });
});
