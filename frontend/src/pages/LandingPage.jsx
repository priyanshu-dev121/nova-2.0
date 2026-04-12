import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle, Globe, Shield, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import './LandingPage.css';

const Typewriter = ({ segments, speed = 40, onComplete }) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (currentSegmentIndex < segments.length) {
      const currentSegment = segments[currentSegmentIndex];
      
      if (charIndex < currentSegment.text.length) {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => prev + currentSegment.text[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        // Move to next segment
        setCurrentSegmentIndex((prev) => prev + 1);
        setCharIndex(0);
      }
    } else {
      if (!isFinished) {
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }
  }, [charIndex, currentSegmentIndex, segments, speed, onComplete, isFinished]);

  // Logic to render segments that are already fully typed, plus the one being typed
  let renderedText = [];
  let charCount = 0;
  let runningDisplayText = displayText;

  for (let i = 0; i <= currentSegmentIndex && i < segments.length; i++) {
    const segment = segments[i];
    const lengthToTake = Math.min(runningDisplayText.length, segment.text.length);
    const textPart = runningDisplayText.substring(0, lengthToTake);
    
    renderedText.push(
      <span key={i} className={segment.className || ''}>
        {textPart}
      </span>
    );
    
    runningDisplayText = runningDisplayText.substring(lengthToTake);
    if (runningDisplayText.length === 0) break;
  }

  return (
    <span className="typewriter-text">
      {renderedText}
      {!isFinished && <span className="cursor">|</span>}
    </span>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [headerFinished, setHeaderFinished] = useState(false);
  const btnRefs = useRef([]);
  btnRefs.current = [];

  const addToBtnRefs = (el) => {
    if (el && !btnRefs.current.includes(el)) {
      btnRefs.current.push(el);
    }
  };

  const handleMagneticMove = (e, btn) => {
    const { left, top, width, height } = btn.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    btn.style.transform = `translate(${x * 0.3}deg, ${y * 0.3}deg) scale(1.05)`;
    // Using pixels for translation is better for magnetic feel
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
  };

  const resetMagnetic = (btn) => {
    btn.style.transform = `translate(0px, 0px) scale(1)`;
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar fade-up">
        <div className="container flex justify-between items-center">
          <div className="logo flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <span className="logo-text">Campus Nova</span>
          </div>
          <div className="nav-links flex items-center gap-8">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className={`hero-brand sequential-reveal ${headerFinished ? 'show' : ''}`}>
              <Sparkles className="brand-icon" size={32} />
              <span className="brand-name">Campus Nova</span>
            </div>
            
            <h1 className="hero-title">
              <Typewriter 
                segments={[
                  { text: 'Campus Nova – A Complete ' },
                  { text: 'Smart', className: 'gradient-glow' },
                  { text: ' Campus Ecosystem' }
                ]}
                speed={40} 
                onComplete={() => setHeaderFinished(true)}
              />
            </h1>
            
            <div className={`sequential-reveal ${headerFinished ? 'show' : ''}`} style={{ transitionDelay: '0.2s' }}>
              <p className="hero-subtitle">
                From attendance to food to complaints to community – everything in one app. 
                Efficiency meets simplicity for the modern student.
              </p>
                <div className="hero-btns">
                  <button 
                    ref={addToBtnRefs}
                    className="btn-primary btn-lg" 
                    onClick={() => navigate('/signup')}
                    onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)}
                    onMouseLeave={(e) => resetMagnetic(e.currentTarget)}
                  >
                    Get Started <ArrowRight size={20} />
                  </button>
                  <button 
                    ref={addToBtnRefs}
                    className="btn-secondary btn-lg" 
                    onClick={() => {
                      document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                    }}
                    onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)}
                    onMouseLeave={(e) => resetMagnetic(e.currentTarget)}
                  >
                    Explore Features
                  </button>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">One Platform, Endless Possibilities</h2>
          <div className="features-grid">
            {[
              { title: 'Smart Attendance', desc: 'Mark your presence with a single tap or QR code.', icon: <CheckCircle /> },
              { title: 'Mess Explorer', desc: 'Real-time menus and schedules for all campus mess halls.', icon: <Zap /> },
              { title: 'Notes Central', desc: 'Share and access study resources in seconds.', icon: <Globe /> },
              { title: 'Instant Help', desc: 'File complaints and track resolutions directly.', icon: <Shield /> },
            ].map((f, i) => (
              <div key={i} className="feature-card fade-up" style={{ animationDelay: `${0.2 * i}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
