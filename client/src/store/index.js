/**
 * Store global Zustand
 * Gestion centralisee de l'etat de l'application
 */

import { create } from 'zustand';
import authService from '../services/auth.service';

/**
 * Store d'authentification
 */
export const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  
  // Actions
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },
  
  refreshProfile: async () => {
    try {
      const user = await authService.getProfile();
      set({ user });
    } catch (error) {
      console.error('Erreur lors du rafraichissement du profil:', error);
    }
  },
  
  clearError: () => set({ error: null }),
  
  // Getters
  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },
  
  isSuperAdmin: () => get().hasRole('SUPER_ADMIN'),
  isGerant: () => get().hasRole('GERANT')
}));

/**
 * Store de gestion du parking
 */
export const useParkingStore = create((set) => ({
  parkings: [],
  selectedParking: null,
  availability: null,
  isLoading: false,
  error: null,
  
  // Actions
  setParkings: (parkings) => set({ parkings }),
  
  setSelectedParking: (parking) => set({ selectedParking: parking }),
  
  setAvailability: (availability) => set({ availability }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Mise a jour de la disponibilite en temps reel
  updateAvailability: (parkingId, availableSpaces) => {
    set((state) => ({
      parkings: state.parkings.map(p => 
        p.id === parkingId ? { ...p, availableSpaces } : p
      ),
      availability: state.availability?.id === parkingId 
        ? { ...state.availability, availableSpaces }
        : state.availability
    }));
  }
}));

/**
 * Store de gestion des entrees/sorties
 */
export const useEntryStore = create((set) => ({
  entries: [],
  activeEntries: [],
  selectedEntry: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: null,
    parkingId: null,
    vehicleType: null,
    startDate: null,
    endDate: null
  },
  isLoading: false,
  error: null,
  
  // Actions
  setEntries: (entries) => set({ entries }),
  
  setActiveEntries: (activeEntries) => set({ activeEntries }),
  
  setSelectedEntry: (entry) => set({ selectedEntry: entry }),
  
  setPagination: (pagination) => set({ pagination }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set({
    filters: {
      status: null,
      parkingId: null,
      vehicleType: null,
      startDate: null,
      endDate: null
    }
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Ajouter une nouvelle entree en temps reel
  addEntry: (entry) => set((state) => ({
    entries: [entry, ...state.entries],
    activeEntries: entry.status === 'IN_PROGRESS' 
      ? [entry, ...state.activeEntries] 
      : state.activeEntries
  })),
  
  // Mettre a jour une entree existante
  updateEntry: (entryId, updates) => set((state) => ({
    entries: state.entries.map(e => 
      e.id === entryId ? { ...e, ...updates } : e
    ),
    activeEntries: state.activeEntries.map(e => 
      e.id === entryId ? { ...e, ...updates } : e
    ).filter(e => e.status === 'IN_PROGRESS')
  }))
}));

/**
 * Store de gestion des vehicules
 */
export const useVehicleStore = create((set) => ({
  vehicles: [],
  selectedVehicle: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    vehicleType: null,
    search: ''
  },
  isLoading: false,
  error: null,
  
  // Actions
  setVehicles: (vehicles) => set({ vehicles }),
  
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  
  setPagination: (pagination) => set({ pagination }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set({
    filters: { vehicleType: null, search: '' }
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}));

/**
 * Store de gestion des statistiques
 */
export const useStatsStore = create((set) => ({
  dashboardStats: null,
  revenueStats: null,
  occupancyStats: null,
  trafficStats: null,
  vehicleTypeStats: null,
  isLoading: false,
  error: null,
  
  // Actions
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  
  setRevenueStats: (stats) => set({ revenueStats: stats }),
  
  setOccupancyStats: (stats) => set({ occupancyStats: stats }),
  
  setTrafficStats: (stats) => set({ trafficStats: stats }),
  
  setVehicleTypeStats: (stats) => set({ vehicleTypeStats: stats }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}));

/**
 * Store de notifications
 */
export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  // Actions
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        id: Date.now(),
        timestamp: new Date(),
        read: false,
        ...notification
      },
      ...state.notifications
    ],
    unreadCount: state.unreadCount + 1
  })),
  
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0
  })
}));
