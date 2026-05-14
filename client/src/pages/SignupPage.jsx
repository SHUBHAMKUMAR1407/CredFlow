import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, verifyEmail } from '../services/api';
import { CreditCard, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import '../styles/auth.css';

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState('');
  const { updateUserData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await registerUser({ name, email, password });
      
      if (data.requiresVerification) {
        // OTP sent to email, go to verification step
        if (data.otp) {
          // Email failed, show OTP as fallback
          setFallbackOtp(data.otp);
          const otpDigits = data.otp.toString().split('');
          setOtp(otpDigits);
          setMessage('OTP has been auto-filled below. Click "Verify" to continue.');
        } else {
          setMessage('Verification OTP sent to your email! Please check your inbox.');
        }
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleOTPChange = (i, val) => {
    if (val.length > 1) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`signup-otp-${i+1}`)?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyEmail({ email, otp: enteredOtp });
      // Auto login after verification
      updateUserData(data);
      localStorage.setItem('credflow_user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-scale">
        <div className="auth-brand">
          <CreditCard size={48} />
          <div className="brand-logo">CredFlow</div>
          <p className="brand-tagline">Join thousands managing their finances smartly</p>
        </div>
        <div className="auth-form-side">
          {step === 1 ? (
            <>
              <h2>Create Account</h2>
              <p className="auth-subtitle">Start your financial journey with CredFlow</p>
              {error && <div className="auth-error">{error}</div>}
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
              <div className="auth-links" style={{ justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Already have an account? <Link to="/login">Sign In</Link></span>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck size={36} style={{ color: 'var(--accent)', margin: '0 auto 12px', display: 'block' }} />
              <h2>Verify Your Email</h2>
              <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{email}</strong></p>
              {error && <div className="auth-error">{error}</div>}
              {message && <div className="auth-success">{message}</div>}
              <form className="auth-form" onSubmit={handleVerify}>
                <div className="otp-inputs">
                  {otp.map((v, i) => (
                    <input key={i} id={`signup-otp-${i}`} maxLength={1} value={v} onChange={e => handleOTPChange(i, e.target.value)} onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) document.getElementById(`signup-otp-${i-1}`)?.focus(); }} required />
                  ))}
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
              <div className="auth-links" style={{ justifyContent: 'center', marginTop: 16 }}>
                <Link to="/signup" onClick={() => { setStep(1); setError(''); setMessage(''); }}>← Back to Signup</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
