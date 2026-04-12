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
  Sparkles
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
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, complaintsRes, notesRes, noticesRes] = await Promise.all([
        API.get('/attendance/user'),
        API.get('/complaints/user').catch(() => ({ data: [] })),
        API.get('/notes').catch(() => ({ data: [] })),
        API.get('/notices').catch(() => ({ data: [] }))
      ]);

      setStats({
        attendance: attendanceRes.data.percentage || 0,
        complaints: complaintsRes.data.length || 0,
        notes: notesRes.data.length || 0
      });
      setNotices(noticesRes.data);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
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
          >
            Welcome, {user.name}!
          </motion.h2>
          <p className="font-bold opacity-60">Your smart campus ecosystem is live.</p>
        </div>
        <div className="top-actions">
          <button className="relative p-2 text-black hover:text-indigo-600 transition-colors">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>
          <div className="user-profile">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black">
              {user.name.charAt(0)}
            </div>
            <span className="font-bold text-sm">PR07</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6' }}>
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <h3>Attendance</h3>
            <div className="value">{stats.attendance}%</div>
          </div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#f43f5e' }}>
            <AlertCircle size={28} />
          </div>
          <div className="stat-info">
            <h3>Active Issues</h3>
            <div className="value">{stats.complaints}</div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#22c55e' }}>
            <FileText size={28} />
          </div>
          <div className="stat-info">
            <h3>Study Material</h3>
            <div className="value">{stats.notes}</div>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="flex items-center gap-3">
                <Bell size={22} className="text-indigo-500" /> 
                Campus Notices
              </h2>
            </div>
            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="text-center py-6 opacity-40 font-bold">No new notices for you.</div>
              ) : (
                notices.map((notice) => (
                  <div key={notice._id} className="p-4 bg-black/5 rounded-2xl border border-black/5 hover:bg-black/10 transition-all">
                    <p className="font-bold mb-1">{notice.title}</p>
                    <p className="text-sm font-bold opacity-60">{notice.content}</p>
                    <div className="flex justify-between items-center mt-2">
                       <span className="text-[10px] font-black opacity-30 uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                       <span className="text-[10px] font-black text-indigo-600 uppercase">{notice.author?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

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

        <div className="quick-actions-card">
          <div className="card h-full">
            <h3 className="font-black text-xl mb-8 tracking-tight uppercase">Quick Actions</h3>
            <div className="actions-list">
              <button 
                className="action-btn-p"
                onClick={() => {
                  console.log('Navigating to Attendance');
                  navigate('/attendance');
                }}
              >
                <Scan size={24} /> 
                <div>
                  <p className="font-black">Mark Attendance</p>
                  <p className="text-xs font-bold opacity-70">QR Scanner</p>
                </div>
              </button>
              
              <button 
                className="action-btn"
                onClick={() => {
                  console.log('Navigating to Complaints');
                  navigate('/complaints');
                }}
              >
                <MessageSquare size={22} /> 
                <span className="font-bold">Raise Complaint</span>
              </button>
              
              <button 
                className="action-btn"
                onClick={() => {
                  console.log('Navigating to Notes');
                  navigate('/notes');
                }}
              >
                <Upload size={22} /> 
                <span className="font-bold">Share Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
