import { useState, useEffect } from 'react';
import { getSuggestions, getSavingsGoals, createSavingsGoal, deleteSavingsGoal, getBudgets, updateSavingsGoal } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Lightbulb, Target, AlertTriangle, Plus, Trash2, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../components/common/CustomSelect';

export default function SmartFeaturesPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalId, setEditGoalId] = useState(null);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', icon: '🎯', color: '#6366f1' });
  const [deleteGoalId, setDeleteGoalId] = useState(null);

  const fetchSmartData = async () => {
    try {
      const [suggRes, goalRes, budgRes] = await Promise.all([
        getSuggestions(), getSavingsGoals(), getBudgets({})
      ]);
      setSuggestions(suggRes.data);
      setGoals(goalRes.data);
      setBudgets(budgRes.data);
    } catch (err) {
      toast.error('Failed to load smart features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartData();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      if (isEditingGoal) {
        await updateSavingsGoal(editGoalId, { ...newGoal, targetAmount: Number(newGoal.targetAmount) });
        toast.success('Savings goal updated!');
      } else {
        await createSavingsGoal({ ...newGoal, targetAmount: Number(newGoal.targetAmount) });
        toast.success('Savings goal created!');
      }
      setShowGoalModal(false);
      setNewGoal({ name: '', targetAmount: '', icon: '🎯', color: '#6366f1' });
      setIsEditingGoal(false);
      setEditGoalId(null);
      fetchSmartData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleEditGoal = (goal) => {
    setNewGoal({ name: goal.name, targetAmount: goal.targetAmount, icon: goal.icon, color: goal.color });
    setEditGoalId(goal._id);
    setIsEditingGoal(true);
    setShowGoalModal(true);
  };

  const confirmDeleteGoal = async () => {
    if (!deleteGoalId) return;
    try {
      await deleteSavingsGoal(deleteGoalId);
      toast.success('Savings goal removed');
      fetchSmartData();
    } catch (err) {
      toast.error('Failed to remove goal');
    } finally {
      setDeleteGoalId(null);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  return (
    <>
    <div className="animate-fade">
      <div className="page-header">
        <h1>Smart Intelligence</h1>
        <p>AI-driven insights to optimize your financial health.</p>
      </div>

      <div className="grid-2">
        <div>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Lightbulb color="var(--warning)" /> AI Suggestions</h3>
          {suggestions.length === 0 ? (
            <div className="glass-card empty-state"><p>No suggestions currently.</p></div>
          ) : (
            suggestions.map((s, i) => (
              <div key={i} className={`suggestion-card ${s.priority}`}>
                <div className="suggestion-content">
                  <h4>{s.title}</h4>
                  <p>{s.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle color="var(--danger)" /> Budget Alerts</h3>
          <div className="glass-card" style={{ marginBottom: 24, padding: 20 }}>
            {budgets.length === 0 ? <p className="text-muted">No budgets set.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {budgets.map(b => {
                  const pct = Math.min(100, b.percentage);
                  const color = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';
                  return (
                    <div key={b._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>{b.category}</span>
                        <span>{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target color="var(--accent)" /> Savings Goals</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowGoalModal(true)}>
              <Plus size={14} /> Add Goal
            </button>
          </div>

          {goals.length === 0 ? <div className="glass-card empty-state"><p>No active savings goals.</p></div> : (
            <div className="grid-2">
              {goals.map(g => {
                const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                return (
                  <div key={g._id} className="glass-card savings-goal-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{g.name}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: g.color }}>{Math.round(pct)}% Complete</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button 
                          onClick={() => handleEditGoal(g)} 
                          title="Edit Goal"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteGoalId(g._id)} 
                          title="Delete Goal"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="progress-bar" style={{ height: 6, marginBottom: 8 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                    <div className="goal-amounts">
                      <span className="current" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatCurrency(g.currentAmount)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

    {showGoalModal && (
      <div className="modal-overlay">
        <div className="modal-content animate-scale">
          <div className="modal-header">
            <h2>{isEditingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}</h2>
            <button className="modal-close" onClick={() => { setShowGoalModal(false); setIsEditingGoal(false); setEditGoalId(null); }}>×</button>
          </div>
          <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label>Goal Name</label>
              <input className="form-input" placeholder="e.g., New Laptop, Vacation" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} required style={{ background: 'var(--bg-primary)' }} />
            </div>
            <div className="input-group">
              <label>Target Amount (₹)</label>
              <input className="form-input" type="number" placeholder="Enter amount" value={newGoal.targetAmount} onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })} required style={{ background: 'var(--bg-primary)' }} />
            </div>
            <div className="input-group">
              <label>Theme Color</label>
              <input className="form-input" type="color" value={newGoal.color} onChange={e => setNewGoal({ ...newGoal, color: e.target.value })} style={{ height: 42, padding: 2, background: 'var(--bg-primary)', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowGoalModal(false); setIsEditingGoal(false); setEditGoalId(null); }} style={{ background: 'var(--bg-primary)' }}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditingGoal ? 'Update Goal' : 'Start Saving'}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {deleteGoalId && (
      <div className="modal-overlay">
        <div className="modal-content animate-scale" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Delete Savings Goal?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This action cannot be undone. Are you sure you want to permanently delete this savings goal?
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteGoalId(null)} style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-primary)' }}>Cancel</button>
            <button className="btn" style={{ background: 'var(--warning)', color: 'white', flex: 1, justifyContent: 'center', border: 'none' }} onClick={confirmDeleteGoal}>
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
