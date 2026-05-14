import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, verifyOTP } from '../services/api';
import { CreditCard, Mail, KeyRound } from 'lucide-react';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=password, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    
    // Set a manual timeout to prevent hanging if Render is waking up (takes up to 50s)
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Server is taking too long to respond. It might be waking up. Please try again.');
    }, 25000); // 25 seconds timeout

    try {
      const res = await forgotPassword({ email });
      clearTimeout(timeout);
      setMessage(res.data.message || 'OTP sent! Please check your email.');
      setStep(2);
    } catch (err) { 
      clearTimeout(timeout);
      setError(err.response?.data?.message || 'Failed to send OTP. Server might be slow.'); 
    } finally {
      // If the timeout already fired, this will just set false again, which is safe.
      setLoading(false);
    }
  };

  const handleOTPChange = (i, val) => {
    if (val.length > 1) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };

  const handleVerifyOTPNext = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setMessage('');
    setStep(3); // Proceed to new password screen
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(''); setLoading(true);
    try {
      await verifyOTP({ email, otp: otp.join(''), newPassword });
      setStep(4);
      setMessage('Password reset successful! You can now login with your new password.');
    } catch (err) { 
      setError(err.response?.data?.message || 'Invalid or expired OTP'); 
      if (err.response?.status === 400) {
        setStep(2); // Go back to OTP if invalid
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-scale" style={{ maxWidth: 480, gridTemplateColumns: '1fr' }}>
        <div className="auth-form-side" style={{ textAlign: 'center' }}>
          <CreditCard size={36} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
          <h2>
            {step === 1 ? 'Forgot Password' : 
             step === 2 ? 'Verify OTP' : 
             step === 3 ? 'Create New Password' : 'Success!'}
          </h2>
          <p className="auth-subtitle">
            {step === 1 ? 'Enter your email to receive a reset code' : 
             step === 2 ? 'Enter the 6-digit code sent to your email' : 
             step === 3 ? 'Choose a strong new password' : ''}
          </p>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          {step === 1 && (
            <form className="auth-form" onSubmit={handleSendOTP}>
              <div className="input-group" style={{ textAlign: 'left' }}>
                <label>Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          )}

          {step === 2 && (
            <form className="auth-form" onSubmit={handleVerifyOTPNext}>
              <div className="otp-inputs">
                {otp.map((v, i) => (
                  <input key={i} id={`otp-${i}`} maxLength={1} value={v} onChange={e => handleOTPChange(i, e.target.value)} onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) document.getElementById(`otp-${i-1}`)?.focus(); }} required />
                ))}
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }}>Verify & Proceed</button>
            </form>
          )}

          {step === 3 && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="input-group" style={{ textAlign: 'left' }}>
                <label>New Password</label>
                <input className="form-input" type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength="6" required />
              </div>
              <div className="input-group" style={{ textAlign: 'left' }}>
                <label>Confirm Password</label>
                <input className="form-input" type="password" placeholder="Confirm your new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength="6" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          )}

          {step === 4 && <Link to="/login" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Go to Login</Link>}
          
          {step < 4 && (
            <div className="auth-links" style={{ justifyContent: 'center', marginTop: 16 }}>
              <Link to="/login">← Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
