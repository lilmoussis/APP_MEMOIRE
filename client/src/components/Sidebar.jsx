/**
 * Composant Sidebar (Navigation latérale)
 * Barre de navigation latérale avec menu dynamique basé sur le rôle de l'utilisateur
 * Affiche différents liens selon si l'utilisateur est Super Admin ou Gérant
 */

import { NavLink } from 'react-router-dom'; // Composant pour les liens de navigation avec état actif
import { 
  LayoutDashboard,  // Icône tableau de bord
  Car,             // Icône véhicules
  CreditCard,      // Icône cartes RFID
  ArrowLeftRight,  // Icône entrées/sorties
  Receipt,         // Icône facturation
  BarChart3,       // Icône statistiques
  Users,           // Icône utilisateurs
  Settings,        // Icône paramètres
  ParkingSquare    // Icône parkings (utilisée aussi pour le logo)
} from 'lucide-react'; // Bibliothèque d'icônes
import { useAuthStore } from '../store'; // Store pour l'authentification et les infos utilisateur

/**
 * Composant Sidebar - Navigation latérale de l'application
 * @returns {JSX.Element} La sidebar avec menu adapté au rôle de l'utilisateur
 */
export default function Sidebar() {
  // Extraction des données utilisateur depuis le store d'authentification
  const { user, isSuperAdmin } = useAuthStore();
  
  /**
   * Liens de navigation pour les Super Administrateurs
   * Accès complet à toutes les fonctionnalités de l'application
   */
  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin/parkings', icon: ParkingSquare, label: 'Parkings' },
    { to: '/admin/vehicles', icon: Car, label: 'Véhicules' },
    { to: '/admin/cards', icon: CreditCard, label: 'Cartes RFID' },
    { to: '/admin/entries', icon: ArrowLeftRight, label: 'Entrées/Sorties' },
    { to: '/admin/billing', icon: Receipt, label: 'Facturation' },
    { to: '/admin/stats', icon: BarChart3, label: 'Statistiques' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' }
  ];
  
  /**
   * Liens de navigation pour les Gérants
   * Accès limité aux fonctionnalités opérationnelles
   */
  const gerantLinks = [
    { to: '/gerant', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/gerant/entries', icon: ArrowLeftRight, label: 'Entrées/Sorties' },
    { to: '/gerant/vehicles', icon: Car, label: 'Véhicules' },
    { to: '/gerant/billing', icon: Receipt, label: 'Facturation' },
    { to: '/gerant/stats', icon: BarChart3, label: 'Statistiques' }
  ];
  
  // Sélectionne les liens appropriés selon le rôle de l'utilisateur
  const links = isSuperAdmin() ? adminLinks : gerantLinks;
  
  return (
    // Conteneur principal de la sidebar
    <div className="sidebar">
      {/* En-tête de la sidebar avec logo et infos utilisateur */}
      <div className="sidebar-header">
        {/* Logo et nom de l'application */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="sidebar-logo">
            {/* Icône du parking - utilisée comme logo */}
            <ParkingSquare size={28} strokeWidth={2.5} />
          </div>
          <div>
            {/* Nom de l'application */}
            <h3 className="sidebar-brand mb-0">SmartPark</h3>
            {/* Sous-titre */}
            <span className="sidebar-subtitle">Gestion Parking</span>
          </div>
        </div>
        
        {/* Section utilisateur avec avatar et infos */}
        <div className="sidebar-user">
          {/* Avatar utilisateur (première lettre du prénom ou username) */}
          <div className="user-avatar">
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </div>
          {/* Informations utilisateur */}
          <div className="user-info">
            <p className="user-name">{user?.firstName || user?.username}</p>
            {/* Affichage du rôle formaté */}
            <p className="user-role">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gérant'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation principale */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {/* Titre de la section de navigation */}
          <span className="nav-section-title">Navigation</span>
          
          {/* Mapping des liens de navigation */}
          {links.map((link) => (
            <NavLink
              key={link.to} // Clé unique basée sur le chemin
              to={link.to}  // Chemin de destination
              /**
               * Fonction de classe conditionnelle
               * Ajoute la classe 'active' si le lien correspond à la route actuelle
               */
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              /**
               * `end` prop pour les liens racines
               * Pour les chemins '/' (admin ou gerant), le lien n'est actif 
               * que si c'est une correspondance exacte
               */
              end={link.to === '/admin' || link.to === '/gerant'}
            >
              {/* Icône du lien */}
              <link.icon size={18} strokeWidth={2} />
              {/* Libellé du lien */}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}