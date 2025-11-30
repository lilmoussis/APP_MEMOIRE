/**
 * Configuration centralisee de l'API
 * Ce fichier definit toutes les URLs et parametres de connexion a l'API
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 30000, // 30 secondes
  
  // Headers par defaut
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Endpoints de l'API
  ENDPOINTS: {
    // Authentification
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me'
    },
    
    // Utilisateurs
    USERS: {
      BASE: '/users',
      BY_ID: (id) => `/users/${id}`,
      TOGGLE_STATUS: (id) => `/users/${id}/toggle-status`
    },
    
    // Parkings
    PARKING: {
      BASE: '/parking',
      BY_ID: (id) => `/parking/${id}`,
      AVAILABILITY: (id) => `/parking/${id}/availability`,
      TARIFFS: (parkingId) => `/parking/${parkingId}/tariffs`,
      TARIFF_BASE: '/parking/tariffs',
      TARIFF_BY_ID: (id) => `/parking/tariffs/${id}`
    },
    
    // Vehicules
    VEHICLES: {
      BASE: '/parking/vehicles/all',
      BY_ID: (id) => `/parking/vehicles/${id}`,
      CREATE: '/parking/vehicles',
      SEARCH: (query) => `/parking/vehicles/all?search=${query}`
    },
    
    // Cartes RFID
    CARDS: {
      BASE: '/parking/cards/all',
      BY_ID: (id) => `/parking/cards/${id}`,
      CREATE: '/parking/cards',
      TOGGLE_STATUS: (id) => `/parking/cards/${id}/toggle-status`
    },
    
    // Entrees/Sorties
    ENTRIES: {
      BASE: '/entries',
      BY_ID: (id) => `/entries/${id}`,
      ACTIVE: '/entries/active',
      BY_VEHICLE: (vehicleId) => `/entries/vehicle/${vehicleId}`,
      EXIT: (id) => `/entries/${id}/exit`,
      CANCEL: (id) => `/entries/${id}/cancel`
    },
    
    // Arduino
    ARDUINO: {
      ENTRY: '/arduino/entry',
      EXIT: '/arduino/exit',
      HEARTBEAT: '/arduino/heartbeat',
      STATUS: '/arduino/status'
    },
    
    // Facturation
    BILLING: {
      HISTORY: '/billing/history',
      BY_ENTRY: (entryId) => `/billing/${entryId}`,
      PDF: (entryId) => `/billing/${entryId}/pdf`,
      EXPORT_EXCEL: '/billing/export/excel'
    },
    
    // Statistiques
    STATS: {
      DASHBOARD: '/stats/dashboard',
      REVENUE: '/stats/revenue',
      OCCUPANCY: '/stats/occupancy',
      TRAFFIC: '/stats/traffic',
      VEHICLES_BY_TYPE: '/stats/vehicles-by-type'
    }
  }
};

// Configuration Socket.io
export const SOCKET_CONFIG = {
  URL: API_CONFIG.SOCKET_URL,
  OPTIONS: {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
  },
  
  // Events Socket.io
  EVENTS: {
    // Emis par le serveur
    PARKING_UPDATE: 'parking:update',
    ENTRY_CREATED: 'entry:created',
    ENTRY_COMPLETED: 'entry:completed',
    CAPACITY_ALERT: 'capacity:alert',
    SYSTEM_NOTIFICATION: 'system:notification',
    
    // Emis par le client
    SUBSCRIBE_DASHBOARD: 'subscribe:dashboard',
    UNSUBSCRIBE_DASHBOARD: 'unsubscribe:dashboard',
    REQUEST_PARKING_STATUS: 'request:parking:status'
  }
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Session expiree, veuillez vous reconnecter',
  FORBIDDEN: 'Acces refuse',
  NOT_FOUND: 'Ressource non trouvee',
  SERVER_ERROR: 'Erreur serveur, veuillez reessayer',
  VALIDATION_ERROR: 'Donnees invalides',
  TIMEOUT: 'Delai d\'attente depasse'
};

// Codes de statut HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  TIMEOUT: 408
};
