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
        <div className="stat-card" style={{ borderLeft: '5px solid var(--accent)' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '5px solid var(--success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Transactions</h3>
            <div className="stat-value">{stats?.totalTransactions || 0}</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '5px solid var(--warning)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <h3>Avg Credit Score</h3>
            <div className="stat-value">{stats?.avgCreditScore || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>User Management</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Role</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-income' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="btn-icon btn-delete"
                        style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>System Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activities.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <p style={{ color: 'var(--text-muted)' }}>No recent activity logged.</p>
              </div>
            ) : (
              activities.slice(0, 8).map(act => (
                <div key={act._id} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={16} color="var(--accent)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: 700 }}>{act.userId?.name || 'System'}</span> {act.details || 'Performed an action'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(act.createdAt || Date.now()).toLocaleString()}
                    </div>
                  </div>
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
