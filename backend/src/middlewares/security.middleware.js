/**
 * Middleware de sécurité pour l'audit et la protection
 */

/**
 * Middleware pour logger les actions sensibles
 * @param {string} action - Description de l'action effectuée
 * @param {string} resourceType - Type de ressource (disponibilite, rendez-vous, etc.)
 */
export const auditAction = (action, resourceType) => {
  return (req, res, next) => {
    // Stocker les informations d'audit dans la requête
    req.auditInfo = {
      action,
      resourceType,
      timestamp: new Date().toISOString(),
      userId: req.userId,
      userRole: req.userRole,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      method: req.method,
      url: req.originalUrl,
    };

    // Ajouter un écouteur pour logger après la réponse
    res.on("finish", () => {
      const auditLog = {
        ...req.auditInfo,
        statusCode: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300,
      };

      // Logger toutes les actions sensibles
      if (auditLog.success) {
        console.log(
          `[AUDIT] ${auditLog.action} | user=${auditLog.userId} role=${auditLog.userRole} | ${auditLog.method} ${auditLog.url} - ${auditLog.statusCode} - ${auditLog.ip}`
        );
      } else {
        console.warn(
          `[AUDIT-FAILED] ${auditLog.action} | user=${auditLog.userId} role=${auditLog.userRole} | ${auditLog.method} ${auditLog.url} - ${auditLog.statusCode} - ${auditLog.ip}`
        );
      }
    });

    next();
  };
};

/**
 * Middleware de rate limiting simple basé sur IP
 * @param {number} maxRequests - Nombre maximum de requêtes par fenêtre
 * @param {number} windowMs - Durée de la fenêtre en millisecondes
 */
export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    // Nettoyer les anciennes entrées
    for (const [ip, data] of requests.entries()) {
      if (now - data.firstRequest > windowMs) {
        requests.delete(ip);
      }
    }

    // Vérifier les requêtes pour cette IP
    if (!requests.has(key)) {
      requests.set(key, {
        count: 1,
        firstRequest: now,
      });
    } else {
      const data = requests.get(key);

      // Si la fenêtre est expirée, réinitialiser
      if (now - data.firstRequest > windowMs) {
        requests.set(key, {
          count: 1,
          firstRequest: now,
        });
      } else {
        data.count++;

        // Vérifier si la limite est dépassée
        if (data.count > maxRequests) {
          console.warn(
            `[SECURITY] Rate limit exceeded | IP=${key} | ${
              data.count
            } requests in ${Math.round((now - data.firstRequest) / 1000)}s`
          );

          return res.status(429).json({
            message: "Trop de requêtes. Veuillez réessayer plus tard.",
            retryAfter: Math.ceil(
              (windowMs - (now - data.firstRequest)) / 1000
            ),
          });
        }
      }
    }

    next();
  };
};

// ❌ FONCTION SUPPRIMÉE : preventTimingAttacks
// Raison: Code mort, jamais utilisée dans le projet

/**
 * Middleware pour détecter les tentatives d'accès suspicieuses
 */
export const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    // Tentatives d'injection SQL
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    // Tentatives XSS
    /<script[^>]*>.*?<\/script>/gi,
    // Tentatives de traversée de répertoire
    /\.\.\//g,
    // Tentatives d'inclusion de fichiers
    /\b(include|require|import)\s*\(/i,
  ];

  const checkValue = (value) => {
    if (typeof value === "string") {
      return suspiciousPatterns.some((pattern) => pattern.test(value));
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  // Vérifier les paramètres, query et body
  const suspicious =
    checkValue(req.params) || checkValue(req.query) || checkValue(req.body);

  if (suspicious) {
    console.warn(
      `[SECURITY] Suspicious activity detected | user=${
        req.userId || "anonymous"
      } role=${req.userRole || "unknown"} | ${req.method} ${
        req.originalUrl
      } - ${req.ip}`
    );

    // Optionnel : bloquer la requête
    return res.status(400).json({
      message: "Requête invalide détectée",
    });
  }

  next();
};

// ❌ FONCTION SUPPRIMÉE : validateCSRF
// Raison: Code mort, système CSRF jamais implémenté

/**
 * Middleware pour nettoyer et valider les entrées
 */
export const sanitizeInput = (req, res, next) => {
  try {
    const sanitizeValue = (value) => {
      if (typeof value === "string") {
        // Supprimer les caractères potentiellement dangereux
        return value
          .replace(/[<>]/g, "") // Supprimer < et >
          .trim(); // Supprimer les espaces en début/fin
      }
      return value;
    };

    const sanitizeObject = (obj) => {
      if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = sanitizeValue(value);
          }
        }
        return sanitized;
      }
      return sanitizeValue(obj);
    };

    // Nettoyer les entrées de manière sécurisée
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query);
    }

    // Ne pas modifier req.params car cela peut casser le routing
    // Les params sont déjà validés par les middlewares de validation

    next();
  } catch (error) {
    console.error("Erreur dans sanitizeInput:", error);
    next(); // Continuer même en cas d'erreur de sanitisation
  }
};

// ❌ FONCTION SUPPRIMÉE : ensureAuthorizedMedecin
// Raison: Redondante avec ownership.middleware.js (restrictDoctorToSelf)
