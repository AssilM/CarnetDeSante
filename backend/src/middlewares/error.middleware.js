/**
 * Middleware de gestion d'erreurs centralisé
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Erreur non gérée:", err);
  console.error("Message d'erreur:", err.message);
  console.error("Stack trace:", err.stack);

  if (err.name === "TypeError" && err.message.includes("pool")) {
    console.error("Erreur de connexion à la base de données:", err);
    return res.status(500).json({
      message: "Erreur de connexion à la base de données",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }

  // Erreurs spécifiques à PostgreSQL
  if (err.code) {
    console.error("Erreur PostgreSQL:", {
      code: err.code,
      detail: err.detail,
      table: err.table,
      constraint: err.constraint,
    });

    switch (err.code) {
      // Violation de contrainte d'unicité
      case "23505":
        return res.status(400).json({
          message: "Une entrée avec ces données existe déjà",
          detail: err.detail,
        });

      // Erreur de syntaxe SQL
      case "22P02":
        return res.status(400).json({
          message: "Format de données invalide",
          detail: err.detail,
        });

      // Violation de contrainte de clé étrangère
      case "23503":
        return res.status(400).json({
          message: "Référence à une entité qui n'existe pas",
          detail: err.detail,
        });

      // Erreur de connexion à la base de données
      case "ECONNREFUSED":
      case "ETIMEDOUT":
      case "57P01": // Serveur de base de données arrêté
      case "57P03": // Base de données indisponible
        return res.status(503).json({
          message: "La base de données est actuellement indisponible",
          error:
            process.env.NODE_ENV === "production" ? undefined : err.message,
        });
    }
  }

  // Erreur par défaut
  res.status(500).json({
    message: "Une erreur interne est survenue",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

/**
 * Middleware pour capturer les routes non trouvées
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
  });
};
