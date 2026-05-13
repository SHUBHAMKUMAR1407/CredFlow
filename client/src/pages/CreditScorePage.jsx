import { useState, useEffect } from 'react';
import { getCreditScore, getCreditScoreHistory, recalculateCreditScore } from '../services/api';
import CreditScoreGauge from '../components/dashboard/CreditScoreGauge';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function CreditScorePage() {
  const [scoreData, setScoreData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchScore = async () => {
    try {
      const [scoreRes, histRes] = await Promise.all([getCreditScore(), getCreditScoreHistory()]);
      setScoreData(scoreRes.data);
      setHistory(histRes.data);
    } catch (err) {
      toast.error('Failed to load credit score');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScore(); }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { data } = await recalculateCreditScore();
      setScoreData(data);
      toast.success('Credit score updated!');
      fetchScore(); // refresh history too
    } catch (err) {
      toast.error('Failed to recalculate');
    }
    setRecalculating(false);
  };

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  const historyData = {
    labels: history.map(h => { const d = new Date(h.year, h.month - 1); return d.toLocaleString('default', { month: 'short' }); }),
    datasets: [{
      label: 'Score',
      data: history.map(h => h.score),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { min: 300, max: 850, grid: { color: 'rgba(255,255,255,0.05)' } } }
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>AI Credit Score</h1>
          <p>Your intelligent financial health indicator.</p>
        </div>
        <button className="btn btn-primary" onClick={handleRecalculate} disabled={recalculating}>
          <RefreshCw size={16} className={recalculating ? 'spin' : ''} /> Recalculate
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div style={{ height: 340 }}><CreditScoreGauge score={scoreData} /></div>
        <div className="glass-card" style={{ height: 340, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 16 }}>Score History</h3>
          <div style={{ flex: 1 }}><Line data={historyData} options={chartOpts} /></div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} color="var(--accent)" /> Score Factors Breakdown</h3>
        <div className="score-factors">
          {Object.entries(scoreData?.factors || {}).map(([key, factor]) => {
            const labels = { paymentConsistency: 'Payment History', incomeStability: 'Income Stability', savingsRatio: 'Savings Rate', spendingDiscipline: 'Spending Control', accountAge: 'Account Age' };
            const pct = (factor.score / factor.max) * 100;
            const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
            return (
              <div key={key} className="score-factor">
                <div className="factor-label">{labels[key]}</div>
                <div className="factor-bar">
                  <div className="factor-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="factor-value" style={{ color }}>{factor.score}/{factor.max}</div>
              </div>
            );
          })}
        </div>
        
        {scoreData?.suggestions?.length > 0 && (
          <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>AI Recommendations</h4>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scoreData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
