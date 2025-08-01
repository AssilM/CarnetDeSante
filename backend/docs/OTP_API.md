# API OTP - Documentation

## Vue d'ensemble

Le système OTP (One-Time Password) permet une authentification sécurisée avec vérification email obligatoire.

## Routes OTP

### 1. Demande OTP de connexion

```http
POST /auth/login/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Réponse :**

```json
{
  "message": "Code de connexion envoyé par email",
  "email": "user@example.com"
}
```

### 2. Connexion avec OTP

```http
POST /auth/login/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Réponse :**

```json
{
  "token": "jwt_access_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "patient",
    "chemin_photo": ""
  }
}
```

### 3. Vérification email avec OTP

```http
POST /auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Réponse :**

```json
{
  "message": "Email vérifié avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "patient",
    "email_verified": true
  }
}
```

### 4. Renvoi OTP de vérification

```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Réponse :**

```json
{
  "message": "Code de vérification renvoyé par email",
  "email": "user@example.com"
}
```

## Codes d'erreur

| Code                     | Message                                       | Description                |
| ------------------------ | --------------------------------------------- | -------------------------- |
| `OTP_INVALID`            | Code OTP incorrect ou expiré                  | OTP invalide ou expiré     |
| `EMAIL_NOT_VERIFIED`     | Veuillez d'abord vérifier votre adresse email | Email non vérifié          |
| `EMAIL_ALREADY_VERIFIED` | Cet email est déjà vérifié                    | Email déjà vérifié         |
| `OTP_RATE_LIMIT`         | Trop de tentatives OTP                        | Rate limiting activé       |
| `OTP_REQUEST_RATE_LIMIT` | Trop de demandes d'OTP                        | Rate limiting des demandes |

## Sécurité

### Rate Limiting

- **Tentatives OTP** : 5 tentatives par 15 minutes
- **Demandes OTP** : 3 demandes par minute

### Expiration

- **OTP** : 10 minutes par défaut
- **Tentatives** : 5 tentatives maximum par token

### Vérification Email

- **Obligatoire** : Tous les comptes doivent vérifier leur email
- **Blocage** : Connexion impossible sans vérification
- **Activation** : `email_verified = true` après vérification

## Headers de Rate Limiting

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2025-07-31T20:25:00.000Z
```

## Flux d'authentification

1. **Inscription** → `email_verified = false`
2. **Email envoyé** → OTP de vérification
3. **Vérification** → `email_verified = true`
4. **Demande OTP connexion** → OTP envoyé
5. **Connexion avec OTP** → Token généré
