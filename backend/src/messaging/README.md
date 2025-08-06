# 📱 Système de Messagerie en Temps Réel

## 🏗️ Architecture

Le système de messagerie suit l'architecture **Repository-Service-Controller** existante dans le projet :

```
messaging/
├── messaging.repository.js    # Accès aux données
├── messaging.service.js       # Logique métier
├── messaging.controller.js    # Gestion HTTP
├── messaging.routes.js        # Routes API
├── index.js                   # Export des routes
└── websocket/
    └── websocket.server.js    # Serveur Socket.IO temps réel avec ROOMS
```

## 🗄️ Structure de Base de Données

### Tables Principales

#### `conversations`

```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (patient_id, doctor_id)
);
```

#### `messages`

```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);
```

## 🔐 Sécurité et Contrôles d'Accès

### Relations Patient-Médecin

- **Seuls les patients et médecins liés** peuvent créer des conversations
- Utilisation de la table `patient_doctor` existante
- Validation stricte des relations avant création

### Contrôles d'Accès

- Authentification JWT requise pour toutes les routes
- Vérification des permissions par conversation
- Validation des rôles utilisateur (patient/medecin)

## 📡 API REST

### Conversations

| Méthode | Endpoint                           | Description                |
| ------- | ---------------------------------- | -------------------------- |
| `POST`  | `/api/messaging/conversations`     | Créer une conversation     |
| `GET`   | `/api/messaging/conversations`     | Lister les conversations   |
| `GET`   | `/api/messaging/conversations/:id` | Détails d'une conversation |

### Messages

| Méthode | Endpoint                                    | Description                |
| ------- | ------------------------------------------- | -------------------------- |
| `POST`  | `/api/messaging/conversations/:id/messages` | Envoyer un message         |
| `GET`   | `/api/messaging/conversations/:id/messages` | Récupérer les messages     |
| `GET`   | `/api/messaging/unread-count`               | Nombre de messages non lus |

### Recherche

| Méthode | Endpoint                         | Description                 |
| ------- | -------------------------------- | --------------------------- |
| `GET`   | `/api/messaging/search-users`    | Rechercher des utilisateurs |
| `GET`   | `/api/messaging/available-users` | Utilisateurs disponibles    |

## 🔌 Socket.IO avec Système de ROOMS

### 🏠 Système de Rooms

Le Socket.IO utilise un **système de rooms** pour garantir que seuls les participants autorisés reçoivent les messages :

- **Room par conversation** : Chaque conversation a sa propre room (`conversation_${id}`)
- **Adhésion sécurisée** : Validation des permissions avant de rejoindre une room
- **Diffusion ciblée** : Messages envoyés uniquement aux participants de la room
- **Nettoyage automatique** : Rooms supprimées quand elles sont vides

### Connexion

```javascript
// Connexion avec token JWT
const socket = io("http://localhost:5001", {
  auth: { token: JWT_TOKEN },
});
```

### Gestion des Rooms

#### Rejoindre une Room

```javascript
socket.emit("join_room", {
  conversationId: 1,
});
```

#### Quitter une Room

```javascript
socket.emit("leave_room", {
  conversationId: 1,
});
```

### Événements Socket.IO

#### Événements Client → Serveur

| Événement      | Données                       | Description        |
| -------------- | ----------------------------- | ------------------ |
| `join_room`    | `{ conversationId }`          | Rejoindre une room |
| `leave_room`   | `{ conversationId }`          | Quitter une room   |
| `send_message` | `{ conversationId, content }` | Envoyer un message |
| `mark_as_read` | `{ conversationId }`          | Marquer comme lu   |
| `typing_start` | `{ conversationId }`          | Début de frappe    |
| `typing_stop`  | `{ conversationId }`          | Arrêt de frappe    |

#### Événements Serveur → Client

| Événement                | Données                                    | Description       |
| ------------------------ | ------------------------------------------ | ----------------- |
| `connection_established` | `{ userId, userRole }`                     | Connexion établie |
| `room_joined`            | `{ conversationId }`                       | Room rejointe     |
| `room_left`              | `{ conversationId }`                       | Room quittée      |
| `new_message`            | `{ message, conversationId }`              | Nouveau message   |
| `messages_read`          | `{ conversationId, userId, updatedCount }` | Messages lus      |
| `typing_start`           | `{ conversationId, userId }`               | Début de frappe   |
| `typing_stop`            | `{ conversationId, userId }`               | Arrêt de frappe   |
| `error`                  | `{ message }`                              | Erreur            |

## 🔧 Configuration

### Backend

```javascript
// Initialisation du serveur Socket.IO
import socketIOServer from "./messaging/websocket/websocket.server.js";

const server = createServer(app);
socketIOServer.initialize(server);
```

### Frontend

```javascript
// Client Socket.IO
import messagingSocket from "../services/websocket/messagingSocket";

// Connexion
messagingSocket.connect();

// Écouter les événements
messagingSocket.on("new_message", (data) => {
  console.log("Nouveau message:", data);
});

// Envoyer un message
messagingSocket.sendMessage(conversationId, "Hello!");
```

## 🚀 Fonctionnalités

### ✅ Implémentées

- [x] API REST complète
- [x] Socket.IO temps réel
- [x] Système de rooms sécurisé
- [x] Authentification JWT
- [x] Gestion des messages
- [x] Indicateurs de frappe
- [x] Marquage comme lu
- [x] Recherche d'utilisateurs
- [x] Validation des permissions
- [x] Gestion des erreurs
- [x] Reconnexion automatique

## 🔄 Flux de Communication

### 1. Connexion

1. **Connexion** : L'utilisateur se connecte au Socket.IO
2. **Authentification** : Validation du token JWT
3. **Confirmation** : Envoi de `connection_established`

### 2. Rejoindre une Conversation

1. **Demande** : Client envoie `join_room` avec `conversationId`
2. **Validation** : Vérification des permissions
3. **Adhésion** : Ajout à la room Socket.IO
4. **Confirmation** : Envoi de `room_joined`

### 3. Envoi de Message

1. **Envoi** : Client envoie `send_message`
2. **Validation** : Vérification des permissions
3. **Sauvegarde** : Création en base de données
4. **Diffusion** : Envoi du message via Socket.IO aux participants de la room

## 🔒 Sécurité

### Authentification

- **JWT pour Socket.IO** : Token transmis via `auth.token`
- **Validation côté serveur** : Vérification de chaque requête
- **Gestion des erreurs** : Déconnexion automatique en cas d'échec

### Autorisations

- **Vérification des conversations** : Seuls les participants peuvent accéder
- **Validation des rôles** : Patient/médecin avec permissions appropriées
- **Isolation des rooms** : Messages isolés par conversation

## 📊 Monitoring

Le serveur Socket.IO fournit des statistiques en temps réel :

```javascript
const stats = socketIOServer.getStats();
// {
//   connections: 10,    // Nombre de connexions Socket.IO actives
//   users: 8,          // Nombre d'utilisateurs uniques connectés
//   multipleConnections: 2, // Utilisateurs avec plusieurs connexions
//   connectionDetails: { "123": 2, "456": 3 } // Détails des connexions multiples
// }
```

## 🛠️ Développement

### Installation des Dépendances

```bash
# Backend
npm install socket.io

# Frontend
npm install socket.io-client
```

### Démarrage

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

### Tests

Le système est testé avec :

- **Authentification** : Validation des tokens JWT
- **Permissions** : Accès aux conversations
- **Rooms** : Adhésion et sortie des rooms
- **Messages** : Envoi et réception en temps réel
- **Erreurs** : Gestion des cas d'erreur
