import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, 
  ArrowLeft,
  Search,
  FilePlus,
  ExternalLink,
  Plus,
  X,
  ChevronDown,
  Upload
} from 'lucide-react';

import API from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import '../pages/Dashboard.css';

import './MaterialLogsPage.css';

const MaterialLogsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Select Subject');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [noteData, setNoteData] = useState({ title: '', subject: 'Select Subject', fileName: '' });
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'faculty') {
      navigate('/dashboard');
      return;
    }
    fetchHistory();
    fetchSubjects();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/notes/my-notes');
      // Only show materials that were officially published to the vault
      const officialHistory = data.filter(n => n.isOfficial);
      setHistory(officialHistory);
    } catch (err) {
      showToast('Error fetching notes history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/attendance/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleUpload = async () => {
    if (!noteData.title || noteData.subject === 'Select Subject' || !fileInputRef.current?.files[0]) {
      showToast('Please fill all fields and select a file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', noteData.title);
    formData.append('subject', noteData.subject);
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('isOfficial', 'true');

    try {
      setUploadLoading(true);
      await API.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('New material added to Academic Vault!', 'success');
      setShowUploadModal(false);
      setNoteData({ title: '', subject: 'Select Subject', fileName: '' });
      setSelectedSubject('Select Subject');
      fetchHistory();
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Material Repository</h1>
            </div>
            <p className="text-slate-500 font-bold ml-12">Shared Study Materials & Documents</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="premium-search-container">
                <Search size={22} className="premium-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="premium-search-input"
                />
             </div>
             <button 
               onClick={() => setShowUploadModal(true)}
               className="upload-pill-btn"
             >
                <Upload size={20} />
                <span>UPLOAD NOTE</span>
             </button>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="py-20 text-center opacity-40 font-black uppercase tracking-widest">Accessing Secure Vault...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Library size={48} className="mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">No curriculum materials shared yet.</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Material Title</th>
                    <th>Subject</th>
                    <th>Date Shared</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((n) => (
                    <tr key={n._id}>
                      <td className="font-extrabold text-slate-900">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <FilePlus size={16} />
                           </div>
                           {n.title}
                        </div>
                      </td>
                      <td>
                        <span className="px-3 py-1 bg-indigo-600/10 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                          {n.subject}
                        </span>
                      </td>
                      <td className="text-[11px] font-bold text-slate-400">
                         {new Date(n.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <a 
                          href={n.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-black transition-all w-fit shadow-md shadow-indigo-200"
                        >
                          <ExternalLink size={14} /> Open File
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showUploadModal && (
          <div className="premium-modal-overlay" onClick={() => setShowUploadModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="premium-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close-btn" 
                onClick={() => setShowUploadModal(false)}
              >
                <X size={28} />
              </button>

              <h3 className="modal-title">Add New Resource</h3>

              <div className="modal-grid">
                 <div className="form-group">
                   <label className="modal-label">Title</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Data Structures Unit 1"
                     value={noteData.title}
                     onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                     className="modal-input"
                   />
                 </div>

                 <div className="form-group relative" ref={dropdownRef}>
                   <label className="modal-label">Subject</label>
                   <div 
                     className="modal-input flex justify-between items-center cursor-pointer"
                     style={{ display: 'flex' }}
                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   >
                     <span className={selectedSubject === 'Select Subject' ? 'selected-placeholder' : ''} style={{ opacity: selectedSubject === 'Select Subject' ? 0.4 : 1 }}>
                       {selectedSubject === 'Select Subject' ? 'Choose a course...' : selectedSubject}
                     </span>
                     <ChevronDown size={20} style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', color: '#10a37f' }} />
                   </div>

                   <AnimatePresence>
                     {isDropdownOpen && (
                       <motion.div 
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 5 }}
                         className="dropdown-menu-custom"
                       >
                         {subjects.map(sub => (
                           <div 
                             key={sub.id || sub._id} 
                             className="dropdown-item-custom"
                             onClick={() => {
                               const fullSubject = `${sub.name} (${sub.code})`;
                               setSelectedSubject(fullSubject);
                               setNoteData(prev => ({ ...prev, subject: fullSubject }));
                               setIsDropdownOpen(false);
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
              </div>

              <div className="form-group" style={{ marginBottom: '3rem' }}>
                 <label className="modal-label">Resource File (PDF/IMAGE)</label>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   onChange={(e) => {
                     const file = e.target.files[0];
                     if (file) setNoteData({...noteData, fileName: file.name});
                   }}
                 />
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="custom-dropzone"
                 >
                   <div className="dropzone-icon-box">
                       <Upload size={30} />
                   </div>
                   
                   {noteData.fileName ? (
                      <p className="dropzone-main-text" style={{ color: '#10a37f' }}>{noteData.fileName}</p>
                   ) : (
                      <>
                        <h4 className="dropzone-main-text">Click to choose or drag file here</h4>
                        <p className="dropzone-sub-text">Support for PDF, JPG, PNG (Max 10MB)</p>
                      </>
                   )}
                 </div>
              </div>

              <div className="modal-actions">
                 <button 
                   onClick={handleUpload}
                   disabled={uploadLoading}
                   className="upload-now-btn"
                 >
                   {uploadLoading ? 'Uploading...' : 'Upload Now'}
                 </button>
                 <button 
                   onClick={() => {
                     setShowUploadModal(false);
                     setNoteData({ title: '', subject: 'Select Subject', fileName: '' });
                   }}
                   className="cancel-btn"
                 >
                   Cancel
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialLogsPage;
