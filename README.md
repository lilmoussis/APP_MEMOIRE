# CAHIER DES CHARGES FONCTIONNEL ET TECHNIQUE
## Système de Gestion de Parking Intelligent

---

## 1. PRESENTATION DU PROJET

### 1.1 Contexte et Objectifs

Le système vise à automatiser et centraliser la gestion d'un parking à travers une solution matérielle (Arduino) connectée à une plateforme logicielle web. L'objectif principal est de permettre le suivi en temps réel des entrées et sorties des véhicules, la gestion automatique de la facturation, et la supervision du taux d'occupation du parking.

### 1.2 Portée du système

- Gestion automatisée des entrées/sorties de véhicules
- Calcul automatique de la facturation selon le temps de stationnement
- Tableau de bord temps réel pour les administrateurs et gérants
- Génération de rapports et statistiques détaillées
- Gestion des utilisateurs et des droits d'accès
- Interface de configuration pour les tarifs et capacités

### 1.3 Acteurs du système

| Acteur | Rôle principal | Accès à la plateforme |
|--------|----------------|----------------------|
| **Super Administrateur** | Supervise, configure et contrôle l'ensemble du système | Interface Web complète |
| **Gérant** | Gère le flux des véhicules, surveille l'état des places | Interface Web restreinte |
| **Arduino** | Dispositif physique chargé de la détection et du comptage des véhicules | Communication automatique via module Wi-Fi (ESP8266) |

---

## 2. SPECIFICATIONS FONCTIONNELLES

### 2.1 Fonctionnalités du Super Administrateur

| Fonctionnalité | Description | Entrées | Sorties/Résultats attendus |
|----------------|-------------|---------|----------------------------|
| **Authentification** | Accès sécurisé par identifiant et mot de passe | Login, mot de passe | Accès à l'espace d'administration avec token JWT |
| **Configuration du nombre de places** | Définir la capacité totale du parking | Nombre total de places | Base de données mise à jour, affichage du total |
| **Configuration du prix par type de véhicule** | Définir les tarifs selon le type (moto, voiture, camion, etc.) | Type de véhicule, prix par heure | Table tarifaire enregistrée et utilisée pour la facturation |
| **Gestion des gérants** | Ajouter, modifier, supprimer des comptes gérants | Formulaire gérant (nom, login, email, contact) | Liste des gérants mise à jour |
| **Gestion des entrées/sorties** | Visualiser toutes les opérations effectuées | Filtres (date, type véhicule) | Historique détaillé et export possible (PDF, Excel) |
| **Statistiques avancées** | Afficher les statistiques d'utilisation du parking (par jour, mois, année) | Choix période | Graphiques dynamiques (taux d'occupation, revenu généré, pics de fréquentation) |
| **Gestion de facturation** | Génération automatique de factures en fonction du temps passé | Données d'entrée et de sortie | Facture générée et téléchargeable (PDF) |
| **Gestion des cartes RFID/Badge** | Ajouter ou supprimer les cartes des usagers enregistrés | ID de carte, informations du véhicule | Association carte/véhicule sauvegardée |
| **Gestion des paramètres système** | Configurer les seuils d'alerte, notifications | Paramètres personnalisés | Système configuré selon préférences |
| **Audit et logs** | Consulter l'historique des actions effectuées sur le système | Filtres utilisateur/date | Journal d'audit complet |

### 2.2 Fonctionnalités du Gérant

| Fonctionnalité | Description | Entrées | Sorties/Résultats attendus |
|----------------|-------------|---------|----------------------------|
| **Authentification** | Connexion sécurisée à son espace personnel | Login, mot de passe | Accès aux fonctions autorisées avec token JWT |
| **Créer une entrée** | Enregistrer manuellement ou automatiquement une entrée de véhicule | Numéro de carte ou plaque | Entrée enregistrée et place occupée mise à jour |
| **Créer une sortie** | Enregistrer le départ d'un véhicule | Numéro de carte ou plaque | Sortie validée, facture générée automatiquement |
| **Gestion de facturation** | Génération automatique de factures en fonction du temps passé | Données d'entrée et de sortie | Facture générée et téléchargeable |
| **Voir les statistiques** | Visualiser les données de fréquentation du jour | Date sélectionnée | Graphique synthétique et indicateurs clés |
| **Voir les places disponibles** | Consulter le nombre de places encore libres | Actualisation en temps réel | Affichage en temps réel du nombre de places |
| **Recherche de véhicules** | Rechercher un véhicule dans le parking | Plaque ou ID carte | Informations détaillées du véhicule et statut |

### 2.3 Fonctionnalités Automatisées (Arduino)

| Fonctionnalité | Description | Éléments matériels impliqués |
|----------------|-------------|------------------------------|
| **Détection automatique d'entrée/sortie** | Le capteur ultrason détecte un véhicule et envoie l'information à l'Arduino | Capteurs HC-SR04, Arduino Uno, ESP8266 |
| **Mise à jour automatique des places** | Chaque entrée/sortie actualise la base de données du parking | Arduino, Serveur Node.js, PostgreSQL |
| **Commande de la barrière** | La barrière s'ouvre/ferme automatiquement selon l'état d'entrée/sortie | Servomoteur connecté à Arduino |
| **Transmission des données** | L'Arduino envoie les données via Wi-Fi vers le serveur Node.js | Module ESP8266, API REST |
| **Lecture RFID** | Identification automatique des véhicules enregistrés | Module RFID RC522 (optionnel) |

---

## 3. SPECIFICATIONS TECHNIQUES

### 3.1 Architecture Système

#### 3.1.1 Vue d'ensemble

```
[Arduino + Capteurs] <--WiFi--> [API Node.js + Express] <---> [PostgreSQL + Prisma ORM]
                                         ^
                                         |
                                    [WebSocket]
                                         |
                                         v
                                [Application Web React]
```

#### 3.1.2 Composants techniques

| Composant | Technologie | Rôle | Interaction principale |
|-----------|-------------|------|------------------------|
| **Frontend** | React 18+, TailwindCSS, React Router, Axios, Socket.io-client | Interface utilisateur web responsive | Communication via API REST et WebSocket |
| **Backend API** | Node.js 18+, Express.js, Socket.io | Gestion des requêtes, logique métier | Communication bidirectionnelle avec Arduino et Frontend |
| **ORM** | Prisma | Abstraction base de données, migrations, typage | Interaction avec PostgreSQL |
| **Base de données** | PostgreSQL 14+ | Stockage centralisé des données | Serveur Node.js via Prisma |
| **Authentification** | JWT (jsonwebtoken), bcrypt | Sécurisation des accès | Middleware sur API |
| **Hardware** | Arduino Uno, ESP8266, HC-SR04, Servomoteur | Détection, commande et communication | Envoie les données d'état au serveur via HTTP |

### 3.2 Stack Technique Détaillée

#### 3.2.1 Frontend (React)

**Dépendances principales :**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "socket.io-client": "^4.6.0",
  "recharts": "^2.10.0",
  "react-hot-toast": "^2.4.1",
  "date-fns": "^2.30.0",
  "zustand": "^4.4.0",
  "@headlessui/react": "^1.7.17",
  "@heroicons/react": "^2.1.0"
}
```

**Structure des dossiers :**
```
client/
├── src/
│   ├── components/
│   │   ├── common/          # Composants réutilisables
│   │   ├── dashboard/       # Tableaux de bord
│   │   ├── parking/         # Gestion parking
│   │   ├── billing/         # Facturation
│   │   └── stats/           # Statistiques
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── GerantDashboard.jsx
│   │   └── Settings.jsx
│   ├── services/
│   │   ├── api.js           # Client Axios configuré
│   │   ├── socket.js        # Client WebSocket
│   │   └── auth.js          # Gestion authentification
│   ├── store/               # State management (Zustand)
│   ├── hooks/               # Hooks personnalisés
│   ├── utils/               # Utilitaires
│   └── App.jsx
├── public/
└── package.json
```

#### 3.2.2 Backend (Node.js + Express)

**Dépendances principales :**
```json
{
  "express": "^4.18.2",
  "@prisma/client": "^5.7.0",
  "socket.io": "^4.6.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "pdfkit": "^0.13.0",
  "exceljs": "^4.4.0"
}
```

**Structure des dossiers :**
```
server/
├── prisma/
│   ├── schema.prisma        # Schéma de base de données
│   └── migrations/          # Migrations générées
├── src/
│   ├── config/
│   │   ├── database.js      # Configuration Prisma
│   │   └── socket.js        # Configuration Socket.io
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── parkingController.js
│   │   ├── entryController.js
│   │   ├── billingController.js
│   │   ├── userController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   ├── auth.js          # Vérification JWT
│   │   ├── roles.js         # Vérification des rôles
│   │   └── validators.js    # Validation des données
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── parking.routes.js
│   │   ├── entries.routes.js
│   │   ├── billing.routes.js
│   │   ├── users.routes.js
│   │   ├── stats.routes.js
│   │   └── arduino.routes.js
│   ├── services/
│   │   ├── billingService.js
│   │   ├── pdfService.js
│   │   └── excelService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   └── index.js             # Point d'entrée
├── .env
└── package.json
```

#### 3.2.3 Base de données (PostgreSQL + Prisma)

**Schéma Prisma (schema.prisma) :**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  firstName String?
  lastName  String?
  phone     String?
  role      Role     @default(GERANT)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  SUPER_ADMIN
  GERANT
}

model Parking {
  id                String   @id @default(uuid())
  name              String
  totalCapacity     Int
  availableSpaces   Int
  location          String?
  description       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tariffs           Tariff[]
  entries           Entry[]

  @@map("parkings")
}

model Tariff {
  id          String      @id @default(uuid())
  parkingId   String
  vehicleType VehicleType
  pricePerHour Float
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  parking     Parking     @relation(fields: [parkingId], references: [id], onDelete: Cascade)

  @@unique([parkingId, vehicleType])
  @@map("tariffs")
}

enum VehicleType {
  MOTO
  VOITURE
  CAMION
  AUTRE
}

model Vehicle {
  id          String      @id @default(uuid())
  plateNumber String      @unique
  vehicleType VehicleType
  brand       String?
  model       String?
  color       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  cards       Card[]
  entries     Entry[]

  @@map("vehicles")
}

model Card {
  id         String   @id @default(uuid())
  cardNumber String   @unique
  vehicleId  String
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  vehicle    Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  entries    Entry[]

  @@map("cards")
}

model Entry {
  id         String      @id @default(uuid())
  parkingId  String
  vehicleId  String
  cardId     String?
  entryTime  DateTime    @default(now())
  exitTime   DateTime?
  duration   Int?        // en minutes
  amount     Float?
  status     EntryStatus @default(IN_PROGRESS)
  paymentMethod String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  parking    Parking     @relation(fields: [parkingId], references: [id])
  vehicle    Vehicle     @relation(fields: [vehicleId], references: [id])
  card       Card?       @relation(fields: [cardId], references: [id])

  @@map("entries")
}

enum EntryStatus {
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### 3.3 API REST - Endpoints

#### 3.3.1 Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription (Super Admin uniquement)
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Récupérer profil utilisateur connecté

#### 3.3.2 Gestion des utilisateurs
- `GET /api/users` - Liste des utilisateurs (Super Admin)
- `POST /api/users` - Créer un gérant (Super Admin)
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (Super Admin)
- `PATCH /api/users/:id/toggle-status` - Activer/désactiver un utilisateur

#### 3.3.3 Gestion du parking
- `GET /api/parking` - Récupérer informations du parking
- `PUT /api/parking/:id` - Modifier configuration (Super Admin)
- `GET /api/parking/availability` - Places disponibles en temps réel

#### 3.3.4 Gestion des tarifs
- `GET /api/tariffs` - Liste des tarifs
- `POST /api/tariffs` - Créer un tarif (Super Admin)
- `PUT /api/tariffs/:id` - Modifier un tarif (Super Admin)
- `DELETE /api/tariffs/:id` - Supprimer un tarif (Super Admin)

#### 3.3.5 Gestion des véhicules
- `GET /api/vehicles` - Liste des véhicules
- `POST /api/vehicles` - Enregistrer un nouveau véhicule
- `GET /api/vehicles/:id` - Détails d'un véhicule
- `PUT /api/vehicles/:id` - Modifier un véhicule
- `DELETE /api/vehicles/:id` - Supprimer un véhicule
- `GET /api/vehicles/search?plate=` - Rechercher par plaque

#### 3.3.6 Gestion des cartes RFID
- `GET /api/cards` - Liste des cartes
- `POST /api/cards` - Créer une carte
- `PUT /api/cards/:id` - Modifier une carte
- `DELETE /api/cards/:id` - Supprimer une carte
- `PATCH /api/cards/:id/toggle-status` - Activer/désactiver

#### 3.3.7 Gestion des entrées/sorties
- `GET /api/entries` - Liste des entrées (avec pagination et filtres)
- `POST /api/entries` - Créer une entrée manuelle
- `POST /api/entries/auto` - Entrée automatique (Arduino)
- `PUT /api/entries/:id/exit` - Enregistrer une sortie
- `GET /api/entries/:id` - Détails d'une entrée
- `GET /api/entries/active` - Véhicules actuellement dans le parking
- `GET /api/entries/vehicle/:vehicleId` - Historique d'un véhicule

#### 3.3.8 Facturation
- `GET /api/billing/:entryId` - Récupérer une facture
- `GET /api/billing/:entryId/pdf` - Télécharger facture PDF
- `GET /api/billing/export/excel?start=&end=` - Export Excel

#### 3.3.9 Statistiques
- `GET /api/stats/dashboard` - Statistiques générales du tableau de bord
- `GET /api/stats/revenue?period=` - Statistiques de revenus
- `GET /api/stats/occupancy?period=` - Taux d'occupation
- `GET /api/stats/traffic?period=` - Analyse du trafic
- `GET /api/stats/vehicles-by-type` - Répartition par type de véhicule

#### 3.3.10 Arduino (API spécifique)
- `POST /api/arduino/entry` - Signal d'entrée détectée
- `POST /api/arduino/exit` - Signal de sortie détectée
- `POST /api/arduino/heartbeat` - Vérification connexion Arduino
- `GET /api/arduino/status` - État du système Arduino

### 3.4 WebSocket Events

#### Events émis par le serveur :
- `parking:update` - Mise à jour des places disponibles
- `entry:created` - Nouvelle entrée détectée
- `entry:completed` - Sortie enregistrée
- `capacity:alert` - Alerte parking plein
- `system:notification` - Notifications système

#### Events reçus du client :
- `subscribe:dashboard` - S'abonner aux mises à jour du tableau de bord
- `unsubscribe:dashboard` - Se désabonner

### 3.5 Communication Arduino

#### 3.5.1 Format de communication

**Entrée détectée (Arduino → Server) :**
```json
POST /api/arduino/entry
{
  "cardId": "A1B2C3D4",
  "sensorId": "ENTRY_01",
  "timestamp": "2025-11-18T10:30:00Z",
  "vehicleType": "VOITURE"
}
```

**Réponse (Server → Arduino) :**
```json
{
  "success": true,
  "action": "OPEN_BARRIER",
  "duration": 5000,
  "message": "Entrée autorisée",
  "availableSpaces": 45
}
```

**Sortie détectée (Arduino → Server) :**
```json
POST /api/arduino/exit
{
  "cardId": "A1B2C3D4",
  "sensorId": "EXIT_01",
  "timestamp": "2025-11-18T12:30:00Z"
}
```

**Réponse (Server → Arduino) :**
```json
{
  "success": true,
  "action": "OPEN_BARRIER",
  "duration": 5000,
  "billing": {
    "amount": 15.50,
    "duration": 120,
    "vehicleType": "VOITURE"
  }
}
```

#### 3.5.2 Code Arduino (Structure)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Configuration WiFi
const char* ssid = "PARKING_WIFI";
const char* password = "PASSWORD";
const char* serverUrl = "http://192.168.1.100:5000/api/arduino";

// Pins
const int TRIG_ENTRY = D1;
const int ECHO_ENTRY = D2;
const int TRIG_EXIT = D3;
const int ECHO_EXIT = D4;
const int SERVO_PIN = D5;

// Fonctions principales
void setup() {
  // Initialisation
}

void loop() {
  // Boucle principale
}

void detectEntry() {
  // Détection entrée
}

void detectExit() {
  // Détection sortie
}

void sendToServer(String endpoint, String payload) {
  // Envoi HTTP
}

void openBarrier(int duration) {
  // Contrôle servomoteur
}
```

### 3.6 Sécurité

#### 3.6.1 Authentification et autorisation
- JWT avec expiration (24h pour access token)
- Refresh tokens stockés côté serveur
- Hash des mots de passe avec bcrypt (salt rounds: 10)
- Middleware de vérification des rôles

#### 3.6.2 Validation des données
- express-validator pour valider toutes les entrées
- Sanitization des données utilisateur
- Limitation du taux de requêtes (rate limiting)

#### 3.6.3 Protection
- Helmet.js pour headers HTTP sécurisés
- CORS configuré pour origines autorisées uniquement
- Protection CSRF pour les formulaires
- Variables d'environnement pour secrets

### 3.7 Variables d'environnement

**Backend (.env) :**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/parking_db"

# JWT
JWT_SECRET="votre_secret_jwt_tres_securise"
JWT_EXPIRES_IN="24h"
REFRESH_TOKEN_SECRET="votre_secret_refresh_token"

# Server
PORT=5000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Arduino
ARDUINO_API_KEY="cle_api_arduino_securisee"
```

**Frontend (.env) :**
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

---

## 4. ARCHITECTURE FONCTIONNELLE

### 4.1 Diagramme de classes (Modèle de données)

Classes principales :
- **User** : Gestion des utilisateurs (Super Admin, Gérant)
- **Parking** : Configuration du parking
- **Tariff** : Tarifs par type de véhicule
- **Vehicle** : Informations des véhicules
- **Card** : Cartes RFID associées aux véhicules
- **Entry** : Enregistrement des entrées/sorties

### 4.2 Diagramme de séquence - Entrée d'un véhicule

```
Arduino                Server               Database            WebSocket           Frontend
   |                     |                     |                    |                  |
   |--Détection capteur->|                     |                    |                  |
   |                     |                     |                    |                  |
   |<-POST /entry--------|                     |                    |                  |
   |   {cardId}          |                     |                    |                  |
   |                     |--Vérifier carte---->|                    |                  |
   |                     |<-Card OK------------|                    |                  |
   |                     |                     |                    |                  |
   |                     |--Créer Entry------->|                    |                  |
   |                     |<-Entry créée--------|                    |                  |
   |                     |                     |                    |                  |
   |                     |--Maj places-------->|                    |                  |
   |                     |<-OK-----------------|                    |                  |
   |                     |                     |                    |                  |
   |                     |---------------------|-------------emit-->|                  |
   |                     |                     |          'entry:created'              |
   |                     |                     |                    |------notify----->|
   |<-Response-----------|                     |                    |                  |
   | {action: OPEN}      |                     |                    |                  |
   |                     |                     |                    |                  |
   |--Ouvre barrière     |                     |                    |                  |
```

### 4.3 Diagramme d'activités - Processus d'entrée

1. Véhicule arrive devant la barrière
2. Capteur ultrason détecte présence
3. Arduino lit carte RFID (si disponible)
4. Envoi données au serveur
5. Serveur vérifie disponibilité places
   - Si places disponibles :
     - Créer entrée en base
     - Décrémenter places disponibles
     - Envoyer commande ouverture barrière
     - Notifier frontend via WebSocket
   - Si parking plein :
     - Envoyer refus à Arduino
     - Afficher "COMPLET" sur écran
6. Arduino ouvre/ferme barrière selon réponse

### 4.4 Diagramme de déploiement

```
┌─────────────────────────────────────────────────┐
│              Utilisateurs (Navigateurs)         │
│           https://parking-app.com               │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│         Serveur Web (Frontend - React)          │
│              - Nginx / Vercel                   │
│              - Build production                 │
└──────────────────┬──────────────────────────────┘
                   │ REST API + WebSocket
                   ▼
┌─────────────────────────────────────────────────┐
│       Serveur Backend (Node.js + Express)       │
│         - API REST                              │
│         - Socket.io                             │
│         - JWT Auth                              │
└──────────────────┬──────────────────────────────┘
                   │ Prisma ORM
                   ▼
┌─────────────────────────────────────────────────┐
│      Base de données (PostgreSQL 14+)           │
│         - Tables relationnelles                 │
│         - Indexation                            │
└─────────────────────────────────────────────────┘

         ┌────────────────┐
         │    Arduino     │
         │   + ESP8266    │──WiFi──> Serveur Backend
         │  + Capteurs    │          (API Arduino)
         └────────────────┘
```

---

## 5. EXIGENCES NON FONCTIONNELLES

### 5.1 Performance
- Temps de réponse API : < 200ms pour 95% des requêtes
- Temps d'ouverture barrière : < 3 secondes après détection
- Support de 100 utilisateurs simultanés minimum
- Mise à jour temps réel : latence < 500ms via WebSocket

### 5.2 Scalabilité
- Architecture modulaire permettant l'ajout de parkings multiples
- Base de données optimisée avec indexation
- Possibilité de clustering Node.js

### 5.3 Disponibilité
- Uptime cible : 99.5%
- Gestion des erreurs Arduino avec retry automatique
- Logs détaillés pour diagnostic

### 5.4 Sécurité
- Chiffrement HTTPS pour communication web
- Protection contre injections SQL (via Prisma)
- Protection XSS et CSRF
- Authentification forte avec JWT

### 5.5 Maintenabilité
- Code commenté et documenté
- Tests unitaires et d'intégration
- Versioning de l'API
- Migrations de base de données versionnées (Prisma)

### 5.6 Utilisabilité
- Interface responsive (mobile, tablette, desktop)
- Temps de chargement initial < 3 secondes
- Messages d'erreur explicites en français
- Accessibilité WCAG 2.1 niveau AA

---

## 6. PHASES DE DEVELOPPEMENT

### Phase 1 - Setup et Infrastructure (Semaine 1-2)
- Configuration environnement développement
- Initialisation projet React + Node.js
- Configuration PostgreSQL et Prisma
- Schéma base de données initial
- Architecture dossiers

### Phase 2 - Backend Core (Semaine 3-4)
- Authentification JWT
- CRUD utilisateurs
- CRUD parking et tarifs
- CRUD véhicules et cartes
- Middleware de sécurité

### Phase 3 - Gestion Entrées/Sorties (Semaine 5-6)
- Logique métier entrées/sorties
- Calcul automatique facturation
- API Arduino
- WebSocket temps réel
- Tests unitaires

### Phase 4 - Frontend Core (Semaine 7-8)
- Pages authentification
- Dashboard Super Admin
- Dashboard Gérant
- Gestion utilisateurs
- Configuration parking

### Phase 5 - Frontend Avancé (Semaine 9-10)
- Gestion entrées/sorties
- Statistiques et graphiques
- Génération factures PDF
- Export Excel
- Recherche et filtres

### Phase 6 - Intégration Arduino (Semaine 11-12)
- Développement code Arduino
- Tests capteurs
- Communication WiFi
- Synchronisation serveur
- Tests d'intégration

### Phase 7 - Tests et Optimisation (Semaine 13-14)
- Tests end-to-end
- Optimisation performances
- Corrections bugs
- Documentation technique
- Documentation utilisateur

### Phase 8 - Déploiement (Semaine 15-16)
- Configuration serveur production
- Déploiement base de données
- Déploiement backend
- Déploiement frontend
- Formation utilisateurs
- Mise en production

---

## 7. LIVRABLES

### 7.1 Livrables techniques
- Code source complet (Frontend + Backend + Arduino)
- Base de données avec données de test
- Documentation technique complète
- Scripts de déploiement
- Fichiers de configuration

### 7.2 Livrables documentaires
- Cahier des charges (ce document)
- Guide d'installation
- Guide utilisateur (Super Admin)
- Guide utilisateur (Gérant)
- Documentation API (Swagger/OpenAPI)
- Schémas d'architecture

### 7.3 Livrables matériels
- Prototype Arduino fonctionnel
- Liste du matériel nécessaire
- Schémas de câblage
- Guide d'installation matériel

---

## 8. CONTRAINTES ET HYPOTHESES

### 8.1 Contraintes
- Budget limité pour hébergement cloud
- Utilisation obligatoire de technologies open-source
- Interface en français uniquement
- Support navigateurs modernes uniquement (Chrome, Firefox, Edge, Safari)

### 8.2 Hypothèses
- Connexion WiFi stable disponible sur site
- Alimentation électrique continue pour Arduino
- Utilisateurs familiers avec outils web basiques
- Un seul parking géré initialement (évolution multi-parking possible)

---

## 9. GLOSSAIRE

- **API** : Application Programming Interface
- **Arduino** : Plateforme de prototypage électronique open-source
- **ESP8266** : Module WiFi pour communication sans fil
- **HC-SR04** : Capteur de distance ultrason
- **JWT** : JSON Web Token, standard d'authentification
- **ORM** : Object-Relational Mapping, abstraction base de données
- **Prisma** : ORM moderne pour Node.js et TypeScript
- **RFID** : Radio Frequency Identification, identification par radiofréquence
- **REST** : Representational State Transfer, architecture API
- **WebSocket** : Protocole de communication bidirectionnelle temps réel
