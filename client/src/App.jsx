import React, { useState, useEffect, useRef } from 'react';

// ==========================================================================
// Ebb: React Frontend Client Application (Anya's Version)
// ==========================================================================

const recommendations = {
    high: {
        morning: {
            battery: 85,
            statusLabel: 'High Alertness',
            theme: 'focus-theme',
            icon: 'fa-solid fa-bolt',
            type: 'PEAK FOCUS',
            title: 'Deep Work: Security Specification',
            desc: 'Your morning cognitive capacity is stable. Focus on drafting independent specifications. The automatic calendar protection is currently active.',
            btnText: 'Start 45m Block',
            helper: 'Protected Focus Block (Alone)',
            cas: 95,
            hrv: 78,
            sleep: '8.2 hrs',
            alertness: 'Stable',
            alertnessDesc: 'Skin clear & stable',
            casDesc: 'Perfect biological alignment',
            insight: 'Anya has stable biometrics today. Ebb schedules a standard morning creative focus block for writing specs, keeping her multiplayer standups and reviews locked in their original slots.'
        },
        afternoon: {
            battery: 50,
            statusLabel: 'Optimal Alertness',
            theme: 'admin-theme',
            icon: 'fa-solid fa-envelope-open-text',
            type: 'ADMIN WINDOW',
            title: 'Backlog Catch-up & Review',
            desc: 'You are entering a natural circadian slump. Dedicate this block to low-cognitive tasks like sorting backlog cards or clearing Slack updates.',
            btnText: 'Open Backlog Triage',
            helper: 'Low Cognitive Demand (Alone)',
            cas: 95,
            hrv: 78,
            sleep: '8.2 hrs',
            alertness: 'Moderate',
            alertnessDesc: 'Normal slump',
            casDesc: 'Perfect biological alignment',
            insight: 'Afternoon circadian slump. Ebb suggests backlog triage or low-effort admin work rather than forcing creative spec writing, protecting Anya from cognitive exhaustion.'
        },
        evening: {
            battery: 15,
            statusLabel: 'Winding Down',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-moon',
            type: 'WIND DOWN',
            title: 'Disconnect: Turn Off Screens',
            desc: 'Work hours are complete. Ebb is auto-muting Slack notifications to protect your sleep hygiene. Sleep prep begins soon.',
            btnText: 'Mute Notifications',
            helper: 'Active Sleep Protection',
            cas: 95,
            hrv: 78,
            sleep: '8.2 hrs',
            alertness: 'Low',
            alertnessDesc: 'Ready for sleep',
            casDesc: 'Perfect biological alignment',
            insight: 'Evening wind-down. Ebb has silenced communication tools to ensure healthy cortisol reduction and prepare Anya for another stable-capacity day tomorrow.'
        }
    },
    low: {
        morning: {
            battery: 45,
            statusLabel: 'Compressed Peak',
            theme: 'focus-theme',
            icon: 'fa-solid fa-battery-quarter',
            type: 'COMPRESSED PEAK',
            title: 'Deep Work: Security Spec (Early Peak)',
            desc: 'Cortisol is red-lined, peak is compressed. Ebb reschedules triage, locks standup at 10 AM, and inserts a recovery window post-review.',
            btnText: 'Start 45m Block',
            helper: 'Protected Focus Block (Alone)',
            cas: 88,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Red-line',
            alertnessDesc: 'Forehead breakout active',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Low recovery detected. Ebb reschedules Anya\'s alone triage session to the afternoon, locks reviews in place (cannot move), and pulls her alone spec focus window earlier to capture her small peak before she crashes.'
        },
        afternoon: {
            battery: 25,
            statusLabel: 'Early Crash',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-person-walking',
            type: 'RECOVERY BLOCK',
            title: 'Somatic Recovery: Cortisol-Drop Walk',
            desc: 'You completed Architecture Review (Locked). biometrics show severe exhaustion. Ebb has auto-deleted Peloton and scheduled a walk.',
            btnText: 'Start Walk Timer',
            helper: 'Slack Auto-Paused (20m)',
            cas: 88,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Exhausted',
            alertnessDesc: 'Cortisol spike warning',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Post-review crash. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels.'
        },
        evening: {
            battery: 5,
            statusLabel: 'Depleted',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-bed',
            type: 'SLEEP DEBT RECOVERY',
            title: 'Urgent: Hair & Skin wind down',
            desc: 'Severe sleep debt detected. Hair shedding risk high. Ebb triggers wind-down protocol now to restore hormone baseline.',
            btnText: 'Start Sleep Prep',
            helper: 'Active Debt Payback',
            cas: 88,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Exhausted',
            alertnessDesc: 'Empty battery',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Anya has accumulated a 2.4-hour sleep debt, exacerbating her hair shedding. Ebb initiates sleep prep 1 hour earlier to restore baseline blood capacity.'
        }
    },
    override: {
        morning: {
            battery: 30,
            statusLabel: 'Severe Strain',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-circle-exclamation',
            type: 'BIOLOGICAL MISALIGNMENT',
            title: 'Friction Alert: Straining System',
            desc: 'You are forcing spec drafting during a severe cortisol crash. Output quality will drop by an estimated 50%. Focus is highly fragmented.',
            btnText: 'Restore Ebb Optimal Schedule',
            helper: 'Extreme Burnout Risk',
            cas: 42,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Exhausted',
            alertnessDesc: 'Forcing spec drafting',
            casDesc: 'Severe schedule mismatch',
            insight: 'Anya is ignoring Ebb\'s advice. Her CAS has dropped to 42% because she skipped her morning focus shift and is trying to do backlog sorting during a biological slump.'
        },
        afternoon: {
            battery: 10,
            statusLabel: 'Cognitive Crash',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-circle-exclamation',
            type: 'BIOLOGICAL MISALIGNMENT',
            title: 'Friction Alert: Forcing Review',
            desc: 'You did not take your somatic walk and are trying to write specifications on 10% battery. Quality of cognitive input is severely degraded.',
            btnText: 'Restore Ebb Optimal Schedule',
            helper: 'Extreme Burnout Risk',
            cas: 42,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Exhausted',
            alertnessDesc: 'Forehead breakout active',
            casDesc: 'Severe schedule mismatch',
            insight: 'Anya bypassed the recovery buffer and is forcing deep spec writing during a cortisol crash. Her focus is fragmented, leading to mistakes.'
        },
        evening: {
            battery: 1,
            statusLabel: 'Drained',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-circle-exclamation',
            type: 'BIOLOGICAL MISALIGNMENT',
            title: 'Bedtime Scrolling: Screen Detected',
            desc: 'You are still working or browsing screens past 8 PM despite severe exhaustion. Sleep cycle disruption alert active.',
            btnText: 'Restore Ebb Optimal Schedule',
            helper: 'Cumulative Debt Incurred',
            cas: 42,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Hyper-wired',
            alertnessDesc: 'Exhausted but wired',
            casDesc: 'Severe schedule mismatch',
            insight: 'Bedtime screen scrolling active. Anya is keeping screens on, ensuring her thyroid and skin barriers tomorrow remain depleted.'
        }
    }
};

const calendarSchedules = {
    high: [
        { id: '1', title: 'Security Spec Drafting', time: '9:00 - 10:00 AM', type: 'focus', col: 1, colSpan: 1, status: 'Alone' },
        { id: '2', title: 'Architecture Review', time: '10:00 - 11:30 AM', type: 'meeting', col: 2, colSpan: 2, status: 'Locked' },
        { id: '3', title: 'Backlog Triage', time: '12:00 - 1:00 PM', type: 'admin', col: 4, colSpan: 1, status: 'Alone' },
        { id: '4', title: 'Team Sync', time: '2:00 - 3:00 PM', type: 'meeting', col: 6, colSpan: 1, status: 'Locked' },
        { id: '5', title: 'Customer Demo', time: '3:30 - 4:30 PM', type: 'meeting', col: 8, colSpan: 1, status: 'Locked' },
        { id: '6', title: 'Self-Care: 1-Hr Swim', time: '5:00 - 6:00 PM', type: 'recovery', col: 9, colSpan: 1, status: 'Recovery' }
    ],
    low: [
        { id: '1', title: 'Security Spec Drafting', time: '9:00 - 10:00 AM', type: 'focus', col: 1, colSpan: 1, status: 'Protected' },
        { id: '2', title: 'Architecture Review', time: '10:00 - 11:30 AM', type: 'meeting', col: 2, colSpan: 2, status: 'Locked' },
        { id: '3-buf', title: 'Zero-Stimulus Buffer', time: '11:30 AM - 12:00 PM', type: 'recovery', col: 4, colSpan: 1, status: 'Recovery' },
        { id: '3', title: 'Backlog Triage', time: '1:00 - 2:00 PM', type: 'admin', col: 5, colSpan: 1, status: 'Shifted' },
        { id: '4', title: 'Team Sync', time: '2:00 - 3:00 PM', type: 'meeting', col: 6, colSpan: 1, status: 'Locked' },
        { id: '5-walk', title: 'Somatic Recovery Walk', time: '3:00 - 3:30 PM', type: 'recovery', col: 7, colSpan: 1, status: 'Recovery' },
        { id: '5', title: 'Customer Demo', time: '3:30 - 4:30 PM', type: 'meeting', col: 8, colSpan: 1, status: 'Locked' },
        { id: '6-buf', title: 'Hair/Skin Repair Buffer', time: '5:00 - 5:30 PM', type: 'recovery', col: 9, colSpan: 1, status: 'Recovery' }
    ]
};

function getStatusColor(status) {
    if (status === 'Protected') return 'var(--color-focus)';
    if (status === 'Shifted') return 'var(--color-recovery)';
    if (status === 'Declined') return 'var(--color-danger)';
    if (status === 'Locked') return 'var(--text-secondary)';
    if (status === 'Alone') return 'var(--color-focus)';
    if (status === 'Recovery') return 'var(--color-recovery)';
    return 'var(--text-secondary)';
}

export default function App() {
    // UI state
    const [scenario, setScenario] = useState('high'); // 'high' vs 'low'
    const [timeOfDay, setTimeOfDay] = useState('morning'); // 'morning', 'afternoon', 'evening'
    const [overrideActive, setOverrideActive] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Live API integration states
    const [dbAudit, setDbAudit] = useState(null);
    const [bufferedTelemetry, setBufferedTelemetry] = useState(0);
    const [syncLoading, setSyncLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState('');
    const [voiceInput, setVoiceInput] = useState('');
    const [calibrationQuestions, setCalibrationQuestions] = useState([]);
    const [showCalibrationModal, setShowCalibrationModal] = useState(false);
    const [calibrationForm, setCalibrationForm] = useState({ focus_rating: 3, ideal_sleep_hours: 8, stress_acne_present: false });

    // Fetch Database metrics on load
    const fetchMetrics = async () => {
        try {
            const res = await fetch('/api/v1/audit/metrics');
            if (res.ok) {
                const data = await res.json();
                setDbAudit(data);
            }
        } catch (err) {
            console.error('Failed to fetch SQL performance metrics:', err);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [scenario, timeOfDay, overrideActive]);

    // Handle Wearable Biometrics Ingestion
    const handleSomaticSync = async (mode) => {
        setSyncLoading(true);
        setApiMessage('Connecting to Oura Cloud & Luna Ring API streams...');
        try {
            if (mode === 'high') {
                // Post high energy biometrics via Somatic Ingest
                const res = await fetch('/api/v1/somatic/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audio_checkin_transcript: 'Woke up feeling recovered, HRV looks stable today.',
                        wearable_sleep_seconds: 29520, // 8.2 hrs
                        wearable_hrv_ms: 78,
                        subjective_alertness: 5
                    })
                });
                const data = await res.json();
                setApiMessage(`Sync Complete! High biometrics locked. Battery: ${data.somatic_battery_percentage}%`);
                setScenario('high');
                setOverrideActive(false);
            } else {
                // Trigger Low Energy Sync
                const res = await fetch('/api/v1/oauth/oura/sync', { method: 'POST' });
                const data = await res.json();
                setApiMessage(`Sync Complete! Low readiness flagged. HRV: ${data.synced_metrics.hrv_ms}ms.`);
                setScenario('low');
            }
            fetchMetrics();
        } catch (err) {
            setApiMessage(`Ingestion Failed: ${err.message}`);
        }
        setSyncLoading(false);
        setTimeout(() => setApiMessage(''), 4000);
    };

    // Voice Pipeline Submit
    const handleVoiceIngest = async (e) => {
        e.preventDefault();
        if (!voiceInput.trim()) return;

        setApiMessage('Transcribing checkin and executing LLM parser Chain-of-Thought...');
        try {
            const isStress = voiceInput.toLowerCase().includes('breakout') || voiceInput.toLowerCase().includes('shedding') || voiceInput.toLowerCase().includes('peloton');
            const res = await fetch('/api/v1/somatic/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_checkin_transcript: voiceInput,
                    wearable_sleep_seconds: isStress ? 20880 : 29520,
                    wearable_hrv_ms: isStress ? 24 : 78,
                    subjective_alertness: isStress ? 2 : 5
                })
            });
            const data = await res.json();
            if (data.status === 'INGEST_SUCCESS') {
                setApiMessage(`Ingest Success! Written to 8-stream ledger (Confidence: ${data.confidence_score}).`);
                setScenario(isStress ? 'low' : 'high');
                setVoiceInput('');
            } else if (data.status === 'CONFIDENCE_GATE_FAIL') {
                setApiMessage(`Confidence Gate Blocked Log (Confidence: ${data.confidence_score}). Check pending warnings.`);
            }
            fetchMetrics();
        } catch (err) {
            setApiMessage(`Voice Processing Failed: ${err.message}`);
        }
        setTimeout(() => setApiMessage(''), 5000);
    };

    // Confirm Proposal Calendar Writes
    const handleConfirmProposal = async () => {
        setApiMessage('Mutating cached Google Calendar events...');
        try {
            // Fetch mock proposal first to submit
            const propRes = await fetch('/api/v1/calendar/shield-proposal', { method: 'POST' });
            const propData = await propRes.json();

            const res = await fetch('/api/v1/calendar/shield-confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmed_actions: propData.proposed_actions
                })
            });
            const data = await res.json();
            setApiMessage(`Boundaries Committed! GCal sync token established. Slack Snooze status active.`);
            fetchMetrics();
        } catch (err) {
            setApiMessage(`Confirmation Failed: ${err.message}`);
        }
        setTimeout(() => setApiMessage(''), 4000);
    };

    // Execute Mid-Day Reset Rebuild
    const handleMiddayRebuild = async () => {
        setApiMessage('Re-calculating circadian boundaries. Shifting afternoon slots...');
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const res = await fetch('/api/v1/calendar/rebuild', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_time: `${todayStr}T13:00:00Z`
                })
            });
            const data = await res.json();
            setApiMessage(`Rebuild Complete! Somatic decompression window injected at 1:00 PM.`);
            fetchMetrics();
        } catch (err) {
            setApiMessage(`Reset Failed: ${err.message}`);
        }
        setTimeout(() => setApiMessage(''), 4000);
    };

    // Post Telemetry Logs
    const handleLogTelemetry = async () => {
        try {
            const res = await fetch('/api/v1/telemetry/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keystroke_count: Math.floor(Math.random() * 80) + 10,
                    mouse_jitter_score: parseFloat((Math.random() * 2.5).toFixed(2)),
                    idle_seconds: Math.floor(Math.random() * 15)
                })
            });
            const data = await res.json();
            setBufferedTelemetry(data.buffered_count);
        } catch (err) {
            console.error('Failed to log telemetry:', err);
        }
    };

    // Flush Telemetry
    const handleFlushTelemetry = async () => {
        try {
            const res = await fetch('/api/v1/telemetry/flush', { method: 'POST' });
            const data = await res.json();
            setBufferedTelemetry(0);
            setApiMessage(`Telemetry Logs Flushed! Committed ${data.flushed_count} entries to disk.`);
            setTimeout(() => setApiMessage(''), 3000);
        } catch (err) {
            console.error('Failed to flush telemetry:', err);
        }
    };

    // Fetch Subjective Calibration Prompts
    const handleOpenCalibration = async () => {
        try {
            const res = await fetch('/api/v1/calibration/prompt');
            const data = await res.json();
            setCalibrationQuestions(data.prompts);
            setShowCalibrationModal(true);
        } catch (err) {
            console.error('Failed to fetch calibration prompts:', err);
        }
    };

    // Submit Subjective Calibration Answers
    const handleCalibrationSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/calibration/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: calibrationForm
                })
            });
            const data = await res.json();
            if (data.status === 'CALIBRATION_SUBMITTED') {
                setShowCalibrationModal(false);
                setApiMessage('Calibration submitted. Data encrypted securely at rest.');
                setTimeout(() => setApiMessage(''), 3000);
            }
        } catch (err) {
            console.error('Failed to submit calibration:', err);
        }
    };

    // Calculate Recommendation parameters
    let profileKey = scenario;
    if (scenario === 'low' && overrideActive) {
        profileKey = 'override';
    }
    const currentData = recommendations[profileKey][timeOfDay];

    // Calendar Display mode
    const todayStr = new Date().toISOString().split('T')[0];
    const calendarMode = (scenario === 'low' && !overrideActive) ? 'low' : 'high';
    const activeEvents = calendarSchedules[calendarMode];

    // Circular Battery meter circumference parameters
    const ringRadius = 95;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (currentData.battery / 100) * ringCircumference;

    let progressColor = 'var(--color-focus)';
    if (currentData.battery < 40) {
        progressColor = 'var(--color-danger)';
    } else if (currentData.battery < 75) {
        progressColor = 'var(--color-admin)';
    }

    // Timeline marker position percentage
    let markerPosition = 5.55;
    let timeText = '9:30 AM';
    if (timeOfDay === 'afternoon') {
        markerPosition = 55.55;
        timeText = '2:00 PM';
    } else if (timeOfDay === 'evening') {
        markerPosition = 95;
        timeText = '8:00 PM';
    }

    return (
        <div className="app-container">
            {/* Sidebar Controller */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="logo-glow"></div>
                    <i className="fa-solid fa-wind brand-icon"></i>
                    <span className="brand-name">ebb</span>
                </div>

                <div className="sim-card">
                    <h3><i className="fa-solid fa-sliders"></i> SIMULATION HUB</h3>
                    <p className="sim-instructions">Toggle biological states and times of day to watch Ebb automatically adjust the calendar and recommendations.</p>

                    <div className="sim-section">
                        <label className="section-label">Biological State (Anya)</label>
                        <div className="toggle-group">
                            <button 
                                id="btn-high-energy" 
                                className={`btn-toggle ${scenario === 'high' ? 'active' : ''}`}
                                onClick={() => handleSomaticSync('high')}
                            >
                                <i className="fa-solid fa-battery-full"></i>
                                <span>Stable Recovery (HRV 78)</span>
                            </button>
                            <button 
                                id="btn-low-energy" 
                                className={`btn-toggle ${scenario === 'low' ? 'active' : ''}`}
                                onClick={() => handleSomaticSync('low')}
                            >
                                <i className="fa-solid fa-battery-quarter warning-glow"></i>
                                <span>Cortisol Red-line (HRV 24)</span>
                            </button>
                        </div>
                    </div>

                    <div className="sim-section">
                        <label className="section-label">Time of Day Simulator</label>
                        <div className="time-switches">
                            <button 
                                className={`btn-time ${timeOfDay === 'morning' ? 'active' : ''}`}
                                onClick={() => setTimeOfDay('morning')}
                            >
                                <i className="fa-regular fa-sun"></i> 9:30 AM
                            </button>
                            <button 
                                className={`btn-time ${timeOfDay === 'afternoon' ? 'active' : ''}`}
                                onClick={() => setTimeOfDay('afternoon')}
                            >
                                <i className="fa-solid fa-cloud-sun"></i> 2:00 PM
                            </button>
                            <button 
                                className={`btn-time ${timeOfDay === 'evening' ? 'active' : ''}`}
                                onClick={() => setTimeOfDay('evening')}
                            >
                                <i className="fa-regular fa-moon"></i> 8:00 PM
                            </button>
                        </div>
                    </div>

                    <div className="sim-section">
                        <label className="section-label">Override Switch</label>
                        <div className="checkbox-container">
                            <input 
                                type="checkbox" 
                                id="override-toggle" 
                                checked={overrideActive}
                                onChange={(e) => setOverrideActive(e.target.checked)}
                            />
                            <label htmlFor="override-toggle">
                                <span>Force "Push Through"</span>
                                <span className="subtext">Ignores somatic DND recommendations</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Passive Sensors Card */}
                <div className="integrations-card">
                    <h3><i className="fa-solid fa-circle-nodes"></i> PASSIVE SENSORS</h3>
                    <ul className="sensor-list">
                        <li className="sensor-item active">
                            <div className="sensor-info">
                                <i className="fa-solid fa-cloud sensor-icon"></i>
                                <span>Oura Cloud Ingress</span>
                            </div>
                            <span className="status-badge">Connected</span>
                        </li>
                        <li className="sensor-item active">
                            <div className="sensor-info">
                                <i className="fa-solid fa-calendar-days sensor-icon"></i>
                                <span>Google Calendar</span>
                            </div>
                            <span className="status-badge">Connected</span>
                        </li>
                        <li className="sensor-item active" style={{ cursor: 'pointer' }} onClick={handleLogTelemetry}>
                            <div className="sensor-info">
                                <i className="fa-solid fa-keyboard sensor-icon animate-pulse"></i>
                                <span>Desktop Telemetry (Log)</span>
                            </div>
                            <span className="status-badge bg-purple-500">
                                {bufferedTelemetry > 0 ? `${bufferedTelemetry} cache` : 'Active'}
                            </span>
                        </li>
                        {bufferedTelemetry > 0 && (
                            <li className="sensor-item" style={{ background: 'rgba(168,85,247,0.1)' }}>
                                <button className="btn-flush" onClick={handleFlushTelemetry}>
                                    <i className="fa-solid fa-arrow-down-to-bracket"></i> Flush telemetry logs to disk
                                </button>
                            </li>
                        )}
                        <li className="sensor-item" style={{ cursor: 'pointer' }} onClick={handleOpenCalibration}>
                            <div className="sensor-info">
                                <i className="fa-solid fa-heart-pulse sensor-icon"></i>
                                <span>Weekly Baseline survey</span>
                            </div>
                            <span className="status-badge">Open</span>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main Area */}
            <main className="main-content">
                {/* Global API Banner messages */}
                {apiMessage && (
                    <div className="api-toast-banner animate-fade-in">
                        <i className="fa-solid fa-circle-info"></i>
                        <span>{apiMessage}</span>
                    </div>
                )}

                {/* Header */}
                <header className="header">
                    <nav className="tab-navigation">
                        <button 
                            className="tab-btn active"
                        >
                            <i className="fa-solid fa-gauge-high"></i> Dashboard
                        </button>
                    </nav>

                    <div className="user-profile">
                        <div className="persona-badge">
                            <span className="persona-name">Anya (Staff AI Eng)</span>
                            <span className="persona-role"><span className="indicator-dot"></span>Active Shielding</span>
                        </div>
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" alt="Anya" className="avatar" />
                    </div>
                </header>

                {/* Dashboard Tab Content */}
                <div className="tab-content active">
                        <div className="dashboard-grid">
                            
                            {/* Biometrics Card */}
                            <div className="metric-card card-biometrics">
                                <div className="card-header">
                                    <h4><i className="fa-solid fa-heart-pulse"></i> RESTING BIOMETRICS</h4>
                                    <span className="header-badge">Luna Ring Sync</span>
                                </div>
                                <div className="biometrics-row">
                                    <div className="biometric-item">
                                        <span className="biometric-label">HRV (Today)</span>
                                        <span className="metric-value" id="metric-hrv">
                                            {currentData.hrv} <span className="unit">ms</span>
                                        </span>
                                        <span className="biometric-desc" id="metric-sleep">Sleep: {currentData.sleep}</span>
                                    </div>
                                    <div className="biometric-item">
                                        <span className="biometric-label">Cognitive Battery</span>
                                        <span className="metric-value" id="metric-alertness">{currentData.alertness}</span>
                                        <span className="biometric-desc" id="metric-alertness-desc">{currentData.alertnessDesc}</span>
                                    </div>
                                    <div className="biometric-item">
                                        <span className="biometric-label">Alignment Index</span>
                                        <span className={`metric-value ${currentData.cas >= 90 ? 'alignment-glowing' : ''}`} id="metric-cas" style={{
                                            color: currentData.cas >= 90 ? '' : currentData.cas >= 70 ? 'var(--color-admin)' : 'var(--color-danger)'
                                        }}>
                                            {dbAudit ? dbAudit.cognitive_alignment.cas_score_percentage : currentData.cas}%
                                        </span>
                                        <span className="biometric-desc" id="metric-cas-desc">
                                            {dbAudit ? `Shield adherence: ${dbAudit.shield_adherence.adherence_rate_percentage}%` : currentData.casDesc}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Battery gauge */}
                            <div className="metric-card card-battery">
                                <div className="card-header">
                                    <h4><i className="fa-solid fa-battery-half"></i> BIOMETRIC BATTERY</h4>
                                </div>
                                <div className="battery-widget">
                                    <svg width="220" height="220" className="circular-meter">
                                        <circle className="meter-bg" cx="110" cy="110" r={ringRadius}></circle>
                                        <circle 
                                            className="meter-fill" 
                                            cx="110" 
                                            cy="110" 
                                            r={ringRadius}
                                            style={{
                                                strokeDasharray: ringCircumference,
                                                strokeDashoffset: ringOffset,
                                                stroke: progressColor
                                            }}
                                        ></circle>
                                    </svg>
                                    <div className="meter-content">
                                        <span className="percentage" id="battery-value">{currentData.battery}%</span>
                                        <span className="status" id="battery-status">{currentData.statusLabel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Circadian chart */}
                            <div className="metric-card card-curve">
                                <div className="card-header">
                                    <h4><i className="fa-solid fa-chart-line"></i> CIRCADIAN ENERGY WAVES</h4>
                                    <span className="time-indicator">Current: <span id="recom-time-indicator">{timeText}</span></span>
                                </div>
                                <div className="chart-canvas-container">
                                    <svg className="chart-svg" width="100%" height="100%">
                                        {/* Grid lines */}
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                            <line 
                                                key={i} 
                                                x1={`${i * 11.11}%`} 
                                                y1="0" 
                                                x2={`${i * 11.11}%`} 
                                                y2="100%" 
                                                stroke="rgba(255,255,255,0.02)" 
                                                strokeWidth="1"
                                            />
                                        ))}
                                        
                                        {/* Circadian Wave Path */}
                                        {scenario === 'high' ? (
                                            <path 
                                                d="M 0 108 Q 65 40 130 108 T 260 180 T 390 110 T 500 220" 
                                                fill="none" 
                                                stroke="url(#highGrad)" 
                                                strokeWidth="3.5"
                                                className="wave-path"
                                            />
                                        ) : (
                                            <path 
                                                d="M 0 180 Q 55 90 110 180 T 220 220 T 330 190 T 500 240" 
                                                fill="none" 
                                                stroke="url(#lowGrad)" 
                                                strokeWidth="3.5"
                                                className="wave-path"
                                            />
                                        )}
                                        
                                        <defs>
                                            <linearGradient id="highGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
                                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                                            </linearGradient>
                                            <linearGradient id="lowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                                                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="canvas-timeline-labels">
                                        <span>9:00 AM</span>
                                        <span>12:00 PM</span>
                                        <span>3:00 PM</span>
                                        <span>6:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coach Card */}
                        <section className={`recom-card-container ${currentData.theme}`} id="recom-card">
                            <div className="recom-accent"></div>
                            <div className="recom-body">
                                <div className="recom-icon-circle">
                                    <i className={currentData.icon} id="recom-icon"></i>
                                </div>
                                <div className="recom-details">
                                    <div className="recom-header-row">
                                        <span className="recom-badge" id="recom-type">{currentData.type}</span>
                                        <span className="recom-time-sub"><i className="fa-regular fa-clock"></i> Recommended Right Now</span>
                                    </div>
                                    <h2 className="recom-title" id="recom-title">{currentData.title}</h2>
                                    <p className="recom-desc" id="recom-description">{currentData.desc}</p>
                                </div>
                            </div>
                            <div className="recom-action-area">
                                {scenario === 'low' && !overrideActive && timeOfDay === 'morning' && (
                                    <button className="action-btn animate-pulse" id="recom-action-btn" onClick={handleConfirmProposal}>
                                        <i className="fa-solid fa-play"></i> Confirm Calendar Shield
                                    </button>
                                )}
                                {scenario === 'low' && !overrideActive && timeOfDay === 'afternoon' && (
                                    <button className="action-btn animate-pulse" id="recom-action-btn" onClick={handleMiddayRebuild}>
                                        <i className="fa-solid fa-refresh"></i> Mid-Day Rebuild Reset
                                    </button>
                                )}
                                {(scenario === 'high' || overrideActive || timeOfDay === 'evening') && (
                                    <button className="action-btn" id="recom-action-btn">
                                        <i className="fa-solid fa-play"></i> {currentData.btnText}
                                    </button>
                                )}
                                <span className="action-helper" id="recom-action-helper">{currentData.helper}</span>
                            </div>
                        </section>

                        {/* Voice Input pipeline card */}
                        <section className="metric-card card-voice" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <h4><i className="fa-solid fa-microphone"></i> "VENT-TO-ADJUST" VOICE PIPELINE</h4>
                                <span className="header-badge bg-purple-600">Luna Chain-of-Thought</span>
                            </div>
                            <form onSubmit={handleVoiceIngest} className="voice-form-row">
                                <input 
                                    type="text" 
                                    className="voice-input-text" 
                                    placeholder="Vent your physical symptoms (e.g. 'Woke up with jawline acne and hair shedding...')" 
                                    value={voiceInput}
                                    onChange={(e) => setVoiceInput(e.target.value)}
                                />
                                <button type="submit" className="voice-submit-btn">
                                    <i className="fa-solid fa-paper-plane"></i> Parse Ingress
                                </button>
                            </form>
                            <p className="sim-instructions" style={{ marginTop: '8px' }}>
                                Type a symptom note. If it contains trigger words (<em>breakout</em>, <em>shedding</em>, etc.), the local LLM will automatically trigger a red-line rebuild scenario.
                            </p>
                        </section>

                        {/* Calendar Cache list */}
                        <section className="metric-card calendar-timeline-card">
                            <div className="card-header">
                                <h4><i className="fa-solid fa-calendar-check"></i> GCAL LOCAL SQL CACHE ({todayStr})</h4>
                                <span className="header-badge">Google OAuth Active</span>
                            </div>
                            
                            <div className="calendar-grid-container">
                                <div className="timeline-headers">
                                    <span style={{ gridColumn: '1 / span 1' }}>9:00 AM</span>
                                    <span style={{ gridColumn: '2 / span 2' }}>10:00 AM</span>
                                    <span style={{ gridColumn: '4 / span 1' }}>12:00 PM</span>
                                    <span style={{ gridColumn: '5 / span 1' }}>1:00 PM</span>
                                    <span style={{ gridColumn: '6 / span 1' }}>2:00 PM</span>
                                    <span style={{ gridColumn: '7 / span 1' }}>3:00 PM</span>
                                    <span style={{ gridColumn: '8 / span 1' }}>4:00 PM</span>
                                    <span style={{ gridColumn: '9 / span 1' }}>5:00 PM</span>
                                </div>

                                <div className="calendar-timeline-row">
                                    {/* Simulated hour line */}
                                    <div 
                                        className="timeline-indicator" 
                                        id="timeline-time-indicator"
                                        style={{ left: `${markerPosition}%` }}
                                    >
                                        <div className="indicator-line"></div>
                                        <span className="time-tag">{timeText}</span>
                                    </div>

                                    {/* Grid blocks */}
                                    <div className="calendar-blocks-list" id="calendar-list">
                                        {activeEvents.map((ev) => (
                                            <div 
                                                key={ev.id} 
                                                className={`calendar-block ${ev.type}-block ${ev.status === 'Shifted' ? 'state-shifted' : ev.status === 'Declined' ? 'state-declined' : ''}`}
                                                style={{ gridColumn: `${ev.col} / span ${ev.colSpan}` }}
                                            >
                                                <div className="block-details">
                                                    <span className="block-title">{ev.title}</span>
                                                    <div className="block-time-range">{ev.time}</div>
                                                </div>
                                                <div className="block-meta">
                                                    <span className="block-badge">{ev.type}</span>
                                                    {ev.status && (
                                                        <span className="block-status" style={{ color: getStatusColor(ev.status) }}>
                                                            {ev.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Diagnostics insight panel */}
                        <section className="metric-card insight-box">
                            <div className="insight-glow"></div>
                            <div className="insight-header">
                                <i className="fa-solid fa-brain insight-icon"></i>
                                <span className="insight-title">PM INSIGHTS & BIO-DIAGNOSTICS</span>
                            </div>
                            <p className="insight-text" id="pm-insight-text">{currentData.insight}</p>
                        </section>
                    </div>
            </main>

            {/* Weekly Calibration survey modal */}
            {showCalibrationModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3><i className="fa-solid fa-sliders"></i> WEEKLY BASELINE CALIBRATION</h3>
                            <button className="close-btn" onClick={() => setShowCalibrationModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCalibrationSubmit}>
                            {calibrationQuestions.map((q) => (
                                <div key={q.question_id} className="form-group">
                                    <label className="section-label">{q.prompt_text}</label>
                                    {q.input_type === 'slider' && (
                                        <input 
                                            type="range" 
                                            min={q.min_val} 
                                            max={q.max_val} 
                                            value={calibrationForm.focus_rating}
                                            onChange={(e) => setCalibrationForm({ ...calibrationForm, focus_rating: parseInt(e.target.value) })}
                                            className="slider-input"
                                        />
                                    )}
                                    {q.input_type === 'number' && (
                                        <input 
                                            type="number" 
                                            min={q.min_val} 
                                            max={q.max_val} 
                                            step="0.5"
                                            value={calibrationForm.ideal_sleep_hours}
                                            onChange={(e) => setCalibrationForm({ ...calibrationForm, ideal_sleep_hours: parseFloat(e.target.value) })}
                                            className="number-input"
                                        />
                                    )}
                                    {q.input_type === 'boolean' && (
                                        <div className="toggle-group" style={{ margin: '8px 0' }}>
                                            <button 
                                                type="button" 
                                                className={`btn-time ${calibrationForm.stress_acne_present ? 'active' : ''}`}
                                                onClick={() => setCalibrationForm({ ...calibrationForm, stress_acne_present: true })}
                                            >
                                                Yes
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn-time ${!calibrationForm.stress_acne_present ? 'active' : ''}`}
                                                onClick={() => setCalibrationForm({ ...calibrationForm, stress_acne_present: false })}
                                            >
                                                No
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '16px' }}>
                                Save Calibration
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
