/**
 * Store global Zustand
 * Gestion centralisée de l'état de l'application
 * Utilise Zustand (bibliothèque de gestion d'état légère) pour créer plusieurs stores
 */

// Importation de la fonction create depuis Zustand pour créer des stores
import { create } from 'zustand';
// Importation du service d'authentification pour les opérations liées à l'auth
import authService from '../services/auth.service';

/**
 * Store d'authentification
 * Gère l'état d'authentification de l'utilisateur et les informations de profil
 */
export const useAuthStore = create((set, get) => ({
  // État initial
  user: authService.getCurrentUser(),        // Utilisateur actuel (récupéré du stockage local)
  isAuthenticated: authService.isAuthenticated(), // Statut d'authentification (booléen)
  isLoading: false,                          // Indicateur de chargement pour les opérations async
  error: null,                               // Message d'erreur en cas d'échec
  
  // Actions (fonctions qui modifient l'état)
  
  /**
   * Action de connexion
   * @param {Object} credentials - Identifiants de connexion (email, password)
   * @returns {Promise<Object>} - Résultat de la tentative de connexion
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });  // Activer le chargement et effacer les erreurs
    try {
      const { user } = await authService.login(credentials);  // Appel au service d'authentification
      set({ user, isAuthenticated: true, isLoading: false }); // Mise à jour de l'état après succès
      return { success: true };              // Retourner un succès
    } catch (error) {
      set({ error: error.message, isLoading: false });  // Enregistrer l'erreur
      throw error;                                      // Propager l'erreur pour traitement
    }
  },
  
  /**
   * Action de déconnexion
   */
  logout: async () => {
    await authService.logout();              // Appeler le service de déconnexion
    set({ user: null, isAuthenticated: false, error: null });  // Réinitialiser l'état
  },
  
  /**
   * Rafraîchir les informations du profil utilisateur
   */
  refreshProfile: async () => {
    try {
      const user = await authService.getProfile();  // Récupérer le profil depuis l'API
      set({ user });                                // Mettre à jour l'utilisateur
    } catch (error) {
      console.error('Erreur lors du rafraichissement du profil:', error);
    }
  },
  
  /**
   * Effacer les messages d'erreur
   */
  clearError: () => set({ error: null }),
  
  // Getters (fonctions qui renvoient des valeurs calculées à partir de l'état)
  
  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier
   * @returns {boolean} - True si l'utilisateur a le rôle
   */
  hasRole: (role) => {
    const { user } = get();                 // Récupérer l'état actuel
    return user?.role === role;              // Comparer les rôles
  },
  
  /**
   * Vérifier si l'utilisateur est Super Admin
   * @returns {boolean}
   */
  isSuperAdmin: () => get().hasRole('SUPER_ADMIN'),
  
  /**
   * Vérifier si l'utilisateur est Gérant
   * @returns {boolean}
   */
  isGerant: () => get().hasRole('GERANT')
}));

/**
 * Store de gestion du parking
 * Gère l'état des parkings, leur disponibilité et la sélection
 */
export const useParkingStore = create((set) => ({
  // État initial
  parkings: [],                              // Liste de tous les parkings
  selectedParking: null,                     // Parking actuellement sélectionné
  availability: null,                        // Disponibilité en temps réel
  isLoading: false,                          // Indicateur de chargement
  error: null,                               // Messages d'erreur
  
  // Actions
  setParkings: (parkings) => set({ parkings }),  // Définir la liste des parkings
  
  setSelectedParking: (parking) => set({ selectedParking: parking }),  // Sélectionner un parking
  
  setAvailability: (availability) => set({ availability }),  // Définir la disponibilité
  
  setLoading: (isLoading) => set({ isLoading }),  // Changer l'état de chargement
  
  setError: (error) => set({ error }),            // Définir une erreur
  
  clearError: () => set({ error: null }),         // Effacer les erreurs
  
  /**
   * Mettre à jour la disponibilité en temps réel
   * @param {string} parkingId - ID du parking à mettre à jour
   * @param {number} availableSpaces - Nombre de places disponibles
   */
  updateAvailability: (parkingId, availableSpaces) => {
    set((state) => ({
      // Mettre à jour la liste des parkings
      parkings: state.parkings.map(p => 
        p.id === parkingId ? { ...p, availableSpaces } : p
      ),
      // Mettre à jour la disponibilité si c'est le parking sélectionné
      availability: state.availability?.id === parkingId 
        ? { ...state.availability, availableSpaces }
        : state.availability
    }));
  }
}));

/**
 * Store de gestion des entrées/sorties
 * Gère l'état des entrées de véhicules dans le parking
 */
export const useEntryStore = create((set) => ({
  // État initial
  entries: [],                               // Toutes les entrées (historique)
  activeEntries: [],                         // Entrées actives (en cours)
  selectedEntry: null,                       // Entrée sélectionnée
  pagination: {                              // Informations de pagination
    page: 1,                                 // Page actuelle
    limit: 10,                               // Éléments par page
    total: 0,                                // Total d'éléments
    totalPages: 0                            // Nombre total de pages
  },
  filters: {                                 // Filtres disponibles
    status: null,                            // Statut (IN_PROGRESS, COMPLETED, etc.)
    parkingId: null,                         // ID du parking
    vehicleType: null,                       // Type de véhicule
    startDate: null,                         // Date de début
    endDate: null                            // Date de fin
  },
  isLoading: false,                          // Indicateur de chargement
  error: null,                               // Messages d'erreur
  
  // Actions
  setEntries: (entries) => set({ entries }),  // Définir la liste des entrées
  
  setActiveEntries: (activeEntries) => set({ activeEntries }),  // Définir les entrées actives
  
  setSelectedEntry: (entry) => set({ selectedEntry: entry }),  // Sélectionner une entrée
  
  setPagination: (pagination) => set({ pagination }),  // Mettre à jour la pagination
  
  /**
   * Appliquer des filtres (fusion avec les filtres existants)
   * @param {Object} filters - Nouveaux filtres à appliquer
   */
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  /**
   * Réinitialiser tous les filtres à leurs valeurs par défaut
   */
  resetFilters: () => set({
    filters: {
      status: null,
      parkingId: null,
      vehicleType: null,
      startDate: null,
      endDate: null
    }
  }),
  
  setLoading: (isLoading) => set({ isLoading }),      // Changer l'état de chargement
  
  setError: (error) => set({ error }),                // Définir une erreur
  
  clearError: () => set({ error: null }),             // Effacer les erreurs
  
  /**
   * Ajouter une nouvelle entrée (pour les mises à jour en temps réel)
   * @param {Object} entry - Nouvelle entrée à ajouter
   */
  addEntry: (entry) => set((state) => ({
    entries: [entry, ...state.entries],               // Ajouter au début de la liste
    activeEntries: entry.status === 'IN_PROGRESS' 
      ? [entry, ...state.activeEntries]               // Ajouter aux actives si en cours
      : state.activeEntries
  })),
  
  /**
   * Mettre à jour une entrée existante
   * @param {string} entryId - ID de l'entrée à mettre à jour
   * @param {Object} updates - Nouvelles valeurs à appliquer
   */
  updateEntry: (entryId, updates) => set((state) => ({
    // Mettre à jour dans la liste générale
    entries: state.entries.map(e => 
      e.id === entryId ? { ...e, ...updates } : e
    ),
    // Mettre à jour dans les actives et filtrer celles toujours en cours
    activeEntries: state.activeEntries.map(e => 
      e.id === entryId ? { ...e, ...updates } : e
    ).filter(e => e.status === 'IN_PROGRESS')
  }))
}));

/**
 * Store de gestion des véhicules
 * Gère l'état des véhicules enregistrés dans le système
 */
export const useVehicleStore = create((set) => ({
  // État initial
  vehicles: [],                               // Liste des véhicules
  selectedVehicle: null,                      // Véhicule sélectionné
  pagination: {                               // Informations de pagination
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {                                  // Filtres de recherche
    vehicleType: null,                        // Type de véhicule
    search: ''                                // Recherche textuelle
  },
  isLoading: false,                           // Indicateur de chargement
  error: null,                                // Messages d'erreur
  
  // Actions
  setVehicles: (vehicles) => set({ vehicles }),  // Définir la liste des véhicules
  
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),  // Sélectionner un véhicule
  
  setPagination: (pagination) => set({ pagination }),  // Mettre à jour la pagination
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }  // Fusionner les filtres
  })),
  
  resetFilters: () => set({                    // Réinitialiser les filtres
    filters: { vehicleType: null, search: '' }
  }),
  
  setLoading: (isLoading) => set({ isLoading }),  // Changer l'état de chargement
  
  setError: (error) => set({ error }),            // Définir une erreur
  
  clearError: () => set({ error: null })          // Effacer les erreurs
}));

/**
 * Store de gestion des statistiques
 * Gère l'état des différentes statistiques du système
 */
export const useStatsStore = create((set) => ({
  // État initial
  dashboardStats: null,                       // Statistiques du dashboard
  revenueStats: null,                         // Statistiques de revenus
  occupancyStats: null,                       // Statistiques d'occupation
  trafficStats: null,                         // Statistiques de trafic
  vehicleTypeStats: null,                     // Statistiques par type de véhicule
  isLoading: false,                           // Indicateur de chargement
  error: null,                                // Messages d'erreur
  
  // Actions
  setDashboardStats: (stats) => set({ dashboardStats: stats }),  // Définir stats dashboard
  
  setRevenueStats: (stats) => set({ revenueStats: stats }),      // Définir stats revenus
  
  setOccupancyStats: (stats) => set({ occupancyStats: stats }),  // Définir stats occupation
  
  setTrafficStats: (stats) => set({ trafficStats: stats }),      // Définir stats trafic
  
  setVehicleTypeStats: (stats) => set({ vehicleTypeStats: stats }),  // Définir stats par type
  
  setLoading: (isLoading) => set({ isLoading }),  // Changer l'état de chargement
  
  setError: (error) => set({ error }),            // Définir une erreur
  
  clearError: () => set({ error: null })          // Effacer les erreurs
}));

/**
 * Store de notifications
 * Gère les notifications système et leur état de lecture
 */
export const useNotificationStore = create((set) => ({
  // État initial
  notifications: [],                          // Liste des notifications
  unreadCount: 0,                             // Nombre de notifications non lues
  
  // Actions
  
  /**
   * Ajouter une nouvelle notification
   * @param {Object} notification - Données de la notification
   * @param {string} notification.type - Type (success, error, warning, info)
   * @param {string} notification.title - Titre de la notification
   * @param {string} notification.message - Message de la notification
   */
  addNotification: (notification) => set((state) => ({
    notifications: [                          // Ajouter au début de la liste
      {
        id: Date.now(),                       // ID unique basé sur le timestamp
        timestamp: new Date(),                // Date de création
        read: false,                          // Non lue par défaut
        ...notification                       // Étendre avec les données fournies
      },
      ...state.notifications
    ],
    unreadCount: state.unreadCount + 1       // Incrémenter le compteur de non lues
  })),
  
  /**
   * Marquer une notification spécifique comme lue
   * @param {number} notificationId - ID de la notification à marquer
   */
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n  // Marquer comme lue
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)  // Décrémenter (minimum 0)
  })),
  
  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),  // Tout marquer comme lu
    unreadCount: 0                                                       // Réinitialiser le compteur
  })),
  
  /**
   * Supprimer toutes les notifications
   */
  clearNotifications: () => set({
    notifications: [],                           // Vider la liste
    unreadCount: 0                               // Réinitialiser le compteur
  })
}));