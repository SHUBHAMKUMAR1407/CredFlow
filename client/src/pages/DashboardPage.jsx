import { useEffect, useState } from 'react';
import { getTransactionSummary, getCreditScore, getTransactions, seedData } from '../services/api';
import BalanceCard from '../components/dashboard/BalanceCard';
import CreditScoreGauge from '../components/dashboard/CreditScoreGauge';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Database, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [score, setScore] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user } = useAuth();
  const { addNotification, notifications } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, scoreRes, txRes] = await Promise.all([
        getTransactionSummary(),
        getCreditScore(),
        getTransactions({ limit: 5 })
      ]);
      setSummary(sumRes.data);
      setScore(scoreRes.data);
      setTransactions(txRes.data.transactions);

      // Low Balance Alert
      if (sumRes.data.balance < 5000) {
        const hasNotif = notifications.some(n => n.title === 'Low Balance Alert' && new Date(n.time).toDateString() === new Date().toDateString());
        if (!hasNotif) {
          addNotification('Low Balance Alert', `Your balance is ₹${sumRes.data.balance}. Please review your spending.`, 'warning');
        }
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    setShowConfirmModal(false);
    setSeeding(true);
    try {
      await seedData();
      toast.success('Demo data seeded successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to seed data');
    }
    setSeeding(false);
  };

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  return (
    <>
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p>Here's your financial overview for this month.</p>
        </div>
        {user?.email === 'demo@credflow.com' && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirmModal(true)} disabled={seeding}>
            <Database size={14} /> {seeding ? 'Seeding...' : 'Reset Demo Data'}
          </button>
        )}
      </div>

      <BalanceCard 
        balance={summary?.balance} 
        income={summary?.current?.income} 
        expense={summary?.current?.expense} 
        incomeChange={summary?.incomeChange} 
        expenseChange={summary?.expenseChange} 
      />

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <CreditScoreGauge score={score} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>

    {showConfirmModal && (
      <div className="modal-overlay">
        <div className="modal-content animate-scale" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Reset Demo Data?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This will wipe your current transactions and budgets and replace them with demo data. This action is irreversible.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSeed}>
              Yes, Reset
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
