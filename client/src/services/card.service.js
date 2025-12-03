/**
 * Service de gestion des cartes RFID
 * Gère toutes les opérations CRUD sur les cartes d'accès
 */

import apiClient from './api.client'; // Client HTTP configuré
import { API_CONFIG } from '../config/api.config'; // Configuration des endpoints API

const cardService = {
  /**
   * Récupérer toutes les cartes avec pagination et filtres
   * @param {Object} params - Paramètres de requête
   * @param {number} params.page - Numéro de page (défaut: 1)
   * @param {number} params.limit - Nombre d'éléments par page (défaut: 10)
   * @param {boolean} params.isActive - Filtre par statut actif/inactif
   * @param {string} params.vehicleId - Filtre par véhicule associé
   * @returns {Promise<Object>} Liste paginée des cartes
   */
  async getAllCards(params = {}) {
    // Destructuration avec valeurs par défaut
    const { page = 1, limit = 10, isActive, vehicleId } = params;
    
    // Construction des paramètres de requête URL
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(isActive !== undefined && { isActive: isActive.toString() }), // Ajoute seulement si défini
      ...(vehicleId && { vehicleId }) // Ajoute seulement si défini
    });
    
    // Appel API GET vers l'endpoint de base des cartes
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CARDS.BASE}?${queryParams}`);
    return response.data.data; // Retourne les données extraites
  },
  
  /**
   * Alias de getAllCards pour compatibilité
   * @param {Object} params - Mêmes paramètres que getAllCards
   * @returns {Promise<Object>} Liste paginée des cartes
   */
  async getAll(params = {}) {
    return this.getAllCards(params); // Délègue à getAllCards
  },
  
  /**
   * Créer une nouvelle carte RFID
   * @param {Object} cardData - Données de la nouvelle carte
   * @param {string} cardData.cardNumber - Numéro unique de la carte
   * @param {string} cardData.vehicleId - ID du véhicule associé
   * @param {boolean} cardData.isActive - Statut d'activation
   * @returns {Promise<Object>} Carte créée
   */
  async createCard(cardData) {
    // Appel API POST pour créer une nouvelle carte
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CARDS.CREATE, cardData);
    return response.data.data; // Retourne la carte créée
  },
  
  /**
   * Alias de createCard pour compatibilité
   * @param {Object} cardData - Données de la carte
   * @returns {Promise<Object>} Carte créée
   */
  async create(cardData) {
    return this.createCard(cardData); // Délègue à createCard
  },
  
  /**
   * Modifier une carte existante
   * @param {string} id - ID de la carte à modifier
   * @param {Object} cardData - Nouvelles données de la carte
   * @returns {Promise<Object>} Carte modifiée
   */
  async updateCard(id, cardData) {
    // Appel API PUT pour mettre à jour la carte
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.CARDS.BY_ID(id), cardData);
    return response.data.data; // Retourne la carte modifiée
  },
  
  /**
   * Alias de updateCard pour compatibilité
   * @param {string} id - ID de la carte
   * @param {Object} cardData - Données à mettre à jour
   * @returns {Promise<Object>} Carte modifiée
   */
  async update(id, cardData) {
    return this.updateCard(id, cardData); // Délègue à updateCard
  },
  
  /**
   * Supprimer une carte
   * @param {string} id - ID de la carte à supprimer
   * @returns {Promise<Object>} Réponse de suppression
   */
  async deleteCard(id) {
    // Appel API DELETE pour supprimer la carte
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.CARDS.BY_ID(id));
    return response.data; // Retourne la réponse complète
  },
  
  /**
   * Alias de deleteCard pour compatibilité
   * @param {string} id - ID de la carte
   * @returns {Promise<Object>} Réponse de suppression
   */
  async delete(id) {
    return this.deleteCard(id); // Délègue à deleteCard
  },
  
  /**
   * Activer/Désactiver une carte (toggle)
   * @param {string} id - ID de la carte
   * @returns {Promise<Object>} Carte avec nouveau statut
   */
  async toggleCardStatus(id) {
    // Appel API PATCH pour changer le statut
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.CARDS.TOGGLE_STATUS(id));
    return response.data.data; // Retourne la carte mise à jour
  }
};

// Exporte le service de gestion des cartes comme export par défaut
export default cardService;