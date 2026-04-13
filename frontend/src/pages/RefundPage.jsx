import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import './LegalPage.css';

const RefundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <button className="legal-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <header className="legal-header">
          <h1>Refund Policy</h1>
          <p className="last-updated">Last Updated: April 13, 2026</p>
        </header>

        <section className="legal-section">
          <h2>1. Canteen and Events</h2>
          <p>
            Refunds for pre-ordered canteen meals or paid campus events can be requested up to 12 hours before the scheduled time. 
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Marketplace Transactions</h2>
          <p>
            Campus Nova facilitates peer-to-peer trading but does not process payments directly. Disputes regarding marketplace items should be settled between the buyer and seller. We recommend inspecting items before completing any transaction.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Membership or Subscriptions</h2>
          <p>
            If Campus Nova introduces paid premium features, refund requests for subscriptions will be handled within 7 days of purchase, provided the features have not been extensively used.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Processing Time</h2>
          <p>
            Approved refunds will be processed back to the original payment method within 5-7 business days.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPage;
