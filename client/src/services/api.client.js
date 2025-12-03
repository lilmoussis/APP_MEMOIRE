/**
 * Client Axios centralisé
 * Gère toutes les requêtes HTTP vers l'API avec intercepteurs et gestion de tokens
 */

import axios from 'axios'; // Bibliothèque HTTP pour les requêtes AJAX
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api.config'; // Configuration de l'API

// Clés de stockage des tokens dans localStorage
const TOKEN_KEY = 'smartpark_token'; // Clé pour le token d'accès
const REFRESH_TOKEN_KEY = 'smartpark_refresh_token'; // Clé pour le token de rafraîchissement

/**
 * Instance Axios configurée avec les paramètres par défaut
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL, // URL de base de l'API
  timeout: API_CONFIG.TIMEOUT, // Délai d'attente maximum (30 secondes)
  headers: API_CONFIG.HEADERS // En-têtes HTTP par défaut (Content-Type, Accept)
});

/**
 * Intercepteur de requêtes
 * Ajoute automatiquement le token d'authentification aux requêtes sortantes
 */
apiClient.interceptors.request.use(
  (config) => {
    // Récupère le token d'accès depuis le localStorage
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Si un token existe, l'ajoute aux en-têtes de la requête
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Format standard Bearer token
    }
    
    return config; // Retourne la configuration modifiée
  },
  (error) => {
    // En cas d'erreur dans l'intercepteur de requête, rejette la promesse
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponses
 * Gère les erreurs globalement et le rafraîchissement automatique du token
 */
apiClient.interceptors.response.use(
  (response) => {
    // Si la réponse est réussie, la retourne simplement
    return response;
  },
  async (error) => {
    const originalRequest = error.config; // Récupère la configuration de la requête originale
    
    // Si erreur 401 (non autorisé) et ce n'est pas déjà un retry
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true; // Marque la requête comme "retry" pour éviter les boucles
      
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          // Tente de rafraîchir le token d'accès avec le token de rafraîchissement
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, // Endpoint de rafraîchissement
            { refreshToken } // Corps de la requête
          );
          
          // Extrait les nouveaux tokens de la réponse
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Sauvegarde les nouveaux tokens dans le localStorage
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          
          // Réessaie la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest); // Exécute à nouveau la requête
        }
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, déconnecte l'utilisateur
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login'; // Redirige vers la page de connexion
        return Promise.reject(refreshError);
      }
    }
    
    // Gestion des erreurs autres que 401
    const errorMessage = getErrorMessage(error);
    return Promise.reject({
      message: errorMessage, // Message d'erreur formaté
      status: error.response?.status, // Code HTTP de l'erreur
      data: error.response?.data, // Données de la réponse d'erreur
      originalError: error // Erreur originale Axios
    });
  }
);

/**
 * Extrait le message d'erreur approprié selon le type d'erreur
 * @param {Object} error - Erreur Axios
 * @returns {string} Message d'erreur formaté
 */
function getErrorMessage(error) {
  // Si pas de réponse (erreur réseau, timeout, etc.)
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR; // "Erreur de connexion au serveur"
  }
  
  const { status, data } = error.response;
  
  // Priorité au message d'erreur du serveur s'il existe
  if (data?.message) {
    return data.message;
  }
  
  // Sinon, utilise un message par défaut selon le code HTTP
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED; // "Session expirée, veuillez vous reconnecter"
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN; // "Accès refusé"
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND; // "Ressource non trouvée"
    case HTTP_STATUS.TIMEOUT:
      return ERROR_MESSAGES.TIMEOUT; // "Délai d'attente dépassé"
    case HTTP_STATUS.SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR; // "Erreur serveur, veuillez réessayer"
    default:
      return ERROR_MESSAGES.SERVER_ERROR; // Message par défaut
  }
}

/**
 * Gestionnaire de tokens pour faciliter leur manipulation
 */
export const tokenManager = {
  /**
   * Récupère le token d'accès
   * @returns {string|null} Token d'accès ou null
   */
  getToken: () => localStorage.getItem(TOKEN_KEY),
  
  /**
   * Récupère le token de rafraîchissement
   * @returns {string|null} Token de rafraîchissement ou null
   */
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  
  /**
   * Définit les deux tokens
   * @param {string} accessToken - Token d'accès
   * @param {string} refreshToken - Token de rafraîchissement
   */
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  /**
   * Supprime tous les tokens (déconnexion)
   */
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  /**
   * Vérifie si un token d'accès existe
   * @returns {boolean} True si un token existe
   */
  hasToken: () => !!localStorage.getItem(TOKEN_KEY)
};

// Exporte l'instance Axios configurée comme export par défaut
export default apiClient;