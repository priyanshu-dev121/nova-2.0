import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, 
  ChevronLeft, 
  Scan, 
  AlertCircle, 
  Check, 
  TrendingUp, 
  Clock,
  BookOpen,
  X,
  LayoutDashboard,
  Sparkles,
  Users
} from 'lucide-react';

import API from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AttendanceLauncher from '../components/AttendanceLauncher';
import './AttendancePage.css';

const AttendancePage = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [role, setRole] = useState('student');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }
    setUser(userInfo);
    setRole(userInfo.role || 'student');
    fetchAttendance();
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

  const checkActiveSession = async () => {
    try {
      const { data } = await API.get('/attendance/active-session');
      setActiveSession(data);
    } catch (err) {
      console.error('Active Session Check Error:', err);
    }
  };

  useEffect(() => {
    checkActiveSession();
    const interval = setInterval(checkActiveSession, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ latitude: null, longitude: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: null, longitude: null }),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  };

  const handleScanSuccess = async (decodedText) => {
    if (loading) return;
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      await API.post('/attendance/mark', { qrValue: decodedText, ...loc });
      showToast('Attendance marked successfully via QR!', 'success');
      setShowScanner(false);
      fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.message || 'Scan failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (manualCode.length !== 4) {
      showToast('Enter a valid 4-digit code', 'error');
      return;
    }
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      await API.post('/attendance/mark', { manualCode, ...loc });
      showToast('Attendance marked via Manual Code!', 'success');
      setManualCode('');
      fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showScanner && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(handleScanSuccess, () => {});
      scannerRef.current = scanner;
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  const getStatusInfo = (pct) => {
    if (pct >= 85) return { label: 'Excellent', class: 'status-safe', icon: <Check size={16} /> };
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
    { name: 'Theory of Computation', code: 'CS303', attendance: 64, total: 20, attended: 13 },
  ];

  const defaulters = subjects.filter(s => s.attendance < 75);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Attendance Tracker <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </h1>
            <p className="text-slate-500 font-bold mt-1">Real-time attendance & Eligibility logs.</p>
          </div>
          <button 
            onClick={() => role === 'student' && setShowScanner(true)}
            className="mark-attendance-btn shimmer-btn"
          >
            <Scan size={20} /> 
            {role === 'faculty' ? 'ACTIVE SESSION' : 'MARK ATTENDANCE'}
          </button>
        </header>

        {role === 'faculty' ? (
          <div className="max-w-xl mx-auto">
             <AttendanceLauncher user={user} />
          </div>
        ) : (
          <>
            {activeSession && (
              <div className="mb-8 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[3rem] shadow-2xl shadow-indigo-200/50 animate-gradient-slow overflow-hidden">
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2.8rem] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner relative group">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl animate-ping group-hover:pause" />
                      <Scan size={32} className="relative z-10" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Live Session Active</p>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activeSession.subject}</h3>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl flex flex-col items-center justify-center min-w-[120px] shadow-xl">
                      <span className="text-[9px] font-bold uppercase opacity-50 tracking-widest mb-1">Passcode</span>
                      <span className="text-2xl font-black tracking-[0.3em] ml-[0.3em]">{activeSession.otp}</span>
                    </div>
                    
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="w-full md:w-auto bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase hover:bg-black transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 shimmer-btn large-shimmer-btn"
                    >
                      <Scan size={22} />
                      Launch Scanner
                    </button>
                  </div>
                </div>
              </div>
            )}

            <section className="manual-entry-banner fade-up p-6 bg-white rounded-[2rem] border border-black/5 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Scan size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Manual Check-in</h3>
                  <p className="text-xs font-bold text-slate-500">Enter the teacher's secret code below.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="CODE"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                  className="w-24 p-4 bg-slate-100 rounded-2xl border-none font-black text-lg text-center tracking-[0.2em] focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleManualSubmit}
                  disabled={loading || manualCode.length !== 4}
                  className="flex-1 md:flex-none py-4 px-8 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-all disabled:opacity-30 active:scale-95"
                >
                  {loading ? '...' : 'SUBMIT'}
                </button>
              </div>
            </section>

            <div className="attendance-hero">
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card eligibility-card">
                <div className="progress-ring-container">
                  <svg className="w-full h-full transform -rotate-90 ring-svg">
                    <circle cx="90" cy="90" r="80" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                    <motion.circle 
                      cx="90" cy="90" r="80" 
                      stroke={percentage >= 75 ? '#4f46e5' : percentage >= 60 ? '#f59e0b' : '#ef4444'} 
                      strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray="502.4" 
                      initial={{ strokeDashoffset: 502.4 }}
                      animate={{ strokeDashoffset: 502.4 - (502.4 * percentage) / 100 }} 
                      strokeLinecap="round"
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="progress-ring-text">
                    <span className="ring-percent" style={{ color: percentage >= 75 ? '#4f46e5' : percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {Math.round(percentage)}%
                    </span>
                    <span className="ring-label">Attendance</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Eligibility Status</h2>
                <p className="text-slate-500 font-bold mb-4">Maintain 75% for exam eligibility.</p>
                
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full rounded-full ${percentage >= 75 ? 'bg-indigo-600' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  />
                </div>

                <div className={`status-indicator flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-black text-xs uppercase ${status.class}`}>
                  {status.icon} {status.label}
                </div>
              </motion.div>

              <div className="stats-container">
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="stat-item shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="stat-label uppercase tracking-widest text-[10px] font-black">Lectures Conducted</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <LayoutDashboard size={16} />
                    </div>
                  </div>
                  <div className="stat-value">{history.length}</div>
                </motion.div>
                
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="stat-item shadow-sm border-2 border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="stat-label uppercase tracking-widest text-[10px] font-black">Average Rank</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <Sparkles size={16} />
                    </div>
                  </div>
                  <div className="stat-value">A+</div>
                </motion.div>
                
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="stat-item shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="stat-label uppercase tracking-widest text-[10px] font-black">Upcoming Labs</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="stat-value">02</div>
                </motion.div>
                
                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="stat-item shadow-sm border-2 border-rose-100 bg-rose-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="stat-label uppercase tracking-widest text-[10px] font-black text-rose-600">Defaulter List</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="stat-value text-rose-600">{defaulters.length > 0 ? defaulters.length : 'NONE'}</div>
                  {defaulters.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {defaulters.map(d => (
                        <div key={d.code} className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">
                          • {d.name}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
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
          </>
        )}
      </main>

      {showScanner && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden relative">
            <div className="p-8 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Scan QR Code</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Align within the frame</p>
              </div>
              <button 
                onClick={() => setShowScanner(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8">
              <div id="qr-reader" className="overflow-hidden rounded-[2rem] border-4 border-indigo-50 shadow-inner"></div>
            </div>

            <div className="p-8 pt-0 text-center">
              <p className="text-xs font-bold text-slate-400 italic">Position the QR code inside the white square.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
