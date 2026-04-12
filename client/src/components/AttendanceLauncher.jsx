import React, { useState, useEffect, useRef } from 'react';
import { Scan, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import API from '../api/axiosConfig';
import { useToast } from './Toast';

const AttendanceLauncher = ({ user }) => {
  const [qrLoading, setQrLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Select Subject');
  const [sessionStudents, setSessionStudents] = useState(0);
  const { showToast } = useToast();
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchSubjects();
    return () => stopPolling();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/attendance/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        showToast('Geolocation not supported', 'error');
        return resolve({ latitude: null, longitude: null });
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          console.error('Loc Error:', err);
          showToast('Location access denied. Anti-proxy disabled.', 'info');
          resolve({ latitude: null, longitude: null });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  };

  const handleGenerateQR = async () => {
    if (selectedSubject === 'Select Subject') {
      showToast('Please select a subject first', 'error');
      return;
    }
    try {
      setQrLoading(true);
      const loc = await getCurrentLocation();
      
      const { data } = await API.post('/attendance/start', { 
        subject: selectedSubject, 
        durationMinutes: 2,
        ...loc
      });
      setQrData(data);
      setShowQRModal(true);
      showToast('Attendance session started!', 'success');
      startPolling(data.sessionId);
    } catch (err) {
      console.error('QR Generation Error:', err);
      showToast(err.response?.data?.message || 'QR Generation failed!', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  const startPolling = (sessionId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setSessionStudents(0);
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await API.get(`/attendance/session/${sessionId}`);
        setSessionStudents(data.count);
      } catch (err) {
        console.error('Polling Error:', err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setShowQRModal(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="flex items-center gap-3">
          <Scan size={24} className="text-indigo-600" /> 
          Attendance Launcher
        </h2>
      </div>
      <div className="p-8 bg-black/5 rounded-[2rem] text-center border border-black/5 hover:bg-white transition-all shadow-sm">
        <p className="font-bold text-slate-500 mb-6 uppercase text-[10px] tracking-widest">Select target subject</p>
        
        <select 
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full mb-6 p-4 bg-white/50 border border-black/5 rounded-2xl font-black text-sm text-center appearance-none cursor-pointer hover:border-indigo-200 transition-all outline-none"
        >
          <option disabled>Select Subject</option>
          {subjects.map(sub => (
            <option key={sub._id} value={sub.name}>{sub.name} ({sub.code})</option>
          ))}
        </select>

        <button 
          onClick={handleGenerateQR}
          disabled={qrLoading}
          className="action-btn-p mx-auto max-w-xs w-full py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <Scan size={20} /> {qrLoading ? 'Wait...' : 'GENERATE QR CODE'}
        </button>
      </div>

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
                onClick={stopPolling}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={28} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Scan size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{selectedSubject}</h3>
                <p className="text-slate-500 text-sm font-bold tracking-tight">2 Minute Security Window</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-center mb-6 shadow-inner">
                <div className="p-3 bg-white rounded-2xl shadow-xl">
                  {(() => {
                    const QRCodeComponent = typeof QRCode === 'function' ? QRCode : (QRCode?.default || null);
                    return QRCodeComponent ? (
                      <QRCodeComponent value={qrData?.qrValue || ''} size={180} />
                    ) : (
                      <div className="w-[180px] h-[180px] flex items-center justify-center text-[10px] font-black text-indigo-400 text-center p-4">
                        QR MODULE LOADING...
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-4 rounded-3xl text-center shadow-lg relative overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 120, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-indigo-500 opacity-50"
                  />
                  <p className="text-[10px] uppercase font-black opacity-60 mb-1">Manual Access Code</p>
                  <p className="text-3xl font-black tracking-[0.5em] ml-[0.3em]">{qrData?.manualCode || '----'}</p>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-3xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase">Live Counter</span>
                  </div>
                  <span className="text-xl font-black">{sessionStudents} <span className="text-xs font-bold opacity-60">Students</span></span>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
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

export default AttendanceLauncher;
