import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Layers, 
  Globe, 
  Link, 
  Save, 
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import API from '../api/axiosConfig';
import './ProfilePage.css';

const ProfilePage = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    section: '',
    year: '',
    department: '',
    bio: '',
    github: '',
    linkedIn: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setUser(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('Failed to load profile data', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Strict numeric validation for phone
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setUser(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Manual Validation
    if (!user.name?.trim()) {
      return showToast('Full Name is required', 'error');
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (user.github && !urlPattern.test(user.github)) {
      return showToast('Invalid GitHub URL', 'error');
    }
    if (user.linkedIn && !urlPattern.test(user.linkedIn)) {
      return showToast('Invalid LinkedIn URL', 'error');
    }

    // Phone Validation
    if (user.phone && user.phone.length !== 10) {
      return showToast('Phone number must be exactly 10 digits', 'error');
    }

    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', user);
      setUser(data);
      
      // Update local storage to keep dashboard in sync
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data }));
      
      showToast('Profile updated successfully! ✨', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a valid image (JPG, PNG)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await API.post('/users/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(prev => ({ ...prev, profilePic: data.profilePic }));
      
      // Update local storage to keep dashboard in sync
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, profilePic: data.profilePic }));

      showToast('Avatar updated successfully! ✨', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="loader"
        />
        <p>Syncing identity with central terminal...</p>
      </div>
    );
  }

  return (
    <div className="profile-container aura-theme">
      {/* Background Orbs */}
      <div className="nebula-orb orb-1" />
      <div className="nebula-orb orb-2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-wrapper"
      >
        {/* Header Actions */}
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="back-btn-aura">
            <ArrowLeft size={18} />
            <span>Return to Terminal</span>
          </button>
          <div className="aura-badge">USER IDENTITY CORE</div>
        </div>

        <div className="profile-content">
          {/* Sidebar / Identity Summary */}
          <aside className="profile-sidebar">
            <div className="identity-card">
              <div className="identity-avatar-wrapper">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
                <div className="identity-avatar" onClick={triggerFileInput} style={{ cursor: 'pointer' }}>
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                  <div className={`avatar-edit ${uploading ? 'uploading' : ''}`}>
                    <Camera size={14} />
                  </div>
                </div>
                <div className="status-glow" />
              </div>
              
              <div className="identity-info">
                <h2>{user.name}</h2>
                <p>{user.role?.toUpperCase()} // {user.email}</p>
              </div>

              <div className="identity-stats">
                <div className="stat">
                  <span className="label">Access Level</span>
                  <span className="val">{user.role}</span>
                </div>
                <div className="stat">
                  <span className="label">Member Since</span>
                  <span className="val">April 2024</span>
                </div>
              </div>
            </div>

            <div className="identity-bio">
              <h3>System Bio</h3>
              <textarea 
                name="bio"
                value={user.bio || ''}
                onChange={handleInputChange}
                placeholder="Initialize your mission bio..."
                className="bio-input"
              />
            </div>
          </aside>

          {/* Main Editing Form */}
          <main className="profile-main">
            <form onSubmit={handleSubmit} className="identity-form" noValidate>
              <div className="form-section">
                <h3><User size={18} /> Basic Coordinates</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <div className="profile-input-wrapper">
                      <User className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="name"
                        value={user.name || ''} 
                        onChange={handleInputChange}
                        placeholder="Name" 
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="profile-input-wrapper readonly">
                      <Mail className="profile-input-icon" size={16} />
                      <input type="email" value={user.email || ''} readOnly />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className="profile-input-wrapper">
                      <Phone className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="phone"
                        value={user.phone || ''} 
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3><BookOpen size={18} /> Academic Parameters</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Current Section</label>
                    <div className="profile-input-wrapper">
                      <Layers className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="section"
                        value={user.section || ''} 
                        onChange={handleInputChange}
                        placeholder="e.g. CS-A" 
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Year of Study</label>
                    <div className="profile-input-wrapper">
                      <Clock className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="year"
                        value={user.year || ''} 
                        onChange={handleInputChange}
                        placeholder="e.g. 3rd Year" 
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Department</label>
                    <div className="profile-input-wrapper">
                      <BookOpen className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="department"
                        value={user.department || ''} 
                        onChange={handleInputChange}
                        placeholder="Computer Science" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Professional Links</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label>GitHub Profile</label>
                    <div className="profile-input-wrapper">
                      <Globe className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="github"
                        value={user.github || ''} 
                        onChange={handleInputChange}
                        placeholder="https://github.com/..." 
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>LinkedIn Network</label>
                    <div className="profile-input-wrapper">
                      <Link className="profile-input-icon" size={16} />
                      <input 
                        type="text" 
                        name="linkedIn"
                        value={user.linkedIn || ''} 
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/..." 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                
                <button 
                  type="submit" 
                  disabled={saving}
                  className={`save-btn-aura ${saving ? 'saving' : ''}`}
                >
                  {saving ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="btn-loader"
                      />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Update Identity</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
