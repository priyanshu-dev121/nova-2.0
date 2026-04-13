import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import ComplaintsPage from './pages/ComplaintsPage';
import NotesPage from './pages/NotesPage';
import AcademicVaultPage from './pages/AcademicVaultPage';
import LostFoundPage from './pages/LostFoundPage';
import MessPage from './pages/MessPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import EventsPage from './pages/EventsPage';
import ClassLogsPage from './pages/ClassLogsPage';
import MaterialLogsPage from './pages/MaterialLogsPage';
import NovaChat from './components/NovaChat';
import ProfilePage from './pages/ProfilePage';
import ErrorBoundary from './components/ErrorBoundary';

import HowItWorksPage from './pages/HowItWorksPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPage from './pages/RefundPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="/admin/users" element={<AdminUserManagementPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/academic-vault" element={<AcademicVaultPage />} />
            <Route path="/lostfound" element={<LostFoundPage />} />
            <Route path="/mess" element={<MessPage />} />
            <Route path="/class-logs" element={<ClassLogsPage />} />
            <Route path="/material-logs" element={<MaterialLogsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </ErrorBoundary>
        <NovaChat />
      </Router>
    </ToastProvider>
  );
}

export default App;
