import React, { useState } from 'react';
import { X, Camera, MapPin, Tag, Calendar, User, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Electronics', 'Stationery', 'Clothing', 'Wallet/Cards', 'Documents', 'Accessories', 'Others'];
const BBDU_LOCATIONS = [
  'Block A', 'Block B', 'Block C', 'Block D', 'Block E', 
  'Auditrium', 'Main Canteen', 'Library', 'Stadium', 
  'Student Activity Center', 'Dental Block', 'BBDITM', 'BBDNIIT',
  'Hostel Block (Boys)', 'Hostel Block (Girls)', 'Parking Area', 'Other'
];

const CustomSelect = ({ label, icon: Icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="form-group relative" ref={containerRef}>
      <label className="flex items-center gap-2"><Icon size={16} /> {label}</label>
      <div className={`custom-sexy-select ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="current-value">{value}</span>
        <div className="chevron-icon">
          <ChevronDown size={18} />
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-dropdown-menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{ zIndex: 1000 }}
          >
            <div className="dropdown-scroll-area">
              {options.map((opt) => (
                <div 
                  key={opt} 
                  className={`dropdown-option ${value === opt ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LostFoundForm = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contactInfo: '',
    type: 'lost',
    category: 'Electronics',
    location: 'Block A',
    date: new Date().toISOString().split('T')[0]
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('image', file);
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <motion.div 
        className="premium-modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Report an Item</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-type-toggle">
            <button 
              type="button" 
              className={formData.type === 'lost' ? 'active' : ''} 
              onClick={() => setFormData({...formData, type: 'lost'})}
            >
              Lost Item
            </button>
            <button 
              type="button" 
              className={formData.type === 'found' ? 'active found' : ''} 
              onClick={() => setFormData({...formData, type: 'found'})}
            >
              Found Item
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="flex items-center gap-2"><Tag size={16} /> Item Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. iPhone 13, Biology Notebook"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <CustomSelect 
              label="Category" 
              icon={Info} 
              value={formData.category} 
              options={CATEGORIES} 
              onChange={(val) => setFormData({...formData, category: val})} 
            />

            <CustomSelect 
              label="Location" 
              icon={MapPin} 
              value={formData.location} 
              options={BBDU_LOCATIONS} 
              onChange={(val) => setFormData({...formData, location: val})} 
            />

            <div className="form-group">
              <label><Calendar size={16} /> Date Lost/Found</label>
              <input 
                type="date" 
                required 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label><User size={16} /> Alternate Contact</label>
              <input 
                type="text" 
                placeholder="WhatsApp or Phone"
                value={formData.contactInfo}
                onChange={e => setFormData({...formData, contactInfo: e.target.value})}
              />
            </div>

            <div className="form-group col-span-2">
              <label>Description & Unique Marks</label>
              <textarea 
                rows="3" 
                required 
                placeholder="Provide details that only the owner would know..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="form-group col-span-2">
              <label>Item Image</label>
              <div className="image-upload-wrapper">
                <input 
                  type="file" 
                  id="file-upload" 
                  hidden 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="image-dropzone">
                  {preview ? (
                    <img src={preview} alt="Preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Camera size={32} />
                      <p>Click to upload photo</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="modal-actions mt-6">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LostFoundForm;
