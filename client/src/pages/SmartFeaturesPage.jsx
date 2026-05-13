import { useState, useEffect } from 'react';
import { getSuggestions, getSavingsGoals, getBudgets } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Lightbulb, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SmartFeaturesPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSmartData();
  }, []);

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  return (
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
                <div className="suggestion-icon">{s.icon}</div>
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

          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Target color="var(--accent)" /> Savings Goals</h3>
          {goals.length === 0 ? <div className="glass-card empty-state"><p>No active savings goals.</p></div> : (
            <div className="grid-2">
              {goals.map(g => {
                const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                return (
                  <div key={g._id} className="glass-card savings-goal-card" style={{ padding: 16 }}>
                    <div className="savings-goal-header">
                      <div>
                        <div className="goal-icon">{g.icon}</div>
                        <div className="goal-name">{g.name}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: g.color }}>{Math.round(pct)}%</div>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                    <div className="goal-amounts">
                      <span className="current">{formatCurrency(g.currentAmount)}</span>
                      <span>{formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
