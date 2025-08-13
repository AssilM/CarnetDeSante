import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppointmentActions } from "./useAppointmentActions.js";

// Mock des contextes
const mockCancelAppointment = vi.fn();
const mockStartAppointment = vi.fn();
const mockFinishAppointment = vi.fn();
const mockShowNotification = vi.fn();

vi.mock("../context", () => ({
  useDoctorAppointmentContext: () => ({
    cancelAppointment: mockCancelAppointment,
    startAppointment: mockStartAppointment,
    finishAppointment: mockFinishAppointment,
  }),
}));

vi.mock("../context/AppContext", () => ({
  useAppContext: () => ({
    showNotification: mockShowNotification,
  }),
}));

describe("useAppointmentActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("état initial", () => {
    it("retourne les bonnes valeurs initiales", () => {
      // Act
      const { result } = renderHook(() => useAppointmentActions());

      // Assert
      expect(result.current.cancelLoading).toBe(false);
      expect(result.current.actionLoading).toBe(false);
      expect(typeof result.current.handleCancel).toBe("function");
      expect(typeof result.current.handleStartAppointment).toBe("function");
      expect(typeof result.current.handleFinishAppointment).toBe("function");
    });
  });

  describe("handleCancel", () => {
    it("annule un rendez-vous avec succès", async () => {
      // Arrange
      const appointmentId = 1;
      mockCancelAppointment.mockResolvedValue();
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleCancel(appointmentId);
      });

      // Assert
      expect(mockCancelAppointment).toHaveBeenCalledWith(appointmentId);
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "success",
        message: "Rendez-vous annulé avec succès !",
      });
      expect(success).toBe(true);
      expect(result.current.cancelLoading).toBe(false);
    });

    it("gère les erreurs d'annulation", async () => {
      // Arrange
      const appointmentId = 1;
      mockCancelAppointment.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleCancel(appointmentId);
      });

      // Assert
      expect(mockCancelAppointment).toHaveBeenCalledWith(appointmentId);
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Erreur lors de l'annulation du rendez-vous",
      });
      expect(success).toBe(false);
      expect(result.current.cancelLoading).toBe(false);
    });

    it("ne fait rien si appointmentId est absent", async () => {
      // Arrange
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      await act(async () => {
        await result.current.handleCancel(null);
      });

      // Assert
      expect(mockCancelAppointment).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it("gère le loading state correctement", async () => {
      // Arrange
      const appointmentId = 1;
      let resolveCancel;
      mockCancelAppointment.mockReturnValue(
        new Promise((resolve) => {
          resolveCancel = resolve;
        })
      );
      const { result } = renderHook(() => useAppointmentActions());

      // Act - Démarrer l'annulation
      act(() => {
        result.current.handleCancel(appointmentId);
      });

      // Assert - Loading doit être true
      expect(result.current.cancelLoading).toBe(true);

      // Act - Terminer l'annulation
      await act(async () => {
        resolveCancel();
      });

      // Assert - Loading doit être false
      expect(result.current.cancelLoading).toBe(false);
    });
  });

  describe("handleStartAppointment", () => {
    it("démarre un rendez-vous avec succès", async () => {
      // Arrange
      const appointmentId = 1;
      mockStartAppointment.mockResolvedValue(true);
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleStartAppointment(appointmentId);
      });

      // Assert
      expect(mockStartAppointment).toHaveBeenCalledWith(appointmentId);
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "success",
        message: "Rendez-vous démarré avec succès !",
      });
      expect(success).toBe(true);
      expect(result.current.actionLoading).toBe(false);
    });

    it("gère l'échec de démarrage", async () => {
      // Arrange
      const appointmentId = 1;
      mockStartAppointment.mockResolvedValue(false);
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleStartAppointment(appointmentId);
      });

      // Assert
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Erreur lors du démarrage du rendez-vous",
      });
      expect(success).toBe(false);
    });

    it("gère les erreurs d'exception", async () => {
      // Arrange
      const appointmentId = 1;
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockStartAppointment.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleStartAppointment(appointmentId);
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors du démarrage du rendez-vous:",
        expect.any(Error)
      );
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Erreur lors du démarrage du rendez-vous",
      });
      expect(success).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("handleFinishAppointment", () => {
    it("termine un rendez-vous avec succès", async () => {
      // Arrange
      const appointmentId = 1;
      mockFinishAppointment.mockResolvedValue(true);
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleFinishAppointment(appointmentId);
      });

      // Assert
      expect(mockFinishAppointment).toHaveBeenCalledWith(appointmentId);
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "success",
        message: "Rendez-vous terminé avec succès !",
      });
      expect(success).toBe(true);
      expect(result.current.actionLoading).toBe(false);
    });

    it("gère l'échec de finalisation", async () => {
      // Arrange
      const appointmentId = 1;
      mockFinishAppointment.mockResolvedValue(false);
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleFinishAppointment(appointmentId);
      });

      // Assert
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Erreur lors de la finalisation du rendez-vous",
      });
      expect(success).toBe(false);
    });

    it("gère les erreurs d'exception", async () => {
      // Arrange
      const appointmentId = 1;
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFinishAppointment.mockRejectedValue(new Error("Database error"));
      const { result } = renderHook(() => useAppointmentActions());

      // Act
      let success;
      await act(async () => {
        success = await result.current.handleFinishAppointment(appointmentId);
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors de la finalisation du rendez-vous:",
        expect.any(Error)
      );
      expect(mockShowNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Erreur lors de la finalisation du rendez-vous",
      });
      expect(success).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("loading states", () => {
    it("gère actionLoading pour start et finish", async () => {
      // Arrange
      const appointmentId = 1;
      let resolveAction;
      mockStartAppointment.mockReturnValue(
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );
      const { result } = renderHook(() => useAppointmentActions());

      // Act - Démarrer l'action
      act(() => {
        result.current.handleStartAppointment(appointmentId);
      });

      // Assert - Loading doit être true
      expect(result.current.actionLoading).toBe(true);

      // Act - Terminer l'action
      await act(async () => {
        resolveAction(true);
      });

      // Assert - Loading doit être false
      expect(result.current.actionLoading).toBe(false);
    });

    it("les états de loading sont indépendants", async () => {
      // Arrange
      const appointmentId = 1;
      const { result } = renderHook(() => useAppointmentActions());

      // Assert - États initiaux
      expect(result.current.cancelLoading).toBe(false);
      expect(result.current.actionLoading).toBe(false);

      // Act - Simuler une action rapide
      mockStartAppointment.mockResolvedValue(true);
      await act(async () => {
        await result.current.handleStartAppointment(appointmentId);
      });

      // Assert - Seul actionLoading a changé
      expect(result.current.cancelLoading).toBe(false);
      expect(result.current.actionLoading).toBe(false);
    });
  });
});
