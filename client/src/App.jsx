import React, { useState, useEffect } from 'react';

// Recommendations matrix for Ebb Scenarios
const recommendations = {
    stable: {
        morning: {
            battery: 78,
            statusLabel: 'OPTIMAL',
            theme: 'focus-theme',
            icon: 'fa-solid fa-bolt',
            type: 'OPTIMAL FLOW',
            title: 'Deep Work: Security Specification',
            desc: 'Your morning capacity is stable. Focus on independent PRD drafting. Automatic calendar protection is currently active.',
            btnText: 'Start Focus block',
            helper: 'Protected Focus Block (Alone)',
            cas: 95,
            hrv: 78,
            sleep: '8.2 hrs',
            alertness: 'Stable',
            alertnessDesc: 'Skin clear & stable',
            casDesc: 'Perfect biological alignment',
            insight: 'Anya has stable biometrics today. Ebb schedules a standard morning creative focus block and keeps the scheduled team meeting at 10:00 AM because alertness is high.'
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
    compressed: {
        morning: {
            battery: 45,
            statusLabel: 'COMPRESSED PEAK',
            theme: 'focus-theme',
            icon: 'fa-solid fa-battery-quarter',
            type: 'COMPRESSED PEAK',
            title: 'Deep Work: Security Spec (Early Peak)',
            desc: 'Cortisol is red-lined, peak is compressed. Ebb reschedules triage, locks standup at 10 AM, and inserts a recovery window post-review.',
            btnText: 'Confirm Calendar Shield',
            helper: 'Somatic Governor active',
            cas: 72,
            hrv: 52,
            sleep: '8.2 hrs',
            alertness: 'Compressed',
            alertnessDesc: 'Normal slump',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Compressed peak detected. Ebb reschedules Anya\'s alone triage session to the afternoon, locks reviews in place (cannot move), and pulls her alone spec focus window earlier to capture her small peak before she crashes.'
        },
        afternoon: {
            battery: 25,
            statusLabel: 'Early Crash',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-person-walking',
            type: 'RECOVERY BLOCK',
            title: 'Somatic Recovery: Cortisol-Drop Walk',
            desc: 'Post-review crash detected. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels.',
            btnText: 'Mid-Day Rebuild Reset',
            helper: 'Slack Auto-Paused (20m)',
            cas: 72,
            hrv: 52,
            sleep: '8.2 hrs',
            alertness: 'Compressed',
            alertnessDesc: 'Normal slump',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Post-review crash. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels.'
        },
        evening: {
            battery: 5,
            statusLabel: 'Depleted',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-bed',
            type: 'SLEEP DEBT RECOVERY',
            title: 'Urgent: Sleep Debt Recovery',
            desc: 'Severe sleep debt detected. Hair shedding risk high. Ebb triggers wind-down protocol now to restore hormone baseline.',
            btnText: 'Start Sleep Prep',
            helper: 'Active Debt Payback',
            cas: 72,
            hrv: 52,
            sleep: '8.2 hrs',
            alertness: 'Compressed',
            alertnessDesc: 'Normal slump',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Somatic recovery low. Sleep prep begins 1 hour early to repay debt and restore follicle stability.'
        }
    },
    redline: {
        morning: {
            battery: 18,
            statusLabel: 'DEPLETED',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-circle-exclamation',
            type: 'CRITICAL ALERT',
            title: 'Recovery Protocol: Cancel Non-Critical',
            desc: 'Critical burnout detected. Ebb has cancelled all non-essential meetings, blocked your calendar for recovery, and sent auto-responses to Slack. Prioritize rest.',
            btnText: 'Confirm Calendar Shield',
            helper: 'Slack Auto-Paused (20m)',
            cas: 34,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Red-line',
            alertnessDesc: 'Forehead breakout active',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Critical burnout detected. Non-critical alone tasks shifted to tomorrow; emergency recovery buffer scheduled post locked Scrum review.'
        },
        afternoon: {
            battery: 10,
            statusLabel: 'Cognitive Crash',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-person-walking',
            type: 'RECOVERY BLOCK',
            title: 'Somatic Recovery: Cortisol-Drop Walk',
            desc: 'Post-review crash detected. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels.',
            btnText: 'Mid-Day Rebuild Reset',
            helper: 'Slack Auto-Paused (20m)',
            cas: 34,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Red-line',
            alertnessDesc: 'Forehead breakout active',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Post-review crash. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels.'
        },
        evening: {
            battery: 1,
            statusLabel: 'Drained',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-bed',
            type: 'SLEEP DEBT RECOVERY',
            title: 'Urgent: Sleep Debt Recovery',
            desc: 'Severe sleep debt detected. Hair shedding risk high. Ebb triggers wind-down protocol now to restore hormone baseline.',
            btnText: 'Start Sleep Prep',
            helper: 'Active Debt Payback',
            cas: 34,
            hrv: 24,
            sleep: '5.8 hrs',
            alertness: 'Red-line',
            alertnessDesc: 'Forehead breakout active',
            casDesc: 'Calendar adjusted to save score',
            insight: 'Critical sleep debt. Screen muting forced. Thyroid and follicle protection active.'
        }
    },
    override: {
        morning: {
            battery: 30, // dynamically set in display
            statusLabel: 'Severe Strain',
            theme: 'recovery-theme',
            icon: 'fa-solid fa-circle-exclamation',
            type: 'BIOLOGICAL MISALIGNMENT',
            title: 'Friction Alert: Straining System',
            desc: '', // dynamically set
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
            desc: '',
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

// Biological Scenario Configuration parameters (gradients, paths, etc. matching app.py)
const biologicalStates = {
    stable: {
        id: 'stable',
        label: 'Stable Recovery',
        hrv: 78,
        sleep: '8.2 hrs',
        battery: 78,
        cas: 95,
        statusLabel: 'OPTIMAL',
        themeColor: '#00f2fe',
        themeGradient: 'linear-gradient(135deg, #00f2fe 0%, #a855f7 100%)',
        cardGlow: 'rgba(0, 242, 254, 0.08)',
        themeBgGradient: 'radial-gradient(circle at 10% 20%, rgba(0, 242, 254, 0.08) 0%, rgba(7, 9, 14, 0) 60%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.06) 0%, rgba(7, 9, 14, 0) 60%)',
        gradientId: 'battery-grad-stable',
        gradStops: (
            <>
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="100%" stopColor="#a855f7" />
            </>
        ),
        shadowColor: 'rgba(0, 242, 254, 0.4)',
        waveColor: '#00f2fe',
        wavePath: 'M 0 80 Q 35 15, 70 60 T 140 40',
        fillPath: 'M 0 80 Q 35 15, 70 60 T 140 40 L 140 140 L 0 140 Z',
        areaGradientId: 'circadian-area-stable',
        areaStop: (
            <>
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </>
        )
    },
    compressed: {
        id: 'compressed',
        label: 'Compressed Peak',
        hrv: 52,
        sleep: '8.2 hrs',
        battery: 45,
        cas: 72,
        statusLabel: 'COMPRESSED PEAK',
        themeColor: '#eab308',
        themeGradient: 'linear-gradient(135deg, #eab308 0%, #ef4444 100%)',
        cardGlow: 'rgba(234, 179, 8, 0.08)',
        themeBgGradient: 'radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.08) 0%, rgba(7, 9, 14, 0) 60%), radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.06) 0%, rgba(7, 9, 14, 0) 60%)',
        gradientId: 'battery-grad-compressed',
        gradStops: (
            <>
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ef4444" />
            </>
        ),
        shadowColor: 'rgba(234, 179, 8, 0.4)',
        waveColor: '#eab308',
        wavePath: 'M 0 90 Q 25 30, 55 90 T 140 110',
        fillPath: 'M 0 90 Q 25 30, 55 90 T 140 110 L 140 140 L 0 140 Z',
        areaGradientId: 'circadian-area-compressed',
        areaStop: (
            <>
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </>
        )
    },
    redline: {
        id: 'redline',
        label: 'Cortisol Red-line',
        hrv: 24,
        sleep: '5.8 hrs',
        battery: 18,
        cas: 34,
        statusLabel: 'DEPLETED',
        themeColor: '#ef4444',
        themeGradient: 'linear-gradient(135deg, #ef4444 0%, #881337 100%)',
        cardGlow: 'rgba(239, 68, 68, 0.08)',
        themeBgGradient: 'radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.08) 0%, rgba(7, 9, 14, 0) 60%), radial-gradient(circle at 90% 80%, rgba(136, 19, 55, 0.06) 0%, rgba(7, 9, 14, 0) 60%)',
        gradientId: 'battery-grad-redline',
        gradStops: (
            <>
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#881337" />
            </>
        ),
        shadowColor: 'rgba(239, 68, 68, 0.4)',
        waveColor: '#ef4444',
        wavePath: 'M 0 110 Q 30 70, 60 110 T 140 130',
        fillPath: 'M 0 110 Q 30 70, 60 110 T 140 130 L 140 140 L 0 140 Z',
        areaGradientId: 'circadian-area-redline',
        areaStop: (
            <>
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </>
        )
    }
};

// Fallback lists for calendar display
const fallbackEventsStable = [
    { event_title: 'Security Spec Drafting', start_time: '2026-05-31T09:00:00Z', end_time: '2026-05-31T10:00:00Z', classification: 'RESCHEDULABLE' },
    { event_title: 'Architecture Review', start_time: '2026-05-31T10:00:00Z', end_time: '2026-05-31T11:30:00Z', classification: 'LOCKED' },
    { event_title: 'Daily Scrum', start_time: '2026-05-31T11:30:00Z', end_time: '2026-05-31T12:00:00Z', classification: 'LOCKED' },
    { event_title: 'Backlog Triage', start_time: '2026-05-31T12:00:00Z', end_time: '2026-05-31T13:00:00Z', classification: 'RESCHEDULABLE' },
    { event_title: 'Team Sync', start_time: '2026-05-31T14:00:00Z', end_time: '2026-05-31T15:00:00Z', classification: 'LOCKED' },
    { event_title: 'Customer Demo', start_time: '2026-05-31T15:30:00Z', end_time: '2026-05-31T16:30:00Z', classification: 'LOCKED' },
    { event_title: 'Peloton HIIT Ride', start_time: '2026-05-31T17:00:00Z', end_time: '2026-05-31T18:00:00Z', classification: 'RESCHEDULABLE' }
];

const fallbackEventsLow = [
    { event_title: 'Security Spec Drafting', start_time: '2026-05-31T09:00:00Z', end_time: '2026-05-31T10:00:00Z', classification: 'PROTECTED' },
    { event_title: 'Architecture Review', start_time: '2026-05-31T10:00:00Z', end_time: '2026-05-31T11:30:00Z', classification: 'LOCKED' },
    { event_title: 'Zero-Stimulus Decompression Buffer', start_time: '2026-05-31T11:30:00Z', end_time: '2026-05-31T12:00:00Z', classification: 'RESCHEDULABLE' },
    { event_title: 'Backlog Triage', start_time: '2026-05-31T13:00:00Z', end_time: '2026-05-31T14:00:00Z', classification: 'RESCHEDULABLE' },
    { event_title: 'Team Sync', start_time: '2026-05-31T14:00:00Z', end_time: '2026-05-31T15:00:00Z', classification: 'LOCKED' },
    { event_title: 'Somatic Recovery Walk', start_time: '2026-05-31T15:00:00Z', end_time: '2026-05-31T15:30:00Z', classification: 'RESCHEDULABLE' },
    { event_title: 'Customer Demo', start_time: '2026-05-31T15:30:00Z', end_time: '2026-05-31T16:30:00Z', classification: 'LOCKED' }
];

function formatTime(isoStr) {
    try {
        const timePart = isoStr.split('T')[1].substring(0, 5); // "09:00"
        let [h, m] = timePart.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
        return isoStr;
    }
}

function getEventStyle(title, classification, state) {
    let borderStyle = 'solid';
    let borderColor = '#3b82f6';
    let badgeBg = 'rgba(59, 130, 246, 0.1)';
    let badgeText = '#3b82f6';
    let itemBg = 'rgba(255, 255, 255, 0.02)';
    let statusLabel = classification;

    const lowerTitle = title.toLowerCase();
    const isLowState = state === 'compressed' || state === 'redline';

    if (lowerTitle.includes('buffer') || lowerTitle.includes('decompression')) {
        borderColor = '#10b981';
        badgeBg = 'rgba(16, 185, 129, 0.1)';
        badgeText = '#10b981';
        statusLabel = 'RECOVERY BUFFER';
        itemBg = 'repeating-linear-gradient(45deg, rgba(16, 185, 129, 0.02), rgba(16, 185, 129, 0.02) 10px, rgba(16, 185, 129, 0.08) 10px, rgba(16, 185, 129, 0.08) 20px)';
    } else if (lowerTitle.includes('walk')) {
        borderColor = '#a855f7';
        badgeBg = 'rgba(168, 85, 247, 0.1)';
        badgeText = '#a855f7';
        statusLabel = 'RECOVERY ACTIVITY';
    } else if (classification === 'RESCHEDULABLE' && isLowState && !lowerTitle.includes('spec')) {
        borderColor = '#eab308';
        borderStyle = 'dashed';
        badgeBg = 'rgba(234, 179, 8, 0.1)';
        badgeText = '#eab308';
        statusLabel = 'SHIFTED';
        itemBg = 'rgba(234, 179, 8, 0.02)';
    } else if (classification === 'LOCKED') {
        borderColor = '#6b7280';
        badgeBg = 'rgba(107, 114, 128, 0.1)';
        badgeText = '#9ca3af';
        statusLabel = 'LOCKED';
    } else if (lowerTitle.includes('spec')) {
        borderColor = '#00f2fe';
        badgeBg = 'rgba(0, 242, 254, 0.1)';
        badgeText = '#00f2fe';
        statusLabel = 'PROTECTED';
    }

    return { borderStyle, borderColor, badgeBg, badgeText, itemBg, statusLabel };
}

export default function App() {
    // UI state
    const [scenario, setScenario] = useState('stable'); // 'stable', 'compressed', 'redline'
    const [timeOfDay, setTimeOfDay] = useState('morning'); // 'morning', 'afternoon', 'evening'
    const [overrideActive, setOverrideActive] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Live API integration states
    const [dbAudit, setDbAudit] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [bufferedTelemetry, setBufferedTelemetry] = useState(0);
    const [syncLoading, setSyncLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState('');
    const [voiceInput, setVoiceInput] = useState('');
    const [calibrationQuestions, setCalibrationQuestions] = useState([]);
    const [showCalibrationModal, setShowCalibrationModal] = useState(false);
    const [calibrationForm, setCalibrationForm] = useState({ focus_rating: 3, ideal_sleep_hours: 8, stress_acne_present: false });

    // Fetch Database metrics and calendar events on load
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

    const fetchCalendarEvents = async () => {
        try {
            const res = await fetch('/api/v1/calendar/events');
            if (res.ok) {
                const data = await res.json();
                setCalendarEvents(data.events || []);
            }
        } catch (err) {
            console.error('Failed to fetch calendar cache events:', err);
        }
    };

    const fetchAllData = async () => {
        await fetchMetrics();
        await fetchCalendarEvents();
    };

    useEffect(() => {
        fetchAllData();
    }, [scenario, timeOfDay, overrideActive]);

    // Handle Wearable Biometrics Ingestion
    const handleSomaticSync = async (mode) => {
        setSyncLoading(true);
        setApiMessage('Connecting to Oura Cloud & Luna Ring API streams...');
        try {
            if (mode === 'stable') {
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
                setApiMessage(`Sync Complete! High biometrics locked. Battery: 78%`);
                setScenario('stable');
                setOverrideActive(false);
            } else if (mode === 'compressed') {
                const res = await fetch('/api/v1/somatic/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audio_checkin_transcript: 'Feeling okay, resting HRV 52ms.',
                        wearable_sleep_seconds: 29520, // 8.2 hrs
                        wearable_hrv_ms: 52,
                        subjective_alertness: 4
                    })
                });
                const data = await res.json();
                setApiMessage(`Sync Complete! Moderate biometrics locked. Battery: 45%`);
                setScenario('compressed');
                setOverrideActive(false);
            } else if (mode === 'redline') {
                const res = await fetch('/api/v1/oauth/oura/sync', { method: 'POST' });
                const data = await res.json();
                setApiMessage(`Sync Complete! Low readiness flagged. HRV: 24ms.`);
                setScenario('redline');
                setOverrideActive(false);
            }
            fetchAllData();
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
            const lowerTranscript = voiceInput.toLowerCase();
            const isRedline = lowerTranscript.includes('breakout') || lowerTranscript.includes('shedding') || lowerTranscript.includes('peloton');
            const isCompressed = lowerTranscript.includes('compressed') || lowerTranscript.includes('moderate') || lowerTranscript.includes('52');
            
            let targetHrv = 78;
            let targetSleep = 29520;
            let targetAlertness = 5;
            let targetScenario = 'stable';

            if (isRedline) {
                targetHrv = 24;
                targetSleep = 20880;
                targetAlertness = 2;
                targetScenario = 'redline';
            } else if (isCompressed) {
                targetHrv = 52;
                targetSleep = 29520;
                targetAlertness = 4;
                targetScenario = 'compressed';
            }

            const res = await fetch('/api/v1/somatic/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_checkin_transcript: voiceInput,
                    wearable_sleep_seconds: targetSleep,
                    wearable_hrv_ms: targetHrv,
                    subjective_alertness: targetAlertness
                })
            });
            const data = await res.json();
            if (data.status === 'INGEST_SUCCESS') {
                setApiMessage(`Ingest Success! Written to somatic ledger (Confidence: ${data.confidence_score}).`);
                setScenario(targetScenario);
                setVoiceInput('');
            } else if (data.status === 'CONFIDENCE_GATE_FAIL') {
                setApiMessage(`Confidence Gate Blocked Log (Confidence: ${data.confidence_score}).`);
            }
            fetchAllData();
        } catch (err) {
            setApiMessage(`Voice Processing Failed: ${err.message}`);
        }
        setTimeout(() => setApiMessage(''), 5000);
    };

    // Confirm Proposal Calendar Writes
    const handleConfirmProposal = async () => {
        setApiMessage('Mutating cached Google Calendar events...');
        try {
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
            fetchAllData();
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
            fetchAllData();
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

    const activeState = biologicalStates[scenario];

    // Calculate Recommendation parameters
    let profileKey = scenario;
    if (overrideActive) {
        profileKey = 'override';
    }
    const currentData = { ...recommendations[profileKey][timeOfDay] };
    if (overrideActive) {
        currentData.battery = activeState.battery;
        currentData.desc = `Anya is ignoring Ebb's advice. Her CAS alignment score has dropped to 42% because she skipped her morning focus shifts and is trying to write specifications on ${activeState.battery}% battery.`;
    }

    // Circular Battery meter circumference parameters
    const ringRadius = 60;
    const ringCircumference = 377; // 2 * Math.PI * 60
    const ringOffset = ringCircumference - (currentData.battery / 100) * ringCircumference;

    // Timeline marker position percentage
    let highlightedTime = '9:00';
    let timeText = '9:30 AM';
    if (timeOfDay === 'afternoon') {
        highlightedTime = '2:00';
        timeText = '2:00 PM';
    } else if (timeOfDay === 'evening') {
        highlightedTime = '5:00';
        timeText = '8:00 PM';
    }

    // Render calendar rows dynamically
    const displayEvents = calendarEvents.length > 0 ? calendarEvents : (scenario === 'stable' ? fallbackEventsStable : fallbackEventsLow);

    return (
        <div className="app-container" style={{ background: activeState.themeBgGradient, transition: 'background 0.5s ease' }}>
            {/* Sidebar Controller */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="logo-glow" style={{ background: activeState.themeColor }}></div>
                    <i className="fa-solid fa-wind brand-icon" style={{ color: activeState.themeColor, filter: `drop-shadow(0 0 8px ${activeState.themeColor}aa)` }}></i>
                    <span className="brand-name">ebb</span>
                </div>

                <div className="sim-card">
                    <h3><i className="fa-solid fa-sliders"></i> SIMULATION HUB</h3>
                    <p className="sim-instructions">Toggle biological states and times of day to watch Ebb automatically adjust the calendar and recommendations.</p>

                    <div className="sim-section">
                        <label className="section-label">Biological State (Anya)</label>
                        <div className="toggle-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Stable Recovery Option */}
                            <button 
                                id="btn-high-energy" 
                                className={`btn-toggle ${scenario === 'stable' ? 'active' : ''}`}
                                onClick={() => handleSomaticSync('stable')}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    border: scenario === 'stable' ? `1px solid ${biologicalStates.stable.themeColor}` : '1px solid rgba(255,255,255,0.08)',
                                    background: scenario === 'stable' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '10px',
                                    width: '100%',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-battery-full" style={{ color: '#00f2fe', fontSize: '1rem' }}></i>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Stable Recovery</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>HRV 78ms | Sleep 8.2h</div>
                                    </div>
                                </div>
                                {scenario === 'stable' && <i className="fa-solid fa-circle-check" style={{ color: '#00f2fe', fontSize: '1.1rem' }}></i>}
                            </button>

                            {/* Compressed Peak Option */}
                            <button 
                                id="btn-compressed-energy" 
                                className={`btn-toggle ${scenario === 'compressed' ? 'active' : ''}`}
                                onClick={() => handleSomaticSync('compressed')}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    border: scenario === 'compressed' ? `1px solid ${biologicalStates.compressed.themeColor}` : '1px solid rgba(255,255,255,0.08)',
                                    background: scenario === 'compressed' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '10px',
                                    width: '100%',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-battery-three-quarters" style={{ color: '#eab308', fontSize: '1rem' }}></i>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Compressed Peak</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>HRV 52ms | Sleep 8.2h</div>
                                    </div>
                                </div>
                                {scenario === 'compressed' && <i className="fa-solid fa-circle-check" style={{ color: '#eab308', fontSize: '1.1rem' }}></i>}
                            </button>

                            {/* Cortisol Red-line Option */}
                            <button 
                                id="btn-low-energy" 
                                className={`btn-toggle ${scenario === 'redline' ? 'active' : ''}`}
                                onClick={() => handleSomaticSync('redline')}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    border: scenario === 'redline' ? `1px solid ${biologicalStates.redline.themeColor}` : '1px solid rgba(255,255,255,0.08)',
                                    background: scenario === 'redline' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '10px',
                                    width: '100%',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-battery-quarter warning-glow" style={{ color: '#ef4444', fontSize: '1rem' }}></i>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Cortisol Red-line</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>HRV 24ms | Sleep 5.8h</div>
                                    </div>
                                </div>
                                {scenario === 'redline' && <i className="fa-solid fa-circle-check" style={{ color: '#ef4444', fontSize: '1.1rem' }}></i>}
                            </button>
                        </div>
                    </div>

                    <div className="sim-section">
                        <label className="section-label">Time of Day Simulator</label>
                        <div className="time-switches">
                            <button 
                                className={`btn-time ${timeOfDay === 'morning' ? 'active' : ''}`}
                                onClick={() => setTimeOfDay('morning')}
                                style={timeOfDay === 'morning' ? { background: activeState.themeGradient, border: `1px solid ${activeState.themeColor}`, color: '#07090e', fontWeight: '700' } : {}}
                            >
                                <i className="fa-regular fa-sun"></i> 9:30 AM
                            </button>
                            <button 
                                className={`btn-time ${timeOfDay === 'afternoon' ? 'active' : ''}`}
                                onClick={() => setTimeOfDay('afternoon')}
                                style={timeOfDay === 'afternoon' ? { background: activeState.themeGradient, border: `1px solid ${activeState.themeColor}`, color: '#07090e', fontWeight: '700' } : {}}
                            >
                                <i className="fa-solid fa-cloud-sun"></i> 2:00 PM
                            </button>
                            <button 
                                className={`btn-time ${timeOfDay === 'evening' ? 'active' : ''}`}
                                onClick={() => setTimeOfDay('evening')}
                                style={timeOfDay === 'evening' ? { background: activeState.themeGradient, border: `1px solid ${activeState.themeColor}`, color: '#07090e', fontWeight: '700' } : {}}
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
                        <li className="sensor-item active">
                            <div className="sensor-info">
                                <i className="fa-solid fa-desktop sensor-icon"></i>
                                <span>Desktop Telemetry</span>
                            </div>
                            <span className="status-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                {bufferedTelemetry > 0 ? `${bufferedTelemetry} logs` : 'Active'}
                            </span>
                        </li>
                    </ul>

                    {/* Side-by-side Telemetry log triggers */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                            className="btn-toggle" 
                            style={{ flex: 1, padding: '8px 10px', fontSize: '0.72rem', justifyContent: 'center', margin: 0, cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                            onClick={handleLogTelemetry}
                        >
                            🖱️ Mouse Log
                        </button>
                        <button 
                            className="btn-toggle" 
                            style={{ flex: 1, padding: '8px 10px', fontSize: '0.72rem', justifyContent: 'center', margin: 0, cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                            onClick={handleLogTelemetry}
                        >
                            ⌨️ Key Log
                        </button>
                    </div>

                    {bufferedTelemetry > 0 && (
                        <div style={{ marginTop: '4px' }}>
                            <button className="btn-flush" onClick={handleFlushTelemetry} style={{ width: '100%', fontSize: '0.72rem', padding: '6px', cursor: 'pointer' }}>
                                <i className="fa-solid fa-arrow-down-to-bracket"></i> Flush telemetry logs
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: '4px' }}>
                        <button 
                            className="btn-toggle" 
                            style={{ width: '100%', padding: '8px 10px', fontSize: '0.72rem', justifyContent: 'center', margin: 0, cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                            onClick={handleOpenCalibration}
                        >
                            📝 Weekly Baseline Survey
                        </button>
                    </div>
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
                            style={{ color: activeState.themeColor, background: `${activeState.themeColor}12` }}
                        >
                            <i className="fa-solid fa-gauge-high"></i> Dashboard
                        </button>
                    </nav>

                    <div className="user-profile">
                        <div className="persona-badge">
                            <span className="persona-name">Anya</span>
                            <span className="persona-role">Staff AI Engineer (San Francisco)</span>
                        </div>
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" alt="Anya" className="avatar" />
                    </div>
                </header>

                {/* Dashboard Tab Content */}
                {activeTab === 'dashboard' && (
                    <div className="tab-content active" style={{ padding: '2rem' }}>
                        <div className="dashboard-grid">
                            
                            {/* Biometrics Card */}
                            <div className="grid-card" style={{
                                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${activeState.cardGlow}`,
                                border: '1px solid rgba(255,255,255,0.06)',
                                height: '100%',
                                padding: '1.5rem',
                                background: 'var(--bg-card)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '18px'
                            }}>
                                <div className="card-header">
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-heart-pulse" style={{ color: activeState.themeColor }}></i> RESTING BIOMETRICS
                                    </h2>
                                    <span className="badge">Luna Ring Sync</span>
                                </div>
                                <div className="biometrics-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.25rem' }}>
                                    <div className="biometric-item" style={{ flex: 1 }}>
                                        <span className="biometric-label" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>HRV (Today)</span>
                                        <span className="metric-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                                            {activeState.hrv} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>ms</span>
                                        </span>
                                        <span className="biometric-desc" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                            {scenario === 'redline' ? 'Temp: +0.4°C (Sleep Debt)' : `Sleep: ${activeState.sleep}`}
                                        </span>
                                    </div>
                                    <div className="biometric-item" style={{ flex: 1 }}>
                                        <span className="biometric-label" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Somatic Load</span>
                                        <span className="metric-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                                            {currentData.alertness}
                                        </span>
                                        <span className="biometric-desc" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                            {currentData.alertnessDesc}
                                        </span>
                                    </div>
                                    <div className="biometric-item" style={{ flex: 1, borderTop: 'none', paddingTop: 0 }}>
                                        <span className="biometric-label" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Cognitive Alignment</span>
                                        <span className={`metric-value ${overrideActive ? '' : 'alignment-glowing'}`} style={{
                                            display: 'block',
                                            fontSize: '1.8rem',
                                            fontWeight: 800,
                                            marginTop: '4px',
                                            color: overrideActive ? 'var(--color-danger)' : (dbAudit ? '' : (activeState.cas >= 90 ? 'var(--color-focus)' : 'var(--color-admin)')),
                                            textShadow: overrideActive ? 'none' : '0 0 10px rgba(0, 242, 254, 0.4)'
                                        }}>
                                            {overrideActive ? 42 : (dbAudit ? dbAudit.cognitive_alignment.cas_score_percentage : activeState.cas)}%
                                        </span>
                                        <span className="biometric-desc" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                            {overrideActive ? 'Severe schedule mismatch' : (dbAudit ? `Shield adherence: ${dbAudit.shield_adherence.adherence_rate_percentage}%` : 'Perfect biological alignment')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Battery gauge */}
                            <div className="grid-card" style={{
                                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${activeState.cardGlow}`,
                                border: '1px solid rgba(255,255,255,0.06)',
                                height: '100%',
                                padding: '1.5rem',
                                background: 'var(--bg-card)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '18px'
                            }}>
                                <div className="card-header">
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-battery-half" style={{ color: activeState.themeColor }}></i> Energy Battery
                                    </h2>
                                </div>
                                <div className="battery-outer" style={{ width: '175px', height: '175px', margin: '20px auto 10px auto', position: 'relative' }}>
                                    <div className="battery-progress-svg">
                                        <svg width="175" height="175" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                                            <defs>
                                                <linearGradient id={activeState.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    {activeState.gradStops}
                                                </linearGradient>
                                            </defs>
                                            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                                            <circle 
                                                cx="70" 
                                                cy="70" 
                                                r="60" 
                                                fill="none" 
                                                stroke={`url(#${activeState.gradientId})`} 
                                                strokeWidth="10" 
                                                strokeDasharray="377" 
                                                strokeDashoffset={ringOffset} 
                                                strokeLinecap="round" 
                                                style={{
                                                    filter: `drop-shadow(0 0 6px ${activeState.shadowColor})`,
                                                    transition: 'stroke-dashoffset 0.8s ease'
                                                }}
                                            />
                                        </svg>
                                    </div>
                                    <div className="battery-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                                        <span className="value" style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800, color: '#fff', display: 'block', lineHeight: 1 }}>{currentData.battery}%</span>
                                        <span className="label" style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'Inter', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                                            {overrideActive ? 'BIOLOGICAL MISALIGNMENT' : activeState.statusLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Circadian chart */}
                            <div className="grid-card" style={{
                                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${activeState.cardGlow}`,
                                border: '1px solid rgba(255,255,255,0.06)',
                                height: '100%',
                                padding: '1.5rem',
                                background: 'var(--bg-card)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '18px'
                            }}>
                                <div className="card-header">
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fa-solid fa-chart-line" style={{ color: activeState.themeColor }}></i> Circadian Waves
                                    </h2>
                                    <span className="badge" style={{ fontSize: '0.7rem' }}>Current: {timeText}</span>
                                </div>
                                <div style={{ width: '100%', height: '140px', marginTop: '15px', position: 'relative' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
                                        <defs>
                                            <linearGradient id={activeState.areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                                                {activeState.areaStop}
                                            </linearGradient>
                                        </defs>
                                        <circle cx="0" cy="0" r="0" />
                                        <line x1="0" y1="0" x2="0" y2="140" stroke="rgba(255,255,255,0.03)"/>
                                        <line x1="35" y1="0" x2="35" y2="140" stroke="rgba(255,255,255,0.03)"/>
                                        <line x1="70" y1="0" x2="70" y2="140" stroke="rgba(255,255,255,0.03)"/>
                                        <line x1="105" y1="0" x2="105" y2="140" stroke="rgba(255,255,255,0.03)"/>
                                        <line x1="140" y1="0" x2="140" y2="140" stroke="rgba(255,255,255,0.03)"/>
                                        
                                        <path d={activeState.fillPath} fill={`url(#${activeState.areaGradientId})`} />
                                        <path d={activeState.wavePath} fill="none" stroke={activeState.waveColor} strokeWidth="3.5" style={{ filter: `drop-shadow(0 0 5px ${activeState.waveColor})` }}/>
                                    </svg>
                                    <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af', marginTop: '15px', fontFamily: 'Inter' }}>
                                        <span>10:00</span>
                                        <span>11:00</span>
                                        <span>12:00</span>
                                        <span>1:00</span>
                                        <span>2:00</span>
                                        <span>3:00</span>
                                        <span>4:00</span>
                                        <span>5:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coach Card */}
                        <section 
                            className={`recom-card-container ${currentData.theme}`} 
                            id="recom-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderLeft: `4px solid ${activeState.themeColor}`,
                                borderRadius: '14px',
                                padding: '1.5rem',
                                marginBottom: '24px',
                                background: overrideActive 
                                    ? `radial-gradient(circle at top left, ${activeState.themeColor}0f, transparent), rgba(17, 24, 39, 0.4)`
                                    : (currentData.type.includes('FOCUS') || currentData.type.includes('FLOW')
                                        ? 'radial-gradient(circle at top left, rgba(0, 242, 254, 0.06), transparent), rgba(17, 24, 39, 0.4)'
                                        : currentData.type.includes('ADMIN')
                                            ? 'radial-gradient(circle at top left, rgba(234, 179, 8, 0.06), transparent), rgba(17, 24, 39, 0.4)'
                                            : `radial-gradient(circle at top left, ${activeState.themeColor}0f, transparent), rgba(17, 24, 39, 0.4)`),
                                boxShadow: `0 4px 20px ${activeState.themeColor}0a`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div className="recom-accent" style={{ background: activeState.themeColor }}></div>
                            <div className="recom-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                <div className="recom-icon-circle" style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    color: activeState.themeColor,
                                    flexShrink: 0
                                }}>
                                    <i className={currentData.icon} id="recom-icon"></i>
                                </div>
                                <div className="recom-details" style={{ flexGrow: 1 }}>
                                    <div className="recom-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="recom-badge" id="recom-type" style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.06)',
                                            border: `1px solid rgba(255,255,255,0.08)`,
                                            color: activeState.themeColor
                                        }}>{currentData.type}</span>
                                        <span className="recom-time-sub" style={{ fontSize: '0.72rem', color: '#9ca3af' }}><i className="fa-regular fa-clock"></i> Recommended Right Now</span>
                                    </div>
                                    <h2 className="recom-title" id="recom-title" style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: '#fff', marginTop: '10px', marginBottom: '8px' }}>{currentData.title}</h2>
                                    <p className="recom-desc" id="recom-description" style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.5 }}>{currentData.desc}</p>
                                </div>
                            </div>
                            <div className="recom-action-area" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.25rem' }}>
                                {scenario !== 'stable' && !overrideActive && timeOfDay === 'morning' && (
                                    <button className="action-btn animate-pulse" id="recom-action-btn" onClick={handleConfirmProposal} style={{
                                        background: activeState.themeGradient,
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        color: '#07090e',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: `0 0 12px ${activeState.themeColor}55`
                                    }}>
                                        <i className="fa-solid fa-play"></i> Confirm Calendar Shield
                                    </button>
                                )}
                                {scenario !== 'stable' && !overrideActive && timeOfDay === 'afternoon' && (
                                    <button className="action-btn animate-pulse" id="recom-action-btn" onClick={handleMiddayRebuild} style={{
                                        background: activeState.themeGradient,
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        color: '#07090e',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: `0 0 12px ${activeState.themeColor}55`
                                    }}>
                                        <i className="fa-solid fa-refresh"></i> Mid-Day Rebuild Reset
                                    </button>
                                )}
                                {(scenario === 'stable' || overrideActive || timeOfDay === 'evening') && (
                                    <button className="action-btn" id="recom-action-btn" style={{
                                        background: activeState.themeGradient,
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        color: '#07090e',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: `0 0 12px ${activeState.themeColor}55`
                                    }}>
                                        <i className="fa-solid fa-play"></i> {currentData.btnText}
                                    </button>
                                )}
                                <button className="action-btn secondary" style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    padding: '9px 18px',
                                    borderRadius: '8px',
                                    color: '#f3f4f6',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                    Slack Auto-Paused (20m)
                                </button>
                                <span className="action-helper" id="recom-action-helper" style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: 'auto' }}>{currentData.helper}</span>
                            </div>
                        </section>

                        {/* Voice Input pipeline card */}
                        <section className="grid-card" style={{ marginBottom: '24px', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderRadius: '18px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <div className="card-header">
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-microphone" style={{ color: activeState.themeColor }}></i> "VENT-TO-ADJUST" VOICE PIPELINE
                                </h2>
                                <span className="badge" style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>Luna Chain-of-Thought</span>
                            </div>
                            <form onSubmit={handleVoiceIngest} className="voice-form-row" style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                                <input 
                                    type="text" 
                                    className="voice-input-text" 
                                    placeholder="Vent your physical symptoms (e.g. 'Woke up with jawline acne and hair shedding...')" 
                                    value={voiceInput}
                                    onChange={(e) => setVoiceInput(e.target.value)}
                                    style={{
                                        flexGrow: 1,
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                                <button type="submit" className="voice-submit-btn" style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1.25rem',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i className="fa-solid fa-paper-plane"></i> Parse Ingress
                                </button>
                            </form>
                            <p className="sim-instructions" style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Type a symptom note. If it contains trigger words (<em>breakout</em>, <em>shedding</em>, etc.), the local LLM will automatically trigger a red-line rebuild scenario.
                            </p>
                        </section>

                        {/* Calendar Cache list */}
                        <section className="grid-card" style={{ marginBottom: '24px', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderRadius: '18px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-calendar-check" style={{ color: activeState.themeColor }}></i> GCAL LOCAL SQL CACHE (Today)
                                </h2>
                                <span className="badge">Google OAuth Active</span>
                            </div>

                            {/* Time markers bar */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px', fontFamily: 'Inter' }}>
                                {["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00"].map((t) => {
                                    const isHighlighted = t === highlightedTime;
                                    return (
                                        <div 
                                            key={t}
                                            style={isHighlighted ? {
                                                background: activeState.themeGradient,
                                                border: `1px solid ${activeState.themeColor}`,
                                                padding: '6px 16px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                color: '#07090e',
                                                fontWeight: '700',
                                                boxShadow: `0 0 10px ${activeState.themeColor}55`
                                            } : {
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                                padding: '6px 16px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                color: '#9ca3af',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {t}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Vertical list of events */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {displayEvents.map((evt, idx) => {
                                    const { borderStyle, borderColor, badgeBg, badgeText, itemBg, statusLabel } = getEventStyle(evt.event_title, evt.classification, scenario);
                                    return (
                                        <div 
                                            key={idx}
                                            style={{
                                                borderLeft: `4px ${borderStyle} ${borderColor}`,
                                                background: itemBg,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                borderTop: '1px solid rgba(255,255,255,0.02)',
                                                borderRight: '1px solid rgba(255,255,255,0.02)',
                                                borderBottom: '1px solid rgba(255,255,255,0.02)',
                                                fontFamily: 'Inter'
                                            }}
                                        >
                                            <div>
                                                <strong style={{ color: '#ffffff', fontSize: '0.95rem', display: 'block' }}>{evt.event_title}</strong>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                    <i className="fa-regular fa-clock"></i> {formatTime(evt.start_time)} - {formatTime(evt.end_time)}
                                                </span>
                                            </div>
                                            <span style={{
                                                background: badgeBg,
                                                color: badgeText,
                                                border: `1px solid ${borderColor}33`,
                                                fontWeight: 600,
                                                fontFamily: 'Inter',
                                                fontSize: '0.7rem',
                                                padding: '3px 8px',
                                                borderRadius: '4px'
                                            }}>{statusLabel}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Diagnostics insight panel */}
                        <section className="grid-card insight-box" style={{
                            position: 'relative',
                            background: 'rgba(17, 24, 39, 0.4)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '18px',
                            padding: '1.5rem',
                            overflow: 'hidden'
                        }}>
                            <div className="insight-glow" style={{ position: 'absolute', width: '200px', height: '200px', background: activeState.themeColor, filter: 'blur(80px)', opacity: 0.05, top: '-50px', left: '-50px' }}></div>
                            <div className="insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Outfit', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '10px' }}>
                                <i className="fa-solid fa-brain insight-icon" style={{ color: activeState.themeColor }}></i>
                                <span className="insight-title">PM INSIGHTS & BIO-DIAGNOSTICS</span>
                            </div>
                            <p className="insight-text" id="pm-insight-text" style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>{currentData.insight}</p>
                        </section>
                    </div>
                )}

                {/* Written Walkthrough Tab Content */}
                {activeTab === 'walkthrough' && (
                    <div className="tab-content active" style={{ padding: '2rem' }}>
                        <div className="walkthrough-container">
                            <div className="walkthrough-header" style={{ marginBottom: '2rem' }}>
                                <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Product Strategy & Walkthrough</h1>
                                <p className="subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Ebb: Restructuring corporate calendars around physical & aesthetic stress indicators</p>
                            </div>

                            <div className="walkthrough-grid">
                                
                                {/* 1. The User & The Moment */}
                                <div className="walkthrough-card">
                                    <div className="number-bubble" style={{ background: activeState.themeColor }}>1</div>
                                    <h2>The User & The Moment</h2>
                                    <div className="card-content">
                                        <h3>Target Persona: Anya (29)</h3>
                                        <p>Anya is a Staff AI Engineer at a high-growth San Francisco scale-up. She is highly ambitious and treats her physical body like a high-performance machine to be bio-hacked and optimized. Her raw pain point is that the **sheer cognitive overhead of trying to have it all is the root cause of her biological breakdown**—specifically stress-induced hair loss (telogen effluvium) and cortisol-driven adult cystic acne.</p>
                                        
                                        <div className="comparison-block" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '10px', marginTop: '1rem' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>A Typical Tuesday Morning without Ebb</h4>
                                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <li><strong>7:30 AM</strong>: Wakes up physically exhausted (HRV 24ms). Finds a clump of hair on her pillow, checks forehead cystic breakout, and begins to spiral.</li>
                                                <li><strong>8:15 AM</strong>: Forces herself onto Peloton to "stay active," but feels lightheaded and stops. Grabs espresso to force alertness, spiking cortisol.</li>
                                                <li><strong>8:45 AM</strong>: Calendar has Daily Scrum, Architecture Review (20 people, locked), and Security Spec Drafting.</li>
                                                <li><strong>2:00 PM</strong>: Slump hits. She tries to write the security spec on 15% battery but gets distracted. Feels guilty and "unprofessional."</li>
                                                <li><strong>10:00 PM</strong>: Apple Watch buzzes to "finish her stand goal," and she vents to ChatGPT.</li>
                                            </ul>
                                        </div>

                                        <div className="ebb-impact-block" style={{ borderLeft: `3px solid ${activeState.themeColor}`, background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0 8px 8px 0', marginTop: '1rem' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Where Ebb Enters Anya's Life</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>At 8:30 AM, after detecting poor wearable recovery, Ebb auto-adjusts her calendar. It leaves heavy multiplayer meetings (scrum standup, review) locked in place as they cannot be rescheduled easily, but slides her alone spec writing block earlier to capture her peak, deletes her intense Peloton session, and inserts a 30-minute recovery buffer right after the architecture review to let her nervous system recover.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. The Product Itself */}
                                <div className="walkthrough-card">
                                    <div className="number-bubble" style={{ background: activeState.themeColor }}>2</div>
                                    <h2>The Product Itself</h2>
                                    <div className="card-content">
                                        <h3>Core Value: Passive Sensing & Zero-Log Ledger</h3>
                                        <p>Ebb operates on **90% passive sensing and 10% active input** (morning voice slider). It recognizes that manual logging is the first thing that dies when a user is exhausted. She speaks naturally for 20 seconds to her Luna Ring, and an LLM structures and updates all 8 dimensions of her life ledger.</p>
                                        
                                        <div className="table-container" style={{ margin: '1rem 0', overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                        <th style={{ textAlign: 'left', padding: '8px', color: '#fff' }}>Data Type</th>
                                                        <th style={{ textAlign: 'left', padding: '8px', color: '#fff' }}>How We Get It</th>
                                                        <th style={{ textAlign: 'left', padding: '8px', color: '#fff' }}>Active/Passive</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '8px' }}>Sleep & HRV</td>
                                                        <td style={{ padding: '8px' }}>Wearables (Oura Ingestion)</td>
                                                        <td style={{ padding: '8px' }}><span className="tag passive" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Passive</span></td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '8px' }}>Calendar Metadata</td>
                                                        <td style={{ padding: '8px' }}>Google Calendar / Outlook Sync</td>
                                                        <td style={{ padding: '8px' }}><span className="tag passive" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Passive</span></td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '8px' }}>Telemetry</td>
                                                        <td style={{ padding: '8px' }}>Desktop client keyboard/idle sensor</td>
                                                        <td style={{ padding: '8px' }}><span className="tag passive" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Passive</span></td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '8px' }}>Subjective Health</td>
                                                        <td style={{ padding: '8px' }}>3-second morning voice check-in</td>
                                                        <td style={{ padding: '8px' }}><span className="tag active" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Active</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <h3>The Key Interaction: Multi-Person Locked Calendar Shifter</h3>
                                        <p>Ebb respects corporate scheduling constraints. Unilateral calendar moves only apply to **alone working hours** (writing specs, admin triage). Multiplayer meetings are locked in place to avoid team conflicts, and Ebb instead injects **Active Recovery buffers** immediately after these intense sessions to let her recharge.</p>
                                    </div>
                                </div>

                                {/* 3. The Hero Metric */}
                                <div className="walkthrough-card">
                                    <div className="number-bubble" style={{ background: activeState.themeColor }}>3</div>
                                    <h2>The Hero Metric</h2>
                                    <div className="card-content">
                                        <h3>Cognitive Alignment Score (CAS)</h3>
                                        <p>CAS measures how successfully Anya aligns the complexity of her tasks with her biological capacity, rewarding her for resting when depleted.</p>
                                        
                                        <div className="formula-box" style={{ margin: '1rem 0', background: '#090c10', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="formula" style={{ textAlign: 'center', fontSize: '0.85rem', color: '#fff', fontFamily: 'Outfit' }}>
                                                <div style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>CAS</span> = 
                                                </div>
                                                <div style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center', marginLeft: '8px', marginRight: '8px' }}>
                                                    <div style={{ borderBottom: '1px solid #fff', paddingBottom: '4px', paddingLeft: '8px', paddingRight: '8px' }}>
                                                        Time in Focus (Peak State) + Time in Recovery/Admin (Slump State)
                                                    </div>
                                                    <div style={{ paddingTop: '4px' }}>
                                                        Total Working Hours
                                                    </div>
                                                </div>
                                                <div style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    &times; 100
                                                </div>
                                            </div>
                                        </div>

                                        <div className="key-callout" style={{ borderLeft: '3px solid var(--color-focus)', background: 'rgba(0, 242, 254, 0.01)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', margin: '1rem 0' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Why CAS Matters</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Traditional tools measure volume (hours worked). CAS measures decision quality in the context of biology. Anya can earn a 100% CAS on a low-energy day if she reschedules alone deep-work blocks, attends locked meetings, and takes recovery walks during her slumps.</p>
                                        </div>

                                        <div className="warning-callout" style={{ borderLeft: '3px solid var(--color-admin)', background: 'rgba(234, 179, 8, 0.01)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', margin: '1rem 0' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Unhealthy Gamification & Mitigation</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}><strong>The Risk:</strong> Anya might avoid challenging tasks on low-energy days or decline critical group meetings to keep her CAS perfect.</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}><strong>The Fix:</strong> Locked team reviews are excluded from CAS penalties, and Ebb caps focus-time scores to reward consistent effort.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. The Retention Problem */}
                                <div className="walkthrough-card">
                                    <div className="number-bubble" style={{ background: activeState.themeColor }}>4</div>
                                    <h2>The Retention Problem</h2>
                                    <div className="card-content">
                                        <h3>Breaking the 90-Day Churn Cliff</h3>
                                        <p>Most wellness apps lose 80% of users by Day 90. Ebb survives because it operates as a **structural workflow utility, not a tracking habit**.</p>
                                        
                                        <div className="mechanism-block" style={{ display: 'flex', gap: '12px', marginTop: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '10px' }}>
                                            <i className="fa-solid fa-lock mechanism-icon" style={{ fontSize: '1.2rem', color: activeState.themeColor, marginTop: '2px' }}></i>
                                            <div className="mechanism-text">
                                                <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Workflow Integration vs. Manual Habits</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Ebb integrates directly with Google Calendar. When Anya wakes up with a cortisol crash, Ebb automatically reschedules her alone blocks and creates recovery slots. She doesn't need to open Ebb to get value. Removing Ebb means losing her calendar assistant and taking back the cognitive load of scheduling, which creates immediate friction.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. What We Would Build First */}
                                <div className="walkthrough-card full-width" style={{ gridColumn: '1 / span 2' }}>
                                    <div className="number-bubble" style={{ background: activeState.themeColor }}>5</div>
                                    <h2>What We Would Build First (v1 MVP)</h2>
                                    <div className="card-content v1-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>12-Week Roadmap Scope</h3>
                                            <p style={{ marginTop: '0.5rem' }}>To prove the concept with 1 engineer and 12 weeks, we build the core schedule blocker widget.</p>
                                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <li><strong>Keep:</strong> A macOS/Windows menu bar app that integrates with Google Calendar and prompts a 3-question morning slider (Sleep quality, Fatigue, HRV mock). It blocks out 90 minutes of "Protected Focus" automatically based on morning inputs.</li>
                                                <li><strong>Cut:</strong> Live Apple Watch API, keystroke activity tracker, team-wide scheduling sync dashboard, and user analytics.</li>
                                            </ul>
                                        </div>
                                        <div className="mvp-validation-box" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Week 13 Success Metric</h4>
                                            <div className="large-metric" style={{ fontSize: '1.8rem', fontWeight: 800, color: activeState.themeColor, margin: '0.5rem 0' }}>Focus Block Adherence</div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>The percentage of Ebb-created calendar blocks and recovery buffers that users keep (do not delete or schedule over) over a 4-week trial.</p>
                                            <div className="target-badge" style={{ display: 'inline-block', marginTop: '1rem', padding: '4px 12px', borderRadius: '20px', background: `${activeState.themeColor}1a`, border: `1px solid ${activeState.themeColor}33`, color: activeState.themeColor, fontWeight: 700, fontSize: '0.85rem' }}>Target: &gt;70% Adherence</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Weekly Calibration survey modal */}
            {showCalibrationModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="modal-card" style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        width: '450px',
                        padding: '1.5rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div className="modal-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            paddingBottom: '0.75rem',
                            marginBottom: '1.25rem'
                        }}>
                            <h3 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-solid fa-sliders" style={{ color: activeState.themeColor }}></i> WEEKLY BASELINE CALIBRATION</h3>
                            <button className="close-btn" onClick={() => setShowCalibrationModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                        </div>
                        <form onSubmit={handleCalibrationSubmit}>
                            {calibrationQuestions.map((q) => (
                                <div key={q.question_id} className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="section-label" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>{q.prompt_text}</label>
                                    {q.input_type === 'slider' && (
                                        <input 
                                            type="range" 
                                            min={q.min_val} 
                                            max={q.max_val} 
                                            value={calibrationForm.focus_rating}
                                            onChange={(e) => setCalibrationForm({ ...calibrationForm, focus_rating: parseInt(e.target.value) })}
                                            className="slider-input"
                                            style={{ width: '100%', accentColor: activeState.themeColor }}
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
                                            style={{
                                                width: '100%',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: '#fff',
                                                outline: 'none'
                                            }}
                                        />
                                    )}
                                    {q.input_type === 'boolean' && (
                                        <div className="toggle-group" style={{ margin: '8px 0', display: 'flex', gap: '8px' }}>
                                            <button 
                                                type="button" 
                                                className={`btn-time ${calibrationForm.stress_acne_present ? 'active' : ''}`}
                                                onClick={() => setCalibrationForm({ ...calibrationForm, stress_acne_present: true })}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: calibrationForm.stress_acne_present ? activeState.themeGradient : 'rgba(255,255,255,0.02)',
                                                    color: calibrationForm.stress_acne_present ? '#07090e' : '#9ca3af',
                                                    border: calibrationForm.stress_acne_present ? `1px solid ${activeState.themeColor}` : '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Yes
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn-time ${!calibrationForm.stress_acne_present ? 'active' : ''}`}
                                                onClick={() => setCalibrationForm({ ...calibrationForm, stress_acne_present: false })}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: !calibrationForm.stress_acne_present ? activeState.themeGradient : 'rgba(255,255,255,0.02)',
                                                    color: !calibrationForm.stress_acne_present ? '#07090e' : '#9ca3af',
                                                    border: !calibrationForm.stress_acne_present ? `1px solid ${activeState.themeColor}` : '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                No
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="action-btn" style={{
                                width: '100%',
                                marginTop: '16px',
                                background: activeState.themeGradient,
                                border: 'none',
                                padding: '10px',
                                borderRadius: '8px',
                                color: '#07090e',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: `0 0 10px ${activeState.themeColor}33`
                            }}>
                                Save Calibration
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
