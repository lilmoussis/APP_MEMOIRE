import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GerantDashboard from './pages/GerantDashboard';
import Layout from './components/Layout';
import { useAuthStore } from './store';

// Admin pages
import AdminParkings from './pages/admin/Parkings';
import AdminVehicles from './pages/admin/Vehicles';
import AdminCards from './pages/admin/Cards';
import AdminEntries from './pages/admin/Entries';
import AdminBilling from './pages/admin/Billing';
import AdminStats from './pages/admin/Stats';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

// Gerant pages
import GerantEntries from './pages/gerant/Entries';
import GerantVehicles from './pages/gerant/Vehicles';
import GerantBilling from './pages/gerant/Billing';
import GerantStats from './pages/gerant/Stats';

function App() {
  const { isAuthenticated, isSuperAdmin } = useAuthStore();
  
  // Route protegee pour Super Admin
  const AdminRoute = ({ children }) => (
    <Layout requiredRole="SUPER_ADMIN">
      {children}
    </Layout>
  );
  
  // Route protegee pour Gerant
  const GerantRoute = ({ children }) => (
    <Layout requiredRole="GERANT">
      {children}
    </Layout>
  );
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes Super Admin */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/parkings" 
          element={
            <AdminRoute>
              <AdminParkings />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/vehicles" 
          element={
            <AdminRoute>
              <AdminVehicles />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/cards" 
          element={
            <AdminRoute>
              <AdminCards />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/entries" 
          element={
            <AdminRoute>
              <AdminEntries />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/billing" 
          element={
            <AdminRoute>
              <AdminBilling />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/stats" 
          element={
            <AdminRoute>
              <AdminStats />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } 
        />
        
        {/* Routes Gerant */}
        <Route 
          path="/gerant" 
          element={
            <GerantRoute>
              <GerantDashboard />
            </GerantRoute>
          } 
        />
        <Route 
          path="/gerant/entries" 
          element={
            <GerantRoute>
              <GerantEntries />
            </GerantRoute>
          } 
        />
        <Route 
          path="/gerant/vehicles" 
          element={
            <GerantRoute>
              <GerantVehicles />
            </GerantRoute>
          } 
        />
        <Route 
          path="/gerant/billing" 
          element={
            <GerantRoute>
              <GerantBilling />
            </GerantRoute>
          } 
        />
        <Route 
          path="/gerant/stats" 
          element={
            <GerantRoute>
              <GerantStats />
            </GerantRoute>
          } 
        />
        
        {/* Route par defaut */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              isSuperAdmin() ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/gerant" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
