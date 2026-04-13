import React from 'react';
import { Menu, Sparkles, X } from 'lucide-react';

const MobileHeader = ({ showSidebar, setShowSidebar }) => {
  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary" size={24} />
          <h1 className="logo-text" style={{ fontSize: '1.25rem' }}>Campus Nova</h1>
        </div>
        
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
          aria-label="Toggle Menu"
        >
          {showSidebar ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
