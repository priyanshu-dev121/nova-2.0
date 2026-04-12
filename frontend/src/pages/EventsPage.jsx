import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  Camera, 
  Trash2, 
  Search,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import './Dashboard.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: ''
  });
  const [posting, setPosting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchEvents();
    }
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/events');
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return showToast('Please fill in title and description', 'error');
    }

    setPosting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.eventDate) data.append('eventDate', formData.eventDate);
    if (file) data.append('image', file);

    try {
      await API.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Event posted successfully!', 'success');
      setShowForm(false);
      setFormData({ title: '', description: '', eventDate: '' });
      setFile(null);
      fetchEvents();
    } catch (err) {
      console.error('Error posting event:', err);
      showToast(err.response?.data?.message || 'Failed to post event', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      showToast('Event successfully deleted.', 'success');
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      showToast('Action failed. Could not remove event.', 'error');
    }
  };


  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard-layout">
      {/* Dynamic Background Elements */}
      <div className="nebula-orb orb-1"></div>
      
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />

      <main className="main-content">
        <header className="top-bar">
          <div className="welcome-msg">
            <h2>Campus Events</h2>
            <p>Stay updated with the latest happenings at Campus Nova</p>
          </div>

          <div className="top-actions">
            <div className="premium-search-container">
              <Search className="premium-search-icon" size={22} />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-search-input"
              />
            </div>
            {isAdmin && (
              <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
                <Plus size={20} /> Post New Event
              </button>
            )}
          </div>
        </header>

        <AnimatePresence>
          {showForm && isAdmin && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="centered-action-module"
            >
              <div className="card">
                <h2 className="premium-form-header">Create Upcoming Event</h2>
                <form onSubmit={handleCreateEvent} className="flex flex-col gap-6">
                  <div className="form-group">
                    <label>Event Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Annual Tech Fest 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Describe the event, venue, and what to expect..."
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label>Event Date (Optional)</label>
                      <input 
                        type="datetime-local"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Cover Photo (Optional)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          id="event-image-upload"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files[0])} 
                        />
                        <label htmlFor="event-image-upload" className="file-upload-hub" style={{ padding: '1.5rem' }}>
                          <Camera size={24} />
                          <span className="text-sm font-semibold">
                            {file ? file.name : "Add Event Photo"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button type="submit" className="btn-primary" disabled={posting}>
                      {posting ? 'Publishing...' : 'Publish Event'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="events-section">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="card text-center py-20">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3>No events found</h3>
              <p>Check back later for new announcements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div 
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card event-premium-card"
                  style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}
                >
                  {event.imageUrl ? (
                    <div className="h-48 w-full overflow-hidden relative">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-indigo-600 shadow-sm uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={12} /> {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative">
                       <Calendar size={48} className="text-indigo-200" />
                       <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-indigo-600 shadow-sm uppercase tracking-wider">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-black mb-2 leading-tight">{event.title}</h3>
                    <p className="text-gray-600 text-sm font-medium mb-6 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Clock size={14} />
                        {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteEvent(event._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsPage;

