import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import FacultyDashboard from '../components/dashboards/FacultyDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import MobileHeader from '../components/MobileHeader';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <MobileHeader showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      
      <Sidebar 
        handleLogout={handleLogout} 
        showSidebar={showSidebar} 
        setShowSidebar={setShowSidebar}
      />
      
      <main className={`main-content ${showSidebar ? 'sidebar-open' : ''}`}>
        {/* Render appropriate dashboard based on user role */}
        {user.role === 'student' && <StudentDashboard user={user} />}
        {user.role === 'faculty' && <FacultyDashboard user={user} />}
        {user.role === 'admin' && <AdminDashboard user={user} />}
      </main>
    </div>
  );
};

export default Dashboard;
