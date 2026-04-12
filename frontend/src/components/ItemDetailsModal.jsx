import React from 'react';
import { X, MapPin, Clock, Tag, User, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const ItemDetailsModal = ({ isOpen, onClose, item, onClaim }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="premium-modal-overlay">
      <motion.div 
        className="premium-modal-content max-w-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <Tag className="text-indigo-600" />
            <h2 className="text-xl font-bold">Item Details</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="detail-image-wrapper">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
              <div className={`detail-status-badge ${item.type}`}>
                {item.type.toUpperCase()}
              </div>
            </div>

            <div className="detail-info-space flex flex-col gap-4">
              <h1 className="text-2xl font-extrabold text-slate-900">{item.title}</h1>
              
              <div className="category-tag-inline px-3 py-1 bg-slate-100 rounded-full w-fit text-sm font-bold text-slate-600">
                {item.category}
              </div>

              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={18} className="text-indigo-500" />
                  <span className="font-medium">{item.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={18} className="text-indigo-500" />
                  <span className="font-medium">{new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <User size={18} className="text-indigo-500" />
                  <span className="font-medium">Found by {item.userId?.name || 'Anonymous'}</span>
                </div>
              </div>

              <div className="description-box mt-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer border-t pt-6 flex gap-4">
          <button 
            className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
            onClick={() => onClaim(item)}
          >
            <ShieldCheck size={20} />
            {item.type === 'lost' ? 'I found this' : 'Claim Listing'}
          </button>
          <button 
            className="btn-secondary px-6"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ItemDetailsModal;
