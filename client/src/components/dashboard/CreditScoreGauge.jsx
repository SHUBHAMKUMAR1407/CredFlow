import { getScoreCategory } from '../../utils/creditScoreUtils';

export default function CreditScoreGauge({ score }) {
  const currentScore = score?.score ?? 0;
  const isNewUser = currentScore === 0;
  const category = getScoreCategory(currentScore);
  const percentage = isNewUser ? 0 : ((currentScore - 300) / 550) * 100;

  // SVG arc calculation (simplified gauge)
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card animate-fade" style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h3 style={{ marginBottom: 20, textAlign: 'left', fontSize: '1rem' }}>AI Credit Score</h3>
      <div className="credit-gauge">
        <svg viewBox="0 0 200 120">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-tertiary)" strokeWidth="16" strokeLinecap="round" />
          {!isNewUser && (
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={`url(#gradient-${category.label})`} strokeWidth="16" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
          )}
          <defs>
            <linearGradient id="gradient-Excellent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient-Good" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="gradient-Fair" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
            <linearGradient id="gradient-Poor" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
        </svg>
        <div className="credit-score-value">
          {isNewUser ? (
            <>
              <div className="score-num" style={{ color: '#94a3b8', fontSize: '2rem' }}>N/A</div>
              <div className="score-label" style={{ color: '#94a3b8' }}>No Data Yet</div>
            </>
          ) : (
            <>
              <div className="score-num" style={{ color: category.color }}>{currentScore}</div>
              <div className="score-label">{category.label}</div>
            </>
          )}
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 16 }}>
        {score?.suggestions?.[0] || (isNewUser ? 'Add your first transaction to start building your credit score!' : 'Analyzing your financial behavior...')}
      </p>
    </div>
  );
}
