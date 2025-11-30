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
      <div className="px-3 mb-4">
        <h3 className="navbar-brand mb-0">SmartPark</h3>
        <p className="text-muted small mb-0">
          {user?.role === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Gerant'}
        </p>
        <p className="text-muted small">{user?.email}</p>
      </div>
      
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            end={link.to === '/admin' || link.to === '/gerant'}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
