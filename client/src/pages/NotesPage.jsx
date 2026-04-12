import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Search, ChevronLeft, Download, Filter, Trash2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig'; // Standardized API handler
import './Dashboard.css';

const NotesPage = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchNotes();
    }
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      const { data } = await API.get('/notes');
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('file', file);

    try {
      await API.post('/notes', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUpload(false);
      setFormData({ title: '', subject: '' });
      setFile(null);
      fetchNotes();
    } catch (err) {
      console.error('Error uploading note:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource forever?')) return;
    try {
      await API.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note.');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              className="icon-btn bg-white shadow-sm border border-black/5" 
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft />
            </motion.button>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-black">Study Resources</h1>
              <p className="font-bold opacity-60">Access and manage campus-wide learning materials.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="search-bar" style={{ minWidth: '400px' }}>
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search resources, subjects, authors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '1rem', fontWeight: 600 }}
              />
            </div>
            {user.role !== 'admin' && (
              <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
                <Upload size={20} /> Upload Note
              </button>
            )}
          </div>
        </header>

        {showUpload && (
          <div className="centered-action-module fade-up">
            <div className="card">
              <h2 className="premium-form-header">Add New Resource</h2>
              <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. Data Structures Unit 1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input 
                      type="text" 
                      value={formData.subject} 
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g. Computer Science"
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Resource File (PDF/Image)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])} 
                      required 
                    />
                    <label htmlFor="file-upload" className="file-upload-hub">
                      <div className="upload-icon-wrapper">
                        <Upload size={32} />
                      </div>
                      <div>
                        <p className="upload-text-main">
                          {file ? file.name : "Click to choose or drag file here"}
                        </p>
                        <p className="upload-text-sub">Support for PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Now'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6 px-4">
             <h2 className="text-2xl font-black text-black">Available Materials</h2>
             <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{filteredNotes.length} Resources Found</span>
          </div>

          <div className="notes-grid">
            {filteredNotes.length === 0 ? (
              <div className="card text-center py-24 opacity-30 w-full">
                <FileText size={64} className="mx-auto mb-4" />
                <p className="text-xl font-black">No resources discovered yet.</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <motion.div 
                  layout
                  key={note._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card !p-8 hover:!border-indigo-500/30 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <FileText size={32} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider mb-1">{note.subject}</p>
                          <h3 className="text-2xl font-black text-black leading-none mb-3">{note.title}</h3>
                          <div className="flex items-center gap-2 text-[12px] font-bold opacity-40 uppercase tracking-widest">
                             By {note.faculty?.name || 'Faculty'} • {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <motion.a 
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href={note.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[12px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                        title="Download Resource"
                      >
                        <Download size={18} />
                        DOWNLOAD
                      </motion.a>

                      {user.role === 'admin' && (
                        <motion.button 
                          whileHover={{ scale: 1.05, translateY: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(note._id)}
                          className="flex items-center gap-3 px-8 py-4 bg-red-50 text-red-600 rounded-2xl text-[12px] font-black hover:bg-red-600 hover:text-white transition-all shadow-md"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                          DELETE
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
