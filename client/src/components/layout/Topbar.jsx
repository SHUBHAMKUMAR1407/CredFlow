import { useState } from 'react';
import { Search, Bell, Sun, Moon, Trash2, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/dateHelpers';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ collapsed }) {
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <div className="topbar-left">
        <div className="topbar-search">
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      <div className="topbar-right">
        <div style={{ position: 'relative' }}>
          <button className="topbar-btn" title="Notifications" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>
          
          {showNotifs && (
            <div className="notification-dropdown animate-scale">
              <div className="notif-header">
                <h3>Notifications</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="notif-action" onClick={clearAll} title="Clear All"><Trash2 size={14} /></button>
                  <button className="notif-action" onClick={() => setShowNotifs(false)}><X size={14} /></button>
                </div>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markAsRead(n.id)}>
                      <div className={`notif-type-dot ${n.type}`} />
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{timeAgo(n.time)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button className="topbar-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
