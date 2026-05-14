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
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ 
    name: '', 
    monthlyBudget: 50000, 
    password: '', 
    avatar: '',
    phoneNumber: '',
    occupation: '',
    bio: '',
    currency: 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name || '', 
        monthlyBudget: user.monthlyBudget || 50000, 
        password: '', 
        avatar: user.avatar || '',
        phoneNumber: user.phoneNumber || '',
        occupation: user.occupation || '',
        bio: user.bio || '',
        currency: user.currency || 'INR'
      });
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
      const dataToUpdate = { 
        name: String(formData.name || ''), 
        monthlyBudget: Number(formData.monthlyBudget || 50000), 
        avatar: String(formData.avatar || ''),
        phoneNumber: String(formData.phoneNumber || ''),
        occupation: String(formData.occupation || ''),
        bio: String(formData.bio || ''),
        currency: String(formData.currency || 'INR')
      };
      if (formData.password) dataToUpdate.password = formData.password;
      
      const { data } = await updateProfile(dataToUpdate);
      console.log('Update Success Response:', data); 
      updateUserData(data);
      toast.success('Profile updated successfully!');
      setShowProfile(false);
      setFormData(prev => ({ ...prev, password: '' })); // clear password
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const profileCompletion = () => {
    const fields = [formData.name, formData.avatar, formData.phoneNumber, formData.occupation, formData.bio];
    const filled = fields.filter(f => f && f.length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <CreditCard size={24} style={{ color: '#818cf8', flexShrink: 0 }} />
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
          <div className="avatar" style={{ cursor: 'pointer', overflow: 'hidden', border: '2px solid var(--border-glass)', flexShrink: 0 }} onClick={() => setShowProfile(true)} title="Edit Profile">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          {!collapsed && (
            <>
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
            </>
          )}
        </div>
      </aside>

      {showProfile && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale" style={{ maxWidth: 650, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '100%', minHeight: 500 }}>
              {/* Modal Sidebar */}
              <div style={{ width: 220, background: 'var(--bg-tertiary)', borderRight: '1px solid var(--border-glass)', padding: '24px 12px' }}>
                <div style={{ padding: '0 12px 24px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Settings</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Manage your account</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={() => setActiveTab('general')} className={`nav-item ${activeTab === 'general' ? 'active' : ''}`} style={{ fontSize: '0.85rem' }}>
                    <Users size={16} /> Personal Info
                  </button>
                  <button onClick={() => setActiveTab('security')} className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} style={{ fontSize: '0.85rem' }}>
                    <Shield size={16} /> Security
                  </button>
                  <button onClick={() => setActiveTab('preferences')} className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`} style={{ fontSize: '0.85rem' }}>
                    <Settings size={16} /> Preferences
                  </button>
                </div>

                <div style={{ marginTop: 'auto', padding: '24px 12px' }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Profile Setup</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{profileCompletion()}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${profileCompletion()}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              </div>

              {/* Modal Main Content */}
              <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: 20, right: 20 }}>
                  <button className="modal-close" onClick={() => setShowProfile(false)}>×</button>
                </div>

                <form onSubmit={handleUpdateProfile} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {activeTab === 'general' && (
                    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ position: 'relative', width: 100, height: 100 }}>
                          <div className="avatar" style={{ width: 100, height: 100, fontSize: '2.5rem', overflow: 'hidden', border: '3px solid var(--border-glass)' }}>
                            {formData.avatar ? (
                              <img src={formData.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              formData.name?.charAt(0)?.toUpperCase()
                            )}
                          </div>
                          <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: -5, right: -5, width: 34, height: 34, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-secondary)', color: 'white', transition: 'var(--transition)' }} className="btn-hover-scale">
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
                            <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} disabled={uploading} />
                          </label>
                          {formData.avatar && (
                            <button type="button" onClick={() => setFormData({ ...formData, avatar: '' })} style={{ position: 'absolute', bottom: -5, left: -5, width: 28, height: 28, background: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-secondary)', color: 'white', padding: 0 }} title="Remove Photo">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formData.name || 'New User'}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <span className="badge badge-income" style={{ fontSize: '0.65rem' }}>Active Account</span>
                            {isAdmin && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Admin</span>}
                          </div>
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="input-group">
                          <label>Full Name</label>
                          <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="input-group">
                          <label>Occupation</label>
                          <input className="form-input" type="text" placeholder="e.g. Software Engineer" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="input-group">
                          <label>Phone Number</label>
                          <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                        </div>
                        <div className="input-group">
                          <label>Monthly Budget (₹)</label>
                          <input className="form-input" type="number" min="1000" value={formData.monthlyBudget} onChange={e => setFormData({ ...formData, monthlyBudget: e.target.value })} required />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Bio</label>
                        <textarea className="form-input" style={{ minHeight: 80, resize: 'none' }} placeholder="Tell us a bit about your financial goals..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Account Security</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update your password to keep your account secure.</p>
                      </div>

                      <div className="input-group">
                        <label>Email Address</label>
                        <input className="form-input" type="email" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed once verified.</p>
                      </div>

                      <div className="input-group">
                        <label>New Password</label>
                        <input className="form-input" type="password" placeholder="Min. 6 characters" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength="6" />
                      </div>

                      <div style={{ padding: 16, background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>Two-Factor Authentication</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>Add an extra layer of security to your account (Coming Soon).</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>App Preferences</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customize your experience on CredFlow.</p>
                      </div>

                      <div className="input-group">
                        <label>Base Currency</label>
                        <select className="form-input" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                          <option value="INR">₹ Indian Rupee (INR)</option>
                          <option value="USD">$ US Dollar (USD)</option>
                          <option value="EUR">€ Euro (EUR)</option>
                          <option value="GBP">£ British Pound (GBP)</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Push Notifications</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get alerts for budgets and unusual activity.</p>
                        </div>
                        <div style={{ width: 40, height: 20, background: 'var(--accent)', borderRadius: 20, position: 'relative' }}>
                          <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Weekly Reports</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receive a summary of your cash flow every Monday.</p>
                        </div>
                        <div style={{ width: 40, height: 20, background: 'var(--bg-tertiary)', borderRadius: 20, position: 'relative', border: '1px solid var(--border-glass)' }}>
                          <div style={{ width: 16, height: 16, background: 'var(--text-muted)', borderRadius: '50%', position: 'absolute', left: 2, top: 1 }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 32 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowProfile(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
