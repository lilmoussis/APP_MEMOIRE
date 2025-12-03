// Importation de la fonction io depuis la bibliothèque socket.io-client
// Cette bibliothèque permet d'établir une connexion WebSocket avec le serveur
import { io } from 'socket.io-client'

// Définition de l'URL du serveur WebSocket :
// - On utilise d'abord la variable d'environnement VITE_SOCKET_URL si elle existe
// - Sinon, on utilise 'http://localhost:5000' comme URL par défaut (serveur local)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Création de l'instance socket avec configuration :
// - autoConnect: false → la connexion ne démarre pas automatiquement
//   (il faudra appeler socket.connect() manuellement)
export const socket = io(SOCKET_URL, { autoConnect: false })

// Export par défaut de l'instance socket
// Permet d'importer avec : import socket from './chemin/vers/ce/fichier'
export default socket