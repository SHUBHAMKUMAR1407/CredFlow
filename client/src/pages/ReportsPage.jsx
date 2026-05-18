import { useState, useEffect } from 'react';
import { getTransactionSummary } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await getTransactionSummary();
        setSummary(data);
      } catch (err) {
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('CredFlow Monthly Report', 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Amount']],
        body: [
          ['Total Income', formatCurrency(summary?.current?.income || 0)],
          ['Total Expense', formatCurrency(summary?.current?.expense || 0)],
          ['Net Balance', formatCurrency(summary?.balance || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] }
      });

      if (summary?.categoryBreakdown?.length > 0) {
        doc.text('Expense Breakdown by Category', 14, doc.lastAutoTable.finalY + 14);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Category', 'Spent']],
          body: summary.categoryBreakdown.map(c => [c._id, formatCurrency(c.total)]),
          theme: 'striped'
        });
      }

      doc.save(`CredFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner" /></div>;

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
  
  const doughnutData = {
    labels: summary?.categoryBreakdown?.map(c => c._id) || [],
    datasets: [{
      data: summary?.categoryBreakdown?.map(c => c.total) || [],
      backgroundColor: colors,
      borderWidth: 0
    }]
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p>Detailed breakdown of your finances.</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportPDF}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: 20 }}>Expense Breakdown</h3>
          {summary?.categoryBreakdown?.length > 0 ? (
            <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} options={{ plugins: { legend: { position: window.innerWidth < 600 ? 'bottom' : 'right', labels: { color: '#94a3b8', font: { size: 11 } } } }, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-muted text-center" style={{ marginTop: 100 }}>No expenses to display.</p>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: 20 }}>Top Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {summary?.categoryBreakdown?.map((c, i) => {
              const pct = (c.total / summary.current.expense) * 100;
              return (
                <div key={c._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span>{c._id}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(c.total)} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
