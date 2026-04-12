import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  QrCode, 
  FilePlus, 
  Megaphone, 
  Clock, 
  CheckCircle2,
  X,
  Send,
  Sparkles,
  Upload,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import API from '../../api/axiosConfig';
import { useToast } from '../Toast';
import './FacultyDashboard.css';

const FacultyDashboard = ({ user }) => {
  const [qrLoading, setQrLoading] = useState(false);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [noticeData, setNoticeData] = useState({ title: '', content: '', target: 'Student' });
  const [noteData, setNoteData] = useState({ title: '', subject: 'Select Subject', fileUrl: 'dummy_url' });
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await API.get('/notices');
      setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
  };


  const handleGenerateQR = async () => {
    try {
      setQrLoading(true);
      const { data } = await API.post('/attendance/start', { 
        subject: 'General Class', 
        durationMinutes: 10 
      });
      setQrData(data);
      setShowQRModal(true);
      showToast('Attendance session started!', 'success');
    } catch (err) {
      console.error('QR Generation Error:', err);
      showToast(err.response?.data?.message || 'QR Generation failed!', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  const handlePostNotice = async () => {
    if (!noticeData.title || !noticeData.content) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      setNoticeLoading(true);
      await API.post('/notices', noticeData);
      showToast('Announcement broadcasted!', 'success');
      setNoticeData({ title: '', content: '', target: 'Student' });
    } catch (err) {
      showToast('Broadcast failed', 'error');
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleUploadNote = async () => {
    if (!noteData.title || noteData.subject === 'Select Subject') {
      showToast('Please fill in title and subject', 'error');
      return;
    }
    try {
      setNoteLoading(true);
      await API.post('/notes', noteData);
      showToast('Study material published to students!', 'success');
      setNoteData({ title: '', subject: 'Select Subject', fileUrl: 'dummy_url' });
    } catch (err) {
      showToast('Publication failed', 'error');
    } finally {
      setNoteLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
          <p>Powering the next generation of campus logic.</p>
        </div>
        <div className="top-actions">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Status</p>
            <p className="text-sm font-black text-emerald-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Now
            </p>
          </div>
          <div className="user-profile">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black">
              {user.name.charAt(0)}
            </div>
            <span className="font-bold text-sm">PR07</span>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="stats-grid">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#4f46e5' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>Classes Today</h3>
            <div className="value">4</div>
          </div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}>
            <FilePlus size={28} />
          </div>
          <div className="stat-info">
            <h3>Notes Shared</h3>
            <div className="value">18</div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>
            <CheckCircle2 size={28} />
          </div>
          <div className="stat-info">
            <h3>Attendance Rate</h3>
            <div className="value">92%</div>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2>
                <QrCode size={22} className="text-indigo-500" /> 
                Attendance Launcher
              </h2>
            </div>
            <div className="p-8 bg-black/5 rounded-[2rem] text-center border border-black/5 hover:bg-white transition-all shadow-sm">
              <p className="font-bold text-slate-500 mb-6">Launch a dynamic QR session for student check-ins.</p>
              <button 
                onClick={handleGenerateQR}
                disabled={qrLoading}
                className="action-btn-p mx-auto max-w-xs"
              >
                <QrCode size={20} /> {qrLoading ? 'Wait...' : 'GENERATE QR CODE'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>
                <Megaphone size={22} className="text-indigo-500" /> 
                Broadcast Center
              </h2>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Alert Title"
                value={noticeData.title}
                onChange={(e) => setNoticeData({...noticeData, title: e.target.value})}
                className="p-4 w-full bg-black/5 rounded-2xl border-none font-bold text-sm"
              />
              <textarea 
                placeholder="Message for students..."
                value={noticeData.content}
                onChange={(e) => setNoticeData({...noticeData, content: e.target.value})}
                className="p-4 w-full bg-black/5 rounded-2xl border-none font-bold text-sm h-32 resize-none"
              ></textarea>
              <button 
                onClick={handlePostNotice}
                disabled={noticeLoading}
                className="action-btn-p w-full"
              >
                <Send size={18} /> {noticeLoading ? 'SENDING...' : 'BROADCAST NOW'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2>
                <FilePlus size={22} className="text-indigo-500" /> 
                Resource Hub
              </h2>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Material Title"
                value={noteData.title}
                onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                className="p-4 w-full bg-black/5 rounded-2xl border-none font-bold text-sm"
              />
              <select 
                value={noteData.subject}
                onChange={(e) => setNoteData({...noteData, subject: e.target.value})}
                className="p-4 w-full bg-black/5 rounded-2xl border-none font-black text-sm cursor-pointer"
              >
                <option disabled>Select Subject</option>
                <option>Logic Design & Circuits</option>
                <option>Data Structures</option>
                <option>Microprocessors</option>
              </select>
              
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
                className="p-6 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-3xl text-center cursor-pointer hover:bg-white transition-colors"
              >
                <Upload size={24} className="mx-auto mb-2 text-indigo-400" />
                <p className="font-black text-xs uppercase text-indigo-600">
                  {noteData.fileName ? noteData.fileName : 'BROWSE FILES'}
                </p>
                <p className="text-[10px] font-bold text-slate-400">PDF, PPT (Max 10MB)</p>
              </div>

              <button 
                onClick={handleUploadNote}
                disabled={noteLoading}
                className="action-btn-p w-full"
              >
                <CheckCircle2 size={20} /> {noteLoading ? 'WAITING...' : 'SUBMIT MATERIAL'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>
                <Megaphone size={22} className="text-amber-500" /> 
                Campus Notices
              </h2>
            </div>
            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="text-center py-6 opacity-40 font-bold text-xs uppercase">No active notices.</div>
              ) : (
                notices.map((notice) => (
                  <div key={notice._id} className="p-4 bg-black/5 rounded-2xl border border-black/5 hover:bg-white transition-all">
                    <p className="font-bold text-sm mb-1">{notice.title}</p>
                    <p className="text-[11px] font-bold opacity-60 leading-relaxed">{notice.content}</p>
                    <div className="flex justify-between items-center mt-3">
                       <span className="text-[9px] font-black opacity-30 uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                       <span className="text-[9px] font-black text-indigo-600 uppercase">{notice.author?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* High-End QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full relative border border-white/20"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={28} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <QrCode size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Attendance QR</h3>
                <p className="text-slate-500 text-sm font-bold">Valid for 10 minutes</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center justify-center mb-8 shadow-inner shadow-slate-200/50">
                <div className="p-4 bg-white rounded-3xl shadow-xl">
                  <QRCode value={qrData?.qrValue || ''} size={200} />
                </div>
              </div>

              <div className="text-center">
                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xs font-black inline-flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> SCAN TO MARK PRESENT
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-black">
                  Expires: {qrData?.expiresAt ? new Date(qrData.expiresAt).toLocaleTimeString() : '--:--:--'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyDashboard;
