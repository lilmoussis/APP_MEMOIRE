/**
 * Service de gestion des véhicules
 * Fournit des méthodes pour gérer les véhicules enregistrés dans le système
 */

// Importation du client API pour effectuer les requêtes HTTP
import apiClient from './api.client';
// Importation de la configuration des endpoints API
import { API_CONFIG } from '../config/api.config';

// Définition de l'objet principal du service véhicule
const vehicleService = {
  /**
   * Récupérer tous les véhicules avec système de pagination et filtres
   * @param {Object} params - Paramètres de filtrage et pagination
   * @param {number} [params.page=1] - Numéro de page (défaut: 1)
   * @param {number} [params.limit=10] - Nombre d'éléments par page (défaut: 10)
   * @param {string} [params.vehicleType] - Type de véhicule (optionnel - ancien paramètre)
   * @param {string} [params.type] - Type de véhicule (optionnel - nouveau paramètre)
   * @param {string} [params.search] - Terme de recherche (numéro d'immatriculation, etc.)
   * @returns {Promise<object>} - Liste paginée des véhicules
   */
  async getAllVehicles(params = {}) {
    // Extraction des paramètres avec valeurs par défaut pour pagination
    const { page = 1, limit = 10, vehicleType, search, type } = params;
    
    // Construction des paramètres de requête URL
    const queryParams = new URLSearchParams({
      page: page.toString(),        // Convertir le numéro de page en string
      limit: limit.toString(),      // Convertir la limite en string
      ...(vehicleType && { vehicleType }),  // Ancien paramètre pour compatibilité
      ...(type && { vehicleType: type }),   // Map 'type' vers 'vehicleType' pour l'API
      ...(search && { search })     // Terme de recherche si fourni
    });
    
    // Effectuer la requête GET vers l'endpoint de base des véhicules
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.VEHICLES.BASE}?${queryParams}`);
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Alias de getAllVehicles pour une utilisation plus concise
   * @param {Object} params - Paramètres de filtrage et pagination
   * @returns {Promise<object>} - Liste paginée des véhicules
   */
  async getAll(params = {}) {
    // Appelle simplement getAllVehicles avec les mêmes paramètres
    return this.getAllVehicles(params);
  },
  
  /**
   * Récupérer un véhicule spécifique par son identifiant
   * @param {string|number} id - Identifiant unique du véhicule
   * @returns {Promise<object>} - Détails complets du véhicule
   */
  async getVehicleById(id) {
    // Effectuer la requête GET vers l'endpoint spécifique du véhicule
    // API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id) génère l'URL avec l'ID
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id));
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Créer un nouveau véhicule dans le système
   * @param {Object} vehicleData - Données du nouveau véhicule
   * @param {string} vehicleData.plateNumber - Numéro d'immatriculation
   * @param {string} vehicleData.vehicleType - Type de véhicule (voiture, moto, utilitaire, etc.)
   * @param {string} [vehicleData.brand] - Marque du véhicule (optionnel)
   * @param {string} [vehicleData.model] - Modèle du véhicule (optionnel)
   * @param {string} [vehicleData.color] - Couleur du véhicule (optionnel)
   * @returns {Promise<object>} - Données du véhicule créé
   */
  async createVehicle(vehicleData) {
    // Effectuer la requête POST vers l'endpoint de création de véhicule
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.VEHICLES.CREATE,  // URL de création
      vehicleData                            // Données à envoyer dans le corps
    );
    
    // Retourner les données du véhicule créé
    return response.data.data;
  },
  
  /**
   * Alias de createVehicle pour une utilisation plus concise
   * @param {Object} vehicleData - Données du nouveau véhicule
   * @returns {Promise<object>} - Données du véhicule créé
   */
  async create(vehicleData) {
    // Appelle simplement createVehicle avec les mêmes données
    return this.createVehicle(vehicleData);
  },
  
  /**
   * Modifier les informations d'un véhicule existant
   * @param {string|number} id - Identifiant du véhicule à modifier
   * @param {Object} vehicleData - Nouvelles données du véhicule
   * @param {string} [vehicleData.plateNumber] - Nouveau numéro d'immatriculation (optionnel)
   * @param {string} [vehicleData.vehicleType] - Nouveau type de véhicule (optionnel)
   * @param {string} [vehicleData.brand] - Nouvelle marque (optionnel)
   * @param {string} [vehicleData.model] - Nouveau modèle (optionnel)
   * @param {string} [vehicleData.color] - Nouvelle couleur (optionnel)
   * @returns {Promise<object>} - Données du véhicule mis à jour
   */
  async updateVehicle(id, vehicleData) {
    // Effectuer la requête PUT vers l'endpoint spécifique du véhicule
    const response = await apiClient.put(
      API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id),  // URL avec ID
      vehicleData                                // Nouvelles données
    );
    
    // Retourner les données du véhicule mis à jour
    return response.data.data;
  },
  
  /**
   * Alias de updateVehicle pour une utilisation plus concise
   * @param {string|number} id - Identifiant du véhicule
   * @param {Object} vehicleData - Nouvelles données
   * @returns {Promise<object>} - Données mises à jour
   */
  async update(id, vehicleData) {
    // Appelle simplement updateVehicle avec les mêmes paramètres
    return this.updateVehicle(id, vehicleData);
  },
  
  /**
   * Supprimer définitivement un véhicule du système
   * @param {string|number} id - Identifiant du véhicule à supprimer
   * @returns {Promise<object>} - Réponse de confirmation
   */
  async deleteVehicle(id) {
    // Effectuer la requête DELETE vers l'endpoint spécifique du véhicule
    const response = await apiClient.delete(
      API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id)  // URL avec ID
    );
    
    // Retourner la réponse complète (peut contenir message de confirmation)
    return response.data;
  },
  
  /**
   * Alias de deleteVehicle pour une utilisation plus concise
   * @param {string|number} id - Identifiant du véhicule
   * @returns {Promise<object>} - Réponse de confirmation
   */
  async delete(id) {
    // Appelle simplement deleteVehicle avec le même ID
    return this.deleteVehicle(id);
  },
  
  /**
   * Rechercher un véhicule par son numéro d'immatriculation (plaque)
   * @param {string} query - Terme de recherche (numéro d'immatriculation)
   * @returns {Promise<object>} - Véhicule(s) correspondant à la recherche
   */
  async searchVehicle(query) {
    // Effectuer la requête GET vers l'endpoint de recherche
    // API_CONFIG.ENDPOINTS.VEHICLES.SEARCH(query) génère l'URL avec le terme de recherche
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VEHICLES.SEARCH(query));
    
    // Retourner les données de la recherche
    return response.data.data;
  }
};

// Export par défaut de l'objet service
export default vehicleService;