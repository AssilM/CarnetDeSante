# Guide Pratique - Lancer les Tests Backend

## 🚀 Commandes de base

### Lancer tous les tests

```bash
npm test
```

**Utilisation** : Exécute tous les tests une seule fois et affiche le résultat

### Mode développement (recommandé)

```bash
npm run test:watch
```

**Utilisation** : Les tests se relancent automatiquement quand tu modifies un fichier
**Pratique** : Laisse cette commande tourner pendant que tu codes

### Tests avec rapport de couverture

```bash
npm run test:coverage
```

**Utilisation** : Montre quel pourcentage de ton code est testé
**Résultat** : Génère un rapport HTML dans le dossier `coverage/`

## 🎯 Commandes spécifiques

### Tests unitaires seulement

```bash
npx vitest run tests/unit/
```

**Quand l'utiliser** : Pour tester rapidement la logique pure (validation, crypto, etc.)

### Tests d'intégration seulement

```bash
npx vitest run tests/integration/
```

**Quand l'utiliser** : Pour tester les API avec la vraie base de données

### Un seul fichier de test

```bash
npx vitest run tests/unit/validation.utils.test.js
```

**Quand l'utiliser** : Quand tu travailles sur un module spécifique

### Débugger un test qui plante

```bash
npx vitest run tests/unit/auth.middleware.test.js --reporter=verbose
```

**Quand l'utiliser** : Pour voir exactement où ça plante avec plus de détails

## 📊 Interpréter les résultats

### ✅ Test qui passe

```
✓ tests/unit/validation.utils.test.js (30)
  Tests  30 passed
```

### ❌ Test qui échoue

```
× rejette les headers Authorization mal formatés
AssertionError: expected "Token d'authentification requis" but got "Token invalide ou expiré"
```

### 📈 Résumé

```
Test Files  3 passed
Tests  54 passed | 1 failed (55)
Duration  1.64s
```

## 🔧 Configuration

### Fichier test.env

Ce fichier contient les variables d'environnement spécifiques aux tests :

- Secrets JWT différents de la production
- Base de données de test séparée
- Services externes désactivés (emails, etc.)

**Important** : Ne copie pas ton `.env` de production ! Le `test.env` est fait exprès pour isoler les tests.

## 🎯 Workflow recommandé

1. **Développement quotidien** :

   ```bash
   npm run test:watch
   ```

   Laisse tourner en arrière-plan

2. **Avant un commit** :

   ```bash
   npm test
   ```

   Vérifie que tout passe

3. **Analyse de qualité** :
   ```bash
   npm run test:coverage
   ```
   Regarde le rapport dans `coverage/index.html`

## 🐛 Résoudre les problèmes

### "Database connection failed"

- Vérifie que PostgreSQL est démarré
- Vérifie les paramètres dans `test.env`
- Crée la base `carnet_test` si elle n'existe pas

### "Module not found"

- Fais `npm install` pour installer les dépendances

### Tests lents

- Les tests unitaires sont rapides (< 1s)
- Les tests d'intégration prennent plus de temps (avec DB)

## 💡 Astuces

- **Ctrl+C** pour arrêter le mode watch
- Les tests s'exécutent en parallèle pour aller plus vite
- Les fichiers sont surveillés automatiquement en mode watch
- Regarde les logs pour comprendre les erreurs
