import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOTP, forgotPassword } from '../services/api';
import { ShieldCheck, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/auth.css';

export default function OTPVerificationPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) navigate('/signup');
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Please enter complete OTP');

    setLoading(true);
    try {
      await verifyOTP({ email, otp: otpString });
      toast.success('Account verified successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await forgotPassword({ email }); // reuse forgotPassword to send OTP
      toast.success('New OTP sent to your email');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-scale" style={{ maxWidth: 450 }}>
        <div className="auth-form-side" style={{ width: '100%', padding: 40 }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginBottom: 24, fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: 'var(--accent-transparent)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={32} />
            </div>
            <h2>Verify Email</h2>
            <p className="auth-subtitle">We've sent a 6-digit code to <strong>{email}</strong></p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{ width: 45, height: 50, textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, borderRadius: 8, border: '1px solid var(--border-glass)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
                  className="otp-input"
                  required
                />
              ))}
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 48 }}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Continue'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                Didn't receive code?{' '}
                <button 
                  type="button" 
                  onClick={handleResend} 
                  disabled={timer > 0 || resending}
                  style={{ background: 'none', border: 'none', color: timer > 0 ? 'var(--text-muted)' : 'var(--accent)', fontWeight: 600, cursor: timer > 0 ? 'default' : 'pointer', padding: 0 }}
                >
                  {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
