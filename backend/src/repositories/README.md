# Architecture Repository

## Vue d'ensemble

Le dossier `repositories/` implémente le **pattern Repository**, qui sépare la logique d'accès aux données de la logique métier. Cette approche offre plusieurs avantages :

- ✅ **Séparation des responsabilités** : La logique SQL est isolée des contrôleurs
- ✅ **Testabilité** : Les repositories peuvent être facilement mockés dans les tests
- ✅ **Maintenabilité** : Modifications de base de données centralisées
- ✅ **Réutilisabilité** : Les fonctions peuvent être utilisées dans plusieurs contrôleurs

## Structure

```
repositories/
├── index.js                    # Exports centralisés
├── user.repository.js          # Gestion des utilisateurs
├── patient.repository.js       # Gestion des patients
├── medecin.repository.js       # Gestion des médecins
├── rendezvous.repository.js    # Gestion des rendez-vous
└── disponibilite.repository.js # Gestion des disponibilités
```

## Conventions

### Nommage des fonctions

- `find*` : Récupération de données (SELECT)
- `create*` / `insert*` : Création de données (INSERT)
- `update*` : Modification de données (UPDATE)
- `delete*` / `remove*` : Suppression de données (DELETE)
- `exists*` / `is*` : Vérifications booléennes

### Gestion d'erreurs

Tous les repositories suivent le même pattern :

```javascript
export const maFonction = async (params) => {
  try {
    // Requête SQL
    return result;
  } catch (error) {
    console.error(`[REPOSITORY] Erreur contexte:`, error.message);
    throw new Error("Message utilisateur");
  }
};
```

### Documentation JSDoc

Chaque fonction est documentée avec :

- Description de l'action
- Types et descriptions des paramètres
- Type de retour
- Exemple d'utilisation si nécessaire

## Utilisation dans les contrôleurs

```javascript
import { findById, updateUser } from "../repositories/user.repository.js";

export const getUserById = async (req, res, next) => {
  try {
    const user = await findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error); // Délégation au middleware d'erreur
  }
};
```

## Bonnes pratiques

1. **Jamais de logique métier** dans les repositories
2. **Sécurité** : Exclusion des mots de passe dans les SELECT
3. **Transactions** : Utiliser le client fourni pour les opérations transactionnelles
4. **Logs** : Préfixer avec `[REPOSITORY]` pour identification
5. **Cohérence** : Même structure d'erreur pour tous les repositories

## Exemple d'ajout d'une nouvelle fonction

```javascript
/**
 * Recherche des utilisateurs par critères multiples
 * @param {Object} criteria - Critères de recherche
 * @param {string} criteria.nom - Nom à rechercher (optionnel)
 * @param {string} criteria.role - Rôle à filtrer (optionnel)
 * @returns {Promise<Array>} Liste des utilisateurs correspondants
 */
export const findByCriteria = async (criteria) => {
  try {
    let query =
      "SELECT id, email, nom, prenom, role FROM utilisateur WHERE 1=1";
    const values = [];
    let paramIndex = 1;

    if (criteria.nom) {
      query += ` AND nom ILIKE $${paramIndex++}`;
      values.push(`%${criteria.nom}%`);
    }

    if (criteria.role) {
      query += ` AND role = $${paramIndex++}`;
      values.push(criteria.role);
    }

    query += " ORDER BY nom, prenom";

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur recherche multicritères:`,
      error.message
    );
    throw new Error("Erreur lors de la recherche d'utilisateurs");
  }
};
```
