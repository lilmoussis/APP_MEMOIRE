# Frontend React SmartPark - Documentation

## Vue d'ensemble

Application React moderne pour la gestion du systeme de parking SmartPark. L'application utilise Bootstrap (pas TailwindCSS) avec une couleur principale personnalisee #624bff.

## Technologies utilisees

- React 19.2.0
- Vite 7.2.4 (Build tool)
- React Router DOM 7.9.6 (Navigation)
- Zustand 5.0.8 (State management)
- Axios 1.13.2 (HTTP client)
- Socket.io-client 4.8.1 (WebSocket)
- Bootstrap 5.3.3 (UI framework)
- React Hot Toast 2.6.0 (Notifications)
- Lucide React 0.554.0 (Icons)
- Recharts 3.5.0 (Graphiques)
- Date-fns 4.1.0 (Manipulation dates)

## Structure du projet

```
client/
├── src/
│   ├── config/
│   │   └── api.config.js                 # Configuration centralisee de l'API
│   │
│   ├── services/
│   │   ├── api.client.js                 # Client Axios configure avec intercepteurs
│   │   ├── auth.service.js               # Service d'authentification
│   │   ├── parking.service.js            # Service gestion parkings
│   │   ├── vehicle.service.js            # Service gestion vehicules
│   │   ├── card.service.js               # Service gestion cartes RFID
│   │   ├── entry.service.js              # Service gestion entrees/sorties
│   │   ├── billing.service.js            # Service facturation
│   │   ├── stats.service.js              # Service statistiques
│   │   ├── user.service.js               # Service gestion utilisateurs
│   │   └── socket.service.js             # Service WebSocket temps reel
│   │
│   ├── store/
│   │   └── index.js                      # Store Zustand centralise
│   │
│   ├── components/
│   │   ├── Layout.jsx                    # Layout principal avec authentification
│   │   ├── Sidebar.jsx                   # Navigation laterale
│   │   ├── Navbar.jsx                    # Barre navigation superieure
│   │   └── common/
│   │       ├── Loading.jsx               # Composant de chargement
│   │       ├── ErrorMessage.jsx          # Affichage erreurs
│   │       ├── EmptyState.jsx            # Etat vide
│   │       └── Pagination.jsx            # Pagination
│   │
│   ├── pages/
│   │   ├── Login.jsx                     # Page de connexion
│   │   ├── AdminDashboard.jsx            # Export dashboard admin
│   │   ├── GerantDashboard.jsx           # Export dashboard gerant
│   │   ├── admin/
│   │   │   └── Dashboard.jsx             # Dashboard Super Admin
│   │   └── gerant/
│   │       └── Dashboard.jsx             # Dashboard Gerant
│   │
│   ├── styles/
│   │   └── global.css                    # Styles globaux avec couleur #624bff
│   │
│   ├── App.jsx                           # Configuration routes
│   └── main.jsx                          # Point d'entree
│
├── .env                                  # Variables d'environnement
├── .env.example                          # Template variables d'environnement
└── package.json                          # Dependances
```

## Fonctionnalites implementees

### 1. Architecture centralisee

- Configuration API centralisee dans `config/api.config.js`
- Client Axios avec intercepteurs pour gestion automatique des tokens
- Refresh automatique des tokens JWT
- Gestion centralisee des erreurs

### 2. State Management (Zustand)

Six stores principaux :
- **useAuthStore** : Authentification et utilisateur connecte
- **useParkingStore** : Gestion des parkings
- **useEntryStore** : Gestion des entrees/sorties
- **useVehicleStore** : Gestion des vehicules
- **useStatsStore** : Statistiques
- **useNotificationStore** : Notifications temps reel

### 3. Services API

Huit services complets pour communiquer avec le backend :
- authService : Connexion, deconnexion, profil
- parkingService : CRUD parkings et tarifs
- vehicleService : CRUD vehicules
- cardService : CRUD cartes RFID
- entryService : Gestion entrees/sorties
- billingService : Facturation et exports PDF/Excel
- statsService : Toutes les statistiques
- userService : Gestion utilisateurs (Super Admin)

### 4. WebSocket temps reel

- Connexion automatique Socket.io au montage
- Ecoute des evenements :
  - `parking:update` : Mise a jour places disponibles
  - `entry:created` : Nouvelle entree
  - `entry:completed` : Sortie enregistree
  - `capacity:alert` : Alerte parking plein
  - `system:notification` : Notifications systeme
- Subscription/unsubscription automatique

### 5. Interface utilisateur

- Design moderne avec Bootstrap 5.3.3
- Couleur principale personnalisee : #624bff
- Sidebar avec navigation role-based
- Navbar avec notifications et menu utilisateur
- Composants reutilisables (Loading, ErrorMessage, EmptyState, Pagination)
- Responsive design

### 6. Authentification et autorisation

- Routes protegees par role (SUPER_ADMIN, GERANT)
- Redirection automatique selon le role
- Gestion des tokens JWT avec refresh automatique
- Deconnexion automatique si token expire

## Configuration

### Variables d'environnement (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_APP_NAME=SmartPark
```

## Comptes de test

- Super Admin : `admin` / `admin123456`
- Gerant : `gerant` / `gerant123456`

## Commandes disponibles

```bash
# Demarrer en mode developpement
npm run live

# Build pour production
npm run build

# Previsualiser le build
npm run preview

# Linter
npm run lint
```

## URLs importantes

- Frontend : http://localhost:5173
- Backend API : http://localhost:5000/api
- WebSocket : http://localhost:5000

## Prochaines etapes

Pour completer l'application, il faudrait implementer :

1. Pages detaillees pour chaque section :
   - Gestion des parkings (liste, creation, modification)
   - Gestion des vehicules (liste, creation, modification)
   - Gestion des cartes RFID (liste, creation, modification)
   - Historique des entrees/sorties avec filtres
   - Facturation avec exports PDF/Excel
   - Statistiques avec graphiques (Recharts)
   - Gestion des utilisateurs (Super Admin uniquement)

2. Formulaires de creation/modification :
   - Validation des champs
   - Messages d'erreur appropries
   - Confirmation avant suppression

3. Graphiques et statistiques :
   - Integration de Recharts
   - Graphiques de revenus
   - Graphiques d'occupation
   - Graphiques de trafic

4. Ameliorations UX :
   - Loading states
   - Skeleton loaders
   - Toast notifications pour chaque action
   - Confirmation modals

5. Responsive design :
   - Sidebar collapsible sur mobile
   - Tables scrollables
   - Cards empilees sur petits ecrans

## Notes importantes

- Pas de TailwindCSS utilise (Bootstrap uniquement)
- Pas de TypeScript (JavaScript uniquement)
- Couleur principale : #624bff
- Toutes les dependances installees sans --legacy-peer-deps
- Communication centralisee avec l'API via les services
- State management global avec Zustand
- WebSocket pour les mises a jour temps reel

## Support et maintenance

Pour toute question ou probleme :
1. Verifier que le backend est demarre (port 5000)
2. Verifier les variables d'environnement
3. Consulter la console navigateur pour les erreurs
4. Verifier la connexion Socket.io dans les DevTools
