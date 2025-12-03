// Importation des configurations et plugins ESLint nécessaires

// Configuration ESLint de base (remplace eslint:recommended)
import js from '@eslint/js'

// Définitions des variables globales pour différents environnements
import globals from 'globals'

// Plugin pour les règles des Hooks React
import reactHooks from 'eslint-plugin-react-hooks'

// Plugin pour les règles de React Refresh (Hot Reload)
import reactRefresh from 'eslint-plugin-react-refresh'

// Fonctions de configuration ESLint (version flat config - nouvelle API)
import { defineConfig, globalIgnores } from 'eslint/config'

// Exportation de la configuration ESLint (nouvelle syntaxe flat config)
export default defineConfig([
  // ====================================================
  // CONFIGURATION GLOBALE - IGNORER CERTAINS DOSSIERS
  // ====================================================
  globalIgnores([
    'dist'  // Ignore le dossier 'dist' (fichiers de production générés)
  ]),
  
  // ====================================================
  // CONFIGURATION PRINCIPALE POUR LES FICHIERS JS/JSX
  // ====================================================
  {
    // Applique cette configuration à tous les fichiers .js et .jsx
    files: ['**/*.{js,jsx}'],
    
    // Étend (extends) les configurations recommandées
    extends: [
      // Configuration recommandée de base d'ESLint
      js.configs.recommended,
      
      // Configuration recommandée pour les Hooks React
      reactHooks.configs.flat.recommended,
      
      // Configuration pour React Refresh (Vite)
      reactRefresh.configs.vite,
    ],
    
    // Options de langage JavaScript
    languageOptions: {
      // Version ECMAScript à supporter (ES2020)
      ecmaVersion: 2020,
      
      // Variables globales disponibles dans l'environnement navigateur
      globals: globals.browser,
      
      // Options supplémentaires pour le parser
      parserOptions: {
        // Utiliser la dernière version d'ECMAScript
        ecmaVersion: 'latest',
        
        // Activer les fonctionnalités JSX
        ecmaFeatures: { jsx: true },
        
        // Utiliser les modules ECMAScript (import/export)
        sourceType: 'module',
      },
    },
    
    // ====================================================
    // RÈGLES PERSONNALISÉES
    // ====================================================
    rules: {
      // Règle pour détecter les variables non utilisées
      'no-unused-vars': [
        'error',  // Niveau : erreur (arrête la construction)
        { 
          // Pattern pour ignorer certaines variables
          varsIgnorePattern: '^[A-Z_]'  // Ignore les variables en majuscules ou commençant par _
        }
      ],
    },
  },
])

/**
 * EXPLICATIONS DÉTAILLÉES :
 * 
 * 1. STRUCTURE DE CONFIGURATION (Flat Config) :
 *    - Nouvelle API ESLint (v9+) plus simple que l'ancienne
 *    - Utilise defineConfig() pour définir plusieurs configurations
 *    - Chaque configuration est un objet dans un tableau
 * 
 * 2. CONFIGURATIONS ÉTENDUES :
 *    - js.configs.recommended : Règles ESLint de base
 *    - reactHooks.configs.flat.recommended : Règles spécifiques aux Hooks React
 *    - reactRefresh.configs.vite : Règles pour React Refresh (Vite)
 * 
 * 3. OPTIONS DE LANGAGE :
 *    - ecmaVersion: 2020 : Supporte les fonctionnalités ES2020
 *    - globals.browser : Variables globales du navigateur (window, document, etc.)
 *    - parserOptions : Options pour l'analyse syntaxique
 *      * ecmaVersion: 'latest' : Utilise la dernière version ECMAScript
 *      * jsx: true : Active le support JSX
 *      * sourceType: 'module' : Utilise les modules ES6
 * 
 * 4. RÈGLES PERSONNALISÉES :
 *    - no-unused-vars : Signale les variables non utilisées
 *      * varsIgnorePattern: '^[A-Z_]' : Ignore les variables qui :
 *        - Commencent par une majuscule (ex: CONSTANTES, Composants React)
 *        - Commencent par un underscore (ex: _variablePrivee)
 * 
 * 5. IGNORER DES DOSSIERS :
 *    - globalIgnores(['dist']) : Ignore complètement le dossier 'dist'
 *    - Le dossier 'dist' contient les fichiers de production compilés
 *    - Pas besoin de les analyser avec ESLint
 * 
 * 6. PLUGINS SPÉCIFIQUES :
 *    - eslint-plugin-react-hooks : Vérifie les bonnes pratiques des Hooks React
 *      * Règles comme "rules-of-hooks" et "exhaustive-deps"
 *    - eslint-plugin-react-refresh : Supporte React Refresh (Hot Reload)
 *      * Désactive certaines règles pendant le développement hot reload
 * 
 * AVANTAGES DE CETTE CONFIGURATION :
 * 
 * 1. Pour React :
 *    - Support complet de JSX et des Hooks React
 *    - Optimisé pour Vite et React Refresh
 *    - Détecte les erreurs courantes avec les Hooks
 * 
 * 2. Pour le développement :
 *    - Ignore les fichiers générés (dist/)
 *    - Supporte les dernières fonctionnalités JavaScript
 *    - Configuration moderne (flat config)
 * 
 * 3. Pour la qualité du code :
 *    - Détecte les variables non utilisées
 *    - Applique les meilleures pratiques React
 *    - Utilise les configurations recommandées
 * 
 * UTILISATION TYPIQUE :
 * 
 * Dans package.json :
 *   "scripts": {
 *     "lint": "eslint .",
 *     "lint:fix": "eslint . --fix"
 *   }
 * 
 * Commandes :
 *   npm run lint     # Vérifie le code
 *   npm run lint:fix # Corrige automatiquement ce qui peut l'être
 */