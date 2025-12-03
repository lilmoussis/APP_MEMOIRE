// Importation des composants nécessaires de React Router pour la navigation
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importation des composants de page
import Login from './pages/Login';                    // Page de connexion
import AdminDashboard from './pages/AdminDashboard';  // Tableau de bord administrateur
import GerantDashboard from './pages/GerantDashboard'; // Tableau de bord gérant
import Layout from './components/Layout';             // Layout principal avec sidebar/navbar
import { useAuthStore } from './store';               // Store d'authentification (Zustand)

// Importation des pages spécifiques à l'administrateur (Super Admin)
import AdminParkings from './pages/admin/Parkings';   // Gestion des parkings
import AdminVehicles from './pages/admin/Vehicles';   // Gestion des véhicules
import AdminCards from './pages/admin/Cards';         // Gestion des cartes
import AdminEntries from './pages/admin/Entries';     // Gestion des entrées/sorties
import AdminBilling from './pages/admin/Billing';     // Facturation
import AdminStats from './pages/admin/Stats';         // Statistiques
import AdminUsers from './pages/admin/Users';         // Gestion des utilisateurs
import AdminSettings from './pages/admin/Settings';   // Paramètres

// Importation des pages spécifiques au gérant
import GerantEntries from './pages/gerant/Entries';   // Entrées/sorties (gérant)
import GerantVehicles from './pages/gerant/Vehicles'; // Véhicules (gérant)
import GerantBilling from './pages/gerant/Billing';   // Facturation (gérant)
import GerantStats from './pages/gerant/Stats';       // Statistiques (gérant)

// Composant principal de l'application
function App() {
  // Récupération de l'état d'authentification et du rôle depuis le store
  const { isAuthenticated, isSuperAdmin } = useAuthStore();
  
  /**
   * Composant de route protégée pour les Super Administrateurs
   * Vérifie que l'utilisateur est authentifié et a le rôle SUPER_ADMIN
   * @param {Object} props - Propriétés du composant
   * @param {React.ReactNode} props.children - Contenu à afficher si autorisé
   * @returns {React.ReactNode} - Layout avec protection ou redirection
   */
  const AdminRoute = ({ children }) => (
    <Layout requiredRole="SUPER_ADMIN">   {/* Layout avec vérification du rôle */}
      {children}                           {/* Contenu de la page */}
    </Layout>
  );
  
  /**
   * Composant de route protégée pour les Gérants
   * Vérifie que l'utilisateur est authentifié et a le rôle GERANT
   * @param {Object} props - Propriétés du composant
   * @param {React.ReactNode} props.children - Contenu à afficher si autorisé
   * @returns {React.ReactNode} - Layout avec protection ou redirection
   */
  const GerantRoute = ({ children }) => (
    <Layout requiredRole="GERANT">        {/* Layout avec vérification du rôle */}
      {children}                           {/* Contenu de la page */}
    </Layout>
  );
  
  return (
    // Fournisseur de routage (BrowserRouter) qui gère la navigation
    <BrowserRouter>
      {/* Conteneur des routes */}
      <Routes>
        {/* ============================================= */}
        {/* ROUTES PUBLIQUES (accessibles sans connexion) */}
        {/* ============================================= */}
        
        {/* Route de connexion - accessible à tous */}
        <Route path="/login" element={<Login />} />
        
        {/* ==================================================== */}
        {/* ROUTES SUPER ADMINISTRATEUR (protégées par rôle) */}
        {/* ==================================================== */}
        
        {/* Tableau de bord administrateur - page principale */}
        <Route 
          path="/admin"                      // Chemin de l'URL
          element={                          // Élément à rendre pour ce chemin
            <AdminRoute>                     // Wrapper de protection
              <AdminDashboard />             // Composant de la page
            </AdminRoute>
          } 
        />
        
        {/* Gestion des parkings (administrateur) */}
        <Route 
          path="/admin/parkings"             // Chemin : /admin/parkings
          element={
            <AdminRoute>
              <AdminParkings />
            </AdminRoute>
          } 
        />
        
        {/* Gestion des véhicules (administrateur) */}
        <Route 
          path="/admin/vehicles"             // Chemin : /admin/vehicles
          element={
            <AdminRoute>
              <AdminVehicles />
            </AdminRoute>
          } 
        />
        
        {/* Gestion des cartes d'accès (administrateur) */}
        <Route 
          path="/admin/cards"                // Chemin : /admin/cards
          element={
            <AdminRoute>
              <AdminCards />
            </AdminRoute>
          } 
        />
        
        {/* Gestion des entrées/sorties (administrateur) */}
        <Route 
          path="/admin/entries"              // Chemin : /admin/entries
          element={
            <AdminRoute>
              <AdminEntries />
            </AdminRoute>
          } 
        />
        
        {/* Facturation (administrateur) */}
        <Route 
          path="/admin/billing"              // Chemin : /admin/billing
          element={
            <AdminRoute>
              <AdminBilling />
            </AdminRoute>
          } 
        />
        
        {/* Statistiques (administrateur) */}
        <Route 
          path="/admin/stats"                // Chemin : /admin/stats
          element={
            <AdminRoute>
              <AdminStats />
            </AdminRoute>
          } 
        />
        
        {/* Gestion des utilisateurs (administrateur) */}
        <Route 
          path="/admin/users"                // Chemin : /admin/users
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } 
        />
        
        {/* Paramètres (administrateur) */}
        <Route 
          path="/admin/settings"             // Chemin : /admin/settings
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } 
        />
        
        {/* ============================================= */}
        {/* ROUTES GÉRANT (protégées par rôle) */}
        {/* ============================================= */}
        
        {/* Tableau de bord gérant - page principale */}
        <Route 
          path="/gerant"                     // Chemin : /gerant
          element={
            <GerantRoute>                    // Protection spécifique gérant
              <GerantDashboard />
            </GerantRoute>
          } 
        />
        
        {/* Gestion des entrées/sorties (gérant) */}
        <Route 
          path="/gerant/entries"             // Chemin : /gerant/entries
          element={
            <GerantRoute>
              <GerantEntries />
            </GerantRoute>
          } 
        />
        
        {/* Gestion des véhicules (gérant) */}
        <Route 
          path="/gerant/vehicles"            // Chemin : /gerant/vehicles
          element={
            <GerantRoute>
              <GerantVehicles />
            </GerantRoute>
          } 
        />
        
        {/* Facturation (gérant) */}
        <Route 
          path="/gerant/billing"             // Chemin : /gerant/billing
          element={
            <GerantRoute>
              <GerantBilling />
            </GerantRoute>
          } 
        />
        
        {/* Statistiques (gérant) */}
        <Route 
          path="/gerant/stats"               // Chemin : /gerant/stats
          element={
            <GerantRoute>
              <GerantStats />
            </GerantRoute>
          } 
        />
        
        {/* ============================================= */}
        {/* ROUTES SPÉCIALES */}
        {/* ============================================= */}
        
        {/* 
          Route racine (/) - Redirection intelligente
          - Si l'utilisateur est connecté : redirige vers le dashboard approprié
          - Si non connecté : redirige vers la page de connexion
        */}
        <Route 
          path="/"                           // Chemin racine
          element={
            isAuthenticated ? (              // Vérifie si l'utilisateur est connecté
              isSuperAdmin() ? (             // Vérifie le rôle (Super Admin)
                // Redirection vers le dashboard administrateur
                <Navigate to="/admin" replace />
              ) : (
                // Redirection vers le dashboard gérant
                <Navigate to="/gerant" replace />
              )
            ) : (
              // Redirection vers la page de connexion
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* 
          Route 404 (catch-all) - Gère les chemins non définis
          Redirige vers la route appropriée selon l'état d'authentification
        */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Exportation du composant App comme export par défaut
export default App;