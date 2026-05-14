import { useState, useEffect } from 'react';
import { getAdminUsers, getAdminStats, getAdminActivity, deleteUser } from '../services/api';
import { Users, Activity, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);

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

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete._id);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userToDelete._id));
      // Refresh stats
      const statRes = await getAdminStats();
      setStats(statRes.data);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
      setUserToDelete(null);
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
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-income' : 'badge-warning'}`}>{u.role}</span></td>
                    <td>
                      <button
                        onClick={() => setUserToDelete(u)}
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

      {userToDelete && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Delete User?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setUserToDelete(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmDeleteUser}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
