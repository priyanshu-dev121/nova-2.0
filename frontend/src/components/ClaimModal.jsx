import React, { useState } from 'react';
import { X, ShieldCheck, Send, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ClaimModal = ({ isOpen, onClose, onSubmit, item, loading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ itemId: item._id, message });
  };

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay">
      <motion.div 
        className="premium-modal-content max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <ShieldCheck className="color-indigo-600" size={24} />
            <h2>Submit Claim Request</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="item-summary-alert mt-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <p>You are claiming: <strong>{item.title}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form mt-4">
          <div className="form-group">
            <label>Detailed Proof or Description</label>
            <textarea 
              rows="5" 
              required 
              placeholder="Describe unique identifiers, contents, or serial numbers. This remains private between you and the finder."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <p className="privacy-note mt-4">
            Security Note: The finder will review your proof. If accepted, your contact details will be shared to facilitate the return.
          </p>

          <div className="modal-actions mt-6">
            <button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
              {loading ? 'Submitting...' : <><Send size={18} /> Send Claim Request</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ClaimModal;
