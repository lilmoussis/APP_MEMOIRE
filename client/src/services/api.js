/**
 * Configuration minimale d'Axios pour les requêtes API
 * Version simplifiée sans intercepteurs ni gestion de tokens
 */

import axios from 'axios'; // Bibliothèque HTTP pour les requêtes AJAX

/**
 * Instance Axios configurée avec les paramètres de base
 * Version minimaliste pour les projets simples ou tests
 */
const api = axios.create({
  // URL de base de l'API
  // Priorise la variable d'environnement VITE_API_URL, sinon utilise localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // En-têtes HTTP par défaut
  headers: { 
    'Content-Type': 'application/json' // Indique que nous envoyons/recevons du JSON
  },
});

// Exporte l'instance Axios configurée comme export par défaut
export default api;