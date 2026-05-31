import React, { useState } from 'react';
import './index.css';

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState(null);
  const [meetingInsights, setMeetingInsights] = useState(false);
  const [workplaceContext, setWorkplaceContext] = useState(false);
  const [focusData, setFocusData] = useState(false);

  // Restart flow
  const handleReset = () => {
    setStep(1);
    setSelectedSource(null);
    setMeetingInsights(false);
    setWorkplaceContext(false);
    setFocusData(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F10', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
      {/* Dynamic styling loaded inline */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        .phone-container {
          width: 390px;
          height: 820px;
          background: #FDFBF7;
          border-radius: 3rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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

        .dots-container {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          margin-top: auto;
          padding-top: 1.5rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #E4E4E7;
          cursor: pointer;
        }

        .dot.active {
          background: #4A7C59;
        }

        .step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .back-btn {
          color: #366A4E;
          font-size: 1.2rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .step-header-title {
          font-weight: 600;
          font-size: 1.15rem;
          color: #366A4E;
        }

        .step-pill {
          background: #F2ECE1;
          color: #8C7853;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 1rem;
          margin-bottom: 1rem;
          display: inline-block;
        }

        .choices-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          width: 100%;
        }

        .choice-card {
          background: #F5EFE6;
          border: 2px solid transparent;
          border-radius: 1.5rem;
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          color: #1C1917;
          text-align: left;
          transition: all 0.2s ease;
        }

        .choice-card.selected {
          border-color: #4A7C59;
          background: #EDF4EE;
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

        .choice-icon {
          font-size: 1.1rem;
          color: #366A4E;
        }

        .choice-details {
          flex: 1;
        }

        .choice-title {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 0.15rem;
        }

        .choice-sub {
          font-size: 0.78rem;
          color: #71717A;
        }

        .choice-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #D1D1D6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .choice-card.selected .choice-checkbox {
          border-color: #4A7C59;
          background: #4A7C59;
        }

        .choice-checkbox-inner {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: transparent;
        }

        .choice-card.selected .choice-checkbox-inner {
          background: #FFFFFF;
        }

        .slider-fallback-btn {
          display: block;
          margin: 1.5rem auto 1.5rem auto;
          font-size: 0.85rem;
          color: #8C7853;
          font-weight: 600;
          text-decoration: underline;
          text-align: center;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .btn-disabled {
          width: 100%;
          background: #EFECE6;
          color: #A1A1AA;
          border-radius: 1.25rem;
          padding: 1.1rem;
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          text-align: center;
        }

        .skip-btn {
          display: block;
          margin: 1rem auto 0 auto;
          font-size: 0.85rem;
          color: #71717A;
          text-decoration: underline;
          font-weight: 600;
          text-align: center;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .local-private-badge {
          margin-top: 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #8C7853;
          letter-spacing: 0.05em;
          justify-content: center;
          width: 100%;
        }

        .dark-phone {
          background: #18181B !important;
        }

        .alert-card {
          background: #FDFBF7;
          border-radius: 2rem;
          padding: 2.2rem 1.8rem;
          margin-top: auto;
          margin-bottom: auto;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
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

        .btn-white-outline {
          width: 100%;
          background: transparent;
          color: #8C7853 !important;
          border: 1.5px solid #EFECE6;
          border-radius: 1.25rem;
          padding: 1.1rem;
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          margin-top: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-white-outline:hover {
          background: #F5F1E9;
        }

        .review-header {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #8C7853;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .cas-chart-card {
          background: #FFFFFF;
          border-radius: 1.75rem;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          margin-bottom: 1rem;
          text-align: left;
        }

        .cas-card-lbl {
          font-size: 0.85rem;
          color: #71717A;
          margin-bottom: 0.25rem;
        }

        .cas-card-val-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }

        .cas-card-val {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 2.2rem;
          color: #366A4E;
        }

        .cas-card-pts {
          font-size: 0.9rem;
          color: #8C7853;
          font-weight: 600;
        }

        .review-metrics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 1rem;
          text-align: left;
        }

        .review-metric-card {
          border-radius: 1.5rem;
          padding: 1.25rem;
        }

        .review-card-green {
          background: #DCEFE0;
        }

        .review-card-tan {
          background: #F5ECE0;
        }

        .review-card-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .review-card-green .review-card-icon-wrap {
          background: #2C5E43;
        }

        .review-card-tan .review-card-icon-wrap {
          background: #7B6843;
        }

        .review-card-icon {
          color: #FFFFFF;
          font-size: 0.95rem;
        }

        .review-card-val {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.8rem;
          color: #1C1917;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .review-card-lbl {
          font-size: 0.8rem;
          color: #52525B;
        }

        .insight-card {
          background: #F8F5EE;
          border-radius: 1.5rem;
          padding: 1.25rem;
          display: flex;
          gap: 0.85rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .insight-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #F2ECE1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .insight-icon {
          font-size: 1.05rem;
          color: #71717A;
        }

        .insight-details {
          color: #1C1917;
        }

        .insight-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.05rem;
          margin-bottom: 0.35rem;
          font-weight: 700;
        }

        .insight-desc {
          font-size: 0.82rem;
          line-height: 1.45;
          color: #52525B;
        }

        .insight-desc strong {
          font-weight: 700;
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

      <div className={step === 4 ? "phone-container dark-phone" : "phone-container"}>
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
          <div className="screen">
            <div className="step-header">
              <button className="back-btn" onClick={() => setStep(1)}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <span className="step-header-title">Ebb</span>
              <div style={{ width: '20px' }}></div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <span className="step-pill">Step 2 of 3</span>
              <h1 className="title-serif">Connect Energy Source</h1>
              <p className="subtitle">Sync your wearable to automatically track your daily flow and recovery rhythms.</p>
            </div>
            
            <div className="choices-list">
              <div 
                className={`choice-card ${selectedSource === 'oura' ? 'selected' : ''}`}
                onClick={() => setSelectedSource('oura')}
              >
                <div className="choice-icon-wrap">
                  <i className="fa-solid fa-circle-dot choice-icon"></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Oura Ring</div>
                  <div className="choice-sub">Deep sleep & readiness insights</div>
                </div>
                <div className="choice-checkbox"><div className="choice-checkbox-inner"></div></div>
              </div>
              
              <div 
                className={`choice-card ${selectedSource === 'luna' ? 'selected' : ''}`}
                onClick={() => setSelectedSource('luna')}
              >
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-circle choice-icon"></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Luna Ring</div>
                  <div className="choice-sub">Holistic wellness tracking</div>
                </div>
                <div className="choice-checkbox"><div className="choice-checkbox-inner"></div></div>
              </div>
              
              <div 
                className={`choice-card ${selectedSource === 'apple' ? 'selected' : ''}`}
                onClick={() => setSelectedSource('apple')}
              >
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-heart choice-icon"></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Apple Health</div>
                  <div className="choice-sub">Steps, activity & vital trends</div>
                </div>
                <div className="choice-checkbox"><div className="choice-checkbox-inner"></div></div>
              </div>
            </div>
            
            <button className="slider-fallback-btn" onClick={() => setSelectedSource('slider')}>
              No wearable? Use the morning slider instead
            </button>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              {selectedSource ? (
                <button className="btn-green" onClick={() => setStep(3)}>
                  Continue <i className="fa-solid fa-arrow-right"></i>
                </button>
              ) : (
                <div className="btn-disabled">
                  Continue <i className="fa-solid fa-arrow-right"></i>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="screen">
            <div className="shield-logo-wrap" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-shield-halved shield-logo-icon"></i>
            </div>
            
            <h1 className="title-serif" style={{ textAlign: 'center' }}>Deepen Your Shield</h1>
            <p className="subtitle">
              Connect optional sources to measure cognitive load with higher accuracy. Everything is processed locally.
            </p>
            
            <div className="choices-list">
              <div 
                className={`choice-card ${meetingInsights ? 'selected' : ''}`}
                onClick={() => setMeetingInsights(!meetingInsights)}
              >
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-file-lines choice-icon"></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Meeting Insights</div>
                  <div className="choice-sub">Identify urgent work in transcripts (e.g. Tactiq)</div>
                </div>
                <div className="choice-checkbox"><div className="choice-checkbox-inner"></div></div>
              </div>
              
              <div 
                className={`choice-card ${workplaceContext ? 'selected' : ''}`}
                onClick={() => setWorkplaceContext(!workplaceContext)}
              >
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-comment-dots choice-icon"></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Workplace Context</div>
                  <div className="choice-sub">Detect urgent pings via Slack or Teams (MCP)</div>
                </div>
                <div className="choice-checkbox"><div className="choice-checkbox-inner"></div></div>
              </div>
              
              <div 
                className={`choice-card ${focusData ? 'selected' : ''}`}
                onClick={() => setFocusData(!focusData)}
              >
                <div className="choice-icon-wrap">
                  <i className="fa-regular fa-clock choice-icon"></i>
                </div>
                <div className="choice-details">
                  <div className="choice-title">Focus Data</div>
                  <div className="choice-sub">Measure cognitive load via Screen Time (MCP)</div>
                </div>
                <div className="choice-checkbox"><div className="choice-checkbox-inner"></div></div>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', textAlign: 'center' }}>
              <button className="btn-green" onClick={() => setStep(4)}>
                Continue
              </button>
              <button className="skip-btn" onClick={() => setStep(4)}>
                Skip for now
              </button>
              <div className="local-private-badge">
                <i className="fa-solid fa-lock"></i> LOCAL-FIRST & PRIVATE
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="screen">
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
              
              <button className="btn-green" onClick={() => setStep(5)}>
                <i className="fa-solid fa-shield-halved"></i> Shield Me
              </button>
              
              <button className="btn-white-outline" onClick={() => setStep(5)}>
                Push Through
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="screen">
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
              Reset Prototype <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
