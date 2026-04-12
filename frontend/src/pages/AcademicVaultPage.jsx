import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, ChevronLeft, Download, Library, Clock, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig';
import './Dashboard.css';

const ResourceLibraryPage = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchOfficialNotes();
      const interval = setInterval(fetchOfficialNotes, 30000);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const fetchOfficialNotes = async () => {
    try {
      const { data } = await API.get('/notes');
      // Filter only for notes uploaded by faculty/teachers
      // Note: In a real system, we'd check note.faculty.role, 
      // but for this implementation, we assume all results from /notes that have a faculty populated are official.
      const officialMaterials = data.filter(note => note.faculty);
      setNotes(officialMaterials);
    } catch (err) {
      console.error('Error fetching official notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this official resource forever?')) return;
    try {
      await API.delete(`/notes/${id}`);
      showToast('Official resource removed', 'success');
      fetchOfficialNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      showToast('Action failed', 'error');
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
              <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
                Academic Vault <Library size={30} className="text-indigo-600" />
              </h1>
              <p className="font-bold opacity-60">Verified study materials published by your instructors.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="search-bar" style={{ minWidth: '400px' }}>
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search official resources..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '1rem', fontWeight: 600 }}
              />
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6 px-4">
             <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-black">Official Curriculum</h2>
                <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">Verified</div>
             </div>
             <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{filteredNotes.length} Materials Available</span>
          </div>

          {loading ? (
            <div className="text-center py-24 opacity-20">
               <Sparkles size={48} className="mx-auto animate-spin" />
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.length === 0 ? (
                <div className="card text-center py-24 opacity-30 w-full col-span-full">
                  <FileText size={64} className="mx-auto mb-4" />
                  <p className="text-xl font-black">No official resources have been published yet.</p>
                </div>
              ) : (
                filteredNotes.map((note, index) => (
                  <motion.div 
                    layout
                    key={note._id} 
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="card !p-8 hover:!border-indigo-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            <FileText size={32} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider ">{note.subject}</p>
                               <span className="w-1 h-1 rounded-full bg-slate-300" />
                               <p className="text-[10px] font-black uppercase opacity-40 tracking-wider ">Faculty Upload</p>
                            </div>
                            <h3 className="text-2xl font-black text-black leading-none mb-3">{note.title}</h3>
                            <div className="flex items-center gap-2 text-[12px] font-bold opacity-40 uppercase tracking-widest">
                               Prof. {note.faculty?.name || 'Authorized Faculty'} • <Clock size={12} /> {new Date(note.createdAt).toLocaleDateString()}
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
                          className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[12px] font-black shadow-xl hover:bg-black transition-all"
                        >
                          <Download size={18} />
                          GET RESOURCE
                        </motion.a>

                        {user.role === 'admin' && (
                          <motion.button 
                            whileHover={{ scale: 1.05, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(note._id)}
                            className="flex items-center gap-3 px-8 py-5 bg-red-50 text-red-600 rounded-2xl text-[12px] font-black hover:bg-red-600 hover:text-white transition-all shadow-md"
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
          )}
        </div>
      </main>
    </div>
  );
};

export default ResourceLibraryPage;
