import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  ClipboardList, 
  FileText, 
  Search, 
  Utensils, 
  LogOut,
  Sparkles,
  ShieldCheck,
  Users,
  Library
} from 'lucide-react';

const Sidebar = ({ handleLogout }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const role = userInfo?.role || 'student';

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Events', icon: <CalendarCheck size={20} />, path: '/events' },
    { name: 'Incident Logs', icon: <ShieldCheck size={20} />, path: '/admin/complaints', roles: ['admin'] },
    { name: 'User Management', icon: <Users size={20} />, path: '/admin/users', roles: ['admin'] },
    { name: 'Attendance', icon: <CalendarCheck size={20} />, path: '/attendance', roles: ['student', 'faculty'] },
    { name: 'Class Logs', icon: <CalendarCheck size={20} />, path: '/class-logs', roles: ['faculty'] },
    { name: 'Material Logs', icon: <Library size={20} />, path: '/material-logs', roles: ['faculty'] },
    { name: 'Complaints', icon: <ClipboardList size={20} />, path: '/complaints', roles: ['student'] },
    { name: 'Academic Vault', icon: <Library size={20} />, path: '/academic-vault', roles: ['student', 'admin'] },
    { name: 'Notes Sharing', icon: <FileText size={20} />, path: '/notes', roles: ['student', 'admin'] },
    { name: 'Lost & Found', icon: <Search size={20} />, path: '/lostfound', roles: ['student'] },
  ];


  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header logo">
        <Sparkles className="text-primary" size={28} />
        <h1 className="logo-text">Campus Nova</h1>
      </div>
      
      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
