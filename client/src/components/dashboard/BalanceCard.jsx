import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function BalanceCard({ balance, income, expense, incomeChange, expenseChange }) {
  const savings = (income || 0) - (expense || 0);
  
  return (
    <div className="grid-4" style={{ marginBottom: 24 }}>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff' }}>
          <Wallet size={24} />
        </div>
        <div className="stat-info">
          <h3>Total Balance</h3>
          <div className="stat-value">{formatCurrency(balance || 0)}</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
          <TrendingUp size={24} />
        </div>
        <div className="stat-info">
          <h3>Monthly Income</h3>
          <div className="stat-value">{formatCurrency(income || 0)}</div>
          <div className={`stat-change ${incomeChange >= 0 ? 'positive' : 'negative'}`}>
            {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}% vs last month
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          <TrendingDown size={24} />
        </div>
        <div className="stat-info">
          <h3>Monthly Expense</h3>
          <div className="stat-value">{formatCurrency(expense || 0)}</div>
          <div className={`stat-change ${expenseChange <= 0 ? 'positive' : 'negative'}`}>
            {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange)}% vs last month
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
          <TrendingUp size={24} />
        </div>
        <div className="stat-info">
          <h3>Monthly Savings</h3>
          <div className="stat-value">{formatCurrency(savings > 0 ? savings : 0)}</div>
          <div className="stat-change positive">
            Net Surplus
          </div>
        </div>
      </div>
    </div>
  );
}
