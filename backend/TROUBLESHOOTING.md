# Guide de Dépannage - Sécurité des Disponibilités

## Problèmes Courants et Solutions

### 1. Erreur 500 (Internal Server Error)

**Symptômes :**

- Erreurs 500 lors des appels API aux disponibilités
- Messages d'erreur vagues dans le frontend

**Causes possibles :**

- Middlewares de sécurité trop restrictifs
- Validation des entrées qui bloque les requêtes légitimes
- Problèmes de sanitisation des données

**Solutions :**

1. Vérifier les logs du serveur pour identifier l'erreur exacte
2. Tester les endpoints avec le script de test : `node test-endpoints.js`
3. Vérifier que les middlewares sont dans le bon ordre dans les routes

### 2. Erreur 400 (Bad Request) - Validation

**Symptômes :**

- Requêtes rejetées avec des messages de validation
- Formats de données non acceptés
- **Erreur spécifique lors des modifications de disponibilités**

**Causes possibles :**

- Validation trop stricte des formats d'heure
- Validation des IDs trop restrictive
- Paramètres manquants ou mal formatés
- **Format d'heure du frontend (HH:MM) vs backend (HH:MM:SS)**
- **Absence de medecin_id dans le body lors des modifications**

**Solutions :**

1. **Vérifier les formats attendus :**

   - Heures : `HH:MM` ou `HH:MM:SS` (maintenant acceptés tous les deux)
   - IDs : nombres entiers positifs
   - Jours : `lundi`, `mardi`, etc. (en minuscules)

2. **Pour les modifications :** Le `medecin_id` n'est pas requis dans le body (géré par le middleware de propriété)

3. **Formats de données corrects :**

   ```javascript
   // Création
   {
     "medecin_id": 1,
     "jour": "lundi",
     "heure_debut": "09:00",  // HH:MM accepté
     "heure_fin": "17:00"
   }

   // Modification (pas de medecin_id requis)
   {
     "jour": "mardi",
     "heure_debut": "10:00",
     "heure_fin": "18:00"
   }
   ```

4. **Tester avec le script de modification :**
   ```bash
   cd backend
   node test-modification.js
   ```

### 3. Erreur 403 (Forbidden) - Autorisations

**Symptômes :**

- Accès refusé même avec une authentification valide
- Logs de sécurité dans la console

**Causes possibles :**

- Middlewares de propriété trop restrictifs
- Vérification des rôles incorrecte
- Tentative d'accès à des ressources d'un autre utilisateur

**Solutions :**

1. Vérifier les logs `[SECURITY] 403 Forbidden` pour identifier la cause
2. S'assurer que l'utilisateur accède à ses propres ressources
3. Vérifier les rôles et permissions dans `auth.middleware.js`

### 4. Erreur 429 (Too Many Requests) - Rate Limiting

**Symptômes :**

- Requêtes bloquées après un certain nombre d'appels
- Message "Trop de requêtes"

**Causes possibles :**

- Rate limiting trop strict
- Trop de requêtes simultanées depuis la même IP

**Solutions :**

1. Ajuster les limites dans `security.middleware.js`
2. Implémenter un système de cache côté frontend
3. Espacer les requêtes ou utiliser la pagination

### 5. Données Sanitisées Incorrectement

**Symptômes :**

- Caractères supprimés des entrées
- Données modifiées de manière inattendue

**Causes possibles :**

- Sanitisation trop agressive
- Problèmes avec les caractères spéciaux

**Solutions :**

1. Vérifier les règles de sanitisation dans `sanitizeInput`
2. Ajuster les patterns de nettoyage si nécessaire
3. Tester avec différents types de données

## Scripts de Test

### Test des Endpoints Publics

```bash
cd backend
node test-endpoints.js
```

### Test des Opérations CRUD avec Authentification

```bash
cd backend
# Modifier le token dans le script avant l'exécution
node test-modification.js
```

### Test de Sécurité

```bash
cd backend
npm test -- --grep "security"
```

## Logs à Surveiller

### Logs de Sécurité

```
[SECURITY] 403 Forbidden | user=<id> role=<role> | <METHOD> <URL> - <IP>
[SECURITY] Suspicious activity detected | user=<id> | <METHOD> <URL> - <IP>
[SECURITY] Rate limit exceeded | IP=<ip> | <count> requests
```

### Logs d'Audit

```
[AUDIT] Disponibilité créée | ID=<id> | Médecin=<id> | <jour> <heure> | Par user=<id>
[AUDIT] Disponibilité modifiée | ID=<id> | Médecin=<id> | Ancien: <...> | Nouveau: <...>
[AUDIT] Disponibilité supprimée | ID=<id> | Médecin=<id> | <jour> <heure>
```

### Logs de Monitoring

```
[MONITORING] Consultation créneaux | Médecin=<id> | Date=<date> | <count> créneaux | IP=<ip>
```

## Validation des Formats

### Heures Acceptées

- `"09:00"` ✅ (format frontend)
- `"09:00:00"` ✅ (format backend)
- `"9:00"` ❌ (doit être sur 2 chiffres)
- `"25:00"` ❌ (heure invalide)

### Jours Acceptés

- `"lundi"` ✅
- `"Lundi"` ✅ (converti automatiquement)
- `"monday"` ❌ (doit être en français)

### Structure des Données

#### Création de Disponibilité (POST)

```json
{
  "medecin_id": 1,
  "jour": "lundi",
  "heure_debut": "09:00",
  "heure_fin": "17:00"
}
```

#### Modification de Disponibilité (PUT)

```json
{
  "jour": "mardi",
  "heure_debut": "10:00",
  "heure_fin": "18:00"
}
```

## Configuration Recommandée

### Environnement de Développement

- Rate limiting : 100 requêtes/15 minutes
- Logs détaillés activés
- Validation moins stricte

### Environnement de Production

- Rate limiting : 50 requêtes/15 minutes
- Logs de sécurité obligatoires
- Validation stricte
- HTTPS obligatoire

## Désactivation Temporaire (Urgence)

Si les nouvelles fonctionnalités causent des problèmes critiques :

1. **Désactiver la détection d'activité suspecte :**

   ```javascript
   // Dans disponibilite.routes.js, commenter :
   // router.use(detectSuspiciousActivity);
   ```

2. **Désactiver le rate limiting :**

   ```javascript
   // Dans disponibilite.routes.js, commenter :
   // router.use("/medecin/:medecinId/creneaux", rateLimiter(50, 15 * 60 * 1000));
   ```

3. **Désactiver la sanitisation :**
   ```javascript
   // Dans disponibilite.routes.js, commenter :
   // router.use(sanitizeInput);
   ```

⚠️ **Important :** Ces désactivations ne doivent être que temporaires et nécessitent une correction rapide.

## Contact Support

En cas de problème persistant :

1. Collecter les logs d'erreur
2. Identifier les étapes de reproduction
3. Vérifier la configuration des middlewares
4. Tester avec les scripts de test fournis
