import { useState, useEffect } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Trash2, PieChart, AlertTriangle, TrendingUp, TrendingDown, Target, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';
import CustomSelect from '../components/common/CustomSelect';
import { CATEGORIES, getCategoryInfo } from '../utils/creditScoreUtils';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: 'Food', limit: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addNotification, notifications } = useNotifications();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data } = await getBudgets({});
      setBudgets(data);

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
      toast.success(isEditing ? 'Budget updated successfully!' : 'Budget added successfully!');
      setShowForm(false);
      setIsEditing(false);
      setFormData({ category: 'Food', limit: '' });
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setFormData({ category: budget.category, limit: budget.limit });
    setIsEditing(true);
    setShowForm(true);
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

  const totalLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const chartData = {
    labels: budgets.map(b => b.category),
    datasets: [{
      data: budgets.map(b => b.limit),
      backgroundColor: budgets.map(b => getCategoryInfo(b.category).color),
      borderWidth: 0,
      borderColor: 'transparent',
      spacing: 0,
      hoverOffset: 2,
      hoverBorderWidth: 0,
      hoverBorderColor: 'transparent'
    }]
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => ` Limit: ${formatCurrency(context.raw)}`
        },
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  return (
    <>
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1>Budget Management</h1>
          <p>Set and monitor monthly spending limits by category.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setIsEditing(false); setFormData({ category: 'Food', limit: '' }); setShowForm(true); }}>
          <Plus size={18} /> Set New Budget
        </button>
      </div>

      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 32 }}>
          <div className="glass-card animate-scale" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <PieChart size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Monthly Budget</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  {formatCurrency(totalSpent)} 
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {formatCurrency(totalLimit)}</span>
                </div>
              </div>
            </div>
            <div style={{ width: '30%', minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Utilization</span>
                <span style={{ color: totalPct >= 100 ? 'var(--danger)' : totalPct >= 80 ? 'var(--warning)' : 'var(--success)' }}>
                  {Math.round(totalPct)}%
                </span>
              </div>
              <div style={{ width: '100%', height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(totalPct, 100)}%`, 
                    height: '100%', 
                    background: totalPct >= 100 ? 'var(--danger)' : totalPct >= 80 ? 'var(--warning)' : 'var(--success)',
                    transition: 'width 1s ease-out'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255, 255, 255, 0.4)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Highest Budget</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {budgets.length > 0 ? budgets.reduce((prev, current) => (prev.limit > current.limit) ? prev : current).category : 'N/A'}
            </span>
          </div>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255, 255, 255, 0.4)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Overspent</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)' }}>
              {budgets.filter(b => b.percentage >= 100).length} Categories
            </span>
          </div>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255, 255, 255, 0.4)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Near Limit</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warning)' }}>
              {budgets.filter(b => b.percentage >= 80 && b.percentage < 100).length} Categories
            </span>
          </div>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255, 255, 255, 0.4)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Available Total</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>
              {formatCurrency(Math.max(0, totalLimit - totalSpent))}
            </span>
          </div>
        </div>
      )}

      <div className="grid-3">
        {budgets.length === 0 ? (
          <div className="glass-card empty-state" style={{ gridColumn: '1 / -1' }}>
            <Target size={48} className="empty-icon" />
            <h3>No Budgets Set</h3>
            <p>Start managing your expenses by setting monthly limits.</p>
          </div>
        ) : (
          budgets.map(b => {
            const pct = Math.min(100, b.percentage);
            const isDanger = pct >= 100;
            const isWarning = pct >= 80 && pct < 100;
            
            let color = 'var(--success)';
            let bgColor = 'rgba(0, 172, 193, 0.15)';
            let Icon = PieChart;
            let TrendIcon = TrendingUp;

            if (isDanger) {
              color = 'var(--danger)';
              bgColor = 'rgba(251, 140, 0, 0.15)';
              Icon = AlertTriangle;
              TrendIcon = TrendingDown;
            } else if (isWarning) {
              color = 'var(--warning)';
              bgColor = 'rgba(245, 158, 11, 0.15)';
              Icon = Target;
            }

            return (
              <div key={b._id} className="stat-card" style={{ borderLeft: `5px solid ${color}`, position: 'relative' }}>
                <div className="stat-icon" style={{ background: bgColor, color: color }}>
                  <Icon size={20} />
                </div>

                <div className="stat-info" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>{b.category} LIMIT</h3>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        padding: '1px 6px', 
                        borderRadius: '12px', 
                        background: b.percentage >= 100 ? 'rgba(239, 68, 68, 0.1)' : b.percentage >= 80 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: b.percentage >= 100 ? 'var(--danger)' : b.percentage >= 80 ? 'var(--warning)' : 'var(--success)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap'
                      }}>
                        {b.percentage >= 100 ? 'Exceeded' : b.percentage >= 80 ? 'Near Limit' : 'On Track'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button 
                        onClick={() => handleEdit(b)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(b._id)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.6rem' }}>{formatCurrency(b.limit)}</div>
                  
                  <div className="stat-change" style={{ color: color, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '12px', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <TrendIcon size={14}/> Spent {formatCurrency(b.spent)} ({Math.round(pct)}%)
                    </div>
                    
                    <div style={{ width: '100%', height: '4px', background: 'var(--border-glass)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Category Budget' : 'Set Category Budget'}</h2>
              <button className="modal-close" onClick={() => { setShowForm(false); setIsEditing(false); }}>×</button>
            </div>
            <form onSubmit={handleAddBudget} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Category</label>
                <CustomSelect 
                  value={formData.category} 
                  onChange={val => setFormData({ ...formData, category: val })}
                  options={CATEGORIES.expense.map(c => ({
                    value: c.value,
                    label: c.label,
                    icon: c.icon,
                    color: getCategoryInfo(c.value).color
                  }))}
                  disabled={isEditing}
                />
              </div>
              <div className="input-group">
                <label>Monthly Limit (₹)</label>
                <input className="form-input" type="number" placeholder="Enter amount" value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })} required style={{ background: 'var(--bg-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setIsEditing(false); }} style={{ background: 'var(--bg-primary)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Update Budget' : 'Save Budget'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Delete Budget?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                This action cannot be undone. Are you sure you want to permanently delete this budget?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn" style={{ background: 'var(--warning)', color: 'white', flex: 1, justifyContent: 'center', border: 'none' }} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
