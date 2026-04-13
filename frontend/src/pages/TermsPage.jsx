import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import './LegalPage.css';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <button className="legal-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <header className="legal-header">
          <h1>Terms & Conditions</h1>
          <p className="last-updated">Last Updated: April 13, 2026</p>
        </header>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Campus Nova, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. User Conduct</h2>
          <p>
            Users are expected to maintain professional conduct within the campus ecosystem. Prohibited activities include:
          </p>
          <ul>
            <li>Providing false information for attendance or registration.</li>
            <li>Harassment or inappropriate behavior in the marketplace or events.</li>
            <li>Unauthorized access or modification of campus records.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Service Availability</h2>
          <p>
            While we strive for 100% uptime, Campus Nova services are provided "as is". We reserve the right to modify or discontinue services for maintenance or updates without prior notice.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Limitation of Liability</h2>
          <p>
            Campus Nova is a tool to facilitate campus management. We are not liable for any disputes arising from peer-to-peer transactions in the marketplace or academic discrepancies not caused by system errors.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
