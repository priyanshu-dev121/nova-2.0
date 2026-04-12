import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  PlusCircle, 
  Upload, 
  FileText,
  Scan,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Megaphone,
  X,
  Radar,
  Rocket,
  Search,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../api/axiosConfig';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    attendance: 0,
    complaints: 0,
    notes: 0
  });
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Polling every 10 seconds for notices/stats
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, complaintsRes, notesRes, noticesRes] = await Promise.all([
        API.get('/attendance/user').catch(() => ({ data: { percentage: 0 } })),
        API.get('/complaints/user').catch(() => ({ data: [] })),
        API.get('/notes').catch(() => ({ data: [] })),
        API.get('/notices').catch((err) => {
          return { data: [] };
        })
      ]);

      setStats({
        attendance: attendanceRes.data.percentage || 0,
        complaints: complaintsRes.data.length || 0,
        notes: notesRes.data.length || 0
      });
      setNotices(noticesRes.data || []);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    }
  };

  const handleDismissNotice = async (id) => {
    try {
      await API.put(`/notices/${id}/dismiss`);
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error dismissing notice:', err);
    }
  };

  const getNoticeIcon = (title, content) => {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('attendance') || text.includes('live')) return <Radar className="text-rose-500 animate-pulse" size={18} />;
    if (text.includes('holiday') || text.includes('cancel')) return <Calendar className="text-amber-500" size={18} />;
    if (text.includes('exam') || text.includes('test')) return <ClipboardList className="text-indigo-500" size={18} />;
    return <Megaphone className="text-indigo-500" size={18} />;
  };





  return (
    <div className="p-0 max-w-full">
      {/* Background Atmosphere */}
      <div className="nebula-orb orb-1" />
      <div className="nebula-orb orb-2" />

      <header className="top-bar">
        <div className="welcome-msg">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            Welcome, {user.name}!
          </motion.h2>
          <p className="font-bold opacity-60">Your smart campus ecosystem is live.</p>
        </div>
        <div className="top-actions">
          <div 
            className="user-profile interactive cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => navigate('/profile')}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 overflow-hidden">
              {user.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <span className="font-bold text-sm tracking-wide">PR07</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }} 
          className="stat-card cursor-pointer group"
          onClick={() => navigate('/attendance')}
        >
          <div className="stat-icon" style={{ color: '#3b82f6' }}>
            <TrendingUp size={28} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-info">
            <h3>Attendance</h3>
            <div className="value">{stats.attendance}%</div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }} 
          className="stat-card cursor-pointer group"
          onClick={() => navigate('/complaints')}
        >
          <div className="stat-icon" style={{ color: '#f43f5e' }}>
            <AlertCircle size={28} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-info">
            <h3>Active Issues</h3>
            <div className="value">{stats.complaints}</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3 }} 
          className="stat-card cursor-pointer group"
          onClick={() => navigate('/notes')}
        >
          <div className="stat-icon" style={{ color: '#22c55e' }}>
            <FileText size={28} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="stat-info">
            <h3>Study Material</h3>
            <div className="value">{stats.notes}</div>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="space-y-6 col-span-2">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="card"
          >
            <div className="card-header">
              <h2 className="flex items-center gap-3">
                Campus Notices
              </h2>
            </div>
            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="text-center py-8 opacity-40 font-black uppercase text-xs tracking-widest bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  Mission Clear: No new notices
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice._id} className="notice-row group relative overflow-hidden">
                    <div className="notice-date">
                       <span>{new Date(notice.createdAt).getDate()}</span>
                       <small>{new Date(notice.createdAt).toLocaleString('default', { month: 'short' })}</small>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                          {getNoticeIcon(notice.title, notice.content)}
                          <h4 className="notice-title truncate">{notice.title || 'Campus Update'}</h4>
                       </div>
                       <p className="notice-content line-clamp-2">{notice.content}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30"></span>
                          <span className="notice-author italic">posted by {notice.author?.name || 'ADMIN'}</span>
                       </div>
                    </div>

                    <button 
                      onClick={() => handleDismissNotice(notice._id)}
                      className="notice-delete-btn group-hover:opacity-100"
                      title="Clear Notice"
                    >
                      <X size={16} />
                    </button>

                    {/* Content type glow indicator */}
                    {(notice.title?.toLowerCase().includes('attendance') || notice.title?.toLowerCase().includes('live')) && (
                       <div className="absolute top-0 right-0 w-1 h-full bg-rose-500/50" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <div className="card">
            <div className="card-header">
              <h2 className="flex items-center gap-3">
                <Calendar size={22} className="text-indigo-500" /> 
                Upcoming Classes
              </h2>
            </div>
            <div className="text-center py-10 opacity-40">
              <div className="p-4 bg-black/10 rounded-full w-fit mx-auto mb-4">
                <ClipboardList size={32} />
              </div>
              <p className="font-bold">No more classes scheduled for today!</p>
            </div>
          </div>
        </div>

        <div className="quick-actions-card col-span-1">
          <div className="card h-full">
            <div className="section-header-aura-centered">
               <h3>
                 <Rocket className="text-indigo-500" size={26} />
                 Quick Actions
               </h3>
            </div>

            <div className="actions-list space-y-4">
              <button 
                className="action-btn-aura"
                onClick={() => navigate('/attendance')}
              >
                <Scan size={26} /> 
                <div className="action-text-wrapper">
                  <span className="action-main-text">Mark Attendance</span>
                  <span className="action-sub-text">Digital QR Scanner</span>
                </div>
              </button>
              
              <button 
                className="action-btn-aura"
                onClick={() => navigate('/complaints')}
              >
                <MessageSquare size={24} /> 
                <div className="action-text-wrapper">
                  <span className="action-main-text">Raise Complaint</span>
                  <span className="action-sub-text">Support Ticket Desk</span>
                </div>
              </button>
              
              <button 
                className="action-btn-aura"
                onClick={() => navigate('/notes')}
              >
                <Upload size={24} /> 
                <div className="action-text-wrapper">
                  <span className="action-main-text">Share Notes</span>
                  <span className="action-sub-text">Academic Vault</span>
                </div>
              </button>

              <button 
                className="action-btn-aura"
                onClick={() => navigate('/lost-found')}
              >
                <Search size={24} /> 
                <div className="action-text-wrapper">
                  <span className="action-main-text">Lost & Found</span>
                  <span className="action-sub-text">Campus Item Registry</span>
                </div>
              </button>

              <button 
                className="action-btn-aura"
                onClick={() => navigate('/events')}
              >
                <Zap size={24} /> 
                <div className="action-text-wrapper">
                  <span className="action-main-text">Campus Events</span>
                  <span className="action-sub-text">Live Activities Hub</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
