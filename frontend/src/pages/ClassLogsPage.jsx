import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarCheck, 
  Clock,
  ArrowLeft,
  Search,
  Users
} from 'lucide-react';

import API from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import '../pages/Dashboard.css';

const ClassLogsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'faculty') {
      navigate('/dashboard');
      return;
    }
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/attendance/history');
      setHistory(data);
    } catch (err) {
      showToast('Error fetching history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.otp.includes(searchTerm)
  );

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Class Logs</h1>
            </div>
            <p className="text-slate-500 font-bold ml-12">Detailed Attendance Session History</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="premium-search-container">
                <Search size={22} className="premium-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by subject or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="premium-search-input"
                />
             </div>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="py-20 text-center opacity-40 font-black uppercase">Loading History...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Clock size={48} className="mx-auto mb-4" />
                <p className="font-black text-xs">NO SESSION HISTORY FOUND</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Students</th>
                    <th>Time & Date</th>
                    <th>Session OTP</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h) => (
                    <tr key={h.id}>
                      <td className="font-bold text-slate-900">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                               <CalendarCheck size={16} />
                            </div>
                            {h.subject}
                         </div>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-col items-center">
                           <span className="font-black text-indigo-600 text-lg">{h.count}</span>
                           <span className="text-[9px] font-black text-slate-300 uppercase">Attendees</span>
                        </div>
                      </td>
                      <td className="text-[11px] font-bold text-slate-500">
                        <span className="text-slate-900">{new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <br/>
                        <span className="opacity-60">{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td><span className="badge-otp">{h.otp}</span></td>
                      <td><span className="badge-success">Success</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ClassLogsPage;
