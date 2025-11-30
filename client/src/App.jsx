import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GerantDashboard from './pages/GerantDashboard';
import Layout from './components/Layout';
import { useAuthStore } from './store';

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
        
        {/* Routes Gerant */}
        <Route 
          path="/gerant" 
          element={
            <GerantRoute>
              <GerantDashboard />
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
