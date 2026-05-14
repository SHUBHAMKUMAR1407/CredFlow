import { useState, useEffect } from 'react';
import { getAdminUsers, getAdminStats, getAdminActivity, deleteUser } from '../services/api';
import { Users, Activity, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        console.log('Fetching admin data...');
        const [statRes, userRes, actRes] = await Promise.all([
          getAdminStats().catch(e => ({ data: null })), 
          getAdminUsers().catch(e => ({ data: [] })), 
          getAdminActivity().catch(e => ({ data: [] }))
        ]);
        
        if (statRes.data) setStats(statRes.data);
        if (userRes.data) setUsers(userRes.data);
        if (actRes.data) setActivities(actRes.data);
        
        console.log('Admin data loaded successfully');
      } catch (err) {
        console.error('Admin fetch error:', err);
        toast.error('Failed to load some admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
      // Refresh stats
      const statRes = await getAdminStats();
      setStats(statRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        <div className="spinner"></div>
        <span style={{ marginLeft: 15 }}>Loading Admin Portal...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>System overview and user management.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="glass-card">
          <Users size={32} color="var(--accent)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalUsers || 0}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</div>
        </div>
        <div className="glass-card">
          <Activity size={32} color="var(--success)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalTransactions || 0}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Transactions</div>
        </div>
        <div className="glass-card">
          <Shield size={32} color="var(--warning)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.avgCreditScore || 0}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Avg Credit Score</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: 16 }}>User List</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td><span className="badge badge-income">{u.role}</span></td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-icon btn-delete" 
                        style={{ width: 32, height: 32, borderRadius: 6, opacity: 0.8 }} 
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: 16 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activities.length === 0 ? <p className="text-muted">No recent activity.</p> : (
              activities.slice(0, 10).map(act => (
                <div key={act._id} style={{ fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ fontWeight: 600 }}>{act.userId?.name || 'System'}</span>: {act.details || 'Performed action'}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
