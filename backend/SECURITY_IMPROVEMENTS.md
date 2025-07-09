# Améliorations de Sécurité - Module Disponibilités

## Vue d'ensemble

Ce document détaille les améliorations de sécurité implémentées pour le module de gestion des disponibilités médicales, répondant aux vulnérabilités identifiées et ajoutant des protections supplémentaires pour une application médicale conforme RGPD.

## Vulnérabilités Corrigées

### 1. Contrôle d'accès insuffisant (IDOR)

**Problème :** Accès non autorisé aux ressources d'autres utilisateurs
**Solution :** Middlewares centralisés d'autorisation et de propriété

### 2. Validation des entrées

**Problème :** Formats d'heures et jours non validés
**Solution :** Validation robuste avec normalisation automatique

### 3. Fuite d'information

**Problème :** Vérifications de propriété insuffisantes
**Solution :** Contrôles d'accès granulaires

### 4. Monitoring et logs

**Problème :** Manque de journalisation des actions sensibles
**Solution :** Système d'audit complet avec logs sécurisés

### 5. Rate limiting

**Problème :** Protection contre les attaques DoS manquante
**Solution :** Limitation de débit par IP avec seuils configurables

## Nouvelles Améliorations de Sécurité Avancées

### 6. Contrôle d'accès aux données médicales (RGPD)

**Problème :** Un médecin pourrait accéder aux données d'un autre médecin
**Solution :** Middleware `ensureAuthorizedMedecin`

```javascript
// Middleware de contrôle d'accès spécifique aux médecins
export const ensureAuthorizedMedecin = async (req, res, next) => {
  const targetMedecinId = parseInt(req.params.medecinId || req.body.medecin_id);
  const userId = req.userId;
  const role = req.userRole;

  // Autoriser admins et médecins pour leurs propres données
  if (role === "admin" || (role === "medecin" && userId === targetMedecinId)) {
    return next();
  }

  // Log de sécurité pour tentatives non autorisées
  console.warn(`[SECURITY] Tentative d'accès non autorisé aux données médecin`);
  return res.status(403).json({ message: "Accès non autorisé à ce médecin" });
};
```

**Bénéfices :**

- Conformité RGPD (protection des données personnelles)
- Prévention des fuites de données entre médecins
- Audit des tentatives d'accès non autorisé
- Support des rôles administrateur

### 7. Validation des durées maximales

**Problème :** Plages horaires irréalistes (ex: 24h consécutives)
**Solution :** Limitation à 10 heures maximum

```javascript
// Validation de la durée maximale
const dureeMinutes = finTotalMinutes - debutTotalMinutes;
if (dureeMinutes > 600) {
  // 10 heures = 600 minutes
  return res.status(400).json({
    message:
      "Une plage de disponibilité ne peut pas excéder 10 heures consécutives",
    field: "duree",
    maxDuration: "10 heures",
  });
}
```

**Bénéfices :**

- Prévention des erreurs de saisie
- Respect des réglementations du travail médical
- Amélioration de la qualité des données
- Protection contre les abus

## Architecture de Sécurité

### Ordre des Middlewares (Optimisé)

```javascript
// Routes publiques (consultation)
detectSuspiciousActivity → sanitizeInput → validation → controller

// Routes protégées (création)
detectSuspiciousActivity → sanitizeInput → rateLimiter →
authenticate → authorize → validate → checkBodyOwnership →
ensureAuthorizedMedecin → audit → controller

// Routes protégées (modification/suppression)
detectSuspiciousActivity → sanitizeInput → authenticate →
authorize → validateId → checkOwnership → validate → audit → controller
```

### Contrôles d'Accès Multi-Niveaux

1. **Niveau Application** : `detectSuspiciousActivity`
2. **Niveau Authentification** : `authenticate`
3. **Niveau Autorisation** : `authorize`
4. **Niveau Propriété** : `checkOwnership`
5. **Niveau Médecin** : `ensureAuthorizedMedecin`
6. **Niveau Validation** : `validateData`
7. **Niveau Audit** : `auditAction`

## Exemples d'Implémentation

### Création Sécurisée de Disponibilité

```javascript
// POST /api/disponibilite
router.post(
  "/",
  // 1. Sécurité globale
  detectSuspiciousActivity,
  sanitizeInput,

  // 2. Authentification/Autorisation
  authenticate,
  authorize(["medecin", "admin"]),

  // 3. Validation des données
  validateDisponibilite,

  // 4. Contrôles de propriété
  checkDoctorBodyOwnership(),
  ensureAuthorizedMedecin,

  // 5. Audit
  auditAction("Création de disponibilité", "disponibilite"),

  // 6. Contrôleur
  createDisponibilite
);
```

### Validation Complète

```javascript
// Formats acceptés
{
  "medecin_id": 1,                    // ID numérique positif
  "jour": "lundi",                    // Jour en français
  "heure_debut": "09:00",             // HH:MM ou HH:MM:SS
  "heure_fin": "17:00"                // Max 10h après début
}

// Contraintes
- Durée minimale : 30 minutes
- Durée maximale : 10 heures
- Heures valides : 06:00 à 22:00
- Pas de chevauchement autorisé
```

## Tests de Sécurité

### Tests d'Accès Non Autorisé

```javascript
// Test : Médecin A essaie de créer pour Médecin B
const response = await request(app)
  .post('/api/disponibilite')
  .set('Authorization', `Bearer ${medecinAToken}`)
  .send({ medecin_id: medecinBId, ... });

expect(response.status).toBe(403);
expect(response.body.message).toContain('Accès non autorisé');
```

### Tests de Durée Maximale

```javascript
// Test : Plage de 12 heures (irréaliste)
const response = await request(app).post("/api/disponibilite").send({
  heure_debut: "06:00",
  heure_fin: "18:00", // 12 heures
});

expect(response.status).toBe(400);
expect(response.body.message).toContain("10 heures");
```

## Logs de Sécurité

### Nouveaux Types de Logs

```bash
# Tentatives d'accès non autorisé aux données médecin
[SECURITY] Tentative d'accès non autorisé aux données médecin | user=1 role=medecin | Cible médecin=2 | POST /api/disponibilite - 192.168.1.100

# Validation des durées
[VALIDATION] Durée excessive rejetée | user=1 | 12h demandées (max 10h) | lundi 06:00-18:00

# Accès autorisés
[AUDIT] Disponibilité créée | ID=123 | Médecin=1 | lundi 09:00-17:00 | Par user=1 role=medecin
```

## Conformité et Réglementations

### RGPD (Règlement Général sur la Protection des Données)

- ✅ **Minimisation des données** : Accès limité aux données strictement nécessaires
- ✅ **Intégrité et confidentialité** : Contrôles d'accès granulaires
- ✅ **Responsabilité** : Logs d'audit complets
- ✅ **Transparence** : Messages d'erreur clairs sans fuite d'information

### Réglementations Médicales

- ✅ **Durées de travail** : Limitation à 10h consécutives
- ✅ **Traçabilité** : Audit complet des modifications
- ✅ **Sécurité des données** : Protection contre les accès non autorisés
- ✅ **Qualité des données** : Validation stricte des formats

## Monitoring et Alertes

### Métriques de Sécurité

1. **Tentatives d'accès non autorisé** : Seuil d'alerte à 5/jour/utilisateur
2. **Durées excessives** : Monitoring des tentatives > 10h
3. **Rate limiting** : Surveillance des dépassements de seuil
4. **Erreurs de validation** : Détection des patterns d'attaque

### Alertes Recommandées

```bash
# Alerte critique : Tentatives répétées d'accès non autorisé
if (unauthorized_attempts > 5 per user per day) {
  alert("Possible tentative d'intrusion - Utilisateur ${userId}");
}

# Alerte info : Durées excessives fréquentes
if (excessive_duration_attempts > 10 per day) {
  alert("Formation utilisateur recommandée - Durées maximales");
}
```

## Recommandations Futures

### Améliorations Suggérées

1. **Chiffrement des logs sensibles** : Chiffrer les logs contenant des IDs utilisateurs
2. **Authentification à deux facteurs** : Pour les comptes médecins
3. **Détection d'anomalies** : ML pour détecter les patterns suspects
4. **Backup sécurisé** : Sauvegarde chiffrée des logs d'audit
5. **Tests de pénétration** : Tests réguliers par des experts externes

### Évolutions Techniques

1. **Rate limiting avancé** : Par utilisateur et par endpoint
2. **Géolocalisation** : Validation des connexions par zone géographique
3. **Session management** : Gestion avancée des sessions utilisateur
4. **Audit externe** : Interface pour audits de conformité

## Configuration Recommandée

### Environnement de Production

```javascript
// Sécurité maximale
const securityConfig = {
  rateLimiting: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  validation: {
    strictMode: true,
    maxDuration: 600, // 10 heures
    minDuration: 30, // 30 minutes
  },
  logging: {
    level: "security",
    retention: "2 years", // Conformité RGPD
    encryption: true,
  },
};
```

### Environnement de Développement

```javascript
// Sécurité avec flexibilité pour les tests
const devConfig = {
  rateLimiting: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000,
  },
  validation: {
    strictMode: false,
    maxDuration: 600,
    minDuration: 30,
  },
  logging: {
    level: "debug",
    retention: "30 days",
    encryption: false,
  },
};
```

---

**Date de dernière mise à jour :** 02/01/2025
**Version :** 2.0 (Sécurité Avancée)
**Responsable :** Équipe Sécurité & Conformité
