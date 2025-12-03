# Serveur API - Systeme de Gestion de Parking

## Installation

1. Installer les dependances:
```bash
npm install
```

2. Configurer les variables d'environnement:
   - Copier `.env.example` vers `.env`
   - Modifier les valeurs selon votre configuration

3. Configuration de la base de donnees PostgreSQL:
   - Assurez-vous que PostgreSQL est installe et demarre
   - Creez une base de donnees:
   ```sql
   CREATE DATABASE parking_db;
   ```

4. Executer les migrations Prisma:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Peupler la base de donnees avec des donnees de test:
```bash
npm run prisma:seed
```

## Demarrage

### Mode developpement (avec hot reload):
```bash
npm run live
```

### Mode production:
```bash
npm start
```

## Scripts disponibles

- `npm start` - Demarre le serveur en mode production
- `npm run live` - Demarre le serveur en mode developpement avec nodemon
- `npm run prisma:generate` - Genere le client Prisma
- `npm run prisma:migrate` - Execute les migrations
- `npm run prisma:deploy` - Deploie les migrations en production
- `npm run prisma:studio` - Ouvre Prisma Studio (interface GUI)
- `npm run prisma:seed` - Peuple la base avec des donnees de test

## Comptes de test (apres seed)

- **Super Admin**: admin@parking.com / admin123456
- **Gerant**: gerant@parking.com / gerant123456

## Documentation complete de l'API

### Authentification

#### POST `/api/auth/login`
Connexion d'un utilisateur au systeme.

**Parametres du corps (JSON):**
- `username` (string, requis) - Nom d'utilisateur (minimum 3 caracteres)
- `password` (string, requis) - Mot de passe (minimum 6 caracteres)

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Connexion reussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "Prenom",
      "lastName": "Nom",
      "phone": "+221 77 123 45 67",
      "role": "SUPER_ADMIN | GERANT",
      "isActive": true
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_jwt_token"
  }
}
```

**Erreurs possibles:**
- 401: Nom d'utilisateur ou mot de passe incorrect
- 403: Compte desactive
- 400: Erreur de validation

---

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur (Super Admin uniquement).

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres du corps (JSON):**
- `email` (string, requis) - Email valide
- `username` (string, requis) - Nom d'utilisateur (minimum 3 caracteres)
- `password` (string, requis) - Mot de passe (minimum 6 caracteres)
- `firstName` (string, optionnel) - Prenom
- `lastName` (string, optionnel) - Nom
- `phone` (string, optionnel) - Numero de telephone
- `role` (string, optionnel) - Role (SUPER_ADMIN ou GERANT, defaut: GERANT)

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Utilisateur cree avec succes",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "Prenom",
    "lastName": "Nom",
    "phone": "+221 77 123 45 67",
    "role": "GERANT",
    "isActive": true,
    "createdAt": "2025-11-29T00:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- 400: Email ou nom d'utilisateur deja utilise
- 401: Non authentifie
- 403: Acces refuse (droits insuffisants)

---

#### POST `/api/auth/refresh`
Rafraichir le token d'acces.

**Parametres du corps (JSON):**
- `refreshToken` (string, requis) - Token de rafraichissement

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_jwt_token"
  }
}
```

**Erreurs possibles:**
- 401: Token de rafraichissement manquant
- 403: Token invalide ou utilisateur desactive

---

#### POST `/api/auth/logout`
Deconnexion de l'utilisateur.

**Autorisation:** Bearer Token

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Deconnexion reussie"
}
```

---

#### GET `/api/auth/me`
Recuperer le profil de l'utilisateur connecte.

**Autorisation:** Bearer Token

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "Prenom",
    "lastName": "Nom",
    "phone": "+221 77 123 45 67",
    "role": "SUPER_ADMIN | GERANT",
    "isActive": true,
    "createdAt": "2025-11-29T00:00:00.000Z",
    "updatedAt": "2025-11-29T00:00:00.000Z"
  }
}
```

---

### Gestion des utilisateurs (Super Admin uniquement)

#### GET `/api/users`
Recuperer la liste des utilisateurs avec pagination.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres de requete (Query):**
- `page` (number, optionnel, defaut: 1) - Numero de page
- `limit` (number, optionnel, defaut: 10) - Nombre d'elements par page
- `role` (string, optionnel) - Filtrer par role (SUPER_ADMIN ou GERANT)
- `isActive` (boolean, optionnel) - Filtrer par statut actif

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "username": "username",
        "firstName": "Prenom",
        "lastName": "Nom",
        "phone": "+221 77 123 45 67",
        "role": "GERANT",
        "isActive": true,
        "createdAt": "2025-11-29T00:00:00.000Z",
        "updatedAt": "2025-11-29T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

#### GET `/api/users/:id`
Recuperer les details d'un utilisateur specifique.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'utilisateur

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "Prenom",
    "lastName": "Nom",
    "phone": "+221 77 123 45 67",
    "role": "GERANT",
    "isActive": true,
    "createdAt": "2025-11-29T00:00:00.000Z",
    "updatedAt": "2025-11-29T00:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- 404: Utilisateur non trouve

---

#### POST `/api/users`
Creer un nouvel utilisateur.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres du corps (JSON):**
- `email` (string, requis) - Email valide
- `username` (string, requis) - Nom d'utilisateur (minimum 3 caracteres)
- `password` (string, requis) - Mot de passe (minimum 6 caracteres)
- `firstName` (string, optionnel) - Prenom
- `lastName` (string, optionnel) - Nom
- `phone` (string, optionnel) - Numero de telephone
- `role` (string, optionnel) - Role (defaut: GERANT)

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Utilisateur cree avec succes",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "GERANT",
    "isActive": true,
    "createdAt": "2025-11-29T00:00:00.000Z"
  }
}
```

---

#### PUT `/api/users/:id`
Modifier un utilisateur existant.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'utilisateur

**Parametres du corps (JSON):**
- `email` (string, optionnel) - Nouvel email
- `username` (string, optionnel) - Nouveau nom d'utilisateur
- `firstName` (string, optionnel) - Nouveau prenom
- `lastName` (string, optionnel) - Nouveau nom
- `phone` (string, optionnel) - Nouveau numero de telephone
- `password` (string, optionnel) - Nouveau mot de passe

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Utilisateur modifie avec succes",
  "data": {
    "id": "uuid",
    "email": "updated@example.com",
    "username": "updated_username",
    "role": "GERANT",
    "isActive": true,
    "updatedAt": "2025-11-29T00:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- 404: Utilisateur non trouve
- 400: Email ou nom d'utilisateur deja utilise

---

#### DELETE `/api/users/:id`
Supprimer un utilisateur.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'utilisateur

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Utilisateur supprime avec succes"
}
```

**Erreurs possibles:**
- 404: Utilisateur non trouve
- 400: Impossible de supprimer son propre compte

---

#### PATCH `/api/users/:id/toggle-status`
Activer ou desactiver un utilisateur.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'utilisateur

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Utilisateur active/desactive avec succes",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "isActive": false
  }
}
```

**Erreurs possibles:**
- 404: Utilisateur non trouve
- 400: Impossible de modifier le statut de son propre compte

---

### Gestion des parkings

#### GET `/api/parking`
Recuperer la liste de tous les parkings.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Parking Principal",
      "totalCapacity": 100,
      "availableSpaces": 45,
      "location": "Avenue Hassan II, Dakar",
      "description": "Parking securise",
      "createdAt": "2025-11-29T00:00:00.000Z",
      "updatedAt": "2025-11-29T00:00:00.000Z",
      "tariffs": [...],
      "_count": {
        "entries": 55
      }
    }
  ]
}
```

---

#### GET `/api/parking/:id`
Recuperer les details d'un parking specifique.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Parking Principal",
    "totalCapacity": 100,
    "availableSpaces": 45,
    "location": "Avenue Hassan II, Dakar",
    "description": "Parking securise",
    "tariffs": [
      {
        "id": "uuid",
        "vehicleType": "VOITURE",
        "pricePerHour": 1000
      }
    ],
    "_count": {
      "entries": 55
    }
  }
}
```

---

#### POST `/api/parking`
Creer un nouveau parking.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres du corps (JSON):**
- `name` (string, requis) - Nom du parking
- `totalCapacity` (number, requis) - Capacite totale (minimum 1)
- `location` (string, optionnel) - Adresse du parking
- `description` (string, optionnel) - Description

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Parking cree avec succes",
  "data": {
    "id": "uuid",
    "name": "Parking Principal",
    "totalCapacity": 100,
    "availableSpaces": 100,
    "location": "Avenue Hassan II, Dakar",
    "description": "Parking securise",
    "createdAt": "2025-11-29T00:00:00.000Z"
  }
}
```

---

#### PUT `/api/parking/:id`
Modifier un parking existant.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du parking

**Parametres du corps (JSON):**
- `name` (string, optionnel) - Nouveau nom
- `totalCapacity` (number, optionnel) - Nouvelle capacite
- `location` (string, optionnel) - Nouvelle adresse
- `description` (string, optionnel) - Nouvelle description

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Parking modifie avec succes",
  "data": {
    "id": "uuid",
    "name": "Parking Principal Modifie",
    "totalCapacity": 120,
    "availableSpaces": 65,
    "updatedAt": "2025-11-29T00:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- 404: Parking non trouve
- 400: Capacite insuffisante pour les places occupees

---

#### DELETE `/api/parking/:id`
Supprimer un parking.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Parking supprime avec succes"
}
```

**Erreurs possibles:**
- 404: Parking non trouve
- 400: Impossible de supprimer un parking avec des vehicules en cours

---

#### GET `/api/parking/:id/availability`
Consulter la disponibilite en temps reel d'un parking.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Parking Principal",
    "totalCapacity": 100,
    "availableSpaces": 45,
    "occupiedSpaces": 55,
    "occupancyRate": 55.00,
    "isFull": false
  }
}
```

---

### Gestion des tarifs

#### GET `/api/parking/:parkingId/tariffs`
Recuperer les tarifs d'un parking.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `parkingId` (uuid, requis) - ID du parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "parkingId": "uuid",
      "vehicleType": "VOITURE",
      "pricePerHour": 1000,
      "createdAt": "2025-11-29T00:00:00.000Z",
      "parking": {
        "id": "uuid",
        "name": "Parking Principal"
      }
    }
  ]
}
```

---

#### POST `/api/parking/tariffs`
Creer un nouveau tarif.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres du corps (JSON):**
- `parkingId` (uuid, requis) - ID du parking
- `vehicleType` (string, requis) - Type de vehicule (MOTO, VOITURE, CAMION, AUTRE)
- `pricePerHour` (number, requis) - Prix par heure (minimum 0)

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Tarif cree avec succes",
  "data": {
    "id": "uuid",
    "parkingId": "uuid",
    "vehicleType": "VOITURE",
    "pricePerHour": 1000,
    "createdAt": "2025-11-29T00:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- 404: Parking non trouve
- 400: Un tarif existe deja pour ce type de vehicule

---

#### PUT `/api/parking/tariffs/:id`
Modifier un tarif existant.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du tarif

**Parametres du corps (JSON):**
- `pricePerHour` (number, requis) - Nouveau prix par heure

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Tarif modifie avec succes",
  "data": {
    "id": "uuid",
    "vehicleType": "VOITURE",
    "pricePerHour": 1200,
    "updatedAt": "2025-11-29T00:00:00.000Z"
  }
}
```

---

#### DELETE `/api/parking/tariffs/:id`
Supprimer un tarif.

**Autorisation:** Bearer Token (SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du tarif

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Tarif supprime avec succes"
}
```

---

### Gestion des vehicules

#### GET `/api/parking/vehicles/all`
Recuperer la liste des vehicules avec pagination.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `page` (number, optionnel, defaut: 1) - Numero de page
- `limit` (number, optionnel, defaut: 10) - Nombre d'elements par page
- `vehicleType` (string, optionnel) - Filtrer par type (MOTO, VOITURE, CAMION, AUTRE)
- `search` (string, optionnel) - Recherche par plaque, marque ou modele

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "uuid",
        "plateNumber": "DK-1234-AA",
        "vehicleType": "VOITURE",
        "brand": "Toyota",
        "model": "Corolla",
        "color": "Blanc",
        "createdAt": "2025-11-29T00:00:00.000Z",
        "cards": [...],
        "_count": {
          "entries": 15
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

#### GET `/api/parking/vehicles/:id`
Recuperer les details d'un vehicule.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du vehicule

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plateNumber": "DK-1234-AA",
    "vehicleType": "VOITURE",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Blanc",
    "cards": [...],
    "entries": [...]
  }
}
```

---

#### POST `/api/parking/vehicles`
Enregistrer un nouveau vehicule.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres du corps (JSON):**
- `plateNumber` (string, requis) - Numero de plaque d'immatriculation
- `vehicleType` (string, requis) - Type (MOTO, VOITURE, CAMION, AUTRE)
- `brand` (string, optionnel) - Marque
- `model` (string, optionnel) - Modele
- `color` (string, optionnel) - Couleur

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Vehicule cree avec succes",
  "data": {
    "id": "uuid",
    "plateNumber": "DK-1234-AA",
    "vehicleType": "VOITURE",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Blanc",
    "createdAt": "2025-11-29T00:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- 400: Un vehicule avec cette plaque existe deja

---

#### PUT `/api/parking/vehicles/:id`
Modifier un vehicule existant.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du vehicule

**Parametres du corps (JSON):**
- `plateNumber` (string, optionnel) - Nouveau numero de plaque
- `vehicleType` (string, optionnel) - Nouveau type
- `brand` (string, optionnel) - Nouvelle marque
- `model` (string, optionnel) - Nouveau modele
- `color` (string, optionnel) - Nouvelle couleur

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Vehicule modifie avec succes",
  "data": {
    "id": "uuid",
    "plateNumber": "DK-1234-AA",
    "vehicleType": "VOITURE",
    "updatedAt": "2025-11-29T00:00:00.000Z"
  }
}
```

---

#### DELETE `/api/parking/vehicles/:id`
Supprimer un vehicule.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID du vehicule

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Vehicule supprime avec succes"
}
```

**Erreurs possibles:**
- 404: Vehicule non trouve
- 400: Impossible de supprimer un vehicule actuellement dans le parking

---

### Gestion des cartes RFID

#### GET `/api/parking/cards/all`
Recuperer la liste des cartes avec pagination.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `page` (number, optionnel, defaut: 1) - Numero de page
- `limit` (number, optionnel, defaut: 10) - Nombre d'elements par page
- `isActive` (boolean, optionnel) - Filtrer par statut actif
- `vehicleId` (uuid, optionnel) - Filtrer par vehicule

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "uuid",
        "cardNumber": "CARD001",
        "vehicleId": "uuid",
        "isActive": true,
        "createdAt": "2025-11-29T00:00:00.000Z",
        "vehicle": {
          "plateNumber": "DK-1234-AA",
          "vehicleType": "VOITURE"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

#### POST `/api/parking/cards`
Creer une nouvelle carte RFID.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres du corps (JSON):**
- `cardNumber` (string, requis) - Numero de la carte
- `vehicleId` (uuid, requis) - ID du vehicule associe

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Carte creee avec succes",
  "data": {
    "id": "uuid",
    "cardNumber": "CARD001",
    "vehicleId": "uuid",
    "isActive": true,
    "createdAt": "2025-11-29T00:00:00.000Z",
    "vehicle": {...}
  }
}
```

**Erreurs possibles:**
- 400: Cette carte existe deja
- 404: Vehicule non trouve

---

#### PUT `/api/parking/cards/:id`
Modifier une carte RFID.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de la carte

**Parametres du corps (JSON):**
- `vehicleId` (uuid, requis) - Nouvel ID du vehicule

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Carte modifiee avec succes",
  "data": {
    "id": "uuid",
    "cardNumber": "CARD001",
    "vehicleId": "new_uuid",
    "isActive": true,
    "vehicle": {...}
  }
}
```

---

#### DELETE `/api/parking/cards/:id`
Supprimer une carte RFID.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de la carte

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Carte supprimee avec succes"
}
```

---

#### PATCH `/api/parking/cards/:id/toggle-status`
Activer ou desactiver une carte RFID.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de la carte

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Carte activee/desactivee avec succes",
  "data": {
    "id": "uuid",
    "cardNumber": "CARD001",
    "isActive": false,
    "vehicle": {...}
  }
}
```

---

### Gestion des entrees et sorties

#### GET `/api/entries`
Recuperer la liste des entrees avec pagination et filtres.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `page` (number, optionnel, defaut: 1) - Numero de page
- `limit` (number, optionnel, defaut: 10) - Nombre d'elements par page
- `status` (string, optionnel) - Filtrer par statut (IN_PROGRESS, COMPLETED, CANCELLED)
- `parkingId` (uuid, optionnel) - Filtrer par parking
- `vehicleType` (string, optionnel) - Filtrer par type de vehicule
- `startDate` (ISO date, optionnel) - Date de debut
- `endDate` (ISO date, optionnel) - Date de fin

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "parkingId": "uuid",
        "vehicleId": "uuid",
        "cardId": "uuid",
        "entryTime": "2025-11-29T10:00:00.000Z",
        "exitTime": "2025-11-29T15:30:00.000Z",
        "duration": 330,
        "amount": 6000,
        "status": "COMPLETED",
        "paymentMethod": "CARTE",
        "parking": {...},
        "vehicle": {...},
        "card": {...}
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

#### GET `/api/entries/active`
Recuperer les entrees en cours (vehicules actuellement dans le parking).

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `parkingId` (uuid, optionnel) - Filtrer par parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entryTime": "2025-11-29T14:00:00.000Z",
      "status": "IN_PROGRESS",
      "parking": {...},
      "vehicle": {...},
      "card": {...}
    }
  ]
}
```

---

#### GET `/api/entries/:id`
Recuperer les details d'une entree specifique.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'entree

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "parkingId": "uuid",
    "vehicleId": "uuid",
    "cardId": "uuid",
    "entryTime": "2025-11-29T10:00:00.000Z",
    "exitTime": "2025-11-29T15:30:00.000Z",
    "duration": 330,
    "amount": 6000,
    "status": "COMPLETED",
    "paymentMethod": "CARTE",
    "parking": {...},
    "vehicle": {...},
    "card": {...}
  }
}
```

---

#### GET `/api/entries/vehicle/:vehicleId`
Recuperer l'historique des entrees d'un vehicule.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `vehicleId` (uuid, requis) - ID du vehicule

**Parametres de requete (Query):**
- `page` (number, optionnel, defaut: 1) - Numero de page
- `limit` (number, optionnel, defaut: 10) - Nombre d'elements par page

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "entries": [...],
    "pagination": {...}
  }
}
```

---

#### POST `/api/entries`
Creer une entree manuelle (enregistrement manuel d'un vehicule).

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres du corps (JSON):**
- `parkingId` (uuid, requis) - ID du parking
- `vehicleId` (uuid, requis) - ID du vehicule
- `cardId` (uuid, optionnel) - ID de la carte RFID

**Reponse reussie (201):**
```json
{
  "success": true,
  "message": "Entree enregistree avec succes",
  "data": {
    "id": "uuid",
    "parkingId": "uuid",
    "vehicleId": "uuid",
    "cardId": "uuid",
    "entryTime": "2025-11-29T14:00:00.000Z",
    "status": "IN_PROGRESS",
    "parking": {...},
    "vehicle": {...},
    "card": {...}
  }
}
```

**Erreurs possibles:**
- 404: Parking ou vehicule non trouve
- 400: Parking complet ou vehicule deja dans un parking
- 400: Carte desactivee ou non associee au vehicule

---

#### PUT `/api/entries/:id/exit`
Enregistrer la sortie d'un vehicule.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'entree

**Parametres du corps (JSON):**
- `exitTime` (ISO date, optionnel) - Heure de sortie (defaut: maintenant)
- `paymentMethod` (string, optionnel) - Mode de paiement (CARTE, ESPECES, etc.)

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Sortie enregistree avec succes",
  "data": {
    "id": "uuid",
    "entryTime": "2025-11-29T10:00:00.000Z",
    "exitTime": "2025-11-29T15:30:00.000Z",
    "duration": 330,
    "amount": 6000,
    "status": "COMPLETED",
    "paymentMethod": "CARTE",
    "parking": {...},
    "vehicle": {...}
  }
}
```

**Erreurs possibles:**
- 404: Entree non trouvee
- 400: Entree deja terminee ou aucun tarif defini

---

#### PATCH `/api/entries/:id/cancel`
Annuler une entree en cours.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `id` (uuid, requis) - ID de l'entree

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Entree annulee avec succes",
  "data": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```

**Erreurs possibles:**
- 404: Entree non trouvee
- 400: Seules les entrees en cours peuvent etre annulees

---

### API Arduino (entrees/sorties automatiques)

#### POST `/api/arduino/entry`
Enregistrement automatique d'une entree detectee par Arduino.

**Autorisation:** Header `x-api-key` avec la cle Arduino

**Parametres du corps (JSON):**
- `cardNumber` (string, requis) - Numero de carte RFID detectee
- `parkingId` (uuid, requis) - ID du parking
- `sensorId` (string, optionnel) - ID du capteur
- `timestamp` (ISO date, optionnel) - Horodatage de detection

**Reponse reussie (200):**
```json
{
  "success": true,
  "action": "OPEN_BARRIER",
  "duration": 5000,
  "message": "Entree autorisee",
  "data": {
    "vehicleType": "VOITURE",
    "plateNumber": "DK-1234-AA",
    "availableSpaces": 44
  }
}
```

**Reponse d'echec:**
```json
{
  "success": false,
  "action": "DENY",
  "message": "Carte non reconnue | Parking complet | Vehicule deja dans un parking"
}
```

**Erreurs possibles:**
- 401: Cle API invalide
- 404: Carte non reconnue ou parking non trouve
- 403: Carte desactivee
- 400: Parking complet ou vehicule deja present

---

#### POST `/api/arduino/exit`
Enregistrement automatique d'une sortie detectee par Arduino.

**Autorisation:** Header `x-api-key` avec la cle Arduino

**Parametres du corps (JSON):**
- `cardNumber` (string, requis) - Numero de carte RFID detectee
- `parkingId` (uuid, requis) - ID du parking
- `sensorId` (string, optionnel) - ID du capteur
- `timestamp` (ISO date, optionnel) - Horodatage de detection

**Reponse reussie (200):**
```json
{
  "success": true,
  "action": "OPEN_BARRIER",
  "duration": 5000,
  "message": "Sortie autorisee",
  "data": {
    "billing": {
      "amount": 6000,
      "duration": 330,
      "vehicleType": "VOITURE",
      "plateNumber": "DK-1234-AA"
    },
    "availableSpaces": 46
  }
}
```

**Reponse d'echec:**
```json
{
  "success": false,
  "action": "DENY",
  "message": "Carte non reconnue | Aucune entree active trouvee"
}
```

---

#### POST `/api/arduino/heartbeat`
Verification de la connexion Arduino.

**Reponse reussie (200):**
```json
{
  "success": true,
  "message": "Arduino connecte",
  "timestamp": "2025-11-29T15:30:00.000Z"
}
```

---

#### GET `/api/arduino/status`
Recuperer le statut du systeme Arduino.

**Reponse reussie (200):**
```json
{
  "success": true,
  "status": "online",
  "server": "operational",
  "timestamp": "2025-11-29T15:30:00.000Z"
}
```

---

### Facturation

#### GET `/api/billing/history`
Recuperer l'historique de facturation avec filtres.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `page` (number, optionnel, defaut: 1) - Numero de page
- `limit` (number, optionnel, defaut: 10) - Nombre d'elements par page
- `startDate` (ISO date, optionnel) - Date de debut
- `endDate` (ISO date, optionnel) - Date de fin
- `parkingId` (uuid, optionnel) - Filtrer par parking
- `minAmount` (number, optionnel) - Montant minimum
- `maxAmount` (number, optionnel) - Montant maximum

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "billings": [
      {
        "id": "uuid",
        "entryTime": "2025-11-29T10:00:00.000Z",
        "exitTime": "2025-11-29T15:30:00.000Z",
        "duration": 330,
        "amount": 6000,
        "parking": {...},
        "vehicle": {...}
      }
    ],
    "pagination": {...},
    "summary": {
      "totalAmount": 150000,
      "averageAmount": 5000,
      "minAmount": 1000,
      "maxAmount": 10000,
      "count": 30
    }
  }
}
```

---

#### GET `/api/billing/:entryId`
Recuperer les details de facturation d'une entree.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `entryId` (uuid, requis) - ID de l'entree

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "parking": {
      "id": "uuid",
      "name": "Parking Principal",
      "location": "Avenue Hassan II, Dakar"
    },
    "vehicle": {
      "plateNumber": "DK-1234-AA",
      "vehicleType": "VOITURE",
      "brand": "Toyota",
      "model": "Corolla"
    },
    "entryTime": "2025-11-29T10:00:00.000Z",
    "exitTime": "2025-11-29T15:30:00.000Z",
    "duration": 330,
    "amount": 6000,
    "paymentMethod": "CARTE",
    "createdAt": "2025-11-29T15:30:00.000Z"
  }
}
```

**Erreurs possibles:**
- 404: Entree non trouvee
- 400: Facturation disponible uniquement pour les entrees terminees

---

#### GET `/api/billing/:entryId/pdf`
Telecharger la facture en format PDF.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres d'URL:**
- `entryId` (uuid, requis) - ID de l'entree

**Reponse reussie (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=facture-{entryId}.pdf`
- Corps: Buffer PDF

**Erreurs possibles:**
- 404: Entree non trouvee
- 400: Impossible de generer une facture pour une entree non terminee

---

#### GET `/api/billing/export/excel`
Exporter un rapport de facturation en format Excel.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `startDate` (ISO date, requis) - Date de debut
- `endDate` (ISO date, requis) - Date de fin
- `parkingId` (uuid, optionnel) - Filtrer par parking
- `status` (string, optionnel) - Filtrer par statut

**Reponse reussie (200):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename=rapport-{startDate}-{endDate}.xlsx`
- Corps: Buffer Excel

**Erreurs possibles:**
- 400: Les dates de debut et de fin sont requises

---

### Statistiques

#### GET `/api/stats/dashboard`
Recuperer les statistiques globales du tableau de bord.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `parkingId` (uuid, optionnel) - Filtrer par parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalParkings": 2,
      "totalVehicles": 150,
      "totalCards": 120,
      "activeEntries": 45,
      "todayEntries": 78,
      "todayRevenue": 234000,
      "totalRevenue": 5600000
    },
    "occupancy": [
      {
        "parkingId": "uuid",
        "parkingName": "Parking Principal",
        "totalCapacity": 100,
        "availableSpaces": 45,
        "occupiedSpaces": 55,
        "occupancyRate": "55.00"
      }
    ]
  }
}
```

---

#### GET `/api/stats/revenue`
Recuperer les statistiques de revenus.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `period` (string, optionnel) - Periode (day, week, month, year)
- `parkingId` (uuid, optionnel) - Filtrer par parking
- `startDate` (ISO date, optionnel) - Date de debut personnalisee
- `endDate` (ISO date, optionnel) - Date de fin personnalisee

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.999Z"
    },
    "summary": {
      "totalRevenue": 450000,
      "entriesCount": 150,
      "averageAmount": 3000
    },
    "byVehicleType": [
      {
        "vehicleType": "VOITURE",
        "totalRevenue": 300000,
        "count": 100
      },
      {
        "vehicleType": "MOTO",
        "totalRevenue": 75000,
        "count": 30
      }
    ],
    "timeline": [
      {
        "date": "2025-11-01",
        "amount": 15000
      },
      {
        "date": "2025-11-02",
        "amount": 18000
      }
    ]
  }
}
```

---

#### GET `/api/stats/occupancy`
Recuperer les statistiques d'occupation.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `period` (string, optionnel) - Periode (day, week, month, year)
- `parkingId` (uuid, optionnel) - Filtrer par parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.999Z"
    },
    "current": [
      {
        "parkingId": "uuid",
        "parkingName": "Parking Principal",
        "totalCapacity": 100,
        "availableSpaces": 45,
        "occupiedSpaces": 55,
        "occupancyRate": "55.00"
      }
    ],
    "averageOccupancy": "62.50",
    "timeline": [
      {
        "date": "2025-11-01",
        "entries": 45,
        "exits": 42
      }
    ]
  }
}
```

---

#### GET `/api/stats/traffic`
Recuperer les statistiques de trafic.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `period` (string, optionnel) - Periode (day, week, month, year)
- `parkingId` (uuid, optionnel) - Filtrer par parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.999Z"
    },
    "summary": {
      "totalEntries": 450,
      "peakHour": "14:00",
      "peakHourCount": 35
    },
    "hourlyTraffic": [
      {
        "hour": 8,
        "count": 25
      },
      {
        "hour": 9,
        "count": 30
      }
    ],
    "dailyTraffic": [
      {
        "date": "2025-11-01",
        "count": 45
      }
    ],
    "byVehicleType": [
      {
        "vehicleType": "VOITURE",
        "count": 300,
        "percentage": "66.67"
      },
      {
        "vehicleType": "MOTO",
        "count": 100,
        "percentage": "22.22"
      }
    ]
  }
}
```

---

#### GET `/api/stats/vehicles-by-type`
Recuperer la repartition des vehicules par type.

**Autorisation:** Bearer Token (GERANT ou SUPER_ADMIN)

**Parametres de requete (Query):**
- `parkingId` (uuid, optionnel) - Filtrer par parking

**Reponse reussie (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byType": [
      {
        "vehicleType": "VOITURE",
        "count": 100,
        "percentage": "66.67"
      },
      {
        "vehicleType": "MOTO",
        "count": 30,
        "percentage": "20.00"
      },
      {
        "vehicleType": "CAMION",
        "count": 15,
        "percentage": "10.00"
      },
      {
        "vehicleType": "AUTRE",
        "count": 5,
        "percentage": "3.33"
      }
    ]
  }
}
```

## WebSocket Events

### Events serveur vers client:
- `parking:update` - Mise a jour des places disponibles
- `entry:created` - Nouvelle entree detectee
- `entry:completed` - Sortie enregistree
- `capacity:alert` - Alerte parking plein
- `system:notification` - Notifications systeme

### Events client vers serveur:
- `subscribe:dashboard` - S'abonner aux mises a jour
- `unsubscribe:dashboard` - Se desabonner
- `request:parking:status` - Demander le statut

## Technologies utilisees

- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT pour l'authentification
- Socket.io pour le temps reel
- PDFKit pour la generation de factures
- ExcelJS pour les exports Excel
- bcryptjs pour le hashage des mots de passe

## Variables d'environnement requises

Voir le fichier `.env.example` pour la liste complete des variables.

## Notes importantes

- Changez tous les secrets (JWT_SECRET, ARDUINO_API_KEY, etc.) en production
- Utilisez HTTPS en production
- Configurez correctement CORS_ORIGIN pour votre domaine frontend
- Sauvegardez regulierement la base de donnees
