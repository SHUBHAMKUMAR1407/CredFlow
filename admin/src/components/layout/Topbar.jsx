import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ collapsed, setMobileOpen }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} title="Open Menu" style={{ padding: 8 }}>
          <Menu size={20} />
        </button>
        <div className="topbar-search">
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search transactions, reports..." />
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <button className="topbar-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
