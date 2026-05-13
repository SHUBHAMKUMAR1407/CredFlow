import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Mail, Lock, Eye, EyeOff, Sparkles, Shield, TrendingUp, PiggyBank } from 'lucide-react';
import '../styles/auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-scale">
        <div className="auth-brand">
          <CreditCard size={48} />
          <div className="brand-logo">CredFlow</div>
          <p className="brand-tagline">Smart financial management with AI-powered credit scoring</p>
          <ul className="brand-features">
            <li><Sparkles size={16} /> AI Credit Score Analysis</li>
            <li><TrendingUp size={16} /> Cash Flow Tracking</li>
            <li><PiggyBank size={16} /> Smart Savings Goals</li>
            <li><Shield size={16} /> Secure & Private</li>
          </ul>
        </div>
        <div className="auth-form-side">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your CredFlow account</p>
          {error && <div className="auth-error">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36, paddingRight: 40 }} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/signup">Create account</Link>
          </div>
          <div className="auth-divider" style={{ marginTop: 20 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demo: demo@credflow.com / demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
