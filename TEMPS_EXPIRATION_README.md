# Configuration du temps d'expiration des sessions

Ce document explique comment configurer le temps d'expiration des sessions dans l'application CarnetDeSante.

## Vue d'ensemble

Le système utilise un mécanisme à deux niveaux pour gérer l'expiration des sessions:

1. Le backend génère des tokens JWT avec une durée de vie limitée
2. Le frontend déconnecte l'utilisateur après un délai d'inactivité

Ces deux durées doivent être synchronisées pour un comportement cohérent.

## Modification du temps d'expiration

### Backend

Dans le fichier `backend/src/controllers/auth.controller.js`:

```javascript
// Récupérer la durée d'expiration du token depuis les variables d'environnement (en secondes)
const TEMPS_EXPIRATION = process.env.TEMPS_EXPIRATION || 20;
```

Pour modifier cette valeur:

- Créez ou modifiez un fichier `.env` dans le dossier `backend/`
- Ajoutez la ligne: `TEMPS_EXPIRATION=600` (pour 10 minutes par exemple)

### Frontend

Dans le fichier `frontend/src/context/AuthContext.jsx`:

```javascript
// CONFIGURATION GLOBALE - Durée d'expiration en secondes
const TEMPS_EXPIRATION = 20;
```

Pour modifier cette valeur:

- Modifiez directement la constante `TEMPS_EXPIRATION` dans le fichier
- **IMPORTANT**: Cette valeur doit être synchronisée avec celle du backend

## Valeurs recommandées

- Pour les tests: 20-30 secondes
- Pour la production: 900 secondes (15 minutes) à 1800 secondes (30 minutes)

## Comportement attendu

- Le token JWT expirera après le temps défini
- L'utilisateur sera déconnecté après ce même délai d'inactivité
- Toute activité utilisateur (clic, frappe, etc.) réinitialise le compteur d'inactivité
