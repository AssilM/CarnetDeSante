# Tests Backend - Guide d'utilisation

## Installation des dépendances de test

```bash
cd backend
npm install
```

## Configuration de la base de données de test

1. Créez une base de données PostgreSQL dédiée aux tests :

```sql
CREATE DATABASE carnet_test;
```

2. Mettez à jour le fichier `test.env` avec vos paramètres de connexion.

## Exécution des tests

### Tous les tests

```bash
npm test
```

### Tests en mode watch (redémarre à chaque modification)

```bash
npm run test:watch
```

### Tests avec coverage

```bash
npm run test:coverage
```

### Tests spécifiques

```bash
# Tests unitaires seulement
npx vitest run tests/unit/

# Tests d'intégration seulement
npx vitest run tests/integration/

# Un fichier spécifique
npx vitest run tests/unit/validation.utils.test.js
```

## Structure des tests

```
backend/
├── tests/
│   ├── setup.js                 # Configuration globale
│   ├── unit/                    # Tests unitaires (fonctions pures)
│   │   ├── validation.utils.test.js
│   │   ├── auth.utils.test.js
│   │   └── auth.middleware.test.js
│   └── integration/             # Tests d'intégration (API + DB)
│       └── auth.routes.test.js
├── vitest.config.js             # Configuration Vitest
└── test.env                     # Variables d'environnement test
```

## Types de tests implémentés

### Tests unitaires

- **validation.utils.test.js** : Validation email, téléphone, mot de passe, etc.
- **auth.utils.test.js** : Hash/compare passwords, génération JWT
- **auth.middleware.test.js** : Middleware d'authentification et autorisation

### Tests d'intégration

- **auth.routes.test.js** : Endpoints signup, signin, refresh token, me

## Bonnes pratiques

1. **Isolation** : Chaque test nettoie ses données
2. **Mocks** : Services externes (email, etc.) sont mockés
3. **Coverage** : Viser >80% de couverture sur la logique métier
4. **Performance** : Tests unitaires < 1s, intégration < 10s

## Debugging

En cas d'erreur :

1. Vérifiez la connexion DB dans `test.env`
2. Vérifiez que la base `carnet_test` existe
3. Regardez les logs avec `npm run test:watch`

## Ajout de nouveaux tests

### Test unitaire

```javascript
import { describe, it, expect } from "vitest";
import { maFonction } from "../../src/utils/mon-module.js";

describe("mon-module", () => {
  it("teste quelque chose", () => {
    expect(maFonction("input")).toBe("output");
  });
});
```

### Test d'intégration

```javascript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("mes routes", () => {
  it("teste un endpoint", async () => {
    const response = await request(app)
      .post("/api/mon-endpoint")
      .send({ data: "test" })
      .expect(200);

    expect(response.body).toMatchObject({ success: true });
  });
});
```
