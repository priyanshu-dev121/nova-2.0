import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, 
  ChevronLeft, 
  Scan, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  BookOpen
} from 'lucide-react';
import API from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import './AttendancePage.css';

const AttendancePage = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else if (userInfo.role === 'faculty') {
      navigate('/dashboard'); // Faculty shouldn't be here, redirect to dashboard
    } else {
      setUser(userInfo);
      fetchAttendance();
    }
  }, [navigate]);

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get('/attendance/user');
      setHistory(data.records || []);
      setPercentage(data.percentage || 0);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const markToday = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      await API.post('/attendance/mark', { date: today, status: 'Present' });
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      fetchAttendance();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error marking attendance' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (pct) => {
    if (pct >= 85) return { label: 'Excellent', class: 'status-safe', icon: <CheckCircle2 size={16} /> };
    if (pct >= 75) return { label: 'Borderline', class: 'status-warning', icon: <TrendingUp size={16} /> };
    return { label: 'Critical', class: 'status-critical', icon: <AlertCircle size={16} /> };
  };

  if (!user) return null;

  const status = getStatusInfo(percentage);

  // Mock subjects for visual demonstration
  const subjects = [
    { name: 'Data Structures', code: 'CS102', attendance: 82, total: 24, attended: 20 },
    { name: 'Software Engineering', code: 'CS301', attendance: 68, total: 18, attended: 12 },
    { name: 'Computer Networks', code: 'CS204', attendance: 91, total: 22, attended: 20 },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      
      <main className="main-content">
        <header className="page-header flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => navigate('/dashboard')}><ChevronLeft /></button>
            <div>
              <h1 className="text-2xl font-bold">Smart Attendance</h1>
              <p className="text-sm text-secondary">Aptly tracking your campus presence</p>
            </div>
          </div>
          <button className="mark-attendance-btn" onClick={markToday} disabled={loading}>
            <Scan size={20} />
            <span>Scan QR Code</span>
          </button>
        </header>

        <section className="attendance-hero">
          <div className="card eligibility-card">
            <h2 className="text-lg mb-6 self-start">Overall Eligibility</h2>
            <div className="progress-ring-container">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                <motion.circle 
                  cx="90" cy="90" r="80" 
                  fill="transparent" 
                  stroke="var(--primary)" 
                  strokeWidth="12" 
                  strokeDasharray="502.4"
                  initial={{ strokeDashoffset: 502.4 }}
                  animate={{ strokeDashoffset: 502.4 - (502.4 * percentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="progress-ring-text">
                <span className="ring-percent">{percentage}%</span>
                <span className="ring-label">Attendance</span>
              </div>
            </div>
            <div className={`status-indicator flex items-center gap-2 ${status.class}`}>
              {status.icon}
              {status.label}
            </div>
            <p className="text-sm mt-4 text-secondary">
              Requirement: <span className="font-bold text-foreground">75%</span> for exam eligibility
            </p>
          </div>

          <div className="stats-container">
            <div className="stat-item fade-up">
              <Clock className="text-primary" size={24} />
              <span className="stat-value">{history.filter(r => r.status === 'Present').length}</span>
              <span className="stat-label">Classes Attended</span>
            </div>
            <div className="stat-item fade-up" style={{ animationDelay: '0.1s' }}>
              <BookOpen className="text-secondary" size={24} />
              <span className="stat-value">{history.length}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
            <div className="stat-item fade-up col-span-2" style={{ animationDelay: '0.2s' }}>
              <CalendarCheck className="text-green-500" size={24} />
              <span className="stat-value">Today</span>
              <span className="stat-label">You are currently [Marked Present]</span>
            </div>
          </div>
        </section>

        <section className="subjects-section mb-12">
          <h2 className="text-xl font-bold mb-6">Subject Statistics</h2>
          <div className="subjects-grid">
            {subjects.map((sub, i) => (
              <motion.div 
                key={sub.code} 
                className="card subject-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="subject-header">
                  <div className="subject-title">
                    <h3>{sub.name}</h3>
                    <span className="subject-code">{sub.code}</span>
                  </div>
                  <div className={`percentage-badge ${sub.attendance >= 75 ? 'safe' : 'critical'}`}>
                    {sub.attendance}%
                  </div>
                </div>
                <div className="mini-progress-bar">
                  <motion.div 
                    className="mini-progress-fill" 
                    style={{ background: sub.attendance >= 75 ? 'var(--primary)' : '#ef4444' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.attendance}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <div className="subject-footer">
                  <span>Present: {sub.attended}</span>
                  <span>Total: {sub.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className={`message-toast ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-4 rounded-xl fixed bottom-8 right-8 shadow-lg flex items-center gap-3`}
            >
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AttendancePage;
