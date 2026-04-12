import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, ChevronLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig'; // Standardized API handler
import { useToast } from '../components/Toast';
import './Dashboard.css';


const ComplaintsPage = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Hostel' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  const navigate = useNavigate();


  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchComplaints();
    }
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get('/complaints/user');
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/complaints', formData);
      setFormData({ title: '', description: '', category: 'Hostel' });
      setShowForm(false);
      showToast('Complaint registered. The relevant department has been notified.', 'success');
      fetchComplaints();
    } catch (err) {
      console.error('Error submitting complaint:', err);
      showToast('Encountered an issue while logging complaint.', 'error');
    } finally {
      setLoading(false);
    }
  };


  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      <main className="main-content">
        <div className="page-header flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => navigate('/dashboard')}><ChevronLeft /></button>
            <h1>Support & Complaints</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> New Complaint
          </button>
        </div>

        {showForm && (
          <div className="centered-action-module fade-up">
            <div className="card">
              <h2 className="premium-form-header">Raise a Complaint</h2>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-6">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Summarize the issue"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="custom-select"
                  >
                    <option value="Hostel">Hostel</option>
                    <option value="WiFi">WiFi</option>
                    <option value="Mess">Mess</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="4" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide details about the issue"
                    required
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Your Previous Complaints</h2>
          <div className="complaint-list mt-4">
            {complaints.length === 0 ? (
              <div className="empty-state py-12 text-center">
                <AlertCircle size={48} className="mx-auto text-secondary mb-4 opacity-20" />
                <p>No complaints raised yet. We're here to help!</p>
              </div>
            ) : (
              <div className="grid">
                {complaints.map((c) => (
                  <div key={c._id} className="complaint-item p-4 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="text-secondary text-sm">{c.category} • {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`status-badge ${(c.status || '').toLowerCase().replace(' ', '-')}`}>
                        {c.status}
                      </span>
                      {c.status === 'Resolved' && c.actionTaken && (
                        <p className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md italic">
                          Action: {c.actionTaken}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintsPage;
