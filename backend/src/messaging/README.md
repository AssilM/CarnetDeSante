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
    └── websocket.server.js    # Serveur WebSocket temps réel avec ROOMS
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

## 🔌 WebSocket avec Système de ROOMS

### 🏠 Système de Rooms

Le WebSocket utilise un **système de rooms** pour garantir que seuls les participants autorisés reçoivent les messages :

- **Room par conversation** : Chaque conversation a sa propre room (`conversation_${id}`)
- **Adhésion sécurisée** : Validation des permissions avant de rejoindre une room
- **Diffusion ciblée** : Messages envoyés uniquement aux participants de la room
- **Nettoyage automatique** : Rooms supprimées quand elles sont vides

### Connexion

```javascript
// Connexion avec token JWT
const ws = new WebSocket("ws://localhost:5001?token=JWT_TOKEN");
```

### Gestion des Rooms

#### Rejoindre une Room

```javascript
ws.send(
  JSON.stringify({
    type: "join_room",
    conversationId: 1,
  })
);
```

#### Quitter une Room

```javascript
ws.send(
  JSON.stringify({
    type: "leave_room",
    conversationId: 1,
  })
);
```

### Types de Messages

#### Envoi de Message

```javascript
ws.send(
  JSON.stringify({
    type: "send_message",
    conversationId: 1,
    content: "Bonjour docteur !",
  })
);
```

#### Marquage comme Lu

```javascript
ws.send(
  JSON.stringify({
    type: "mark_as_read",
    conversationId: 1,
  })
);
```

#### Indicateur de Frappe

```javascript
// Début de frappe
ws.send(
  JSON.stringify({
    type: "typing_start",
    conversationId: 1,
  })
);

// Arrêt de frappe
ws.send(
  JSON.stringify({
    type: "typing_stop",
    conversationId: 1,
  })
);
```

### Messages Reçus

#### Confirmation d'Adhésion à une Room

```javascript
{
  type: "room_joined",
  conversationId: 1
}
```

#### Confirmation de Sortie d'une Room

```javascript
{
  type: "room_left",
  conversationId: 1
}
```

#### Nouveau Message

```javascript
{
  type: "new_message",
  message: {
    id: 123,
    conversation_id: 1,
    sender_id: 456,
    content: "Bonjour !",
    sent_at: "2024-01-01T10:00:00Z",
    is_read: false,
    sender_info: {
      id: 456,
      nom: "Dupont",
      prenom: "Jean"
    }
  },
  conversationId: 1
}
```

#### Messages Lus

```javascript
{
  type: "messages_read",
  conversationId: 1,
  userId: 456,
  updatedCount: 5
}
```

#### Indicateur de Frappe

```javascript
{
  type: "typing_start",
  conversationId: 1,
  userId: 456
}
```

## 🚀 Fonctionnalités

### ✅ Implémentées

- [x] **Système de Rooms** : Isolation des conversations par room
- [x] **Adhésion sécurisée** : Validation des permissions avant de rejoindre une room
- [x] **Diffusion ciblée** : Messages envoyés uniquement aux participants
- [x] **Nettoyage automatique** : Rooms supprimées quand vides
- [x] Création de conversations entre patients et médecins liés
- [x] Envoi de messages textuels
- [x] Marquage des messages comme lus
- [x] Comptage des messages non lus
- [x] Recherche d'utilisateurs pour nouvelles conversations
- [x] WebSocket temps réel
- [x] Indicateurs de frappe
- [x] Validation des relations patient-médecin
- [x] Contrôles d'accès par conversation

### 🔄 Logique Métier

#### Gestion des Rooms

1. **Connexion** : L'utilisateur se connecte au WebSocket
2. **Adhésion** : L'utilisateur rejoint une room pour une conversation spécifique
3. **Validation** : Vérification des permissions avant d'adhérer à la room
4. **Diffusion** : Messages envoyés uniquement aux participants de la room
5. **Sortie** : L'utilisateur quitte la room quand il change de conversation
6. **Nettoyage** : Room supprimée automatiquement quand elle est vide

#### Création de Conversation

1. **Validation** : Vérifier que l'utilisateur et l'autre utilisateur sont liés
2. **Création** : Créer la conversation en base
3. **Retour** : Retourner les détails de la conversation

#### Envoi de Message

1. **Validation** : Vérifier l'accès à la conversation
2. **Création** : Sauvegarder le message en base
3. **Diffusion** : Envoyer le message via WebSocket aux participants de la room
4. **Mise à jour** : Actualiser le timestamp de la conversation

#### Affichage des Conversations

- **Filtrage** : Seules les conversations avec au moins un message sont affichées
- **Tri** : Par date du dernier message (plus récent en premier)
- **Comptage** : Nombre de messages non lus par conversation

## 🔧 Configuration

### Variables d'Environnement

```env
# Base de données de messagerie
CHAT_DB_HOST=localhost
CHAT_DB_USER=chatuser
CHAT_DB_PASSWORD=chatpass
CHAT_DB_NAME=chat_db
CHAT_DB_PORT=5433

# JWT pour WebSocket
JWT_SECRET=your_jwt_secret
```

### Initialisation

```javascript
// Dans server.js
import initChatTables from "./data/createChatTables.js";

// Initialiser les tables de messagerie
await initChatTables();
```

## 📊 Performance

### Index Optimisés

- `idx_conversations_patient` : Recherche par patient
- `idx_conversations_doctor` : Recherche par médecin
- `idx_conversations_last_message` : Tri par dernier message
- `idx_messages_conversation` : Messages par conversation
- `idx_messages_sent_at` : Tri chronologique
- `idx_messages_read` : Statut de lecture

### Pagination

- Messages récupérés par lots de 50 par défaut
- Support des paramètres `limit` et `offset`

### Avantages du Système de Rooms

- **Sécurité** : Isolation complète des conversations
- **Performance** : Diffusion ciblée uniquement aux participants
- **Scalabilité** : Gestion efficace des conversations multiples
- **Ressources** : Nettoyage automatique des rooms vides

## 🛡️ Sécurité

### Authentification

- JWT requis pour toutes les routes
- Validation des tokens WebSocket
- Vérification des permissions par conversation

### Validation

- Contenu des messages limité à 1000 caractères
- Validation des relations patient-médecin
- Contrôles d'accès stricts

### Protection

- **Isolation par Room** : Seuls les participants autorisés reçoivent les messages
- Validation des permissions avant d'adhérer à une room
- Pas d'accès aux conversations non autorisées
- Validation des rôles utilisateur
- Sanitisation des données d'entrée

## 📈 Statistiques

Le serveur WebSocket fournit des statistiques en temps réel :

```javascript
// Obtenir les statistiques du serveur
const stats = webSocketServer.getStats();
console.log(stats);
// {
//   connections: 10,    // Nombre de connexions WebSocket actives
//   users: 8,          // Nombre d'utilisateurs connectés
//   rooms: 5           // Nombre de rooms actives
// }
```
