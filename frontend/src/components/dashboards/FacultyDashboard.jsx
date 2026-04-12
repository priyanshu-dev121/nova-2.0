import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Monitor, 
  FilePlus, 
  Megaphone, 
  Clock, 
  Check,
  X,
  Send,
  Sparkles,
  Upload,
  ChevronRight,
  Type,
  AlignLeft,
  FileText,
  Library,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";

import API from '../../api/axiosConfig';
import { useToast } from '../Toast';
import AttendanceLauncher from '../AttendanceLauncher';
import './FacultyDashboard.css';

const FacultyDashboard = ({ user }) => {
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [subjects] = useState([
    { id: 1, code: 'NBS4201', name: 'Differential Equations and Fourier Analysis' },
    { id: 2, code: 'NCS4201', name: 'Programming Concepts with Python' },
    { id: 3, code: 'NEE4201', name: 'Basic Electrical Engineering' },
    { id: 4, code: 'NBS4203', name: 'Engineering Chemistry' },
    { id: 5, code: 'NCS4202', name: 'Basics of Artificial Intelligence' },
    { id: 6, code: 'NHSCC1201', name: 'Communicative English' },
    { id: 7, code: 'NCS4251', name: 'Python Programming Lab' },
    { id: 8, code: 'NEE4251', name: 'Basic Electrical Engineering Lab' },
    { id: 9, code: 'NBS4253', name: 'Engineering Chemistry Lab' }
  ]);
  const [selectedSubject, setSelectedSubject] = useState('Select Subject');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notices, setNotices] = useState([]);
  const [noticeData, setNoticeData] = useState({ title: '', content: '', target: 'Faculty' });
  const [noteData, setNoteData] = useState({ title: '', subject: 'Select Subject', fileUrl: 'dummy_url', fileName: '' });
  const [stats, setStats] = useState({ classesCount: 0, notesCount: 0, avgAttendance: 0 });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotices();
    fetchStats();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/attendance/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchNotices = async () => {
    try {
      const { data } = await API.get('/notices');
      setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
  };

  const handlePostNotice = async () => {
     if (!noticeData.title || !noticeData.content) {
        showToast('Please fill all notice fields', 'error');
        return;
     }
     try {
        setNoticeLoading(true);
        await API.post('/notices', noticeData);
        showToast('Notice Broadcasted!', 'success');
        setNoticeData({ title: '', content: '', target: 'Faculty' });
        fetchNotices();
     } catch (err) {
        showToast('Broadcast failed', 'error');
     } finally {
        setNoticeLoading(false);
     }
  };

  const handleDismissNotice = async (id) => {
     try {
        await API.put(`/notices/${id}/dismiss`);
        showToast('Notice cleared', 'success');
        setNotices(prev => prev.filter(n => n._id !== id));
     } catch (err) {
        showToast('Failed to clear', 'error');
     }
  };

  const handleUploadNote = async () => {
    if (!noteData.title || noteData.subject === 'Select Subject') {
      showToast('Please fill in title and subject', 'error');
      return;
    }
    
    // Simulating a more realistic URL for the mock environment
    const submissionData = {
      ...noteData,
      fileUrl: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?filename=${encodeURIComponent(noteData.fileName || 'document.pdf')}`
    };

    try {
      setNoteLoading(true);
      await API.post('/notes', submissionData);
      showToast('Study material published to students!', 'success');
      fetchStats(); // REFRESH NOTES COUNT
      setNoteData({ title: '', subject: 'Select Subject', fileUrl: 'dummy_url', fileName: '' });
    } catch (err) {
      showToast('Publication failed', 'error');
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <div className="p-0 max-w-full">
      <header className="top-bar">
        <div className="welcome-msg">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            Welcome, {user.name}!
          </motion.h2>
        </div>
        <div className="top-actions">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Status</p>
            <p className="text-sm font-black text-emerald-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Now
            </p>
          </div>
          <div className="user-profile">
            <div className="profile-avatar">
              {user.name.charAt(0)}
            </div>
            <div className="profile-info">
              <span className="profile-rank">Faculty</span>
              <span className="profile-name">PR07</span>
            </div>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }} 
          className="stat-card"
          onClick={() => navigate('/class-logs')}
        >
          <div className="stat-icon" style={{ color: '#4f46e5' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>Classes</h3>
            <div className="value">{stats.classesCount}</div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }} 
          className="stat-card"
          onClick={() => navigate('/material-logs')}
        >
          <div className="stat-icon" style={{ color: '#f59e0b' }}>
            <FilePlus size={28} />
          </div>
          <div className="stat-info">
            <h3>Notes Shared</h3>
            <div className="value">{stats.notesCount}</div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>
            <Check size={28} />
          </div>
          <div className="stat-info">
            <h3>Attendance Rate</h3>
            <div className="value">{stats.avgAttendance}%</div>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="space-y-6 col-span-2">
          <AttendanceLauncher user={user} onSuccess={fetchStats} />

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="card"
          >
            <div className="card-header">
              <h2>
                <Megaphone size={26} /> 
                Broadcast Center
              </h2>
            </div>
            <div className="space-y-5">
              <div className="aura-field-container">
                <Type className="aura-field-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="e.g. Tomorrow's Lab Session Cancelled"
                  value={noticeData.title}
                  onChange={(e) => setNoticeData({...noticeData, title: e.target.value})}
                  className="aura-input"
                />
              </div>

              <div className="aura-field-container">
                <AlignLeft className="aura-field-icon" size={20} style={{ top: '1.4rem' }} />
                <textarea 
                  placeholder="Write your announcement details here for students..."
                  value={noticeData.content}
                  onChange={(e) => setNoticeData({...noticeData, content: e.target.value})}
                  className="aura-input h-32"
                ></textarea>
              </div>

              <button 
                onClick={handlePostNotice}
                disabled={noticeLoading}
                className="action-btn-p w-full py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <Megaphone size={20} /> {noticeLoading ? 'SENDING...' : 'BROADCAST NOW'}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 col-span-1">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="card"
          >
            <div className="card-header">
              <h2>
                <Library size={26} /> 
                Academic Vault
              </h2>
            </div>
            <div className="space-y-6">
              <div className="aura-field-container">
                <FileText className="aura-field-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="e.g. Lecture 05 - Neural Networks.pdf"
                  value={noteData.title}
                  onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                  className="aura-input"
                />
              </div>

              <div className="custom-dropdown mb-2" ref={dropdownRef}>
                <div 
                  className={`dropdown-trigger ${isOpen ? 'active' : ''} !shadow-none !border-transparent !bg-black/5 !rounded-[1.25rem]`}
                  onClick={() => setIsOpen(!isOpen)}
                  style={{ paddingLeft: '3.5rem' }}
                >
                  <Library className="aura-field-icon" size={20} />
                  <span className="selected-value !text-[0.9rem] !font-bold">
                    {selectedSubject === 'Select Subject' ? 'Choose a course...' : selectedSubject}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} className="text-slate-400" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="dropdown-menu"
                    >
                      {subjects.map((sub) => (
                        <div 
                          key={sub.id} 
                          className={`dropdown-item ${selectedSubject === sub.name ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedSubject(sub.name);
                            setNoteData({...noteData, subject: sub.name});
                            setIsOpen(false);
                          }}
                        >
                          <span className="item-code">{sub.code}</span>
                          <span className="item-name">{sub.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNoteData({...noteData, fileName: file.name});
                    showToast(`Selected: ${file.name}`, 'success');
                  }
                }} 
              />

              <div 
                onClick={() => fileInputRef.current.click()}
                className="aura-upload-zone"
              >
                {noteData.fileName ? (
                  <h4 className="font-black text-xs uppercase tracking-widest text-indigo-600">
                    {noteData.fileName}
                  </h4>
                ) : (
                  <Upload size={24} className="text-indigo-600" />
                )}
              </div>

              <button 
                onClick={handleUploadNote}
                disabled={noteLoading}
                className="action-btn-p w-full py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <Check size={22} /> {noteLoading ? 'WAITING...' : 'SUBMIT MATERIAL'}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="card"
          >
            <div className="card-header">
              <h2>
                <Megaphone size={26} /> 
                Campus Notices
              </h2>
            </div>
            <div className="space-y-2">
              {notices.length === 0 ? (
                <div className="text-center py-6 opacity-40 font-bold text-xs uppercase">No active notices.</div>
              ) : (
                notices.map((notice) => {
                  const isAdminNotice = notice.title?.toLowerCase().includes('system') || notice.author?.name?.toLowerCase().includes('system');
                  const authorLabel = isAdminNotice ? 'ADMIN' : (notice.author?.name || 'ADMIN');

                  return (
                    <div key={notice._id} className="notice-row group">
                      <div className="notice-date">
                         <span>{new Date(notice.createdAt).getDate()}</span>
                         <small>{new Date(notice.createdAt).toLocaleString('default', { month: 'short' })}</small>
                      </div>
                      
                      <div className="notice-main">
                         <h4 className="notice-title">{notice.title}</h4>
                         <p className="notice-content">{notice.content}</p>
                         <span className="notice-author">By {authorLabel}</span>
                      </div>

                      <button 
                        onClick={() => handleDismissNotice(notice._id)}
                        className="notice-delete-btn"
                        title="Dismiss Notice"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
