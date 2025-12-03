/**
 * Service de gestion des utilisateurs (Super Admin uniquement)
 * Fournit des méthodes CRUD pour la gestion des comptes utilisateurs
 * Réservé aux administrateurs avec privilèges élevés
 */

// Importation du client API pour effectuer les requêtes HTTP
import apiClient from './api.client';
// Importation de la configuration des endpoints API
import { API_CONFIG } from '../config/api.config';

// Définition de l'objet principal du service utilisateur
const userService = {
  /**
   * Récupérer tous les utilisateurs avec système de pagination
   * @param {Object} params - Paramètres de filtrage et pagination
   * @param {number} [params.page=1] - Numéro de page (défaut: 1)
   * @param {number} [params.limit=10] - Nombre d'éléments par page (défaut: 10)
   * @param {string} [params.role] - Filtrer par rôle utilisateur (optionnel)
   * @param {boolean} [params.isActive] - Filtrer par statut actif/inactif (optionnel)
   * @returns {Promise<object>} - Liste paginée des utilisateurs
   */
  async getAllUsers(params = {}) {
    // Extraction des paramètres avec valeurs par défaut
    const { page = 1, limit = 10, role, isActive } = params;
    
    // Construction des paramètres de requête URL
    const queryParams = new URLSearchParams({
      page: page.toString(),        // Numéro de page converti en string
      limit: limit.toString(),      // Limite convertie en string
      ...(role && { role }),        // Ajouter rôle seulement s'il est défini
      ...(isActive !== undefined && { 
        isActive: isActive.toString() // Convertir boolean en string si défini
      })
    });
    
    // Effectuer la requête GET vers l'endpoint de base des utilisateurs
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}?${queryParams}`
    );
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Alias de getAllUsers pour une utilisation plus concise
   * @param {Object} params - Paramètres de filtrage et pagination
   * @returns {Promise<object>} - Liste paginée des utilisateurs
   */
  async getAll(params = {}) {
    // Appelle simplement getAllUsers avec les mêmes paramètres
    return this.getAllUsers(params);
  },
  
  /**
   * Récupérer un utilisateur spécifique par son identifiant
   * @param {string|number} id - Identifiant unique de l'utilisateur
   * @returns {Promise<object>} - Détails de l'utilisateur
   */
  async getUserById(id) {
    // Effectuer la requête GET vers l'endpoint spécifique de l'utilisateur
    // API_CONFIG.ENDPOINTS.USERS.BY_ID(id) génère l'URL avec l'ID
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Créer un nouvel utilisateur dans le système
   * @param {Object} userData - Données du nouvel utilisateur
   * @param {string} userData.email - Email de l'utilisateur
   * @param {string} userData.password - Mot de passe (doit être haché côté serveur)
   * @param {string} userData.role - Rôle de l'utilisateur (admin, manager, etc.)
   * @param {string} userData.firstName - Prénom
   * @param {string} userData.lastName - Nom
   * @returns {Promise<object>} - Données de l'utilisateur créé
   */
  async createUser(userData) {
    // Effectuer la requête POST vers l'endpoint de base des utilisateurs
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.USERS.BASE,  // URL de création
      userData                          // Données à envoyer dans le corps
    );
    
    // Retourner les données de l'utilisateur créé
    return response.data.data;
  },
  
  /**
   * Alias de createUser pour une utilisation plus concise
   * @param {Object} userData - Données du nouvel utilisateur
   * @returns {Promise<object>} - Données de l'utilisateur créé
   */
  async create(userData) {
    // Appelle simplement createUser avec les mêmes données
    return this.createUser(userData);
  },
  
  /**
   * Modifier les informations d'un utilisateur existant
   * @param {string|number} id - Identifiant de l'utilisateur à modifier
   * @param {Object} userData - Nouvelles données de l'utilisateur
   * @param {string} [userData.email] - Nouvel email (optionnel)
   * @param {string} [userData.firstName] - Nouveau prénom (optionnel)
   * @param {string} [userData.lastName] - Nouveau nom (optionnel)
   * @param {string} [userData.role] - Nouveau rôle (optionnel)
   * @returns {Promise<object>} - Données de l'utilisateur mis à jour
   */
  async updateUser(id, userData) {
    // Effectuer la requête PUT vers l'endpoint spécifique de l'utilisateur
    const response = await apiClient.put(
      API_CONFIG.ENDPOINTS.USERS.BY_ID(id),  // URL avec ID
      userData                                // Nouvelles données
    );
    
    // Retourner les données de l'utilisateur mis à jour
    return response.data.data;
  },
  
  /**
   * Alias de updateUser pour une utilisation plus concise
   * @param {string|number} id - Identifiant de l'utilisateur
   * @param {Object} userData - Nouvelles données
   * @returns {Promise<object>} - Données mises à jour
   */
  async update(id, userData) {
    // Appelle simplement updateUser avec les mêmes paramètres
    return this.updateUser(id, userData);
  },
  
  /**
   * Supprimer définitivement un utilisateur du système
   * @param {string|number} id - Identifiant de l'utilisateur à supprimer
   * @returns {Promise<object>} - Réponse de confirmation
   */
  async deleteUser(id) {
    // Effectuer la requête DELETE vers l'endpoint spécifique de l'utilisateur
    const response = await apiClient.delete(
      API_CONFIG.ENDPOINTS.USERS.BY_ID(id)  // URL avec ID
    );
    
    // Retourner la réponse complète (peut contenir message de confirmation)
    return response.data;
  },
  
  /**
   * Alias de deleteUser pour une utilisation plus concise
   * @param {string|number} id - Identifiant de l'utilisateur
   * @returns {Promise<object>} - Réponse de confirmation
   */
  async delete(id) {
    // Appelle simplement deleteUser avec le même ID
    return this.deleteUser(id);
  },
  
  /**
   * Activer ou désactiver le compte d'un utilisateur (bascule de statut)
   * Cette méthode permet de suspendre temporairement un compte sans le supprimer
   * @param {string|number} id - Identifiant de l'utilisateur
   * @returns {Promise<object>} - Données de l'utilisateur avec nouveau statut
   */
  async toggleUserStatus(id) {
    // Effectuer la requête PATCH vers l'endpoint de basculement de statut
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.USERS.TOGGLE_STATUS(id)  // URL spécifique pour statut
    );
    
    // Retourner les données de l'utilisateur avec le statut mis à jour
    return response.data.data;
  }
};

// Export par défaut de l'objet service
export default userService;