import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig';
import './Dashboard.css';

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/dashboard');
    } else {
      fetchComplaints();
    }
  }, [navigate]);

  useEffect(() => {
    let result = complaints;
    if (filterStatus !== 'All') {
      result = result.filter(c => c.status === filterStatus);
    }
    if (searchTerm) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredComplaints(result);
  }, [searchTerm, filterStatus, complaints]);

  // Handle click outside to close resolution drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the drawer is open and the click is outside the card, close it
      if (selectedId && !event.target.closest('.resolution-active-card')) {
        setSelectedId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedId]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/complaints/admin');
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, notes = '') => {
    setUpdating(true);
    try {
      await API.patch(`/complaints/${id}`, { status, actionTaken: notes });
      setSelectedId(null);
      setResolutionNote('');
      showToast(`Incident marked as ${status}`, 'success');
      fetchComplaints();
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-0">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              className="icon-btn bg-white shadow-sm border border-black/5" 
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft />
            </motion.button>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-black">Incident Command</h1>
              <p className="font-bold opacity-60">Manage system-wide resolutions and user support.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search by title or user..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="search-icon" />
             </div>
          </div>
        </header>

        {/* Quick Stats Banner - Redesigned */}
        <div className="admin-stats-grid">
          {[
            { label: 'Total Logs', value: stats.total, color: '#6366f1' },
            { label: 'Pending', value: stats.pending, color: '#f59e0b' },
            { label: 'Active Issues', value: stats.inProgress, color: '#3b82f6' },
            { label: 'Solved', value: stats.resolved, color: '#10b981' }
          ].map((s) => (
            <div key={s.label} className="admin-stat-card">
               <div className="accent-bar" style={{ background: s.color }}></div>
               <span className="label">{s.label}</span>
               <span className="value">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Status Filters - Cinema Style */}
        <div className="filter-pills-group">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((s) => (
            <button 
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {filteredComplaints.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card text-center py-20 opacity-40 font-bold"
              >
                <AlertCircle size={48} className="mx-auto mb-4" />
                No matching incidents found.
              </motion.div>
            ) : (
              filteredComplaints.map((c) => (
                <motion.div 
                  layout
                  key={c._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card !p-8 hover:!border-indigo-400/50 ${selectedId === c._id ? 'resolution-active-card !border-indigo-600 !ring-8 !ring-indigo-50' : ''}`}
                >
                  <div className="admin-incident-card-body">
                    {/* Pillar: Status Icon */}
                    <div className="status-icon-pillar">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
                        c.status === 'Resolved' ? 'bg-green-600 text-white shadow-green-100' : 
                        c.status === 'In Progress' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-amber-500 text-white shadow-amber-100'
                      }`}>
                        {c.status === 'Resolved' ? <CheckCircle size={40} /> : c.status === 'In Progress' ? <Clock size={40} /> : <AlertCircle size={40} />}
                      </div>
                    </div>

                    {/* Stack: Primary Content */}
                    <div className="content-info-stack">
                        <div className="align-center-row" style={{ gap: '2rem' }}>
                           <h3 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#000', margin: 0, letterSpacing: '-0.02em' }}>{c.title}</h3>
                           <span style={{ 
                             fontSize: '0.75rem', 
                             fontWeight: 900, 
                             textTransform: 'uppercase', 
                             background: 'rgba(0,0,0,0.05)', 
                             padding: '0.5rem 1.25rem', 
                             borderRadius: '0.75rem', 
                             color: '#64748b',
                             whiteSpace: 'nowrap'
                           }}>{c.category}</span>
                        </div>

                        <p className="incident-description-text">
                           <AlertCircle size={22} style={{ color: '#6366f1', marginTop: '4px' }} />
                           <span>{c.description}</span>
                        </p>

                        <div className="incident-metadata-group">
                           <div className="metadata-item">
                             <ShieldCheck size={18} style={{ color: '#6366f1' }} /> 
                             {c.userId?.name || 'Unknown User'}
                           </div>
                           <div className="metadata-item">
                             <Clock size={18} /> 
                             {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </div>
                        </div>
                    </div>

                    {/* Hub: Action & Status */}
                    <div className="action-status-hub">
                       <span className={`px-6 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-xl transition-all ${
                         c.status === 'Resolved' ? 'bg-green-600 text-white shadow-green-200' : 
                         c.status === 'In Progress' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-amber-500 text-white shadow-amber-200'
                       }`}>
                         {c.status}
                       </span>
                       
                       {c.status !== 'Resolved' && (
                         <div className="flex flex-col gap-4 items-end w-full">
                           {c.status === 'Pending' && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleUpdateStatus(c._id, 'In Progress'); }}
                               className="px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl text-[11px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-95 w-full text-center"
                             >
                               MARK IN-PROGRESS
                             </button>
                           )}
                           <motion.button 
                             whileHover={{ scale: 1.02, translateY: -2 }}
                             whileTap={{ scale: 0.96 }}
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedId(c._id);
                               setResolutionNote(c.actionTaken || '');
                             }}
                             className="px-10 py-5 bg-indigo-600 text-white rounded-full text-[14px] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 tracking-widest w-full text-center flex items-center justify-center gap-3"
                           >
                             <Send size={20} />
                             CONFIRM RESOLUTION
                           </motion.button>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Resolution Drawer - REFINED */}
                  <AnimatePresence>
                    {(selectedId === c._id) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="resolution-drawer-v2">
                           <h4 className="flex items-center gap-3 text-black">
                             <MessageSquare size={20} className="text-indigo-600" /> WHAT ACTION WAS TAKEN? (OPTIONAL)
                           </h4>
                           <textarea 
                             className="form-control"
                             placeholder="Describe the solution for the user in detail..."
                             value={resolutionNote}
                             onChange={(e) => setResolutionNote(e.target.value)}
                           />
                           <div className="flex gap-4 mt-8">
                              <button 
                                onClick={() => handleUpdateStatus(c._id, 'Resolved', resolutionNote)}
                                disabled={updating}
                                className="btn-primary !px-10 !py-4 flex items-center gap-3"
                              >
                                {updating ? 'Saving...' : <><Send size={20} /> Confirm Resolution</>}
                              </button>
                              <button 
                                onClick={() => setSelectedId(null)}
                                className="btn-secondary !px-10 !py-4"
                              >
                                Cancel
                              </button>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {c.status === 'Resolved' && c.actionTaken && (
                    <div className="mt-8 p-6 bg-green-50/40 rounded-3xl border border-green-100/50">
                       <p className="text-[10px] font-black uppercase text-green-800/40 mb-2 flex items-center gap-2">
                         <CheckCircle size={12} /> Official Resolution Log
                       </p>
                       <p className="text-lg font-bold text-green-900/90 leading-relaxed italic">"{c.actionTaken}"</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminComplaintsPage;
