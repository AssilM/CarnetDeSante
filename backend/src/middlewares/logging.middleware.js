/**
 * Middleware pour journaliser les requêtes entrantes
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Format de base de la requête
  const logInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };

  // Journaliser la requête entrante
  console.log(`[REQUEST] ${logInfo.method} ${logInfo.url} - ${logInfo.ip}`);

  // Journaliser les données de la requête en mode développement
  if (process.env.NODE_ENV === "development") {
    if (Object.keys(req.body).length > 0) {
      console.log("Body:", JSON.stringify(req.body, null, 2));
    }

    if (Object.keys(req.query).length > 0) {
      console.log("Query:", req.query);
    }

    if (Object.keys(req.params).length > 0) {
      console.log("Params:", req.params);
    }
  }

  // Ajouter un écouteur pour la fin de la réponse
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[RESPONSE] ${logInfo.method} ${logInfo.url} ${res.statusCode} - ${duration}ms`
    );

    // Log sécurité pour les accès interdits (403)
    if (res.statusCode === 403) {
      const securityLog = {
        timestamp: new Date().toISOString(),
        event: "FORBIDDEN_ACCESS",
        status: 403,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.userId || null,
        userRole: req.userRole || null,
      };
      console.warn(
        `[SECURITY] 403 Forbidden | user=${
          securityLog.userId ?? "anonymous"
        } role=${securityLog.userRole ?? "unknown"} | ${securityLog.method} ${
          securityLog.url
        } - ${securityLog.ip}`
      );
    }
  });

  next();
};
