import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Moon, Sun, Database, Bell, Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    newUser: true,
    suspiciousActivity: true,
    systemUpdates: false
  });

  const handleSavePreferences = () => {
    toast.success('System preferences saved successfully');
  };

  const handleExportData = () => {
    toast.success('Database export started. You will be notified when complete.');
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Manage application configurations and admin preferences.</p>
      </div>

      <div className="grid-2">
        {/* Appearance & Theme */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <Moon size={20} color="var(--accent)" /> : <Sun size={20} color="var(--warning)" />}
            Appearance
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Theme Preference</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle between light and dark mode</div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Security & Access */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color="var(--success)" />
            Security Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Admin Email</span>
              <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Access Level</span>
              <span className="badge badge-income">Super Admin</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Last Login</span>
              <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color="var(--info)" />
            Alerts & Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>New User Registrations</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified when a new user signs up</div>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.newUser} 
                onChange={(e) => setNotifications({...notifications, newUser: e.target.checked})}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Suspicious Activity Alerts</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Alerts for unusual transaction patterns</div>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.suspiciousActivity} 
                onChange={(e) => setNotifications({...notifications, suspiciousActivity: e.target.checked})}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSavePreferences} style={{ marginTop: 24, width: '100%' }}>
            <Save size={16} /> Save Preferences
          </button>
        </div>

        {/* Data Management */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={20} color="var(--accent2)" />
            Data Management
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Export all system data including users, transactions, and logs for backup purposes.
          </p>
          <button className="btn btn-secondary" onClick={handleExportData} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <Download size={16} /> Export System Backup (.json)
          </button>
        </div>
      </div>
    </div>
  );
}
