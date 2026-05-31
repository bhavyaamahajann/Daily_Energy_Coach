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
              
              <button className="btn-green-link" onClick={() => setStep(2)}>
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

            <button style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', color: '#366A4E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', margin: '1.5rem auto 0 auto', cursor: 'pointer' }} onClick={() => setStep(5)}>
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
            <button className="back-btn" onClick={() => setStep(1)}>
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

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Create your account</h1>
            <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Sign up with your email or phone to start protecting your focus.</p>

            <div className="toggle-tabs">
              <button className="tab-btn active">
                <i className="fa-regular fa-envelope"></i> Email
              </button>
              <button className="tab-btn">
                <i className="fa-solid fa-phone"></i> Phone
              </button>
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" defaultValue="you@calm.com" />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" defaultValue="At least 6 characters" style={{ color: '#71717A' }} />
            </div>

            <button className="btn-green-link" onClick={() => setStep(3)} style={{ marginTop: '0.5rem' }}>
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
            <button className="back-btn" onClick={() => setStep(2)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.25rem', color: '#366A4E', textAlign: 'center', marginTop: '0.5rem', fontWeight: 700 }}>Ebb</div>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.2rem' }}>
              <span className="step-pill">STEP 2 OF 3</span>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2rem', color: '#1C1917', marginBottom: '0.5rem' }}>Connect Energy Source</h1>
            <p className="subtitle" style={{ marginBottom: '1.8rem' }}>Sync your wearable to automatically track your daily flow and recovery rhythms.</p>

            <div className="choices-list">
              <div className="choice-card selected">
                <div className="choice-icon-wrap">
                  <i className="fa-solid fa-circle-dot" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Oura Ring</div>
                  <div className="choice-sub">Deep sleep & readiness insights</div>
                </div>
              </div>

              <div className="choice-card">
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-circle" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Luna Ring</div>
                  <div className="choice-sub">Holistic wellness tracking</div>
                </div>
              </div>

              <div className="choice-card">
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-heart" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
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

            <button className="btn-green-link" onClick={() => setStep(4)}>
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
            <button className="back-btn" onClick={() => setStep(3)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="shield-logo-wrap" style={{ background: '#EFECE6', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <i className="fa-regular fa-shield-halved" style={{ fontSize: '2.2rem', color: '#1C1917' }}></i>
            </div>

            <h1 className="title-serif" style={{ textAlign: 'center', fontSize: '2.1rem', color: '#366A4E', marginBottom: '0.5rem' }}>Deepen Your Shield</h1>
            <p className="subtitle" style={{ marginBottom: '1.8rem', maxWidth: '290px' }}>Connect optional sources to measure cognitive load with higher accuracy. Everything is processed locally.</p>

            <div className="choices-list">
              <div className="choice-card selected">
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-file-lines" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Meeting Insights</div>
                  <div className="choice-sub">Identify urgent work in transcripts (e.g. Tactiq)</div>
                </div>
                <i className="fa-solid fa-circle-check" style={{ color: '#366A4E', fontSize: '1.2rem' }}></i>
              </div>

              <div className="choice-card">
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-comment" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Workplace Context</div>
                  <div className="choice-sub">Detect urgent pings via Slack or Teams (MCP)</div>
                </div>
                <i className="fa-regular fa-circle" style={{ color: '#D1D1D6', fontSize: '1.2rem' }}></i>
              </div>

              <div className="choice-card">
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-clock" style={{ fontSize: '1.1rem', color: '#366A4E' }}></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Focus Data</div>
                  <div className="choice-sub">Measure cognitive load via Screen Time (MCP)</div>
                </div>
                <i className="fa-regular fa-circle" style={{ color: '#D1D1D6', fontSize: '1.2rem' }}></i>
              </div>
            </div>

            <button className="btn-green-link" onClick={() => setStep(5)} style={{ marginTop: '1.5rem' }}>
              Continue
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#71717A', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }} onClick={() => setStep(5)}>Skip for now</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#8C7853', letterSpacing: '0.05em', transform: 'uppercase', marginTop: 'auto' }}>
              <i className="fa-solid fa-lock"></i> Local-first & private
            </div>

            <div className="step-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot active"></div>
            </div>
          </div>
        )}

        {/* Screen 5: Morning Shield Propose */}
        {step === 5 && (
          <div className="screen animate-fade">
            <button className="back-btn" onClick={() => setStep(4)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="alert-card" style={{ width: '100%', border: 'none', boxShadow: 'none', padding: 0, background: 'transparent' }}>
              <div className="alert-label" style={{ marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-battery-quarter" style={{ transform: 'rotate(270deg)', color: '#D4443F', fontSize: '1rem' }}></i>
                <span style={{ color: '#52525B', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>MORNING SHIELD</span>
              </div>
              
              <h1 className="alert-title" style={{ fontSize: '2.2rem', textAlign: 'left', color: '#1C1917', marginBottom: '1.5rem' }}>Your energy is low this morning</h1>
              
              <div className="alert-metrics">
                <div className="alert-metric-item red-tint" style={{ border: '1px solid rgba(212,68,63,0.1)' }}>
                  <i className="fa-solid fa-battery-quarter alert-metric-icon" style={{ transform: 'rotate(270deg)', color: '#D4443F' }}></i>
                  <div className="alert-metric-val" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1C1917' }}>31<span style={{ fontSize: '0.75rem', fontWeight: 600 }}>%</span></div>
                  <div className="alert-metric-lbl">Energy</div>
                </div>
                <div className="alert-metric-item">
                  <i className="fa-regular fa-heart alert-metric-icon" style={{ color: '#71717A' }}></i>
                  <div className="alert-metric-val" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1C1917' }}>24<span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ms</span></div>
                  <div className="alert-metric-lbl">HRV</div>
                </div>
                <div className="alert-metric-item">
                  <i className="fa-regular fa-moon alert-metric-icon" style={{ color: '#8C7853' }}></i>
                  <div className="alert-metric-val" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1C1917' }}>5.2<span style={{ fontSize: '0.75rem', fontWeight: 600 }}>h</span></div>
                  <div className="alert-metric-lbl">Sleep</div>
                </div>
              </div>

              <div className="action-list-card" style={{ background: '#F8F5EE', padding: '1.5rem', borderRadius: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8C7853', letterSpacing: '0.05em', transform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-regular fa-calendar-plus" style={{ fontSize: '0.95rem' }}></i> PROPOSED ACTION
                </div>
                <div style={{ fontSize: '0.98rem', lineHeight: 1.5, color: '#1C1917' }}>
                  Moving <strong>Spec Drafting</strong> to tomorrow at <strong>9:00 AM</strong> when your readiness is predicted to be higher.
                </div>
              </div>

              <button className="btn-green-link" onClick={() => setStep(6)}>
                <i className="fa-regular fa-shield-halved"></i> Yes, Shield Me
              </button>

              <button onClick={() => setStep(6)} style={{ width: '100%', borderRadius: '1.25rem', padding: '1.1rem', fontWeight: 600, fontSize: '0.95rem', border: 'none', background: '#F5F1E9', color: '#8C7853', marginTop: '0.85rem', cursor: 'pointer' }}>
                Push Through
              </button>
            </div>
          </div>
        )}

        {/* Screen 6: Success */}
        {step === 6 && (
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
                <span className="success-item-del">Spec Drafting (Moved to tomorrow)</span>
              </div>
            </div>
            
            <button className="btn-green-link" onClick={handleReset} style={{ marginTop: 'auto' }}>
              Reset Prototype <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
