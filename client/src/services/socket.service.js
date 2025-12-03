/**
 * Service WebSocket avec Socket.io
 * Gestion des connexions temps reel
 */

import { io } from 'socket.io-client';
import { SOCKET_CONFIG } from '../config/api.config';
import { tokenManager } from './api.client';
import { useParkingStore, useEntryStore, useNotificationStore } from '../store';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }
  
  /**
   * Initialiser la connexion Socket.io
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }
    
    const token = tokenManager.getToken();
    
    if (!token) {
      console.warn('Aucun token disponible pour la connexion Socket.io');
      return;
    }
    
    this.socket = io(SOCKET_CONFIG.URL, {
      ...SOCKET_CONFIG.OPTIONS,
      auth: { token }
    });
    
    this.setupEventListeners();
    this.socket.connect();
  }
  
  /**
   * Configurer les ecouteurs d'evenements
   */
  setupEventListeners() {
    if (!this.socket) return;
    
    // Connexion etablie
    this.socket.on('connect', () => {
      console.log('Socket.io connecte');
      this.isConnected = true;
    });
    
    // Deconnexion
    this.socket.on('disconnect', (reason) => {
      console.log('Socket.io deconnecte:', reason);
      this.isConnected = false;
    });
    
    // Erreur de connexion
    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.io:', error);
      this.isConnected = false;
    });
    
    // Mise a jour du parking
    this.socket.on(SOCKET_CONFIG.EVENTS.PARKING_UPDATE, (data) => {
      console.log('Mise a jour parking:', data);
      const { parkingId, availableSpaces } = data;
      useParkingStore.getState().updateAvailability(parkingId, availableSpaces);
    });
    
    // Nouvelle entree detectee
    this.socket.on(SOCKET_CONFIG.EVENTS.ENTRY_CREATED, (data) => {
      console.log('Nouvelle entree:', data);
      useEntryStore.getState().addEntry(data);
      
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Nouvelle entree',
        message: `Vehicule ${data.vehicle?.plateNumber} est entre dans le parking`
      });
    });
    
    // Sortie enregistree
    this.socket.on(SOCKET_CONFIG.EVENTS.ENTRY_COMPLETED, (data) => {
      console.log('Sortie completee:', data);
      useEntryStore.getState().updateEntry(data.id, data);
      
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Sortie enregistree',
        message: `Vehicule ${data.vehicle?.plateNumber} a quitte le parking`
      });
    });
    
    // Alerte parking plein
    this.socket.on(SOCKET_CONFIG.EVENTS.CAPACITY_ALERT, (data) => {
      console.log('Alerte capacite:', data);
      
      useNotificationStore.getState().addNotification({
        type: 'warning',
        title: 'Parking plein',
        message: `Le parking ${data.parkingName} est complet`
      });
    });
    
    // Notification systeme
    this.socket.on(SOCKET_CONFIG.EVENTS.SYSTEM_NOTIFICATION, (data) => {
      console.log('Notification systeme:', data);
      
      useNotificationStore.getState().addNotification({
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message
      });
    });
  }
  
  /**
   * S'abonner aux mises a jour du dashboard
   */
  subscribeToDashboard(parkingId = null) {
    if (!this.socket?.connected) {
      console.warn('Socket.io non connecte');
      return;
    }
    
    this.socket.emit(SOCKET_CONFIG.EVENTS.SUBSCRIBE_DASHBOARD, { parkingId });
  }
  
  /**
   * Se desabonner des mises a jour du dashboard
   */
  unsubscribeFromDashboard(parkingId = null) {
    if (!this.socket?.connected) {
      return;
    }
    
    this.socket.emit(SOCKET_CONFIG.EVENTS.UNSUBSCRIBE_DASHBOARD, { parkingId });
  }
  
  /**
   * Demander le statut actuel du parking
   */
  requestParkingStatus(parkingId) {
    if (!this.socket?.connected) {
      console.warn('Socket.io non connecte');
      return;
    }
    
    this.socket.emit(SOCKET_CONFIG.EVENTS.REQUEST_PARKING_STATUS, { parkingId });
  }
  
  /**
   * Deconnecter Socket.io
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Verifier si connecte
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Instance unique (singleton)
const socketService = new SocketService();

export default socketService;
