# CarnetDeSante

Application de gestion de carnet de santé numérique permettant aux patients de gérer leurs rendez-vous médicaux et leur historique de santé.

## Structure de la base de données

La base de données utilise une approche simplifiée où l'ID utilisateur est utilisé comme clé primaire dans les tables spécialisées (patient, medecin, administrateur).

### Tables principales

- **utilisateur**: Table centrale contenant les informations générales de tous les utilisateurs

  - **id**: Clé primaire, identifiant unique de l'utilisateur
  - **role**: Type d'utilisateur ('patient', 'medecin', 'admin')
  - Autres informations communes (nom, prénom, email, etc.)

- **patient**: Table des données spécifiques aux patients

  - **utilisateur_id**: Clé primaire et clé étrangère vers utilisateur(id)
  - Informations médicales de base (groupe sanguin, taille, poids)

- **medecin**: Table des données spécifiques aux médecins

  - **utilisateur_id**: Clé primaire et clé étrangère vers utilisateur(id)
  - Informations professionnelles (spécialité, description)

- **administrateur**: Table des données spécifiques aux administrateurs
  - **utilisateur_id**: Clé primaire et clé étrangère vers utilisateur(id)
  - Paramètres d'administration (niveau d'accès)

### Tables associées

- **rendez_vous**: Rendez-vous médicaux

  - Références directes vers patient(utilisateur_id) et medecin(utilisateur_id)

- **disponibilite_medecin**: Créneaux de disponibilité des médecins
  - Référence directe vers medecin(utilisateur_id)

## Architecture de l'application

### Backend (Node.js + Express)

- **Contrôleurs**: Gestion des requêtes HTTP et logique métier
- **Routes**: Définition des points d'entrée de l'API
- **Middlewares**: Authentification et autorisations
- **Services**: Logique métier réutilisable

### Frontend (React)

- **Contexts**: État global et gestion de l'authentification
- **Components**: Interface utilisateur réutilisable
- **Pages**: Écrans principaux de l'application
- **Services**: Communication avec l'API backend

## Installation

### Prérequis

- Node.js (v14+)
- PostgreSQL (v12+)

### Configuration

1. Cloner ce dépôt
2. Installer les dépendances backend et frontend:

```bash
# Installation des dépendances backend
cd backend
npm install

# Installation des dépendances frontend
cd ../frontend
npm install
```

3. Configurer la base de données:

```bash
# Depuis le répertoire backend
npm run db:init
```

### Démarrage

```bash
# Démarrer le backend
cd backend
npm start

# Démarrer le frontend
cd ../frontend
npm run dev
```
