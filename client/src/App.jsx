import React, { useState, useRef } from 'react';
import './index.css';

export default function App() {
  const [step, setStep] = useState(1);
  const [lastVisitedStep, setLastVisitedStep] = useState(6);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [wearable, setWearable] = useState('oura'); // 'oura', 'luna', 'apple'
  const [shieldOptions, setShieldOptions] = useState({
    meeting: true,
    workplace: false,
    focus: false
  });
  
  // Draft texts
  const [protectedDraft, setProtectedDraft] = useState(
    `"Hey team, just an update: I'm currently in a deep focus block. The architecture review draft is ready, but I'll be reviewing specs tomorrow. Let me know if anything is urgent."`
  );
  const [overriddenDraft, setOverriddenDraft] = useState(
    `"Hey team, just an update: I am operating at 31% energy today. I'm pushing through to complete the spec drafting at 2 PM, but responses will be delayed."`
  );

  const protectedDraftRef = useRef(null);
  const overriddenDraftRef = useRef(null);

  // Navigate step
  const handleGoToStep = (num) => {
    if (num === 6 || num === 7) {
      setLastVisitedStep(num);
    }
    setStep(num);
  };

  // Restart flow
  const handleReset = () => {
    setStep(1);
  };

  const toggleShieldOpt = (opt) => {
    setShieldOptions(prev => ({
      ...prev,
      [opt]: !prev[opt]
    }));
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
          height: 100%;
          overflow-y: auto;
        }
        
        .screen::-webkit-scrollbar {
          display: none;
        }

        .title-serif {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 2.25rem;
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
          margin: 2rem auto 1.5rem auto;
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

        .btn-green-link {
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

        .btn-green-link:hover {
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

        .back-btn {
          background: transparent;
          border: none;
          color: #366A4E;
          font-size: 1.2rem;
          cursor: pointer;
          align-self: flex-start;
          margin-bottom: 0.5rem;
        }

        .step-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 1.5rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #E4E4E7;
        }

        .dot.active {
          background: #4A7C59;
        }

        .step-pill {
          background: #F2ECE1;
          color: #8C7853;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 1rem;
          display: inline-block;
        }

        .toggle-tabs {
          display: flex;
          background: #EFECE6;
          padding: 0.25rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          border-radius: 0.85rem;
          padding: 0.6rem 0;
          font-weight: 600;
          color: #71717A;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: #FFFFFF;
          color: #1C1917;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .input-group {
          margin-bottom: 1.2rem;
          text-align: left;
          width: 100%;
        }

        .input-group label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #8C7853;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          display: block;
        }

        .input-group input {
          width: 100%;
          border: 1px solid #E4E4E7;
          background: #F8F5EE;
          border-radius: 1rem;
          padding: 0.9rem 1.1rem;
          font-size: 0.95rem;
          color: #1C1917;
          outline: none;
        }

        .choices-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          width: 100%;
        }

        .choice-card {
          background: #F8F5EE;
          border: 1px solid transparent;
          border-radius: 1.5rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .choice-card.selected {
          background: #EDF4EE;
          border: 1px solid #4A7C59;
        }

        .choice-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #EFECE6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .choice-card.selected .choice-icon-wrap {
          background: #DCEFE0;
        }

        .choice-details {
          flex: 1;
          text-align: left;
        }

        .choice-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #1C1917;
        }

        .choice-sub {
          font-size: 0.78rem;
          color: #71717A;
        }

        /* Lock Screen notification layout styles */
        .lockscreen-bg {
          background: linear-gradient(135deg, #182e22 0%, #0F0F10 100%);
          width: 100%;
          height: 100%;
          position: relative;
          padding: 2.2rem 1.5rem;
          display: flex;
          flex-direction: column;
          color: #FFFFFF;
        }
        .lockscreen-time-wrap {
          text-align: center;
          margin-top: 2rem;
          margin-bottom: 2rem;
        }
        .lockscreen-time {
          font-size: 3.5rem;
          font-weight: 300;
          letter-spacing: -0.02em;
          color: #FFFFFF;
        }
        .lockscreen-date {
          font-size: 0.95rem;
          font-weight: 500;
          color: #A1A1AA;
          letter-spacing: 0.05em;
          margin-top: 0.25rem;
        }
        .notification-banner {
          background: rgba(253, 251, 247, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.75rem;
          padding: 1.25rem;
          color: #1C1917;
          text-align: left;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          margin-top: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .notification-appname {
          font-size: 0.75rem;
          font-weight: 700;
          color: #8C7853;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .notification-time {
          font-size: 0.72rem;
          color: #71717A;
        }
        .notification-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.35rem;
          color: #1C1917;
          line-height: 1.2;
          margin-bottom: 0.6rem;
        }
        .notification-desc {
          font-size: 0.85rem;
          color: #52525B;
          line-height: 1.45;
          margin-bottom: 1.2rem;
        }

        /* Focus Protected / Timeline / Graph styles */
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .header-bar span {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.25rem;
          color: #366A4E;
          font-weight: 700;
        }
        .header-close {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          color: #71717A;
          cursor: pointer;
        }
        .round-shield-container {
          width: 90px;
          height: 90px;
          min-width: 90px;
          min-height: 90px;
          max-width: 90px;
          max-height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.5rem auto 1rem auto;
          flex-shrink: 0;
        }
        .cas-badge {
          background: #F2ECE1;
          color: #366A4E;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.4rem 0.9rem;
          border-radius: 2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin: 0.25rem auto 1.5rem auto;
        }
        .draft-card {
          background: #FDFBF7;
          border-radius: 1.5rem;
          padding: 1.25rem;
          text-align: left;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .draft-quote {
          font-size: 0.85rem;
          font-style: italic;
          line-height: 1.45;
          color: #52525B;
          margin: 0.6rem 0 1rem 0;
          width: 100%;
          border: none;
          background: transparent;
          resize: none;
          outline: none;
          font-family: inherit;
        }
        .draft-quote:focus {
          background: #F5F1E9;
          border-radius: 0.5rem;
          padding: 0.25rem;
        }
        .draft-btn-outline {
          width: 100%;
          border-radius: 1.25rem;
          padding: 0.9rem;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #EFECE6;
          background: #FDFBF7;
          color: #366A4E;
          cursor: pointer;
          margin-top: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .flow-card {
          background: #FDFBF7;
          border-radius: 1.75rem;
          padding: 1.5rem;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          text-align: left;
        }
        .timeline {
          position: relative;
          padding-left: 1.8rem;
          border-left: 1.5px solid #EFECE6;
          margin-top: 1.2rem;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-dot {
          position: absolute;
          left: -2.35rem;
          top: 0.25rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #E4E4E7;
          border: 2px solid #FDFBF7;
        }
        .timeline-dot.active {
          background: #4A7C59;
        }
        .timeline-time {
          font-size: 0.8rem;
          color: #71717A;
          margin-bottom: 0.15rem;
          font-weight: 500;
        }
        .timeline-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.08rem;
          color: #1C1917;
          font-weight: 700;
        }
        .timeline-title.crossed {
          text-decoration: line-through;
          color: #A1A1AA;
        }
        .timeline-sub {
          font-size: 0.78rem;
          color: #71717A;
        }
        .buffer-box {
          background: #EDF4EE;
          border-radius: 1.25rem;
          padding: 1rem;
          margin-top: 0.5rem;
        }
        .buffer-title {
          font-family: 'DM Serif Display', Georgia, serif;
          color: #366A4E;
          font-weight: 700;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .buffer-desc {
          font-size: 0.8rem;
          color: #52525B;
          line-height: 1.4;
          margin-top: 0.35rem;
          margin-bottom: 0.75rem;
        }
        .badge-pill {
          background: #FFFFFF;
          color: #4A7C59;
          font-weight: 700;
          font-size: 0.72rem;
          padding: 0.25rem 0.65rem;
          border-radius: 1rem;
          display: inline-block;
        }
        .see-review-link {
          display: block;
          text-align: center;
          color: #366A4E;
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: underline;
          margin: 1.5rem auto 0 auto;
          cursor: pointer;
        }
        .report-card {
          background: #FDFBF7;
          border-radius: 2rem;
          padding: 1.5rem;
          border: 1px solid rgba(0,0,0,0.04);
          margin-bottom: 1.25rem;
          text-align: left;
        }
        .report-subcard {
          background: #FDFBF7;
          border-radius: 1.5rem;
          padding: 1.2rem;
          border: 1px solid rgba(0,0,0,0.04);
        }
      `}</style>

      <div className="phone-container">
        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="screen animate-fade">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ color: '#366A4E', marginBottom: '0.5rem' }}>
                <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5"/>
                <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" strokeLinecap="round" fill="none" opacity="0.75"/>
                <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" strokeLinecap="round" fill="none"/>
              </svg>
              <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.8rem', color: '#366A4E', fontWeight: 700 }}>ebb</span>
            </div>
            
            <h1 className="title-serif" style={{ textAlign: 'center' }}>Welcome to Ebb</h1>
            <p className="subtitle" style={{ marginBottom: '1.8rem', maxWidth: '260px' }}>Let's start by understanding your natural rhythm.</p>
            
            <div className="welcome-card" style={{ marginTop: '0.5rem', width: '100%' }}>
              <i className="fa-regular fa-calendar welcome-card-icon"></i>
              <div className="welcome-card-title">Sync Your Calendar</div>
              
              <button className="btn-green-link" onClick={() => handleGoToStep(2)}>
                <i className="fa-regular fa-calendar-check"></i> Sign up with email or phone
              </button>
              
              <div className="privacy-note">
                <i className="fa-solid fa-lock privacy-icon"></i>
                <div>
                  <div className="privacy-title">Privacy First</div>
                  <div className="privacy-body">Ebb only analyzes timing and attendee counts to gauge your energy load. We <strong>never</strong> read or store meeting titles, descriptions, or sensitive data.</div>
                </div>
              </div>
            </div>

            <button style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', color: '#366A4E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', margin: '1.5rem auto 0 auto', cursor: 'pointer' }} onClick={() => handleGoToStep(5)}>
              <i className="fa-solid fa-table-cells-large"></i> Preview the dashboard
            </button>

            <div className="step-dots">
              <div className="dot active"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

        {/* Screen 2: Create Account */}
        {step === 2 && (
          <div className="screen animate-fade">
            <button className="back-btn" onClick={() => handleGoToStep(1)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ color: '#366A4E', marginBottom: '0.25rem' }}>
                <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" strokeLinecap="round" fill="none" opacity="0.5"/>
                <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" strokeLinecap="round" fill="none" opacity="0.75"/>
                <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" strokeLinecap="round" fill="none"/>
              </svg>
              <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.4rem', color: '#366A4E', fontWeight: 700 }}>ebb</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.2rem' }}>
              <span className="step-pill">STEP 1 OF 3</span>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Create your account</h1>
            <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Sign up with your email or phone to start protecting your focus.</p>

            <div className="toggle-tabs">
              <button className={`tab-btn ${authMethod === 'email' ? 'active' : ''}`} onClick={() => setAuthMethod('email')}>
                <i className="fa-regular fa-envelope"></i> Email
              </button>
              <button className={`tab-btn ${authMethod === 'phone' ? 'active' : ''}`} onClick={() => setAuthMethod('phone')}>
                <i className="fa-solid fa-phone"></i> Phone
              </button>
            </div>

            <div className="input-group">
              <label>{authMethod === 'email' ? 'Email' : 'Phone'}</label>
              <input 
                type={authMethod === 'email' ? 'email' : 'tel'} 
                defaultValue={authMethod === 'email' ? 'you@calm.com' : '+1 (555) 019-2834'} 
                key={authMethod}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" defaultValue="At least 6 characters" style={{ color: '#71717A' }} />
            </div>

            <button className="btn-green-link" onClick={() => handleGoToStep(3)} style={{ marginTop: '0.5rem' }}>
              Create account &nbsp;<i className="fa-solid fa-arrow-right"></i>
            </button>

            <div style={{ fontSize: '0.85rem', color: '#71717A', textAlign: 'center', marginTop: '1.5rem' }}>
              Already have an account? <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#366A4E', fontWeight: 600 }}>Sign in</span>
            </div>
          </div>
        )}

        {/* Screen 3: Connect Energy Source */}
        {step === 3 && (
          <div className="screen animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
              <button className="back-btn" onClick={() => handleGoToStep(2)} style={{ margin: 0, width: '32px', textAlign: 'left' }}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" style={{ color: '#366A4E' }}>
                  <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" />
                  <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75" />
                  <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </svg>
                <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.4rem', color: '#366A4E', fontWeight: 700 }}>ebb</span>
              </div>
              <div style={{ width: '32px' }}></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.2rem' }}>
              <span className="step-pill">STEP 2 OF 3</span>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2rem', color: '#1C1917', marginBottom: '0.5rem' }}>Connect Energy Source</h1>
            <p className="subtitle" style={{ marginBottom: '1.8rem' }}>Sync your wearable to automatically track your daily flow and recovery rhythms.</p>

            <div className="choices-list">
              <div className={`choice-card ${wearable === 'oura' ? 'selected' : ''}`} onClick={() => setWearable('oura')}>
                <div className="choice-icon-wrap">
                  <i className={wearable === 'oura' ? "fa-solid fa-circle-dot" : "fa-regular fa-circle"} style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Oura Ring</div>
                  <div className="choice-sub">Deep sleep & readiness insights</div>
                </div>
              </div>

              <div className={`choice-card ${wearable === 'luna' ? 'selected' : ''}`} onClick={() => setWearable('luna')}>
                <div className="choice-icon-wrap">
                  <i className={wearable === 'luna' ? "fa-solid fa-circle-dot" : "fa-regular fa-circle"} style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Luna Ring</div>
                  <div className="choice-sub">Holistic wellness tracking</div>
                </div>
              </div>

              <div className={`choice-card ${wearable === 'apple' ? 'selected' : ''}`} onClick={() => setWearable('apple')}>
                <div className="choice-icon-wrap">
                  <i className={wearable === 'apple' ? "fa-solid fa-heart" : "fa-regular fa-circle"} style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Apple Health</div>
                  <div className="choice-sub">Steps, activity & vital trends</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#8C7853', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>No wearable? Use the morning slider instead</span>
            </div>

            <button className="btn-green-link" onClick={() => handleGoToStep(4)}>
              Continue &nbsp;<i className="fa-solid fa-arrow-right"></i>
            </button>

            <div className="step-dots">
              <div className="dot"></div>
              <div className="dot active"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

        {/* Screen 4: Deepen Your Shield */}
        {step === 4 && (
          <div className="screen animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
              <button className="back-btn" onClick={() => handleGoToStep(3)} style={{ margin: 0, width: '32px', textAlign: 'left' }}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" style={{ color: '#366A4E' }}>
                  <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" />
                  <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75" />
                  <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </svg>
                <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.4rem', color: '#366A4E', fontWeight: 700 }}>ebb</span>
              </div>
              <div style={{ width: '32px' }}></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.2rem' }}>
              <span className="step-pill">STEP 3 OF 3</span>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2.1rem', color: '#366A4E', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Deepen Your Shield</h1>
            <p className="subtitle" style={{ marginBottom: '1.8rem', maxWidth: '290px' }}>Connect optional sources to measure cognitive load with higher accuracy. Everything is processed locally.</p>

            <div className="choices-list">
              <div className={`choice-card ${shieldOptions.meeting ? 'selected' : ''}`} onClick={() => toggleShieldOpt('meeting')}>
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-file-lines" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Meeting Insights</div>
                  <div className="choice-sub">Identify urgent work in transcripts (e.g. Tactiq)</div>
                </div>
                <i className={shieldOptions.meeting ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} style={{ color: shieldOptions.meeting ? '#366A4E' : '#D1D1D6', fontSize: '1.2rem' }}></i>
              </div>

              <div className={`choice-card ${shieldOptions.workplace ? 'selected' : ''}`} onClick={() => toggleShieldOpt('workplace')}>
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-comment" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Workplace Context</div>
                  <div className="choice-sub">Detect urgent pings via Slack or Teams (MCP)</div>
                </div>
                <i className={shieldOptions.workplace ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} style={{ color: shieldOptions.workplace ? '#366A4E' : '#D1D1D6', fontSize: '1.2rem' }}></i>
              </div>

              <div className={`choice-card ${shieldOptions.focus ? 'selected' : ''}`} onClick={() => toggleShieldOpt('focus')}>
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-clock" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Focus Data</div>
                  <div className="choice-sub">Measure cognitive load via Screen Time (MCP)</div>
                </div>
                <i className={shieldOptions.focus ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} style={{ color: shieldOptions.focus ? '#366A4E' : '#D1D1D6', fontSize: '1.2rem' }}></i>
              </div>
            </div>

            <button className="btn-green-link" onClick={() => handleGoToStep(5)} style={{ marginTop: '1.5rem' }}>
              Continue
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#71717A', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleGoToStep(5)}>Skip for now</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#8C7853', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 'auto' }}>
              <i className="fa-solid fa-lock"></i> Local-first & private
            </div>

            <div className="step-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot active"></div>
            </div>
          </div>
        )}

        {/* Screen 5: Morning Shield Propose (Renders like lockscreen overlay) */}
        {step === 5 && (
          <div className="screen animate-fade" style={{ padding: 0 }}>
            <div className="lockscreen-bg">
              <button className="back-btn" onClick={() => handleGoToStep(4)} style={{ color: '#FFFFFF', marginBottom: 0, zIndex: 10 }}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              
              <div className="lockscreen-time-wrap">
                <div className="lockscreen-time">08:30</div>
                <div className="lockscreen-date">Monday, May 31</div>
              </div>

              <div className="notification-banner">
                <div className="notification-header">
                  <span className="notification-appname">
                    <svg width="14" height="14" viewBox="0 0 40 40" fill="none" style={{ color: '#366A4E', marginRight: '0.1rem' }}>
                      <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                      <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                      <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="3" strokeLinecap="round" fill="none"/>
                    </svg>
                    EBB ALERT
                  </span>
                  <span className="notification-time">now</span>
                </div>

                <div className="notification-title">Your energy is low today</div>
                <div className="notification-desc">
                  Somatic recovery is low (24ms HRV). You have a locked 10:00 AM Architecture Review. Protect your energy?
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button className="btn-green-link" onClick={() => handleGoToStep(6)} style={{ padding: '0.9rem', borderRadius: '0.9rem' }}>
                    <i className="fa-solid fa-shield-halved"></i> Yes, Shield Me
                  </button>
                  <button onClick={() => handleGoToStep(7)} style={{ width: '100%', borderRadius: '0.9rem', padding: '0.9rem', fontWeight: 600, fontSize: '0.95rem', border: 'none', background: '#EFECE6', color: '#8C7853', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-bolt"></i> Push Through
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 6: State Protected (Focus Protected) */}
        {step === 6 && (
          <div className="screen animate-fade" style={{ padding: '1.8rem 1.4rem' }}>
            <div className="header-bar">
              <button className="back-btn" onClick={() => handleGoToStep(5)} style={{ margin: 0 }}><i className="fa-solid fa-arrow-left"></i></button>
              <span>State Protected</span>
              <button className="header-close" onClick={handleReset}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="round-shield-container" style={{ background: '#DCEFE0' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '2.8rem', color: '#366A4E' }}></i>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2rem', color: '#1C1917', marginBottom: '0.4rem' }}>Focus Protected</h1>
            <p style={{ fontSize: '0.9rem', color: '#71717A', textAlign: 'center', marginBottom: '1rem', maxWidth: '320px' }}>Your timeline has been adjusted to preserve your cognitive load.</p>

            <div className="cas-badge">
              <span>CAS Score</span> <strong>79%</strong> <i className="fa-solid fa-arrow-trend-up"></i>
            </div>

            {/* Draft Card */}
            <div className="draft-card" style={{ borderLeft: '4px solid #EC4899' }}>
              <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.15rem', color: '#1C1917', fontWeight: 700 }}>Draft created for #product</div>
              
              <textarea 
                ref={protectedDraftRef}
                className="draft-quote" 
                rows="4" 
                value={protectedDraft}
                onChange={(e) => setProtectedDraft(e.target.value)}
              />
              
              <button className="btn-green-link" style={{ padding: '0.8rem', fontSize: '0.88rem' }} onClick={() => alert('Notification sent!')}>
                <i className="fa-regular fa-paper-plane"></i> Send Now
              </button>
              <button className="draft-btn-outline" onClick={() => protectedDraftRef.current?.focus()}>
                <i className="fa-regular fa-edit"></i> Edit Draft
              </button>
            </div>

            {/* Flow Card */}
            <div className="flow-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.2rem', color: '#1C1917', fontWeight: 700 }}>Updated Flow</span>
                <span style={{ background: '#EFECE6', color: '#71717A', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '1rem', letterSpacing: '0.05em' }}>TODAY</span>
              </div>

              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-time">10:00</div>
                  <div className="timeline-title crossed">Architecture Review</div>
                  <div className="timeline-sub"><i className="fa-solid fa-lock" style={{ fontSize: '0.75rem', color: '#71717A', marginRight: '0.2rem' }}></i> Locked by protocol</div>
                </div>

                <div className="timeline-item" style={{ marginBottom: '1rem' }}>
                  <div className="timeline-dot active"></div>
                  <div className="buffer-box">
                    <div className="buffer-title">
                      <i className="fa-solid fa-feather-pointed"></i> Zero-Stimulus Buffer
                    </div>
                    <div className="buffer-desc">Reclaiming cognitive capacity. All non-essential notifications silenced.</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#366A4E' }}>11:00 – 13:00</strong>
                      <span className="badge-pill">Active</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-time">14:00</div>
                  <div className="timeline-title crossed">Spec Drafting</div>
                  <div style={{ background: '#F2ECE1', color: '#8C7853', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '0.5rem', display: 'inline-block', marginTop: '0.25rem' }}>
                    <i className="fa-solid fa-arrow-trend-up"></i> Moved to Tomorrow, 09:00
                  </div>
                </div>
              </div>
            </div>

            <span className="see-review-link" onClick={() => handleGoToStep(8)}>See this month's review &nbsp;<i className="fa-solid fa-arrow-right"></i></span>
          </div>
        )}

        {/* Screen 7: State Overridden (Push Through) */}
        {step === 7 && (
          <div className="screen animate-fade" style={{ padding: '1.8rem 1.4rem' }}>
            <div className="header-bar">
              <button className="back-btn" onClick={() => handleGoToStep(5)} style={{ margin: 0 }}><i className="fa-solid fa-arrow-left"></i></button>
              <span>State Overridden</span>
              <button className="header-close" onClick={handleReset}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="round-shield-container" style={{ background: '#FDF0EE' }}>
              <i className="fa-solid fa-bolt" style={{ fontSize: '2.8rem', color: '#D4443F' }}></i>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2rem', color: '#1C1917', marginBottom: '0.4rem' }}>Pushing Through</h1>
            <p style={{ fontSize: '0.9rem', color: '#71717A', textAlign: 'center', marginBottom: '1rem', maxWidth: '320px' }}>Timeline kept. Be mindful of your battery limit as you execute today's schedule.</p>

            <div className="cas-badge" style={{ background: '#FDF0EE', color: '#D4443F' }}>
              <span>CAS Score</span> <strong>55%</strong> <i className="fa-solid fa-arrow-trend-down"></i>
            </div>

            {/* Flow Card */}
            <div className="flow-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.2rem', color: '#1C1917', fontWeight: 700 }}>Active Flow</span>
                <span style={{ background: '#FDF0EE', color: '#D4443F', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '1rem', letterSpacing: '0.05em' }}>TODAY</span>
              </div>

              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-time">10:00</div>
                  <div className="timeline-title crossed">Architecture Review</div>
                  <div className="timeline-sub"><i className="fa-solid fa-lock" style={{ fontSize: '0.75rem', color: '#71717A', marginRight: '0.2rem' }}></i> Locked by protocol</div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot active" style={{ background: '#D4443F' }}></div>
                  <div className="timeline-time">14:00</div>
                  <div className="timeline-title">Spec Drafting</div>
                  <div style={{ background: '#FDF0EE', color: '#D4443F', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '0.5rem', display: 'inline-block', marginTop: '0.25rem' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> High Cognitive Demand (31% Energy)
                  </div>
                </div>
              </div>
            </div>

            <span className="see-review-link" onClick={() => handleGoToStep(8)}>See this month's review &nbsp;<i className="fa-solid fa-arrow-right"></i></span>
          </div>
        )}

        {/* Screen 8: May Review */}
        {step === 8 && (
          <div className="screen animate-fade" style={{ padding: '1.8rem 1.4rem' }}>
            <button className="back-btn" onClick={() => handleGoToStep(lastVisitedStep)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#8C7853', letterSpacing: '0.05em', transform: 'uppercase', marginBottom: '0.5rem' }}>
              <i className="fa-regular fa-calendar"></i> MAY REVIEW
            </div>

            <h1 className="title-serif" style={{ fontSize: '2.2rem', color: '#366A4E', lineHeight: 1.2, marginBottom: '1.5rem', textAlign: 'left' }}>You found your rhythm this month.</h1>

            {/* Score Graph Card */}
            <div className="report-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#71717A', marginBottom: '0.25rem', fontWeight: 500 }}>Cognitive Alignment Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.2rem' }}>
                <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '2.2rem', color: '#366A4E', fontWeight: 700 }}>78%</span>
                <span style={{ fontSize: '0.9rem', color: '#366A4E', fontWeight: 700 }}><i className="fa-solid fa-arrow-up"></i> 17 pts</span>
              </div>

              {/* SVG line graph */}
              <div style={{ width: '100%', height: '120px', position: 'relative', marginBottom: '0.5rem' }}>
                <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%' }}>
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#F5F1E9" strokeDasharray="4" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#F5F1E9" strokeDasharray="4" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="#F5F1E9" stroke-dasharray="4" />
                  
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#366A4E" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#366A4E" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 80 Q 75 75 150 45 T 300 20 L 300 100 L 0 100 Z" fill="url(#grad)" />
                  
                  <path d="M 0 80 Q 75 75 150 45 T 300 20" fill="none" stroke="#366A4E" strokeWidth="2.5" strokeLinecap="round" />
                  
                  <circle cx="0" cy="80" r="4" fill="#366A4E" />
                  <circle cx="300" cy="20" r="4" fill="#366A4E" />
                  
                  <text x="5" y="93" fontSize="7" fill="#A1A1AA" fontFamily="sans-serif">61%</text>
                  <text x="282" y="13" fontSize="7" fill="#366A4E" fontWeight="700" fontFamily="sans-serif">78%</text>
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600 }}>
                <span>May 1</span>
                <span>May 15</span>
                <span>May 31</span>
              </div>
            </div>

            {/* Approvals & Overrides row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div className="report-subcard" style={{ background: '#DCEFE0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#366A4E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <i className="fa-regular fa-shield-halved" style={{ color: '#FFFFFF', fontSize: '0.95rem' }}></i>
                </div>
                <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.8rem', color: '#1C1917', lineHeight: 1, marginBottom: '0.25rem' }}>23</div>
                <div style={{ fontSize: '0.8rem', color: '#52525B' }}>Shields approved</div>
              </div>

              <div className="report-subcard" style={{ background: '#F5ECE0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8C7853', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <i className="fa-solid fa-bolt" style={{ color: '#FFFFFF', fontSize: '0.95rem' }}></i>
                </div>
                <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.8rem', color: '#1C1917', lineHeight: 1, marginBottom: '0.25rem' }}>4</div>
                <div style={{ fontSize: '0.8rem', color: '#52525B' }}>Overrides required</div>
              </div>
            </div>

            {/* Insight card */}
            <div style={{ background: '#F8F5EE', borderRadius: '1.5rem', padding: '1.25rem', display: 'flex', gap: '0.85rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F2ECE1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-regular fa-lightbulb" style={{ fontSize: '1.1rem', color: '#71717A' }}></i>
              </div>
              <div style={{ color: '#1C1917' }}>
                <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.05rem', marginBottom: '0.35rem', fontWeight: 700 }}>Key Insight</div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#52525B' }}>Your best weeks had <strong>4+ morning shields accepted</strong>. Establishing boundaries early seems to set a positive tone for your day.</div>
              </div>
            </div>

            <button className="btn-green-link" onClick={handleReset} style={{ marginTop: 'auto' }}>
              Start June &nbsp;<i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
