import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Check, X } from 'lucide-react';
import { useToast } from '../components/Toast';
import API from '../api/axiosConfig';
import './Auth.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  const navigate = useNavigate();

  const validatePassword = (pass) => ({
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
  });

  const checklist = validatePassword(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- MANUAL VALIDATION (TOASTS) ---
    if (!formData.name) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    if (!formData.email) {
      showToast('Please enter your college email.', 'error');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@bbdu\.ac\.in$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Invalid format. Please use @bbdu.ac.in email.', 'error');
      return;
    }

    if (!formData.password) {
      showToast('Please create a password.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (!Object.values(checklist).every(Boolean)) {
      showToast('Please complete all password requirements.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      // Redirect to OTP verification
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Cinematic Background Orbs */}
      <div className="nebula-orb orb-1" />
      <div className="nebula-orb orb-2" />
      
      <div className="auth-card fade-up">
        <div className="auth-header">
          <div className="logo flex items-center justify-center gap-2">
            <Sparkles className="text-primary" size={28} />
            <h1 className="logo-text">Campus Nova</h1>
          </div>
          <h2>Create your account</h2>
          <p>Join the smart campus ecosystem today.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                name="name"
                placeholder="Enter Your Full Name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>College Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                name="email"
                placeholder="username@bbdu.ac.in" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <button 
                type="button" 
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Redesigned Premium Checklist Badges */}
            <div className="password-checklist mt-3">
              <div className={`checklist-badge ${checklist.length ? 'badge-success' : 'badge-pending'}`}>
                {checklist.length ? <Check size={14} /> : <X size={14} />} 8+ Characters
              </div>
              <div className={`checklist-badge ${checklist.upper ? 'badge-success' : 'badge-pending'}`}>
                {checklist.upper ? <Check size={14} /> : <X size={14} />} Uppercase
              </div>
              <div className={`checklist-badge ${checklist.number ? 'badge-success' : 'badge-pending'}`}>
                {checklist.number ? <Check size={14} /> : <X size={14} />} One Number
              </div>
              <div className={`checklist-badge ${checklist.special ? 'badge-success' : 'badge-pending'}`}>
                {checklist.special ? <Check size={14} /> : <X size={14} />} Special Char
              </div>
            </div>
          </div>


          <div className="form-group">
            <label>Confirm Password</label>
            <div 
              className="input-wrapper transition-all duration-300"
              style={{
                borderColor: formData.confirmPassword && formData.password === formData.confirmPassword ? '#22c55e' : '',
                boxShadow: formData.confirmPassword && formData.password === formData.confirmPassword ? '0 0 0 4px rgba(34, 197, 94, 0.1)' : ''
              }}
            >
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword"
                placeholder="••••••••" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Check className="text-green-500 mr-3 animate-bounce-short" size={18} />
              )}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary w-full flex items-center justify-center font-bold uppercase tracking-wide" disabled={loading}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
