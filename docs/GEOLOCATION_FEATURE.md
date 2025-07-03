# Fonctionnalité de Géolocalisation pour Médecins

## Vue d'ensemble

Cette fonctionnalité permet aux médecins de renseigner obligatoirement leur localisation lors de l'inscription et de la modifier dans leurs paramètres. Elle est spécialement adaptée au contexte africain, notamment pour Lomé, Togo.

## Caractéristiques

### ✨ Fonctionnalités principales

- **Localisation obligatoire** : Les médecins doivent obligatoirement renseigner leur localisation lors de l'inscription
- **Minicarte interactive** : Interface avec carte Leaflet pour sélectionner la position
- **Géolocalisation automatique** : Bouton pour détecter automatiquement la position actuelle
- **Adresse contextualisée** : Système d'adresse adapté au contexte africain (description + ville)
- **Coordonnées GPS** : Sauvegarde des coordonnées latitude/longitude précises

### 🌍 Adaptation au contexte africain

- **Villes prédéfinies** : Liste des principales villes du Togo (Lomé, Kara, Sokodé, etc.)
- **Description par quartier** : Possibilité de décrire la localisation par quartier et points de repère
- **Coordonnées par défaut** : Centré sur Lomé (6.1319, 1.2228)
- **Format d'adresse simplifié** : "Description, Ville" au lieu du format postal traditionnel

## Structure des fichiers

### Frontend

```
frontend/src/
├── components/doctor/
│   └── LocationPicker.jsx          # Composant de sélection de localisation
├── pages/doctor/
│   └── DoctorProfile.jsx          # Page de profil médecin avec géolocalisation
└── pages/auth/
    └── RegisterPage.jsx           # Formulaire d'inscription modifié
```

### Backend

```
backend/src/
├── data/migrations/
│   └── addLocationFields.js       # Migration pour ajouter les champs
└── controllers/
    ├── auth.controller.js         # Modifié pour gérer la géolocalisation
    └── medecin.controller.js      # Modifié pour inclure les champs de localisation
```

## Base de données

### Nouveaux champs ajoutés à la table `utilisateur`

```sql
ALTER TABLE utilisateur 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN description_localisation TEXT;
```

### Commentaires de documentation

```sql
COMMENT ON COLUMN utilisateur.latitude IS 'Latitude de la localisation (pour les médecins)';
COMMENT ON COLUMN utilisateur.longitude IS 'Longitude de la localisation (pour les médecins)';
COMMENT ON COLUMN utilisateur.description_localisation IS 'Description de la localisation (quartier, points de repère) pour les médecins';
```

## Installation et configuration

### 1. Exécuter la migration de base de données

```bash
# Depuis le dossier backend
cd backend
node src/data/migrations/addLocationFields.js
```

### 2. Rollback si nécessaire

```bash
# Pour supprimer les champs (rollback)
node src/data/migrations/addLocationFields.js rollback
```

### 3. Dépendances requises

Le composant utilise Leaflet pour la carte interactive. Les scripts sont chargés dynamiquement, aucune installation supplémentaire n'est requise.

## Utilisation

### Inscription d'un médecin

1. Le médecin remplit les informations personnelles et professionnelles
2. **Obligatoire** : Il doit sélectionner sa localisation sur la carte
3. Il peut utiliser le bouton "Utiliser ma position actuelle" pour la géolocalisation automatique
4. Il renseigne une description de sa localisation (quartier, points de repère)
5. L'adresse complète est générée automatiquement

### Modification du profil

1. Accès via `/doctor/profile`
2. Mode édition pour modifier toutes les informations
3. Localisation modifiable avec la même interface

## Format des données

### Données envoyées lors de l'inscription

```javascript
{
  // ... autres champs utilisateur
  latitude: 6.1319,
  longitude: 1.2228,
  adresse: "Quartier Bè, près du marché central, Lomé",
  ville: "Lomé",
  description_localisation: "Quartier Bè, près du marché central"
}
```

### Données retournées par l'API

```javascript
{
  utilisateur_id: 1,
  nom: "Dubois",
  prenom: "Pierre",
  specialite: "Médecine générale",
  // ... autres champs
  latitude: 6.1319,
  longitude: 1.2228,
  adresse: "Quartier Bè, près du marché central, Lomé",
  ville: "Lomé",
  description_localisation: "Quartier Bè, près du marché central"
}
```

## Validation

### Côté frontend

- Vérification de la présence de latitude/longitude
- Validation de la description de localisation (non vide)
- Messages d'erreur contextualisés

### Côté backend

- Les champs de géolocalisation sont optionnels en base mais requis pour les médecins
- Validation des types de données (DECIMAL pour lat/lng, TEXT pour description)

## Sécurité et confidentialité

- Les coordonnées GPS sont stockées avec une précision de 8 décimales (±1cm)
- Seules les informations nécessaires sont exposées via l'API
- La géolocalisation automatique nécessite l'autorisation de l'utilisateur

## Amélirations futures possibles

1. **Recherche par proximité** : Permettre aux patients de trouver des médecins proches
2. **Cartes offline** : Support pour les zones avec connexion limitée
3. **Validation d'adresse** : Intégration avec des services de géocodage locaux
4. **Zones de couverture** : Définir des zones de service pour chaque médecin
5. **Optimisation mobile** : Interface optimisée pour les appareils mobiles

## Tests

### Tests manuels recommandés

1. **Inscription médecin** : Vérifier que la localisation est obligatoire
2. **Géolocalisation automatique** : Tester le bouton de position actuelle
3. **Modification de profil** : Vérifier la modification de localisation
4. **Affichage des données** : Contrôler l'affichage correct des informations
5. **Validation des erreurs** : Tester les messages d'erreur

### Cas de test

- Inscription sans localisation (doit échouer)
- Géolocalisation refusée par l'utilisateur
- Modification de position sur la carte
- Changement de ville et description
- Sauvegarde et récupération des données

## Support et maintenance

Cette fonctionnalité est conçue pour être maintenue facilement :

- Code modulaire et réutilisable
- Migration réversible
- Documentation complète
- Gestion d'erreurs robuste

Pour toute question ou problème, consultez la documentation technique ou contactez l'équipe de développement.
