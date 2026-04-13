import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig';
import { 
  Search, Plus, ChevronLeft, MapPin, 
  Filter, Tag, Calendar, LayoutGrid, 
  Map as MapIcon, ShieldCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LostFoundForm from '../components/LostFoundForm';
import ClaimModal from '../components/ClaimModal';
import ItemDetailsModal from '../components/ItemDetailsModal';
import CampusMap from '../components/CampusMap';
import './Dashboard.css';

const CATEGORIES = ['All', 'Electronics', 'Stationery', 'Clothing', 'Wallet/Cards', 'Documents', 'Accessories', 'Others'];

const LostFoundPage = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showMap, setShowMap] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) navigate('/login');
    else {
      setUser(userInfo);
      fetchItems();
    }
  }, [navigate]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, activeType, activeCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lostfound');
      setItems(data);
    } catch (err) {
      showToast('System connectivity error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let result = [...items];
    if (activeType !== 'all') result = result.filter(i => i.type === activeType);
    if (activeCategory !== 'All') result = result.filter(i => i.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      );
    }
    setFilteredItems(result);
  };

  const handlePostItem = async (formData) => {
    try {
      setLoading(true);
      await API.post('/lostfound', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      showToast('Listing synchronized with Campus Core', 'success');
      fetchItems();
    } catch (err) {
      console.error('Post Error:', err);
      const errorMsg = err.response?.data?.message || 'Validation or Upload Error';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async ({ itemId, message }) => {
    try {
      setLoading(true);
      await API.post('/lostfound/claim', { itemId, message });
      setShowClaimModal(false);
      setShowDetailModal(false);
      showToast('Claim request broadcasted to the finder', 'success');
    } catch (err) {
      showToast('Claim submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => navigate('/dashboard')}><ChevronLeft /></button>
            <h1 className="text-2xl font-bold">Lost & Found Portal</h1>
          </div>
          <div className="flex gap-2">
            <button className={`icon-btn ${showMap ? 'active' : ''}`} onClick={() => setShowMap(!showMap)}>
              <MapIcon size={20} />
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={20} /> Report Item
            </button>
          </div>
        </header>

        {showMap && <CampusMap />}

        <div className="lost-found-controls mb-8">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, location, or description..."
              className="premium-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-scroll-wrapper">
            <div className="type-filters">
              {['all', 'lost', 'found'].map(t => (
                <button 
                  key={t}
                  className={`filter-chip ${activeType === t ? 'active' : ''}`}
                  onClick={() => setActiveType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="divider"></div>
            <div className="category-filters">
              {CATEGORIES.map(c => (
                <button 
                  key={c}
                  className={`filter-chip ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="items-grid-v2">
          {loading ? (
            <div className="flex-center py-20"><div className="nova-spinner"></div></div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state-v2">
              <Search size={48} />
              <h3>No items found</h3>
              <p>Try adjusting your filters or search keywords</p>
            </div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredItems.map((item) => (
                <motion.div 
                  key={item._id} 
                  className={`premium-item-card ${item.type}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => openDetails(item)}
                >
                  <div className="card-badge">
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </div>
                  <div className="item-img-container">
                    <img src={item.imageUrl} alt={item.title} />
                    <div className="category-overlay">{item.category}</div>
                  </div>
                  <div className="card-body">
                    <h3 className="item-title">{item.title}</h3>
                    <div className="meta-info">
                      <div className="info-item"><MapPin size={14} /> {item.location}</div>
                      <div className="info-item"><Clock size={14} /> {new Date(item.date).toLocaleDateString()}</div>
                    </div>
                    <p className="item-desc">{item.description}</p>
                    <div className="card-footer">
                      <div className="user-tag">
                        <div className="avatar-small">{item.userId?.name?.[0] || 'A'}</div>
                        <span>{item.userId?.name || 'Anonymous'}</span>
                      </div>
                      <div className="view-details-hint font-bold text-indigo-500 text-sm">
                        View Details →
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <LostFoundForm 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handlePostItem}
          loading={loading}
        />

        <ItemDetailsModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onClaim={() => { setShowClaimModal(true); }}
          item={selectedItem}
        />

        <ClaimModal 
          isOpen={showClaimModal} 
          onClose={() => setShowClaimModal(false)}
          onSubmit={handleClaimSubmit}
          item={selectedItem || {}}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default LostFoundPage;
