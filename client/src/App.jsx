import React, { useState } from 'react';
import './index.css';

export default function App() {
  const [step, setStep] = useState(1);

  // Restart flow
  const handleReset = () => {
    setStep(1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
      {/* Dynamic styling loaded inline */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        .phone-container {
          width: 390px;
          height: 820px;
          background: #FDFBF7;
          border-radius: 3rem;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
          overflow-y: auto;
          position: relative;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          color: #1C1917;
        }

        .phone-container::-webkit-scrollbar {
          display: none;
        }

        .screen {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 2.2rem 1.8rem;
          box-sizing: border-box;
        }

        .title-serif {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 2.2rem;
          font-weight: 400;
          color: #366A4E;
          line-height: 1.15;
          margin: 0 0 0.75rem 0;
        }

        .subtitle {
          font-size: 0.95rem;
          color: #71717A;
          line-height: 1.5;
          margin: 0 auto 1.5rem auto;
          max-width: 280px;
          text-align: center;
        }

        .shield-logo-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #EFECE6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.5rem auto 1.5rem auto;
        }

        .shield-logo-icon {
          font-size: 2.2rem;
          color: #1C1917;
        }

        .welcome-card {
          background: #F8F5EE;
          border-radius: 1.75rem;
          padding: 2rem 1.5rem;
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .welcome-card-icon {
          font-size: 1.8rem;
          color: #366A4E;
          margin-bottom: 0.75rem;
        }

        .welcome-card-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.4rem;
          color: #1C1917;
          margin-bottom: 1.5rem;
        }

        .btn-green {
          width: 100%;
          background: #4A7C59;
          color: #FFFFFF !important;
          border: none;
          outline: none;
          border-radius: 1.25rem;
          padding: 1.1rem;
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .btn-green:hover {
          background: #3B6748;
        }

        .privacy-note {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          text-align: left;
          margin-top: 1.5rem;
          width: 100%;
        }

        .privacy-icon {
          color: #8C7853;
          font-size: 0.95rem;
          margin-top: 2px;
        }

        .privacy-title {
          font-weight: 600;
          font-size: 0.8rem;
          color: #1C1917;
          margin-bottom: 0.15rem;
        }

        .privacy-body {
          font-size: 0.75rem;
          color: #71717A;
          line-height: 1.4;
        }

        .alert-card {
          background: #FDFBF7;
          border-radius: 2rem;
          padding: 2.2rem 1.8rem;
          margin-top: auto;
          margin-bottom: auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          text-align: center;
          color: #1C1917;
        }

        .alert-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #D4443F;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }

        .alert-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.95rem;
          line-height: 1.2;
          color: #1C1917;
          margin: 0 0 1.5rem 0;
          font-weight: 400;
        }

        .alert-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.65rem;
          margin-bottom: 1.5rem;
        }

        .alert-metric-item {
          background: #F5F1E9;
          border-radius: 1.25rem;
          padding: 0.85rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .alert-metric-item.red-tint {
          background: #FDF0EE;
        }

        .alert-metric-icon {
          font-size: 1.1rem;
          margin-bottom: 0.4rem;
        }

        .alert-metric-item.red-tint .alert-metric-icon {
          color: #D4443F;
        }

        .alert-metric-val {
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 0.15rem;
        }

        .alert-metric-lbl {
          font-size: 0.7rem;
          color: #71717A;
        }

        .action-list-card {
          background: #F5F1E9;
          border-radius: 1.25rem;
          padding: 1.25rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .action-list-header {
          font-size: 0.78rem;
          font-weight: 700;
          color: #8C7853;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.88rem;
          line-height: 1.45;
          color: #52525B;
          margin-bottom: 0.75rem;
        }

        .action-item:last-child {
          margin-bottom: 0;
        }

        .action-item-bullet {
          color: #366A4E;
          font-size: 0.95rem;
          margin-top: 2px;
        }

        .success-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #DCEFE0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 3rem auto 2rem auto;
        }

        .success-icon {
          font-size: 2.5rem;
          color: #366A4E;
        }

        .success-list {
          background: #FFFFFF;
          border-radius: 1.5rem;
          padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .success-title-text {
          font-weight: 700;
          font-size: 0.9rem;
          color: #366A4E;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }

        .success-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #1C1917;
          margin-bottom: 0.85rem;
        }

        .success-item:last-child {
          margin-bottom: 0;
        }

        .success-item-check {
          color: #366A4E;
          font-size: 0.95rem;
        }

        .success-item-del {
          text-decoration: line-through;
          color: #A1A1AA;
        }
      `}</style>

      <div className="phone-container">
        {step === 1 && (
          <div className="screen animate-fade">
            <div className="shield-logo-wrap">
              <i className="fa-solid fa-shield-halved shield-logo-icon"></i>
            </div>
            
            <h1 className="title-serif" style={{ textAlign: 'center' }}>Ebb</h1>
            <p className="subtitle" style={{ fontWeight: 600, color: '#366A4E', marginBottom: '0.5rem' }}>
              A Daily Decision Engine for Knowledge Workers
            </p>
            <p className="subtitle" style={{ fontSize: '0.88rem', color: '#71717A', maxWidth: '250px' }}>
              Sync your schedule to automatically calibrate your daily focus boundaries.
            </p>
            
            <div className="welcome-card" style={{ marginTop: '0.5rem' }}>
              <i className="fa-regular fa-calendar welcome-card-icon"></i>
              <div className="welcome-card-title">Sync Your Calendar</div>
              
              <button className="btn-green" onClick={() => setStep(2)}>
                <i className="fa-regular fa-calendar"></i>
                Connect Google Calendar
              </button>
              
              <div className="privacy-note">
                <i className="fa-solid fa-lock privacy-icon"></i>
                <div>
                  <div className="privacy-title">Privacy First</div>
                  <div className="privacy-body">
                    Ebb only analyzes timing and attendee counts to gauge your energy load. We <strong>never</strong> read or store meeting titles, descriptions, or sensitive data.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="screen animate-fade">
            <div className="alert-card">
              <div className="alert-label">
                <i className="fa-solid fa-battery-quarter" style={{ transform: 'rotate(270deg)' }}></i> MORNING SHIELD
              </div>
              <h1 className="alert-title">Your energy is low this morning</h1>
              
              <div className="alert-metrics">
                <div className="alert-metric-item red-tint">
                  <i className="fa-solid fa-bolt alert-metric-icon"></i>
                  <div className="alert-metric-val">31%</div>
                  <div className="alert-metric-lbl">Energy</div>
                </div>
                <div className="alert-metric-item">
                  <i className="fa-regular fa-heart alert-metric-icon"></i>
                  <div className="alert-metric-val">24ms</div>
                  <div className="alert-metric-lbl">HRV</div>
                </div>
                <div className="alert-metric-item">
                  <i className="fa-regular fa-moon alert-metric-icon"></i>
                  <div className="alert-metric-val">5.2h</div>
                  <div className="alert-metric-lbl">Sleep</div>
                </div>
              </div>
              
              <div className="action-list-card">
                <div className="action-list-header">
                  <i className="fa-regular fa-lightbulb"></i> One recommendation
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.65rem' }}>
                  You have 6 meetings today.
                </div>
                <div style={{ fontSize: '0.85rem', color: '#52525B', marginBottom: '0.65rem', fontWeight: 600 }}>
                  Based on your energy:
                </div>
                <div className="action-item">
                  <i className="fa-regular fa-calendar-minus action-item-bullet"></i>
                  <span>Move roadmap planning to tomorrow.</span>
                </div>
                <div className="action-item">
                  <i className="fa-regular fa-circle-check action-item-bullet"></i>
                  <span>Protect 2-4 PM for focus work.</span>
                </div>
                <div className="action-item">
                  <i className="fa-regular fa-clock action-item-bullet"></i>
                  <span>Add a 30-minute recovery block after lunch.</span>
                </div>
              </div>
              
              <button className="btn-green" onClick={() => setStep(3)}>
                <i className="fa-solid fa-shield-halved"></i> Shield Me
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="screen animate-fade">
            <div className="success-icon-wrap">
              <i className="fa-solid fa-calendar-check success-icon"></i>
            </div>
            
            <h1 className="title-serif" style={{ textAlign: 'center' }}>Calendar Protected</h1>
            <p className="subtitle" style={{ maxWidth: '280px', marginBottom: '1.5rem' }}>
              Somatic boundaries applied. We successfully adjusted your agenda based on your morning readiness baseline.
            </p>
            
            <div className="success-list">
              <div className="success-title-text">Today's Schedule Mutations</div>
              <div className="success-item">
                <i className="fa-solid fa-check success-item-check"></i>
                <span className="success-item-del">Roadmap Planning (Moved to tomorrow)</span>
              </div>
              <div className="success-item">
                <i className="fa-solid fa-check success-item-check"></i>
                <span>Focus Block Protected (2:00 – 4:00 PM)</span>
              </div>
              <div className="success-item">
                <i className="fa-solid fa-check success-item-check"></i>
                <span>Recovery Decompression Block (12:30 PM)</span>
              </div>
            </div>
            
            <button className="btn-green" onClick={handleReset} style={{ marginTop: 'auto' }}>
              Reset Prototype <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
