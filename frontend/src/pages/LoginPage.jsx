import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useToast } from '../components/Toast';
import API from '../api/axiosConfig';
import './Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { showToast } = useToast();
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Manual Validation Check (to avoid browser tooltips)
      if (!formData.email || !formData.password) {
        showToast('Please fill in all fields', 'error');
        setLoading(false);
        return;
      }

      // Format check (Regex for @bbdu.ac.in)
      const emailRegex = /^\w+([\.-]?\w+)*@bbdu\.ac\.in$/;
      if (!emailRegex.test(formData.email)) {
        showToast('Invalid format. Please use your official @bbdu.ac.in email.', 'error');
        setLoading(false);
        return;
      }

      const { data } = await API.post('/auth/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast('Logged in successfully! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error Details:', err);
      
      if (!err.response) {
        // Network error (backend unreachable)
        const networkError = 'Unable to connect to the server. Please check your internet or ensure the backend is running.';
        setError(networkError);
        showToast(networkError, 'error');
      } else if (err.response.status === 401) {
        // Specific authentication errors
        const message = err.response.data?.message || 'Invalid email or password.';
        if (message.toLowerCase().includes('verify')) {
          navigate('/verify-otp', { state: { email: formData.email } });
        } else {
          setError(message);
          showToast(message, 'error');
          setShowForgot(true);
        }
      } else if (err.response.status === 404) {
        // Specifically handle 404 to help with URL debugging
        const errorMsg = `API Not Found (404). Check your VITE_API_BASE_URL. Failing URL: ${err.config?.baseURL}${err.config?.url}`;
        setError(errorMsg);
        showToast('Connection error: API not found.', 'error');
      } else {
        // Other errors (500, etc.)
        const errorMsg = err.response.data?.message || `Server error (${err.response.status}). Please try again later.`;
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
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
          <h2>Welcome Back</h2>
          <p>Login to access your campus dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
          </div>

          {showForgot && (
            <div className="forgot-password fade-up">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary w-full flex items-center justify-center font-bold uppercase tracking-wide" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
