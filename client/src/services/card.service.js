/**
 * Service de gestion des cartes RFID
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const cardService = {
  /**
   * Recuperer toutes les cartes avec pagination
   */
  async getAllCards(params = {}) {
    const { page = 1, limit = 10, isActive, vehicleId } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(isActive !== undefined && { isActive: isActive.toString() }),
      ...(vehicleId && { vehicleId })
    });
    
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CARDS.BASE}?${queryParams}`);
    return response.data.data;
  },
  
  /**
   * Creer une nouvelle carte
   */
  async createCard(cardData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CARDS.CREATE, cardData);
    return response.data.data;
  },
  
  /**
   * Modifier une carte
   */
  async updateCard(id, cardData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.CARDS.BY_ID(id), cardData);
    return response.data.data;
  },
  
  /**
   * Supprimer une carte
   */
  async deleteCard(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.CARDS.BY_ID(id));
    return response.data;
  },
  
  /**
   * Activer/Desactiver une carte
   */
  async toggleCardStatus(id) {
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.CARDS.TOGGLE_STATUS(id));
    return response.data.data;
  }
};

export default cardService;
