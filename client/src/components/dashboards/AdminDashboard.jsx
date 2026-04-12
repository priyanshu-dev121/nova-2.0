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
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../api/axiosConfig';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    complaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [noticeContent, setNoticeContent] = useState('');
  const [loading, setLoading] = useState(true);

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
        title: 'University-wide Notice',
        content: noticeContent,
        target: 'All'
      });
      setNoticeContent('');
      alert('Broadcast successful! All users will receive this notice.');
    } catch (err) {
      console.error('Error broadcasting notice:', err);
      alert('Failed to broadcast notice.');
    }
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
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-indigo-600" /> 
                Recent System Incidents
              </h2>
            </div>
            <div className="space-y-3">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-6 opacity-40 font-bold">No active incidents found.</div>
              ) : (
                recentComplaints.map((complaint) => (
                  <div key={complaint._id} className="flex items-center justify-between p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-all cursor-pointer border border-black/5">
                    <div>
                      <p className="font-bold text-sm text-black">{complaint.title}</p>
                      <p className="text-xs font-bold opacity-60">Posted by: {complaint.userId?.name || 'User'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                      complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                ))
              )}
            </div>
            <button className="action-btn-p w-full mt-6" onClick={() => navigate('/admin/complaints')}>
              Manage Incident Logs
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="flex items-center gap-3">
                <Bell size={22} className="text-amber-500" /> 
                Campus-wide Broadcast
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="form-group mb-0">
                <textarea 
                  placeholder="Post an official notice for all students and faculty..." 
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
                <Send size={18} /> Broadcast Now
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-black text-black mb-6 flex items-center gap-3">
              <Activity size={22} className="text-indigo-600 animate-pulse" /> System Diagnostics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-black/5">
                <span className="font-bold opacity-60">Core API Mesh</span>
                <span className="text-green-600 font-black flex items-center gap-1">
                  <CheckCircle size={14} /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-black/5">
                <span className="font-bold opacity-60">Database Cluster</span>
                <span className="text-green-600 font-black flex items-center gap-1">
                  <CheckCircle size={14} /> Stabilized
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="font-bold opacity-60">Telemetry Nodes</span>
                <span className="text-blue-600 font-black flex items-center gap-1">
                   Processing...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
