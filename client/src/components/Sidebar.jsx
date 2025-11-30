/**
 * Composant Sidebar (Navigation laterale)
 */

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  CreditCard, 
  ArrowLeftRight, 
  Receipt, 
  BarChart3, 
  Users, 
  Settings,
  ParkingSquare
} from 'lucide-react';
import { useAuthStore } from '../store';

export default function Sidebar() {
  const { user, isSuperAdmin } = useAuthStore();
  
  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin/parkings', icon: ParkingSquare, label: 'Parkings' },
    { to: '/admin/vehicles', icon: Car, label: 'Vehicules' },
    { to: '/admin/cards', icon: CreditCard, label: 'Cartes RFID' },
    { to: '/admin/entries', icon: ArrowLeftRight, label: 'Entrees/Sorties' },
    { to: '/admin/billing', icon: Receipt, label: 'Facturation' },
    { to: '/admin/stats', icon: BarChart3, label: 'Statistiques' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/settings', icon: Settings, label: 'Parametres' }
  ];
  
  const gerantLinks = [
    { to: '/gerant', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/gerant/entries', icon: ArrowLeftRight, label: 'Entrees/Sorties' },
    { to: '/gerant/vehicles', icon: Car, label: 'Vehicules' },
    { to: '/gerant/billing', icon: Receipt, label: 'Facturation' },
    { to: '/gerant/stats', icon: BarChart3, label: 'Statistiques' }
  ];
  
  const links = isSuperAdmin() ? adminLinks : gerantLinks;
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="sidebar-logo">
            <ParkingSquare size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="sidebar-brand mb-0">SmartPark</h3>
            <span className="sidebar-subtitle">Gestion Parking</span>
          </div>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.firstName || user?.username}</p>
            <p className="user-role">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gérant'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Navigation</span>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={link.to === '/admin' || link.to === '/gerant'}
            >
              <link.icon size={18} strokeWidth={2} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
