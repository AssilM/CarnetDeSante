# 🏥 CarnetDeSante

Une application web moderne de carnet de santé numérique permettant aux patients de gérer leur dossier médical et aux professionnels de santé de suivre leurs patients.

## ✨ Fonctionnalités

### 👤 Pour les Patients

- **Profil médical complet** : Informations personnelles, allergies, antécédents médicaux
- **Gestion des rendez-vous** : Prise de rendez-vous en ligne avec les médecins
- **Documents médicaux** : Upload et stockage sécurisé de documents
- **Carnet de vaccination** : Suivi des vaccinations
- **Paramètres de compte** : Modification des informations personnelles

### 👨‍⚕️ Pour les Médecins

- **Tableau de bord professionnel** : Vue d'ensemble des patients et rendez-vous
- **Gestion des disponibilités** : Configuration des créneaux de consultation
- **Suivi des patients** : Accès aux dossiers médicaux des patients

### 👨‍💼 Pour les Administrateurs

- **Gestion globale** : Supervision de la plateforme
- **Administration des utilisateurs** : Gestion des comptes patients et médecins

## 🛠️ Technologies

### Backend

- **Node.js** + **Express** - API REST
- **PostgreSQL** - Base de données
- **JWT** - Authentification sécurisée
- **bcrypt** - Chiffrement des mots de passe
- **Multer** - Gestion des uploads de fichiers

### Frontend

- **React 19** - Interface utilisateur moderne
- **Vite** - Bundler rapide
- **Tailwind CSS** - Design system responsive
- **React Router** - Navigation
- **Axios** - Client HTTP

## 🚀 Installation

### Prérequis

- Node.js (v18 ou plus récent)
- PostgreSQL
- npm ou yarn

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/CarnetDeSante.git
cd CarnetDeSante
```

### 2. Installation des dépendances

```bash
# Dépendances racine
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configuration de la base de données

```bash
# Dans le dossier backend
cd backend

# Initialiser la base de données
npm run init-db
```

### 4. Variables d'environnement

Créez un fichier `.env` dans le dossier `backend` :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carnet_sante
DB_USER=votre_user
DB_PASSWORD=votre_password

# JWT
JWT_SECRET=votre_jwt_secret
JWT_REFRESH_SECRET=votre_refresh_secret
ACCESS_TOKEN_EXPIRES=15m

# Application
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 5. Lancement de l'application

**Démarrage du backend :**

```bash
cd backend
npm run dev
```

**Démarrage du frontend :**

```bash
cd frontend
npm run dev
```

L'application sera accessible sur :

- Frontend : http://localhost:5173
- Backend API : http://localhost:3001

## 📁 Structure du projet

```
CarnetDeSante/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/         # Routes API
│   │   ├── middlewares/    # Middlewares (auth, validation)
│   │   ├── data/          # Scripts BDD et seeders
│   │   └── config/        # Configuration
│   └── uploads/           # Fichiers uploadés
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── context/      # Contextes React
│   │   ├── services/     # Services API
│   │   └── routes/       # Configuration des routes
│   └── public/
└── README.md
```

## 🔒 Sécurite

- **Authentification JWT** avec tokens d'accès et de rafraîchissement
- **Hachage des mots de passe** avec bcrypt
- **Validation des entrées** côté client et serveur
- **Protection des routes** basée sur les rôles utilisateur
- **Cookies sécurisés** pour les tokens de rafraîchissement

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
