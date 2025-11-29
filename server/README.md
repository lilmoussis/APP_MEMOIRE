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

## Structure de l'API

### Authentification
- POST `/api/auth/login` - Connexion
- POST `/api/auth/register` - Inscription (Super Admin uniquement)
- POST `/api/auth/refresh` - Rafraichir le token
- POST `/api/auth/logout` - Deconnexion
- GET `/api/auth/me` - Profil utilisateur

### Utilisateurs (Super Admin uniquement)
- GET `/api/users` - Liste des utilisateurs
- GET `/api/users/:id` - Details d'un utilisateur
- POST `/api/users` - Creer un utilisateur
- PUT `/api/users/:id` - Modifier un utilisateur
- DELETE `/api/users/:id` - Supprimer un utilisateur
- PATCH `/api/users/:id/toggle-status` - Activer/Desactiver

### Parking
- GET `/api/parking` - Liste des parkings
- GET `/api/parking/:id` - Details d'un parking
- POST `/api/parking` - Creer un parking (Super Admin)
- PUT `/api/parking/:id` - Modifier un parking (Super Admin)
- DELETE `/api/parking/:id` - Supprimer un parking (Super Admin)
- GET `/api/parking/:id/availability` - Places disponibles

### Tarifs
- GET `/api/parking/:parkingId/tariffs` - Liste des tarifs
- POST `/api/parking/tariffs` - Creer un tarif (Super Admin)
- PUT `/api/parking/tariffs/:id` - Modifier un tarif (Super Admin)
- DELETE `/api/parking/tariffs/:id` - Supprimer un tarif (Super Admin)

### Vehicules
- GET `/api/parking/vehicles/all` - Liste des vehicules
- GET `/api/parking/vehicles/:id` - Details d'un vehicule
- POST `/api/parking/vehicles` - Enregistrer un vehicule
- PUT `/api/parking/vehicles/:id` - Modifier un vehicule
- DELETE `/api/parking/vehicles/:id` - Supprimer un vehicule

### Cartes RFID
- GET `/api/parking/cards/all` - Liste des cartes
- POST `/api/parking/cards` - Creer une carte
- PUT `/api/parking/cards/:id` - Modifier une carte
- DELETE `/api/parking/cards/:id` - Supprimer une carte
- PATCH `/api/parking/cards/:id/toggle-status` - Activer/Desactiver

### Entrees/Sorties
- GET `/api/entries` - Liste des entrees
- GET `/api/entries/active` - Entrees en cours
- GET `/api/entries/:id` - Details d'une entree
- GET `/api/entries/vehicle/:vehicleId` - Historique d'un vehicule
- POST `/api/entries` - Creer une entree manuelle
- PUT `/api/entries/:id/exit` - Enregistrer une sortie
- PATCH `/api/entries/:id/cancel` - Annuler une entree

### Arduino (API automatique)
- POST `/api/arduino/entry` - Entree automatique
- POST `/api/arduino/exit` - Sortie automatique
- POST `/api/arduino/heartbeat` - Verification connexion
- GET `/api/arduino/status` - Statut du systeme

### Facturation
- GET `/api/billing/history` - Historique de facturation
- GET `/api/billing/:entryId` - Details d'une facture
- GET `/api/billing/:entryId/pdf` - Telecharger facture PDF
- GET `/api/billing/export/excel` - Export Excel

### Statistiques
- GET `/api/stats/dashboard` - Statistiques du dashboard
- GET `/api/stats/revenue` - Statistiques de revenus
- GET `/api/stats/occupancy` - Taux d'occupation
- GET `/api/stats/traffic` - Analyse du trafic
- GET `/api/stats/vehicles-by-type` - Repartition par type

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
