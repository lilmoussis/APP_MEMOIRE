/**
 * Composant Navbar (Barre de navigation superieure)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../store';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markAllAsRead();
    }
  };
  
  return (
    <nav className="navbar-custom">
      <div className="navbar-container">
        <button className="btn btn-link d-lg-none menu-toggle" type="button">
          <Menu size={20} />
        </button>
        
        <div className="navbar-actions">
          {/* Notifications */}
          <div className="notification-wrapper">
            <button 
              className={`notification-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
              onClick={handleNotificationClick}
              title="Notifications"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowNotifications(false)}></div>
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h6 className="dropdown-title">Notifications</h6>
                    {unreadCount > 0 && (
                      <button className="btn-mark-read" onClick={() => markAllAsRead()}>
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">
                        <Bell size={32} className="empty-icon" />
                        <p className="empty-text">Aucune notification</p>
                      </div>
                    ) : (
                      <>
                        {notifications.slice(0, 5).map((notif) => (
                          <div 
                            key={notif.id}
                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          >
                            <div className="notification-icon">
                              <Bell size={16} />
                            </div>
                            <div className="notification-content">
                              <h6 className="notification-title">{notif.title}</h6>
                              <p className="notification-message">{notif.message}</p>
                              {notif.timestamp && (
                                <span className="notification-time">
                                  {new Date(notif.timestamp).toLocaleString('fr-FR')}
                                </span>
                              )}
                            </div>
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
            <button 
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="user-info d-none d-md-block">
                <span className="user-name">{user?.firstName || user?.username}</span>
                <span className="user-role">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gérant'}</span>
              </div>
            </button>
            
            {showUserMenu && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowUserMenu(false)}></div>
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar-large">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </div>
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-name">{user?.firstName || user?.username}</div>
                      <div className="user-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  
                  <div className="user-dropdown-menu">
                    <button 
                      className="dropdown-menu-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                    >
                      <User size={18} />
                      <span>Mon Profil</span>
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
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
