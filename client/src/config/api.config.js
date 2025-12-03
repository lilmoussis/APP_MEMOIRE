/**
 * Configuration centralisée de l'API
 * Ce fichier définit toutes les URLs et paramètres de connexion à l'API
 * Centralise toutes les constantes liées aux appels HTTP et WebSocket
 */

/**
 * Configuration principale de l'API REST
 */
export const API_CONFIG = {
  // URL de base de l'API, priorise la variable d'environnement ou utilise localhost par défaut
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // URL pour les WebSockets/Socket.io
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  
  // Timeout global pour les requêtes API (30 secondes)
  TIMEOUT: 30000,
  
  // Headers HTTP par défaut pour toutes les requêtes
  HEADERS: {
    'Content-Type': 'application/json', // Format JSON pour le body
    'Accept': 'application/json'        // Accepte JSON en réponse
  },
  
  // Définition de tous les endpoints de l'API organisés par domaine
  ENDPOINTS: {
    // Authentification et gestion des sessions
    AUTH: {
      LOGIN: '/auth/login',           // Connexion utilisateur
      REGISTER: '/auth/register',     // Inscription utilisateur
      LOGOUT: '/auth/logout',         // Déconnexion
      REFRESH: '/auth/refresh',       // Rafraîchissement token
      ME: '/auth/me'                  // Récupération info utilisateur connecté
    },
    
    // Gestion des utilisateurs
    USERS: {
      BASE: '/users',                            // Liste/Création utilisateurs
      BY_ID: (id) => `/users/${id}`,            // Récupération/Modification par ID
      TOGGLE_STATUS: (id) => `/users/${id}/toggle-status` // Activation/Désactivation
    },
    
    // Gestion des parkings
    PARKING: {
      BASE: '/parking',                                  // Liste/Création parkings
      BY_ID: (id) => `/parking/${id}`,                  // Parking spécifique
      AVAILABILITY: (id) => `/parking/${id}/availability`, // Places disponibles
      TARIFFS: (parkingId) => `/parking/${parkingId}/tariffs`, // Tarifs d'un parking
      TARIFF_BASE: '/parking/tariffs',                   // Tous les tarifs
      TARIFF_BY_ID: (id) => `/parking/tariffs/${id}`     // Tarif spécifique
    },
    
    // Gestion des véhicules
    VEHICLES: {
      BASE: '/parking/vehicles/all',                 // Tous les véhicules
      BY_ID: (id) => `/parking/vehicles/${id}`,     // Véhicule spécifique
      CREATE: '/parking/vehicles',                   // Création véhicule
      SEARCH: (query) => `/parking/vehicles/all?search=${query}` // Recherche véhicules
    },
    
    // Gestion des cartes RFID
    CARDS: {
      BASE: '/parking/cards/all',                    // Toutes les cartes
      BY_ID: (id) => `/parking/cards/${id}`,        // Carte spécifique
      CREATE: '/parking/cards',                      // Création carte
      TOGGLE_STATUS: (id) => `/parking/cards/${id}/toggle-status` // Activation carte
    },
    
    // Gestion des entrées/sorties
    ENTRIES: {
      BASE: '/entries',                              // Historique entrées
      BY_ID: (id) => `/entries/${id}`,              // Entrée spécifique
      ACTIVE: '/entries/active',                     // Entrées en cours
      BY_VEHICLE: (vehicleId) => `/entries/vehicle/${vehicleId}`, // Historique véhicule
      EXIT: (id) => `/entries/${id}/exit`,          // Enregistrer sortie
      CANCEL: (id) => `/entries/${id}/cancel`       // Annuler entrée
    },
    
    // Communication avec Arduino/Matériel
    ARDUINO: {
      ENTRY: '/arduino/entry',       // Signal d'entrée véhicule
      EXIT: '/arduino/exit',         // Signal de sortie véhicule
      HEARTBEAT: '/arduino/heartbeat', // Vérification connexion
      STATUS: '/arduino/status'      // État matériel
    },
    
    // Facturation et paiements
    BILLING: {
      HISTORY: '/billing/history',                   // Historique factures
      BY_ENTRY: (entryId) => `/billing/${entryId}`, // Facture par entrée
      PDF: (entryId) => `/billing/${entryId}/pdf`,  // Téléchargement PDF
      EXPORT_EXCEL: '/billing/export/excel'         // Export Excel
    },
    
    // Statistiques et rapports
    STATS: {
      DASHBOARD: '/stats/dashboard',             // Données dashboard
      REVENUE: '/stats/revenue',                 // Chiffre d'affaires
      OCCUPANCY: '/stats/occupancy',             // Taux d'occupation
      TRAFFIC: '/stats/traffic',                 // Trafic journalier
      VEHICLES_BY_TYPE: '/stats/vehicles-by-type' // Répartition par type véhicule
    }
  }
};

/**
 * Configuration pour Socket.io (WebSockets temps réel)
 */
export const SOCKET_CONFIG = {
  URL: API_CONFIG.SOCKET_URL, // URL de connexion Socket.io
  
  // Options de connexion Socket.io
  OPTIONS: {
    autoConnect: false,          // Ne pas se connecter automatiquement
    reconnection: true,          // Réessayer si déconnecté
    reconnectionAttempts: 5,     // 5 tentatives max
    reconnectionDelay: 1000,     // 1 seconde entre tentatives
    timeout: 20000               // Timeout de connexion
  },
  
  // Définition des événements Socket.io
  EVENTS: {
    // Événements émis PAR LE SERVEUR vers le client
    PARKING_UPDATE: 'parking:update',           // Mise à jour état parking
    ENTRY_CREATED: 'entry:created',             // Nouvelle entrée détectée
    ENTRY_COMPLETED: 'entry:completed',         // Sortie enregistrée
    CAPACITY_ALERT: 'capacity:alert',           // Alerte capacité parking
    SYSTEM_NOTIFICATION: 'system:notification', // Notification système
    
    // Événements émis PAR LE CLIENT vers le serveur
    SUBSCRIBE_DASHBOARD: 'subscribe:dashboard',         // Abonnement dashboard
    UNSUBSCRIBE_DASHBOARD: 'unsubscribe:dashboard',     // Désabonnement dashboard
    REQUEST_PARKING_STATUS: 'request:parking:status'    // Demande état parking
  }
};

/**
 * Messages d'erreur standardisés pour l'application
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Session expirée, veuillez vous reconnecter',
  FORBIDDEN: 'Accès refusé',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer',
  VALIDATION_ERROR: 'Données invalides',
  TIMEOUT: 'Délai d\'attente dépassé'
};

/**
 * Codes de statut HTTP utilisés dans l'application
 */
export const HTTP_STATUS = {
  OK: 200,              // Requête réussie
  CREATED: 201,         // Ressource créée
  BAD_REQUEST: 400,     // Mauvaise requête
  UNAUTHORIZED: 401,    // Non authentifié
  FORBIDDEN: 403,       // Non autorisé
  NOT_FOUND: 404,       // Non trouvé
  CONFLICT: 409,        // Conflit (ex: doublon)
  SERVER_ERROR: 500,    // Erreur serveur interne
  TIMEOUT: 408          // Timeout de requête
};