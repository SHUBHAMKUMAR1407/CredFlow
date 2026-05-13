import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ collapsed }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <div className="topbar-left">
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
