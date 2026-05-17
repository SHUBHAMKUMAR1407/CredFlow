import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, LogOut, CreditCard, Settings, ChevronLeft, ChevronRight, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { updateProfile } from '../../services/api';
import toast from 'react-hot-toast';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUserData } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({ name: '', monthlyBudget: 50000, password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, monthlyBudget: user.monthlyBudget || 50000, password: '' });
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToUpdate = { name: formData.name, monthlyBudget: Number(formData.monthlyBudget) };
      if (formData.password) dataToUpdate.password = formData.password;
      const { data } = await updateProfile(dataToUpdate);
      updateUserData(data);
      toast.success('Profile updated successfully!');
      setShowProfile(false);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <CreditCard size={24} style={{ color: '#6366f1', flexShrink: 0 }} />
          <span className="sidebar-logo">CredAdmin</span>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Admin Management</div>
            <button className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="nav-icon" size={20} />
              <span className="nav-label">Dashboard</span>
            </button>
            <button className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
              <Settings className="nav-icon" size={20} />
              <span className="nav-label">Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)} title="Edit Profile">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {collapsed ? (
            <button className="sidebar-toggle" onClick={handleLogout} title="Logout" style={{ margin: 0, padding: '8px' }}>
              <LogOut size={24} style={{ color: 'var(--warning)', strokeWidth: 2.2 }} />
            </button>
          ) : (
            <>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <div className="sidebar-footer-actions" style={{ marginLeft: 'auto', display: 'flex' }}>
                <button className="sidebar-toggle" onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {showProfile && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale" style={{ maxWidth: 450, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
              <button className="modal-close" onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.8)' }}>×</button>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{user?.name}</h2>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <ShieldCheck size={14} /> Administrator
              </div>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div className="input-group">
                  <label>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="email" value={user?.email || ''} disabled style={{ paddingLeft: 42, background: 'var(--bg-primary)', opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ paddingLeft: 42 }} />
                  </div>
                </div>

                <div className="input-group">
                  <label>New Password (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength="6" style={{ paddingLeft: 42 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProfile(false)} style={{ flex: 1, padding: '12px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: '12px' }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
