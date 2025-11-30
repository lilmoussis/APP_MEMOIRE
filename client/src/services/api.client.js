/**
 * Client Axios centralise
 * Gere toutes les requetes HTTP vers l'API
 */

import axios from 'axios';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api.config';

// Cle de stockage du token dans localStorage
const TOKEN_KEY = 'smartpark_token';
const REFRESH_TOKEN_KEY = 'smartpark_refresh_token';

/**
 * Instance Axios configuree
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

/**
 * Intercepteur de requetes
 * Ajoute automatiquement le token d'authentification
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de reponses
 * Gere les erreurs globalement et le rafraichissement du token
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur 401 et pas deja un retry
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          // Tenter de rafraichir le token
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken }
          );
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Sauvegarder les nouveaux tokens
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          
          // Reessayer la requete originale
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Echec du rafraichissement, deconnecter l'utilisateur
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Gestion des erreurs
    const errorMessage = getErrorMessage(error);
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

/**
 * Extraire le message d'erreur approprie
 */
function getErrorMessage(error) {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  const { status, data } = error.response;
  
  // Message du serveur en priorite
  if (data?.message) {
    return data.message;
  }
  
  // Sinon, message par defaut selon le code
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.TIMEOUT:
      return ERROR_MESSAGES.TIMEOUT;
    case HTTP_STATUS.SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.SERVER_ERROR;
  }
}

/**
 * Gestion des tokens
 */
export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  hasToken: () => !!localStorage.getItem(TOKEN_KEY)
};

export default apiClient;
