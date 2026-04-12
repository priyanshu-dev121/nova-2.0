import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, AlertCircle, Clock, ShieldAlert, RotateCcw, XCircle } from 'lucide-react';
import API from '../api/axiosConfig';
import { useToast } from '../components/Toast';
import './Auth.css';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSpamTip, setShowSpamTip] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isLocked, setIsLocked] = useState(false);
  const { showToast } = useToast();
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Navigation Guard
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Main 5-minute Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsLocked(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Activity Timer for Spam Tip
  useEffect(() => {
    let timer;
    if (!otp && !showSpamTip && !isLocked) {
      timer = setTimeout(() => {
        setShowSpamTip(true);
      }, 6000);
    }
    return () => clearTimeout(timer);
  }, [otp, showSpamTip, isLocked]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    
    if (!otp) {
      showToast('Please enter the verification code.', 'error');
      return;
    }

    if (otp.length < 6) {
      showToast('Please enter the complete 6-digit code.', 'error');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/verify-email', {
        email,
        otp,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast('Account verified successfully!', 'success');
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post('/auth/forgot-password', { email });
      showToast('A new OTP has been sent!', 'success');
      setTimeLeft(300); // Reset timer
      setIsLocked(false);
      setOtp('');
      setShowSpamTip(false);
    } catch (err) {
      showToast('Failed to resend OTP.', 'error');
    }
  };

  return (
    <div className="auth-container otp-page-container">
      {/* Cinematic Background Orbs */}
      <div className="nebula-orb orb-1" />
      <div className="nebula-orb orb-2" />
      
      <div className="auth-card">
        <div className="auth-header">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="text-primary" size={28} />
            <h1 className="logo-text">Campus Nova</h1>
          </motion.div>
          
          <h2>Secure Verification</h2>
          <p className="text-sm">
            Sent to <strong>{email}</strong>
          </p>
        </div>

        {/* Dynamic Timer Component */}
        <div className="timer-badge">
          <div className="flex items-center gap-2">
            <Clock className={timeLeft < 60 ? 'urgent' : ''} size={18} />
            <span style={{fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em'}}>TIME REMAINING</span>
          </div>
          <span className={`timer-text ${timeLeft < 60 ? 'urgent' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <div className={`input-wrapper ${isLocked ? 'locked' : ''}`}>
              <Mail className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="ENTER 6-DIGIT OTP" 
                maxLength="6"
                disabled={isLocked}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if(showSpamTip) setShowSpamTip(false);
                }}
              />
            </div>
            <AnimatePresence>
              {showSpamTip && !otp && !isLocked && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="spam-alert-premium"
                >
                  <AlertCircle size={14} />
                  DIDN'T RECEIVE IT? CHECK YOUR SPAM FOLDER
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button 
            type="submit" 
            className="btn-premium-verify"
            disabled={loading || isLocked}
          >
            {loading ? <RotateCcw className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
            &nbsp;{loading ? 'VALIDATING...' : 'VERIFY IDENTITY'}
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive code? <button type="button" className="link-btn" onClick={handleResend}>RESEND OTP</button>
        </p>
      </div>

      {/* Security Lockout Modal */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lockout-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="lockout-modal"
            >
              <div style={{color: '#f43f5e', marginBottom: '1.5rem'}}>
                <XCircle size={64} style={{margin: '0 auto'}} />
              </div>
              <h3 style={{fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem'}}>Verification Expired</h3>
              <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem'}}>
                Security window closed. Please request a new code to proceed.
              </p>
              <button 
                onClick={handleResend}
                className="btn-premium-verify"
              >
                Request New Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyOTPPage;
