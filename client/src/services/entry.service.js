/**
 * Service de gestion des entrees/sorties
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const entryService = {
  /**
   * Recuperer toutes les entrees avec filtres
   */
  async getAllEntries(params = {}) {
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
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(parkingId && { parkingId }),
      ...(vehicleType && { vehicleType }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search })
    });
    
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ENTRIES.BASE}?${queryParams}`);
    return response.data.data;
  },
  
  /**
   * Alias de getAllEntries
   */
  async getAll(params = {}) {
    return this.getAllEntries(params);
  },
  
  /**
   * Recuperer les entrees en cours (vehicules dans le parking)
   */
  async getActiveEntries(parkingId) {
    const queryParams = parkingId ? `?parkingId=${parkingId}` : '';
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ENTRIES.ACTIVE}${queryParams}`);
    return response.data.data;
  },
  
  /**
   * Recuperer une entree par ID
   */
  async getEntryById(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ENTRIES.BY_ID(id));
    return response.data.data;
  },
  
  /**
   * Recuperer l'historique d'un vehicule
   */
  async getVehicleHistory(vehicleId, params = {}) {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.ENTRIES.BY_VEHICLE(vehicleId)}?${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Creer une entree manuelle
   */
  async createEntry(entryData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.ENTRIES.BASE, entryData);
    return response.data.data;
  },
  
  async create(entryData) {
    return this.createEntry(entryData);
  },
  
  /**
   * Alias de createEntry
   */
  async recordEntry(entryData) {
    return this.createEntry(entryData);
  },
  
  /**
   * Enregistrer une sortie
   */
  async exitEntry(id, exitData = {}) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.ENTRIES.EXIT(id), exitData);
    return response.data.data;
  },
  
  /**
   * Alias de exitEntry
   */
  async recordExit(id, exitData = {}) {
    return this.exitEntry(id, exitData);
  },
  
  /**
   * Annuler une entree
   */
  async cancelEntry(id) {
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.ENTRIES.CANCEL(id));
    return response.data.data;
  }
};

export default entryService;
