import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Search, ChevronLeft, Download, Filter } from 'lucide-react';
import axios from 'axios';
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

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => navigate('/dashboard')}><ChevronLeft /></button>
            <h1 className="text-2xl font-bold">Study Resources</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
            <Upload size={20} /> Upload Note
          </button>
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

        <div className="card">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black">All Resources</h2>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search by title or subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="search-icon" />
            </div>
          </div>

          <div className="notes-grid">
            {filteredNotes.length === 0 ? (
              <p className="empty-state">No resources matching your search.</p>
            ) : (
              filteredNotes.map((note) => (
                <div key={note._id} className="note-card">
                  <div className="note-icon">
                    <FileText size={32} />
                  </div>
                  <div className="note-card-details">
                    <p className="note-subject">{note.subject}</p>
                    <h3 className="note-title">{note.title}</h3>
                    <div className="note-meta text-sm font-bold opacity-60">
                      By {note.faculty?.name || 'Faculty'}
                    </div>
                  </div>
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                    <Download size={18} />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
