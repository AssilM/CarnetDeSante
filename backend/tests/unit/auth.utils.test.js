import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  hashPassword,
  comparePassword,
} from "../../src/utils/auth.utils.js";

// Mock des variables d'environnement pour les tests
vi.stubEnv("JWT_SECRET", "test_secret_jwt_very_long_for_testing");
vi.stubEnv(
  "JWT_REFRESH_SECRET",
  "test_refresh_secret_jwt_very_long_for_testing"
);
vi.stubEnv("ACCESS_TOKEN_EXPIRES", "900");
vi.stubEnv("NODE_ENV", "test");

describe("auth.utils", () => {
  describe("generateAccessToken", () => {
    it("génère un token JWT avec les bonnes données", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: "patient",
      };

      const token = generateAccessToken(user);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // Format JWT : header.payload.signature

      // Vérifier le contenu du token
      const decoded = jwt.verify(
        token,
        "test_secret_jwt_very_long_for_testing"
      );
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.exp).toBeDefined(); // Expiration présente
    });

    it("utilise la durée d'expiration de l'environnement", () => {
      const user = { id: 1, email: "test@example.com", role: "patient" };
      const token = generateAccessToken(user);

      const decoded = jwt.verify(
        token,
        "test_secret_jwt_very_long_for_testing"
      );
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 900; // 900 secondes

      // Tolérance de quelques secondes pour l'exécution du test
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
    });
  });

  describe("generateRefreshToken", () => {
    it("génère un refresh token avec l'ID utilisateur", () => {
      const userId = 42;
      const token = generateRefreshToken(userId);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      // Vérifier le contenu
      const decoded = jwt.verify(
        token,
        "test_refresh_secret_jwt_very_long_for_testing"
      );
      expect(decoded.id).toBe(userId);
      expect(decoded.exp).toBeDefined();
    });

    it("utilise le secret de refresh token", () => {
      const userId = 1;
      const token = generateRefreshToken(userId);

      // Vérifier qu'on ne peut pas décoder avec le secret normal
      expect(() => {
        jwt.verify(token, "test_secret_jwt_very_long_for_testing");
      }).toThrow();

      // Mais qu'on peut avec le refresh secret
      expect(() => {
        jwt.verify(token, "test_refresh_secret_jwt_very_long_for_testing");
      }).not.toThrow();
    });
  });

  describe("setRefreshTokenCookie", () => {
    it("définit le cookie avec les bonnes options", () => {
      const mockRes = {
        cookie: vi.fn(),
      };
      const token = "test_refresh_token";

      setRefreshTokenCookie(mockRes, token);

      expect(mockRes.cookie).toHaveBeenCalledWith("jid", token, {
        httpOnly: true,
        secure: false, // NODE_ENV = test
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
      });
    });

    it("utilise secure=true en production", () => {
      // Temporairement changer l'environnement
      vi.stubEnv("NODE_ENV", "production");

      const mockRes = {
        cookie: vi.fn(),
      };
      const token = "test_refresh_token";

      setRefreshTokenCookie(mockRes, token);

      expect(mockRes.cookie).toHaveBeenCalledWith("jid", token, {
        httpOnly: true,
        secure: true, // NODE_ENV = production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Remettre en test
      vi.stubEnv("NODE_ENV", "test");
    });
  });

  describe("hashPassword", () => {
    it("hash un mot de passe", async () => {
      const plainPassword = "MonMotDePasse123!";
      const hashedPassword = await hashPassword(plainPassword);

      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // Hash bcrypt typique
      expect(hashedPassword.startsWith("$2")).toBe(true); // Format bcrypt
    });

    it("génère des hash différents pour le même mot de passe", async () => {
      const plainPassword = "MonMotDePasse123!";
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // Salt différent à chaque fois
    });
  });

  describe("comparePassword", () => {
    it("valide un mot de passe correct", async () => {
      const plainPassword = "MonMotDePasse123!";
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await comparePassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("rejette un mot de passe incorrect", async () => {
      const plainPassword = "MonMotDePasse123!";
      const wrongPassword = "MauvaisMotDePasse456!";
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it("rejette si le hash est invalide", async () => {
      const plainPassword = "MonMotDePasse123!";
      const invalidHash = "invalid_hash";

      const isValid = await comparePassword(plainPassword, invalidHash);
      expect(isValid).toBe(false);
    });
  });

  describe("intégration hash/compare", () => {
    it("cycle complet : hash puis compare", async () => {
      const passwords = [
        "SimplePassword123!",
        "Très Long Mot De Passe Avec Espaces 456@",
        "P@ssW0rd!",
        "àéèêëîïôöùûüç123!", // Accents
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        expect(await comparePassword(password, hash)).toBe(true);
        expect(await comparePassword(password + "wrong", hash)).toBe(false);
      }
    });
  });
});
