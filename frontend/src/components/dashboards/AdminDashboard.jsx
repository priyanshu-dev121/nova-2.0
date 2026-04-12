import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle,
  BarChart3,
  CalendarDays,
  Sparkles,
  Bell,
  Send,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../api/axiosConfig';
import { useToast } from '../Toast';


const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    complaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [noticeContent, setNoticeContent] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('All');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAdminData();

    // Auto-update every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data.stats);
      setRecentComplaints(data.recentComplaints);
    } catch (err) {
      console.error('Error fetching admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastNotice = async () => {
    if (!noticeContent.trim()) return;
    try {
      await API.post('/notices', {
        title: 'System Announcement',
        content: noticeContent,
        target: broadcastTarget
      });
      setNoticeContent('');
      showToast(`Broadcast sent to ${broadcastTarget === 'All' ? 'everyone' : broadcastTarget + 's'}!`, 'success');
    } catch (err) {
      console.error('Error broadcasting notice:', err);
      showToast('Broadcast failed. Check console for details.', 'error');
    }
  };


  return (
    <div className="p-0 max-w-full">
      <header className="top-bar">
        <div className="welcome-msg">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="font-black text-black"
            style={{ fontSize: '3.5rem', letterSpacing: '-0.05em' }}
          >
            Welcome, Admin!
          </motion.h2>
          <p className="font-bold opacity-60">Global management and system-wide analytics.</p>
        </div>
        <div className="top-actions">
          <div className="user-profile">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">
              A
            </div>
            <span className="font-bold text-sm">PR-ADMIN-01</span>
          </div>
        </div>
      </header>

      {/* Analytics Command Center */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ scale: 1.05, translateY: -5 }}
          onClick={() => navigate('/admin/complaints')}
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }} 
          className="stat-card cursor-pointer"
        >
          <div className="stat-icon" style={{ color: '#ef4444' }}>
            <MessageSquare size={28} />
          </div>
          <div className="stat-info">
            <h3>Open Complaints</h3>
            <div className="value">{stats.complaints}</div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05, translateY: -5 }}
          onClick={() => navigate('/admin/users?role=faculty')}
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }} 
          className="stat-card cursor-pointer"
        >
          <div className="stat-icon" style={{ color: '#166534' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>Faculty Active</h3>
            <div className="value">{stats.faculty}</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, translateY: -5 }}
          onClick={() => navigate('/admin/users?role=student')}
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3 }} 
          className="stat-card cursor-pointer"
        >
          <div className="stat-icon" style={{ color: '#6366f1' }}>
            <BarChart3 size={28} />
          </div>
          <div className="stat-info">
            <h3>Student Base</h3>
            <div className="value">{stats.students}</div>
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
            <div className="card-header justify-between">
              <h3 className="flex items-center gap-3">
                <ShieldAlert size={22} className="text-rose-600 animate-pulse" /> Critical Incidents
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-12 opacity-40 font-bold text-xs uppercase tracking-widest">No active incidents found.</div>
              ) : (
                recentComplaints.map((complaint) => (
                  <div 
                    key={complaint._id} 
                    className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-slate-800 leading-tight mb-1">{complaint.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          Reported by <span className="text-indigo-600">{complaint.userId?.name || 'Anonymous User'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        complaint.status === 'Resolved' ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 
                        complaint.status === 'In Progress' ? 'border-indigo-200 bg-indigo-50/50 text-indigo-700' : 'border-amber-200 bg-amber-50/50 text-amber-700'
                      }`}>
                        {complaint.status}
                      </span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
          <button className="action-btn-p w-full mt-6" onClick={() => navigate('/admin/complaints')}>
              Manage Incident Logs
            </button>
        </div>

        <div className="space-y-6 col-span-1">
          <div className="card">
            <div className="card-header">
              <h2 className="flex items-center gap-3">
                <Bell size={22} className="text-amber-500" /> 
                Campus-wide Broadcast
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-8 p-0">
                {['All', 'Student', 'Faculty'].map(target => (
                  <button
                    key={target}
                    onClick={() => setBroadcastTarget(target)}
                    style={{ fontSize: '1.5rem' }}
                    className={`relative px-10 py-4 rounded-full font-black uppercase tracking-tight transition-all duration-300 ${
                      broadcastTarget === target 
                        ? 'target-active neon-pulse-animation scale-110'
                        : 'text-slate-400 hover:text-slate-900 bg-transparent opacity-60'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>
              <div className="form-group mb-0">
                <textarea 
                  placeholder={`Post a notice to ${broadcastTarget === 'All' ? 'everyone' : broadcastTarget + 's'}...`}
                  className="p-4 bg-black/5 border-none rounded-2xl text-sm h-32 resize-none font-bold text-black focus:bg-white transition-all outline-none"
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                ></textarea>
              </div>
              <button 
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={handleBroadcastNotice}
                disabled={!noticeContent.trim()}
              >
                <Send size={18} /> Broadcast to {broadcastTarget}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
