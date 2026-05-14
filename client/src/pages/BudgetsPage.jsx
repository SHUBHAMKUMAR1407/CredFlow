import { useState, useEffect } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Trash2, PieChart, AlertCircle, PiggyBank } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: 'Food', limit: '' });
  const [deleteId, setDeleteId] = useState(null);
  const { addNotification, notifications } = useNotifications();

  const categories = ['Food', 'Rent', 'Transport', 'Health', 'Entertainment', 'Education', 'Shopping', 'Utilities', 'Insurance', 'Other'];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data } = await getBudgets({});
      setBudgets(data);

      // Budget Exceeded Check
      data.forEach(b => {
        if (b.percentage >= 100) {
          const hasNotif = notifications.some(n => n.title === 'Budget Exceeded' && n.message.includes(b.category) && new Date(n.time).toDateString() === new Date().toDateString());
          if (!hasNotif) {
            addNotification('Budget Exceeded', `You have exceeded your monthly budget for ${b.category}!`, 'danger');
          }
        }
      });
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      await createBudget({ ...formData, limit: Number(formData.limit) });
      toast.success('Budget added successfully!');
      setShowForm(false);
      setFormData({ category: 'Food', limit: '' });
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add budget');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBudget(deleteId);
      toast.success('Budget deleted successfully');
      setBudgets(budgets.filter(b => b._id !== deleteId));
    } catch (err) {
      toast.error('Failed to delete budget');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Budget Management</h1>
          <p>Set and monitor monthly spending limits by category.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Set New Budget
        </button>
      </div>

      <div className="grid-3">
        {budgets.length === 0 ? (
          <div className="glass-card empty-state" style={{ gridColumn: '1 / -1' }}>
            <PieChart size={48} className="empty-icon" />
            <h3>No Budgets Set</h3>
            <p>Start managing your expenses by setting monthly limits.</p>
          </div>
        ) : (
          budgets.map(b => {
            const pct = Math.min(100, b.percentage);
            const color = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={b._id} className="glass-card animate-scale">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.category}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Limit</span>
                  </div>
                  <button className="btn-icon btn-delete" onClick={() => setDeleteId(b._id)} title="Delete Budget">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(b.limit)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 10 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Spent: {formatCurrency(b.spent)}</span>
                    <span style={{ color: color, fontWeight: 600 }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>

                {pct >= 100 && (
                  <div className="badge badge-expense" style={{ width: '100%', justifyContent: 'center' }}>
                    <AlertCircle size={14} /> Budget Exceeded
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2>Set Category Budget</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddBudget} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Category</label>
                <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Monthly Limit (₹)</label>
                <input className="form-input" type="number" placeholder="Enter amount" value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Delete Budget?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Are you sure you want to delete the budget for this category? This will not delete your transactions.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', flex: 1, justifyContent: 'center', border: 'none' }} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
