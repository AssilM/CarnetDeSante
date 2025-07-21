# Composants de Gestion des Utilisateurs

Ce dossier contient les composants modulaires pour la gestion des utilisateurs dans l'interface d'administration.

## Composants

### UserCard

Affiche les informations d'un utilisateur avec des actions de base (modifier, activer/désactiver, supprimer).

**Props :**

- `user` : Objet utilisateur avec les propriétés (id, nom, prenom, email, role, status, telephone, created_at, last_login)
- `onEdit` : Fonction appelée lors du clic sur "Modifier"
- `onDelete` : Fonction appelée lors du clic sur "Supprimer"
- `onToggleStatus` : Fonction appelée lors du clic sur "Activer/Désactiver"

### UserFilters

Interface de filtrage des utilisateurs par rôle, statut et recherche textuelle.

**Props :**

- `filters` : Objet contenant les filtres actuels (role, status, search)
- `onFilterChange` : Fonction appelée lors du changement d'un filtre
- `onReset` : Fonction appelée lors de la réinitialisation des filtres

### UserStats

Affiche les statistiques des utilisateurs (total, patients, médecins, administrateurs).

**Props :**

- `stats` : Objet contenant les statistiques (total, patients, medecins, admins)

## Page principale

### Users.jsx

Page complète de gestion des utilisateurs qui intègre tous les composants ci-dessus.

**Fonctionnalités :**

- Chargement des utilisateurs depuis l'API
- Filtrage en temps réel
- Calcul automatique des statistiques
- Actions CRUD (actuellement : activer/désactiver, supprimer)
- Gestion des erreurs et états de chargement
- Vérification des permissions admin

## Utilisation

```jsx
import { UserCard, UserFilters, UserStats } from "../../components/admin/users";

// Dans votre composant
<UserStats stats={stats} />
<UserFilters
  filters={filters}
  onFilterChange={handleFilterChange}
  onReset={handleResetFilters}
/>
<UserCard
  user={user}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleStatus={handleToggleStatus}
/>
```

## Routes

La page est accessible via `/admin/users` et est protégée par le composant `ProtectedRoute` avec le rôle "admin".

## API

Les composants utilisent les fonctions de `adminService` :

- `getAllUsers()` : Récupère tous les utilisateurs
- `updateUser(id, data)` : Met à jour un utilisateur
- `deleteUser(id)` : Supprime un utilisateur

## TODO

- [ ] Implémenter la modal d'édition d'utilisateur
- [ ] Ajouter la pagination pour les grandes listes
- [ ] Ajouter des confirmations pour les actions destructives
- [ ] Implémenter la création d'utilisateurs
- [ ] Ajouter des notifications toast pour les actions
