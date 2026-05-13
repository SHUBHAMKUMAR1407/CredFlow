import { getCategoryInfo } from '../../utils/creditScoreUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';

export default function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-card animate-fade">
        <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Recent Transactions</h3>
        <div className="empty-state" style={{ padding: '30px 10px' }}>
          <div className="empty-icon">📝</div>
          <h3>No transactions yet</h3>
          <p style={{ fontSize: '0.85rem' }}>Your recent activity will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade">
      <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Recent Transactions</h3>
      <div className="transaction-list">
        {transactions.slice(0, 5).map(tx => {
          const cat = getCategoryInfo(tx.category);
          return (
            <div key={tx._id} className="transaction-item">
              <div className="transaction-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                {cat.icon}
              </div>
              <div className="transaction-details">
                <div className="tx-category">{cat.label}</div>
                <div className="tx-desc">{tx.description || tx.paymentMethod}</div>
              </div>
              <div>
                <div className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
                <div className="transaction-date">{formatDate(tx.date)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
