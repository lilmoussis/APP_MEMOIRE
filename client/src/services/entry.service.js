/**
 * Service de gestion des entrées/sorties
 * Gère toutes les opérations liées au trafic des véhicules dans le parking
 */

import apiClient from './api.client'; // Client HTTP configuré
import { API_CONFIG } from '../config/api.config'; // Configuration des endpoints API

const entryService = {
  /**
   * Récupérer toutes les entrées avec filtres et pagination
   * @param {Object} params - Paramètres de filtrage
   * @param {number} params.page - Numéro de page (défaut: 1)
   * @param {number} params.limit - Nombre d'éléments par page (défaut: 10)
   * @param {string} params.status - Filtre par statut ('active', 'completed', 'cancelled')
   * @param {string} params.parkingId - Filtre par parking spécifique
   * @param {string} params.vehicleType - Filtre par type de véhicule
   * @param {string} params.startDate - Date de début pour l'historique
   * @param {string} params.endDate - Date de fin pour l'historique
   * @param {string} params.search - Recherche textuelle (plaque, nom, etc.)
   * @returns {Promise<Object>} Liste paginée des entrées
   */
  async getAllEntries(params = {}) {
    // Destructuration avec valeurs par défaut
    const { 
      page = 1, 
      limit = 10, 
      status, 
      parkingId, 
      vehicleType, 
      startDate, 
      endDate,
      search
    } = params;
    
    // Construction des paramètres de requête URL
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }), // Ajoute seulement si défini
      ...(parkingId && { parkingId }),
      ...(vehicleType && { vehicleType }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search })
    });
    
    // Appel API GET vers l'endpoint de base des entrées
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ENTRIES.BASE}?${queryParams}`);
    return response.data.data; // Retourne les données extraites
  },
  
  /**
   * Alias de getAllEntries pour compatibilité
   * @param {Object} params - Mêmes paramètres que getAllEntries
   * @returns {Promise<Object>} Liste paginée des entrées
   */
  async getAll(params = {}) {
    return this.getAllEntries(params); // Délègue à getAllEntries
  },
  
  /**
   * Récupérer les entrées en cours (véhicules actuellement dans le parking)
   * @param {string} parkingId - ID du parking (optionnel)
   * @returns {Promise<Array>} Liste des entrées actives
   */
  async getActiveEntries(parkingId) {
    // Ajoute un paramètre parkingId si fourni
    const queryParams = parkingId ? `?parkingId=${parkingId}` : '';
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ENTRIES.ACTIVE}${queryParams}`);
    return response.data.data; // Retourne la liste des entrées actives
  },
  
  /**
   * Récupérer une entrée spécifique par son ID
   * @param {string} id - ID de l'entrée
   * @returns {Promise<Object>} Détails de l'entrée
   */
  async getEntryById(id) {
    // Appel API GET vers l'endpoint spécifique d'une entrée
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ENTRIES.BY_ID(id));
    return response.data.data; // Retourne les détails de l'entrée
  },
  
  /**
   * Récupérer l'historique des entrées/sorties d'un véhicule spécifique
   * @param {string} vehicleId - ID du véhicule
   * @param {Object} params - Paramètres de pagination
   * @param {number} params.page - Numéro de page (défaut: 1)
   * @param {number} params.limit - Nombre d'éléments par page (défaut: 10)
   * @returns {Promise<Object>} Historique paginé du véhicule
   */
  async getVehicleHistory(vehicleId, params = {}) {
    const { page = 1, limit = 10 } = params;
    
    // Construction des paramètres de pagination
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Appel API GET vers l'endpoint d'historique véhicule
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.ENTRIES.BY_VEHICLE(vehicleId)}?${queryParams}`
    );
    return response.data.data; // Retourne l'historique
  },
  
  /**
   * Créer une entrée manuelle (saisie par le gérant)
   * @param {Object} entryData - Données de la nouvelle entrée
   * @param {string} entryData.vehicleId - ID du véhicule
   * @param {string} entryData.parkingId - ID du parking
   * @param {string} entryData.cardId - ID de la carte RFID (optionnel)
   * @returns {Promise<Object>} Entrée créée
   */
  async createEntry(entryData) {
    // Appel API POST pour créer une nouvelle entrée
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.ENTRIES.BASE, entryData);
    return response.data.data; // Retourne l'entrée créée
  },
  
  /**
   * Alias de createEntry pour compatibilité
   * @param {Object} entryData - Données de l'entrée
   * @returns {Promise<Object>} Entrée créée
   */
  async create(entryData) {
    return this.createEntry(entryData); // Délègue à createEntry
  },
  
  /**
   * Alias de createEntry avec nom plus explicite
   * @param {Object} entryData - Données de l'entrée
   * @returns {Promise<Object>} Entrée créée
   */
  async recordEntry(entryData) {
    return this.createEntry(entryData); // Délègue à createEntry
  },
  
  /**
   * Enregistrer la sortie d'un véhicule (clôturer une entrée)
   * @param {string} id - ID de l'entrée à clôturer
   * @param {Object} exitData - Données de sortie (mode de paiement, etc.)
   * @param {string} exitData.paymentMethod - Mode de paiement ('cash', 'card', etc.)
   * @returns {Promise<Object>} Entrée clôturée avec facture
   */
  async exitEntry(id, exitData = {}) {
    // Appel API PUT pour enregistrer la sortie
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.ENTRIES.EXIT(id), exitData);
    return response.data.data; // Retourne l'entrée clôturée
  },
  
  /**
   * Alias de exitEntry avec nom plus explicite
   * @param {string} id - ID de l'entrée
   * @param {Object} exitData - Données de sortie
   * @returns {Promise<Object>} Entrée clôturée
   */
  async recordExit(id, exitData = {}) {
    return this.exitEntry(id, exitData); // Délègue à exitEntry
  },
  
  /**
   * Annuler une entrée (en cas d'erreur)
   * @param {string} id - ID de l'entrée à annuler
   * @returns {Promise<Object>} Entrée annulée
   */
  async cancelEntry(id) {
    // Appel API PATCH pour annuler l'entrée
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.ENTRIES.CANCEL(id));
    return response.data.data; // Retourne l'entrée annulée
  }
};

// Exporte le service de gestion des entrées comme export par défaut
export default entryService;