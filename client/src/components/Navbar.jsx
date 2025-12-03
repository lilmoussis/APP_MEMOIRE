/**
 * Composant Navbar (Barre de navigation supérieure)
 * Barre de navigation fixe en haut de l'application avec notifications et menu utilisateur
 * Responsive : s'adapte aux différentes tailles d'écran
 */

import { useState, useEffect } from 'react'; // Hooks React pour état local et effets
import { useNavigate } from 'react-router-dom'; // Hook pour la navigation programmatique
import { Bell, User, LogOut, Menu } from 'lucide-react'; // Icônes de Lucide React
import { useAuthStore, useNotificationStore } from '../store'; // Stores Zustand pour état global

/**
 * Composant Navbar - Barre de navigation supérieure de l'application
 * @returns {JSX.Element} La barre de navigation avec notifications et profil utilisateur
 */
export default function Navbar() {
  // Navigation
  const navigate = useNavigate();
  
  // États globaux (Zustand stores)
  const { user, logout } = useAuthStore(); // Informations utilisateur et fonction de déconnexion
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore(); // Gestion des notifications
  
  // États locaux
  const [showNotifications, setShowNotifications] = useState(false); // Contrôle affichage dropdown notifications
  const [showUserMenu, setShowUserMenu] = useState(false); // Contrôle affichage dropdown profil
  const [isScrolled, setIsScrolled] = useState(false); // État pour détecter le scroll de la page
  
  /**
   * useEffect pour détecter le scroll de la page
   * Ajoute/supprime une classe CSS quand l'utilisateur scroll pour un effet visuel
   */
  useEffect(() => {
    const handleScroll = () => {
      // Si l'utilisateur a scrollé de plus de 20px, active l'état "scrolled"
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Ajoute l'écouteur d'événement au scroll
    window.addEventListener('scroll', handleScroll);
    
    // Nettoyage : supprime l'écouteur quand le composant est démonté
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Tableau de dépendances vide = s'exécute une seule fois au montage
  
  /**
   * Gère la déconnexion de l'utilisateur
   * Appelle la fonction logout du store et redirige vers la page de login
   */
  const handleLogout = async () => {
    await logout(); // Appelle la fonction asynchrone de déconnexion
    navigate('/login'); // Redirige vers la page de connexion
  };
  
  /**
   * Gère le clic sur le bouton de notifications
   * Ouvre/ferme le dropdown et marque toutes les notifications comme lues si elles étaient non lues
   */
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications); // Bascule l'état d'affichage
    
    // Si on ouvre le dropdown et qu'il y a des notifications non lues
    if (!showNotifications && unreadCount > 0) {
      markAllAsRead(); // Marque toutes les notifications comme lues
    }
  };
  
  return (
    // Élément nav principal avec classe conditionnelle selon l'état de scroll
    <nav className={`navbar-custom ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Bouton menu hamburger pour mobile (visible uniquement sur petits écrans) */}
        <button className="btn btn-link d-lg-none menu-toggle" type="button">
          <Menu size={20} /> {/* Icône menu hamburger */}
        </button>
        
        {/* Conteneur pour les actions de la navbar (notifications + profil) */}
        <div className="navbar-actions">
          {/* Section Notifications */}
          <div className="notification-wrapper">
            {/* Bouton notifications avec badge si notifications non lues */}
            <button 
              className={`notification-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
              onClick={handleNotificationClick}
              title="Notifications"
            >
              <Bell size={20} strokeWidth={2} /> {/* Icône cloche */}
              
              {/* Badge avec le nombre de notifications non lues */}
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {/* Affiche "9+" si plus de 9 notifications */}
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Dropdown des notifications (conditionnel) */}
            {showNotifications && (
              <>
                {/* Overlay pour fermer le dropdown en cliquant à l'extérieur */}
                <div className="dropdown-overlay" onClick={() => setShowNotifications(false)}></div>
                
                {/* Conteneur du dropdown des notifications */}
                <div className="notification-dropdown">
                  {/* En-tête du dropdown */}
                  <div className="dropdown-header">
                    <h6 className="dropdown-title">Notifications</h6>
                    
                    {/* Bouton pour tout marquer comme lu (visible seulement s'il y a des non-lues) */}
                    {unreadCount > 0 && (
                      <button className="btn-mark-read" onClick={() => markAllAsRead()}>
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  
                  {/* Liste des notifications */}
                  <div className="notification-list">
                    {/* Message si aucune notification */}
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">
                        <Bell size={32} className="empty-icon" />
                        <p className="empty-text">Aucune notification</p>
                      </div>
                    ) : (
                      <>
                        {/* Mapper les 5 premières notifications */}
                        {notifications.slice(0, 5).map((notif) => (
                          <div 
                            key={notif.id}
                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          >
                            {/* Icône de la notification */}
                            <div className="notification-icon">
                              <Bell size={16} />
                            </div>
                            
                            {/* Contenu de la notification */}
                            <div className="notification-content">
                              <h6 className="notification-title">{notif.title}</h6>
                              <p className="notification-message">{notif.message}</p>
                              
                              {/* Timestamp formaté en français */}
                              {notif.timestamp && (
                                <span className="notification-time">
                                  {new Date(notif.timestamp).toLocaleString('fr-FR')}
                                </span>
                              )}
                            </div>
                            
                            {/* Indicateur visuel pour les notifications non lues */}
                            {!notif.read && <div className="unread-indicator"></div>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Menu utilisateur */}
          <div className="user-menu-wrapper">
            {/* Bouton pour ouvrir le menu utilisateur */}
            <button 
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {/* Avatar utilisateur (première lettre du prénom ou nom d'utilisateur) */}
              <div className="user-avatar">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              
              {/* Informations utilisateur (cachées sur mobile) */}
              <div className="user-info d-none d-md-block">
                <span className="user-name">{user?.firstName || user?.username}</span>
                {" "}
                {/* Affichage du rôle formaté */}
                <span className="user-role">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gérant'}
                </span>
              </div>
            </button>
            
            {/* Dropdown du menu utilisateur (conditionnel) */}
            {showUserMenu && (
              <>
                {/* Overlay pour fermer le dropdown en cliquant à l'extérieur */}
                <div className="dropdown-overlay" onClick={() => setShowUserMenu(false)}></div>
                
                {/* Contenu du dropdown utilisateur */}
                <div className="user-dropdown">
                  {/* En-tête avec avatar agrandi et infos */}
                  <div className="user-dropdown-header">
                    <div className="user-avatar-large">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </div>
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-name">{user?.firstName || user?.username}</div>
                      <div className="user-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  
                  {/* Menu avec options */}
                  <div className="user-dropdown-menu">
                    {/* Option "Mon Profil" */}
                    <button 
                      className="dropdown-menu-item"
                      onClick={() => {
                        setShowUserMenu(false); // Ferme le dropdown
                        navigate('/profile'); // Navigue vers la page profil
                      }}
                    >
                      <User size={18} />
                      <span>Mon Profil</span>
                    </button>
                    
                    {/* Séparateur visuel */}
                    <div className="dropdown-divider"></div>
                    
                    {/* Option "Déconnexion" */}
                    <button 
                      className="dropdown-menu-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}