import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, LogIn, LayoutDashboard, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';
import './HowItWorksPage.css';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 'Phase 01',
      title: 'Quick Registration',
      desc: 'Join the ecosystem in seconds. Use your college email for instant verification and secure profile setup.',
      icon: <UserPlus size={28} />,
    },
    {
      number: 'Phase 02',
      title: 'Secure Access',
      desc: 'Log in securely with OTP-based authentication, ensuring your data and campus records are always protected.',
      icon: <ShieldCheck size={28} />,
    },
    {
      number: 'Phase 03',
      title: 'Unified Dashboard',
      desc: 'Access all campus services from a single, personalized command center tailored to your role (Student, Faculty, or Admin).',
      icon: <LayoutDashboard size={28} />,
    },
    {
      number: 'Phase 04',
      title: 'Instant Service Delivery',
      desc: 'Mark attendance via QR, find lost items, order food, or file complaints – all with real-time tracking.',
      icon: <Zap size={28} />,
    },
    {
      number: 'Phase 05',
      title: 'Continuous Evolution',
      desc: 'Stay updated with new features and campus events, helping you build a smarter, more connected community.',
      icon: <Sparkles size={28} />,
    }
  ];

  return (
    <div className="how-it-works-container">
      <div className="how-it-works-content">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <header className="how-header">
          <h1>How it Works</h1>
          <p>Discover how Campus Nova streamlines your college life into a single, powerful digital experience.</p>
        </header>

        <div className="flow-container">
          {steps.map((step, index) => (
            <div key={index} className="flow-step">
              <div className="step-dot">{index + 1}</div>
              <div className="step-card">
                <span className="step-number">{step.number}</span>
                <div className="step-icon">
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              <div style={{ width: '45%' }} className="hidden md:block"></div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
