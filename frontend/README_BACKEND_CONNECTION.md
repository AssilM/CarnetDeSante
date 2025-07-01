# Guide de Connexion Backend-Frontend

## Prérequis

1. **Base de données PostgreSQL** : Assurez-vous que PostgreSQL est installé et en cours d'exécution
2. **Variables d'environnement** : Configurez les variables d'environnement dans le fichier `.env` du backend

## Démarrage du Backend

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer la base de données

Assurez-vous que votre fichier `.env` dans le dossier `backend` contient les bonnes informations de connexion à la base de données :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carnet_sante
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
PORT=5001
```

### 3. Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Ou mode production
npm start
```

Le serveur devrait démarrer sur `http://localhost:5001`

## Test de la Connexion

### 1. Vérifier que le serveur répond

Ouvrez votre navigateur et allez sur `http://localhost:5001`
Vous devriez voir : "API Carnet de Santé Virtuel"

### 2. Tester l'API

```bash
# Test de l'endpoint de santé
curl http://localhost:5001/api/

# Test de l'authentification (si vous avez un token)
curl -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:5001/api/user/profile
```

## Utilisation de l'Interface de Test

Une fois le frontend démarré, vous pouvez utiliser les boutons de test dans l'interface du médecin :

### Boutons disponibles :

1. **Test Connexion** : Vérifie si le backend est accessible
2. **Test Rendez-vous** : Teste la récupération des rendez-vous du médecin connecté
3. **Créer Données Test** : Crée des rendez-vous de test pour le médecin

### Interprétation des résultats :

#### Test de Connexion Réussi :

```json
{
  "success": true,
  "server": "accessible",
  "auth": "valid",
  "user": { ... }
}
```

#### Erreur de Connexion :

```json
{
  "success": false,
  "server": "unreachable",
  "auth": "unknown",
  "error": "Le serveur backend n'est pas accessible. Vérifiez qu'il est démarré sur le port 5001."
}
```

## Résolution des Problèmes Courants

### 1. Erreur "ECONNREFUSED"

- Vérifiez que le backend est démarré
- Vérifiez que le port 5001 n'est pas utilisé par une autre application
- Vérifiez les logs du serveur pour des erreurs

### 2. Erreur d'authentification

- Vérifiez que vous êtes connecté dans le frontend
- Vérifiez que le token JWT est valide
- Vérifiez la configuration JWT_SECRET dans le backend

### 3. Erreur de base de données

- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les informations de connexion dans le fichier `.env`
- Vérifiez que la base de données `carnet_sante` existe

### 4. Erreur CORS

- Le backend est configuré pour accepter les requêtes CORS
- Si vous avez des problèmes, vérifiez la configuration dans `backend/src/app.js`

## Logs de Débogage

Le frontend affiche maintenant des informations de débogage détaillées :

- **Informations de débogage** : Affiche l'état de l'utilisateur, le nombre de rendez-vous, etc.
- **Résultats de test** : Affiche les résultats des tests de connexion en temps réel
- **Console du navigateur** : Contient des logs détaillés pour le débogage

## Structure des Données

### Format des Rendez-vous

```json
{
  "id": 1,
  "patient_id": 1,
  "medecin_id": 2,
  "date": "2024-12-20",
  "heure": "09:00",
  "duree": 30,
  "statut": "confirmé",
  "motif": "Consultation de routine",
  "adresse": "Cabinet médical",
  "patient_nom": "Dupont",
  "patient_prenom": "Jean"
}
```

### Endpoints API Utilisés

- `GET /api/rendez-vous/medecin/:medecinId` - Récupérer les rendez-vous d'un médecin
- `POST /api/rendez-vous` - Créer un nouveau rendez-vous
- `PUT /api/rendez-vous/:id/annuler` - Annuler un rendez-vous
- `PUT /api/rendez-vous/:id/confirm` - Confirmer un rendez-vous

## Prochaines Étapes

Une fois la connexion établie et testée :

1. Supprimez les sections de débogage de l'interface
2. Optimisez les performances si nécessaire
3. Ajoutez des fonctionnalités supplémentaires (filtres, recherche, etc.)
4. Implémentez la gestion des erreurs en production
