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
    <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4">
      <div className="container-fluid">
        <button className="btn btn-link d-lg-none" type="button">
          <Menu size={24} />
        </button>
        
        <div className="ms-auto d-flex align-items-center">
          {/* Notifications */}
          <div className="position-relative me-3">
            <button 
              className="btn btn-link position-relative"
              onClick={handleNotificationClick}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div 
                className="position-absolute end-0 mt-2 bg-white rounded shadow-lg"
                style={{ width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000 }}
              >
                <div className="p-3 border-bottom">
                  <h6 className="mb-0">Notifications</h6>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted">
                    Aucune notification
                  </div>
                ) : (
                  <div>
                    {notifications.slice(0, 5).map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-3 border-bottom ${!notif.read ? 'bg-light' : ''}`}
                      >
                        <div className="d-flex align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 small">{notif.title}</h6>
                            <p className="mb-0 small text-muted">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Menu utilisateur */}
          <div className="position-relative">
            <button 
              className="btn btn-link d-flex align-items-center"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}
              >
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <span className="ms-2 d-none d-md-inline">
                {user?.firstName || user?.username}
              </span>
            </button>
            
            {showUserMenu && (
              <div 
                className="position-absolute end-0 mt-2 bg-white rounded shadow-lg"
                style={{ width: '200px', zIndex: 1000 }}
              >
                <div className="p-3 border-bottom">
                  <div className="fw-bold">{user?.username}</div>
                  <div className="small text-muted">{user?.email}</div>
                </div>
                
                <div className="p-2">
                  <button 
                    className="btn btn-link text-decoration-none w-100 text-start d-flex align-items-center"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                  >
                    <User size={16} className="me-2" />
                    Profil
                  </button>
                  
                  <button 
                    className="btn btn-link text-danger text-decoration-none w-100 text-start d-flex align-items-center"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="me-2" />
                    Deconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
