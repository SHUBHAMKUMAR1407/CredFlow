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
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return 'rgba(139, 92, 246, 0.1)';
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.01)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#8b5cf6',
      pointHoverBorderWidth: 3
    }]
  };

  const chartOpts = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        padding: 14,
        cornerRadius: 10,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        titleFont: { family: 'Inter', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 13, weight: '700' },
        displayColors: false,
        boxPadding: 6,
        callbacks: {
          label: (ctx) => `Score: ${ctx.raw}`
        }
      }
    },
    scales: { 
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12, weight: '500' } },
        border: { display: false }
      }, 
      y: { 
        min: 300, 
        max: 850, 
        grid: { color: 'rgba(148, 163, 184, 0.08)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        border: { display: false }
      } 
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>AI Credit Score</h1>
          <p>Your intelligent financial health indicator.</p>
        </div>
        <button className="btn btn-primary" onClick={handleRecalculate} disabled={recalculating} style={{ padding: '10px 20px' }}>
          <RefreshCw size={16} className={recalculating ? 'spin' : ''} /> {recalculating ? 'Analyzing...' : 'Recalculate'}
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="glass-card" style={{ height: 360, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CreditScoreGauge score={scoreData} />
        </div>
        <div className="glass-card" style={{ height: 360, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Score History</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={historyData} options={chartOpts} />
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', fontWeight: 700 }}>
          <ShieldCheck size={22} color="var(--accent)" /> 
          Score Factors Breakdown
        </h3>
        <div className="score-factors">
          {Object.entries(scoreData?.factors || {}).map(([key, factor]) => {
            const labels = { paymentConsistency: 'Payment History', incomeStability: 'Income Stability', savingsRatio: 'Savings Rate', spendingDiscipline: 'Spending Control', accountAge: 'Account Age' };
            const pct = (factor.score / factor.max) * 100;
            const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
            return (
              <div key={key} className="score-factor">
                <div className="factor-label">
                  {labels[key]}
                </div>
                <div className="factor-bar">
                  <div className="factor-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="factor-value" style={{ color }}>
                  {factor.score}/{factor.max}
                </div>
              </div>
            );
          })}
        </div>
        
        {scoreData?.suggestions?.length > 0 && (
          <div style={{ marginTop: 32, padding: '24px', background: 'var(--bg-glass)', borderRadius: 'var(--radius)', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', width: 28, height: 28, borderRadius: '50%' }}>✨</span>
              AI Recommendations
            </h4>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scoreData.suggestions.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginTop: 8, flexShrink: 0, opacity: 0.7 }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
