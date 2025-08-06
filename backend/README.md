# Backend - Carnet de Santé Virtuel

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

## Base de Données

### Initialisation Automatique

Le système réinitialise automatiquement les deux bases de données au démarrage du serveur :

- **Tables principales** : utilisateurs, patients, médecins, rendez-vous, documents, etc.
- **Tables de messagerie** : conversations et messages
- **Fonctions et triggers** : notifications en temps réel

### Architecture de la Base de Données

Le système utilise une architecture centralisée avec :
- `createTables.js` : Création de toutes les tables principales
- `createMessagingTables.js` : Création des tables de messagerie
- `notificationFunctions.js` : Fonctions de notification
- `notificationTriggers.js` : Triggers de notification

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## Structure du Projet

```
backend/
├── src/
│   ├── data/           # Initialisation et maintenance de la DB
│   ├── config/         # Configuration de la base de données
│   ├── routes/         # Routes de l'API
│   ├── controllers/    # Contrôleurs
│   ├── services/       # Services métier
│   ├── middlewares/    # Middlewares
│   ├── utils/          # Utilitaires
│   └── websocket/      # Serveur WebSocket
├── uploads/            # Fichiers uploadés
└── package.json
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Modifier le profil

### Rendez-vous
- `GET /api/rendez-vous` - Liste des rendez-vous
- `POST /api/rendez-vous` - Créer un rendez-vous
- `PUT /api/rendez-vous/:id` - Modifier un rendez-vous
- `DELETE /api/rendez-vous/:id` - Supprimer un rendez-vous

### Documents
- `GET /api/documents` - Liste des documents
- `POST /api/documents` - Uploader un document
- `DELETE /api/documents/:id` - Supprimer un document

### Messagerie
- `GET /api/messaging/conversations` - Conversations
- `GET /api/messaging/messages/:conversationId` - Messages d'une conversation
- `POST /api/messaging/messages` - Envoyer un message

## WebSocket

Le serveur WebSocket est automatiquement initialisé et gère les événements de messagerie en temps réel.

## Notifications

Le système de notifications utilise PostgreSQL pour déclencher des événements en temps réel via WebSocket. 