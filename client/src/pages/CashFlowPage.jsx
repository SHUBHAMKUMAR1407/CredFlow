import { useState, useEffect } from 'react';
import { getMonthlyCashFlow } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function CashFlowPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const res = await getMonthlyCashFlow();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load cash flow data');
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, []);

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  const labels = data.map(d => d.month);

  const barData = {
    labels,
    datasets: [
      { label: 'Income', data: data.map(d => d.income), backgroundColor: '#10b981', borderRadius: 4 },
      { label: 'Expense', data: data.map(d => d.expense), backgroundColor: '#ef4444', borderRadius: 4 }
    ]
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Net Cash Flow',
        data: data.map(d => d.net),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#f1f5f9', padding: 12, cornerRadius: 8 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Cash Flow Analysis</h1>
        <p>Track your income and expenses over time.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>Income vs Expense (12 Months)</h3>
        <div style={{ height: 300 }}>
          <Bar data={barData} options={options} />
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: 20 }}>Net Cash Flow Trend</h3>
        <div style={{ height: 300 }}>
          <Line data={lineData} options={options} />
        </div>
      </div>
    </div>
  );
}
