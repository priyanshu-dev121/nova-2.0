import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  Trash2, 
  UserCircle, 
  ShieldCheck, 
  GraduationCap,
  Users,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig';
import { useToast } from '../components/Toast';
import './Dashboard.css';


const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'Student');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [roleFilter]);

  useEffect(() => {
    const result = users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(result);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/users?role=${roleFilter}`);
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      setDeletingId(id);
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      showToast('User permanently removed from system.', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast('Purge failed. Access restricted.', 'error');
    } finally {
      setDeletingId(null);
    }
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
              <h1 className="text-4xl font-black tracking-tight text-black">Identity Management</h1>
              <p className="font-bold opacity-60">Audit and manage platform access for all users.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="search-bar" style={{ minWidth: '400px' }}>
              <input 
                type="text" 
                placeholder={`Search ${roleFilter.toLowerCase()}s by name or email...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '1rem', fontWeight: 600 }}
              />
              <Search size={20} className="search-icon" />
            </div>
          </div>
        </header>

        {/* Role Toggle Tabs */}
        <div className="filter-pills-group mb-12">
          {['Student', 'Faculty'].map((r) => (
            <button 
              key={r}
              onClick={() => {
                setRoleFilter(r);
                navigate(`/admin/users?role=${r.toLowerCase()}`);
              }}
              className={`filter-pill ${roleFilter === r ? 'active' : ''}`}
              style={{ padding: '1rem 3rem', fontSize: '1rem' }}
            >
              {r === 'Student' ? <GraduationCap size={18} className="inline mr-2" /> : <ShieldCheck size={18} className="inline mr-2" />}
              {r}S
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-4 mb-4">
             <h2 className="text-2xl font-black text-black">Active User Directory</h2>
             <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{filteredUsers.length} Identified</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <AnimatePresence mode='popLayout'>
               {loading ? (
                 <div className="text-center py-24 opacity-30 font-black text-2xl animate-pulse">
                   SCANNING DIRECTORY...
                 </div>
               ) : filteredUsers.length === 0 ? (
                 <div className="card text-center py-24 opacity-30">
                    <Users size={64} className="mx-auto mb-4" />
                    <p className="text-xl font-black">No users found in this sector.</p>
                 </div>
               ) : (
                 filteredUsers.map((u) => (
                   <motion.div 
                     layout
                     key={u._id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="card !p-6 hover:!border-indigo-500/30 transition-all group"
                   >
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
                           <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-indigo-600 font-black text-2xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {u.name?.charAt(0) || '?'}
                           </div>
                           <div>
                              <h3 className="text-2xl font-black text-black leading-none mb-2">{u.name}</h3>
                              <p className="text-sm font-bold opacity-40 uppercase tracking-widest mb-3">{u.email}</p>
                              <div className="flex items-center gap-6">
                                 <span className="text-[10px] font-black px-3 py-1 bg-black/5 rounded-lg text-black/60 tracking-wider">
                                    ID: {u._id.slice(-8).toUpperCase()}
                                 </span>
                                 <span className="text-[10px] font-black px-3 py-1 bg-black/5 rounded-lg text-black/60 tracking-wider">
                                    JOINED: {new Date(u.createdAt).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <motion.button 
                              whileHover={{ scale: 1.05, translateY: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={deletingId === u._id}
                              className="px-8 py-4 bg-rose-50/50 text-rose-600 rounded-2xl text-[11px] font-black border border-rose-200/50 hover:bg-rose-600 hover:text-white hover:border-rose-600 neon-purge-glow transition-all flex items-center gap-3 active:scale-95 group/btn"
                           >
                              <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                              {deletingId === u._id ? 'DELETING...' : 'DELETE USER'}
                           </motion.button>
                        </div>
                     </div>
                   </motion.div>
                 ))
               )}
             </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagementPage;
