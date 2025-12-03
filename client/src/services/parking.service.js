/**
 * Service de gestion des parkings
 * Gère toutes les opérations CRUD sur les parkings et leurs tarifs
 */

import apiClient from './api.client'; // Client HTTP configuré
import { API_CONFIG } from '../config/api.config'; // Configuration des endpoints API

const parkingService = {
  /**
   * Récupérer tous les parkings
   * @returns {Promise<Array>} Liste de tous les parkings
   */
  async getAllParkings() {
    // Appel API GET vers l'endpoint de base des parkings
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.BASE);
    return response.data.data; // Retourne la liste des parkings
  },
  
  /**
   * Alias de getAllParkings pour compatibilité
   * @returns {Promise<Array>} Liste de tous les parkings
   */
  async getAll() {
    return this.getAllParkings(); // Délègue à getAllParkings
  },
  
  /**
   * Récupérer un parking spécifique par son ID
   * @param {string} id - ID du parking
   * @returns {Promise<Object>} Détails du parking
   */
  async getParkingById(id) {
    // Appel API GET vers l'endpoint spécifique d'un parking
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.BY_ID(id));
    return response.data.data; // Retourne les détails du parking
  },
  
  /**
   * Créer un nouveau parking (réservé au Super Admin)
   * @param {Object} parkingData - Données du nouveau parking
   * @param {string} parkingData.name - Nom du parking
   * @param {number} parkingData.totalCapacity - Capacité totale en places
   * @param {string} parkingData.location - Localisation géographique
   * @param {string} parkingData.description - Description additionnelle
   * @returns {Promise<Object>} Parking créé
   */
  async createParking(parkingData) {
    // Appel API POST pour créer un nouveau parking
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PARKING.BASE, parkingData);
    return response.data.data; // Retourne le parking créé
  },
  
  /**
   * Alias de createParking pour compatibilité
   * @param {Object} parkingData - Données du parking
   * @returns {Promise<Object>} Parking créé
   */
  async create(parkingData) {
    return this.createParking(parkingData); // Délègue à createParking
  },
  
  /**
   * Modifier un parking existant (réservé au Super Admin)
   * @param {string} id - ID du parking à modifier
   * @param {Object} parkingData - Nouvelles données du parking
   * @returns {Promise<Object>} Parking modifié
   */
  async updateParking(id, parkingData) {
    // Appel API PUT pour mettre à jour le parking
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.PARKING.BY_ID(id), parkingData);
    return response.data.data; // Retourne le parking modifié
  },
  
  /**
   * Alias de updateParking pour compatibilité
   * @param {string} id - ID du parking
   * @param {Object} parkingData - Données à mettre à jour
   * @returns {Promise<Object>} Parking modifié
   */
  async update(id, parkingData) {
    return this.updateParking(id, parkingData); // Délègue à updateParking
  },
  
  /**
   * Supprimer un parking (réservé au Super Admin)
   * @param {string} id - ID du parking à supprimer
   * @returns {Promise<Object>} Réponse de suppression
   */
  async deleteParking(id) {
    // Appel API DELETE pour supprimer le parking
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PARKING.BY_ID(id));
    return response.data; // Retourne la réponse complète
  },
  
  /**
   * Alias de deleteParking pour compatibilité
   * @param {string} id - ID du parking
   * @returns {Promise<Object>} Réponse de suppression
   */
  async delete(id) {
    return this.deleteParking(id); // Délègue à deleteParking
  },
  
  /**
   * Consulter la disponibilité actuelle d'un parking
   * @param {string} id - ID du parking
   * @returns {Promise<Object>} Statistiques de disponibilité
   */
  async getParkingAvailability(id) {
    // Appel API GET vers l'endpoint de disponibilité
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.AVAILABILITY(id));
    return response.data.data; // Retourne les statistiques de disponibilité
  },
  
  /**
   * Récupérer les tarifs d'un parking spécifique
   * @param {string} parkingId - ID du parking
   * @returns {Promise<Array>} Liste des tarifs du parking
   */
  async getTariffs(parkingId) {
    // Appel API GET vers l'endpoint des tarifs d'un parking
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.TARIFFS(parkingId));
    return response.data.data; // Retourne la liste des tarifs
  },
  
  /**
   * Créer un nouveau tarif pour un parking (réservé au Super Admin)
   * Note: Cette méthode utilise TARIFF_BASE mais nécessite probablement parkingId dans les données
   * @param {Object} tariffData - Données du nouveau tarif
   * @param {string} tariffData.parkingId - ID du parking (dans le body)
   * @param {string} tariffData.vehicleType - Type de véhicule ('MOTO', 'VOITURE', 'CAMION')
   * @param {number} tariffData.pricePerHour - Prix horaire en FCFA
   * @returns {Promise<Object>} Tarif créé
   */
  async createTariff(tariffData) {
    // Appel API POST pour créer un nouveau tarif
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PARKING.TARIFF_BASE, tariffData);
    return response.data.data; // Retourne le tarif créé
  },
  
  /**
   * Modifier un tarif existant (réservé au Super Admin)
   * @param {string} id - ID du tarif à modifier
   * @param {Object} tariffData - Nouvelles données du tarif
   * @returns {Promise<Object>} Tarif modifié
   */
  async updateTariff(id, tariffData) {
    // Appel API PUT pour mettre à jour le tarif
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.PARKING.TARIFF_BY_ID(id), tariffData);
    return response.data.data; // Retourne le tarif modifié
  },
  
  /**
   * Supprimer un tarif (réservé au Super Admin)
   * @param {string} id - ID du tarif à supprimer
   * @returns {Promise<Object>} Réponse de suppression
   */
  async deleteTariff(id) {
    // Appel API DELETE pour supprimer le tarif
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PARKING.TARIFF_BY_ID(id));
    return response.data; // Retourne la réponse complète
  }
};

// Exporte le service de gestion des parkings comme export par défaut
export default parkingService;