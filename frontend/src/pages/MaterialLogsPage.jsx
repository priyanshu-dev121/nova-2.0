import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Library, 
  ArrowLeft,
  Search,
  FilePlus,
  ExternalLink,
  Plus
} from 'lucide-react';

import API from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import '../pages/Dashboard.css';

const MaterialLogsPage = () => {
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
      const { data } = await API.get('/notes/my-notes');
      setHistory(data);
    } catch (err) {
      showToast('Error fetching notes history', 'error');
    } finally {
      setLoading(false);
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
               onClick={() => navigate('/dashboard')}
               className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-full font-black text-xs uppercase hover:bg-black transition-all shadow-xl active:scale-95"
             >
                <Plus size={20} /> New Upload
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
              <div className="py-20 text-center opacity-40 font-black uppercase">Loading Repository...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Library size={48} className="mx-auto mb-4" />
                <p className="font-black text-xs">NO MATERIALS FOUND</p>
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
                           <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                              <FilePlus size={16} />
                           </div>
                           {n.title}
                        </div>
                      </td>
                      <td>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
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
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all w-fit"
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
    </div>
  );
};

export default MaterialLogsPage;
