import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Configuration de l'environnement
    environment: "node",

    // Variables d'environnement pour les tests
    env: {
      NODE_ENV: "test",
    },

    // Setup files - fichiers exécutés avant chaque test
    setupFiles: ["./tests/setup.js"],

    // Timeout par défaut (30s pour les tests d'intégration avec DB)
    testTimeout: 30000,

    // Patterns pour trouver les fichiers de test
    include: ["tests/**/*.test.js", "src/**/*.test.js"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.js"],
      exclude: [
        "src/server.js", // Point d'entrée, pas de logique métier
        "src/data/**", // Scripts de setup DB
        "src/config/**", // Configuration simple
        "**/*.test.js",
      ],
    },

    // Pool configuration pour les tests parallèles
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },

  // Résolution des imports
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
