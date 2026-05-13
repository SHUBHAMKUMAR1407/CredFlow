import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, LogOut, CreditCard, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
            <button className="nav-item" onClick={() => toast('User Management Integrated')}>
              <Users className="nav-icon" size={20} />
              <span className="nav-label">Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)} title="Edit Profile">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className="sidebar-toggle" onClick={() => setShowProfile(true)} title="Settings">
              <Settings size={16} />
            </button>
            <button className="sidebar-toggle" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {showProfile && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2>Admin Profile</h2>
              <button className="modal-close" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Full Name</label>
                <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>New Password (Optional)</label>
                <input className="form-input" type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength="6" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfile(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
