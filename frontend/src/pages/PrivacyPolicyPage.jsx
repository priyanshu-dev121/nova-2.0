import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import './LegalPage.css';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <button className="legal-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: April 13, 2026</p>
        </header>

        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>
            Campus Nova collects minimal information necessary to provide our smart campus services. This includes:
          </p>
          <ul>
            <li>Academic Email Address for authentication.</li>
            <li>Profile information (Name, Role).</li>
            <li>Usage data related to attendance, notes, and canteen services.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Your Data</h2>
          <p>
            Your data is used exclusively to:
          </p>
          <ul>
            <li>Maintain accurate academic records (e.g., Attendance).</li>
            <li>Facilitate peer-to-peer marketplaces and campus events.</li>
            <li>Improve the user experience and security of the platform.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Data Security</h2>
          <p>
            We implement industry-standard security measures, including OTP-based authentication and encrypted data storage, to ensure your information remains secure within the campus ecosystem.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <strong>Email:</strong> campusnova1@gmail.com
            <br />
            <strong>Phone:</strong> +91 9458128469
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
