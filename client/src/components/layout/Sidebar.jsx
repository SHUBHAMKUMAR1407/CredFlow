import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadAvatar } from '../../services/api';
import { LayoutDashboard, ArrowRightLeft, TrendingUp, Shield, Lightbulb, FileText, Users, ChevronLeft, ChevronRight, LogOut, CreditCard, Settings, PiggyBank, Camera, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { section: 'Main', items: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
    { path: '/cashflow', icon: TrendingUp, label: 'Cash Flow' },
  ]},
  { section: 'Intelligence', items: [
    { path: '/credit-score', icon: Shield, label: 'Credit Score' },
    { path: '/budgets', icon: PiggyBank, label: 'Budgets' },
    { path: '/smart', icon: Lightbulb, label: 'Smart Features' },
  ]},
  { section: 'Reports', items: [
    { path: '/reports', icon: FileText, label: 'Reports' },
  ]},
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, updateUserData } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({ name: '', monthlyBudget: 50000, password: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, monthlyBudget: user.monthlyBudget || 50000, password: '', avatar: user.avatar || '' });
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    setUploading(true);
    try {
      const { data } = await uploadAvatar(uploadFormData);
      setFormData(prev => ({ ...prev, avatar: data.url }));
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToUpdate = { name: formData.name, monthlyBudget: Number(formData.monthlyBudget), avatar: formData.avatar };
      if (formData.password) dataToUpdate.password = formData.password;
      const { data } = await updateProfile(dataToUpdate);
      updateUserData(data);
      toast.success('Profile updated successfully!');
      setShowProfile(false);
      setFormData(prev => ({ ...prev, password: '' })); // clear password
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
          <span className="sidebar-logo">CredFlow</span>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <button key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
                  <item.icon className="nav-icon" size={20} />
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => setShowProfile(true)} title="Edit Profile">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
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
              <h2>Profile Settings</h2>
              <button className="modal-close" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <div className="avatar" style={{ width: 100, height: 100, fontSize: '2rem', overflow: 'hidden' }}>
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      formData.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: -10, width: 32, height: 32, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-secondary)', color: 'white' }} title="Upload Photo">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} disabled={uploading} />
                  </label>
                  {formData.avatar && (
                    <button type="button" onClick={() => setFormData({ ...formData, avatar: '' })} style={{ position: 'absolute', bottom: 0, left: -10, width: 32, height: 32, background: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-secondary)', color: 'white', padding: 0 }} title="Remove Photo">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label>Full Name</label>
                <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Monthly Budget Limit (₹)</label>
                <input className="form-input" type="number" min="1000" value={formData.monthlyBudget} onChange={e => setFormData({ ...formData, monthlyBudget: e.target.value })} required />
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
