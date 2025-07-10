# Utilitaires (Utils)

## Vue d'ensemble

Le dossier `utils/` centralise les **fonctions utilitaires** réutilisables dans toute l'application. Ces fonctions éliminent la duplication de code et offrent des outils communs pour :

- 🔐 **Authentification** : JWT, bcrypt, cookies sécurisés
- 📅 **Dates** : Manipulation, formatage, calculs
- ✅ **Validation** : Formats, contraintes métier, sécurité

## Structure

```
utils/
├── index.js              # Exports centralisés
├── auth.utils.js         # Fonctions d'authentification et sécurité
├── date.utils.js         # Fonctions de manipulation des dates
└── validation.utils.js   # Fonctions de validation des données
```

## Modules disponibles

### 🔐 `auth.utils.js`

Fonctions pour l'authentification et la sécurité :

```javascript
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  hashPassword,
  comparePassword,
} from "../utils/auth.utils.js";

// Génération de tokens
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user.id);

// Gestion des cookies sécurisés
setRefreshTokenCookie(res, refreshToken);

// Gestion des mots de passe
const hashedPassword = await hashPassword(plainPassword);
const isValid = await comparePassword(plainPassword, hashedPassword);
```

**Fonctions disponibles :**

- `generateAccessToken(user)` - Token JWT d'accès
- `generateRefreshToken(userId)` - Token JWT de rafraîchissement
- `setRefreshTokenCookie(res, token)` - Cookie sécurisé
- `hashPassword(plainPassword)` - Hachage bcrypt
- `comparePassword(plain, hashed)` - Comparaison bcrypt

### 📅 `date.utils.js`

Fonctions pour la manipulation des dates :

```javascript
import {
  getJourSemaine,
  isDateInFuture,
  formatDateToFrench,
  calculateAge,
  timeSlotsOverlap,
} from "../utils/date.utils.js";

// Formatage et vérifications
const jour = getJourSemaine("2024-01-15"); // "lundi"
const isFuture = isDateInFuture("2024-12-25"); // true/false
const dateFormatee = formatDateToFrench("2024-01-15"); // "lundi 15 janvier 2024"

// Calculs
const age = calculateAge("1990-05-15"); // âge en années
const overlap = timeSlotsOverlap("09:00", 60, "09:30", 45); // true
```

**Fonctions disponibles :**

- `getJourSemaine(dateStr)` - Jour en français
- `isDateInFuture(dateStr)` - Vérification future
- `isDateTodayOrFuture(dateStr)` - Aujourd'hui ou futur
- `formatDateToFrench(dateStr)` - Format français complet
- `calculateAge(dateNaissance)` - Calcul d'âge
- `timeSlotsOverlap()` - Chevauchement créneaux
- `generateDateRange(start, end)` - Plage de dates

### ✅ `validation.utils.js`

Fonctions de validation des données :

```javascript
import {
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  isValidBloodType,
  validateBodyMeasurements,
} from "../utils/validation.utils.js";

// Validations simples
const emailValid = isValidEmail("user@example.com"); // true/false
const phoneValid = isValidPhoneNumber("0123456789"); // true/false
const bloodValid = isValidBloodType("A+"); // true/false

// Validations complexes
const passwordCheck = validatePassword("MonMotDePasse123!");
// Retourne: { isValid: true/false, errors: [...] }

const bodyCheck = validateBodyMeasurements(175, 70);
// Retourne: { isValid: true/false, errors: [...] }
```

**Fonctions disponibles :**

- `isValidEmail(email)` - Format email
- `isValidPhoneNumber(numero)` - Téléphone français
- `isValidPostalCode(codePostal)` - Code postal français
- `validatePassword(password)` - Force mot de passe
- `isValidBirthDate(dateStr)` - Date de naissance réaliste
- `isValidBloodType(groupe)` - Groupe sanguin
- `validateBodyMeasurements(taille, poids)` - Mesures corporelles
- `formatPhoneNumber(numero)` - Nettoyage téléphone
- `isNotEmpty(str)` - Chaîne non vide
- `isValidLength(str, min, max)` - Longueur chaîne

## Utilisation dans les contrôleurs

```javascript
import { hashPassword } from "../utils/auth.utils.js";
import { isValidEmail, validatePassword } from "../utils/validation.utils.js";
import { calculateAge } from "../utils/date.utils.js";

export const createUser = async (req, res, next) => {
  try {
    const { email, password, date_naissance } = req.body;

    // Validations
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: "Mot de passe invalide",
        errors: passwordValidation.errors,
      });
    }

    // Calculs
    const age = calculateAge(date_naissance);
    if (age < 18) {
      return res.status(400).json({ message: "Âge minimum requis : 18 ans" });
    }

    // Sécurité
    const hashedPassword = await hashPassword(password);

    // Création utilisateur...
  } catch (error) {
    next(error);
  }
};
```

## Bonnes pratiques

1. **Réutilisabilité** : Une fonction = un objectif précis
2. **Documentation** : JSDoc complète pour chaque fonction
3. **Validation** : Toujours valider les entrées
4. **Sécurité** : Jamais de données sensibles en logs
5. **Performance** : Fonctions optimisées pour une utilisation fréquente
6. **Tests** : Chaque utilitaire doit être testable individuellement

## Ajout d'un nouvel utilitaire

```javascript
/**
 * Génère un identifiant unique pour les documents
 * @param {string} prefix - Préfixe de l'identifiant
 * @returns {string} - Identifiant unique
 */
export const generateDocumentId = (prefix = "DOC") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};
```

## Import centralisé

Grâce au fichier `index.js`, vous pouvez importer tous les utilitaires depuis un seul endroit :

```javascript
import {
  generateAccessToken, // auth.utils.js
  formatDateToFrench, // date.utils.js
  isValidEmail, // validation.utils.js
} from "../utils/index.js";
```
