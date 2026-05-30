// ==========================================================================
// Ebb: Interactive Prototype Application Logic (Anya's Version)
// ==========================================================================

// Global Application State
const state = {
    scenario: 'high',     // 'high' (Stable recovery) vs 'low' (Cortisol red-line)
    timeOfDay: 'morning', // 'morning' (9:30 AM), 'afternoon' (2:00 PM), 'evening' (8:00 PM)
    overrideActive: false, // User forces "push through" ignoring recommendations
    activeTab: 'dashboard', // 'dashboard' vs 'walkthrough'
    timerRunning: false,
    timerSeconds: 45 * 60 // 45 minutes
};

// Canvas Configuration
let canvas, ctx;

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('energy-chart-canvas');
    ctx = canvas.getContext('2d');
    
    // Set Canvas scale for retina displays
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        renderEnergyCurve();
    });

    // Initial render
    updateAppView();
});

// Resize Canvas context
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// Tab Switcher
function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update Tab navigation buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // Update Tab Content areas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`content-${tabId}`).classList.add('active');
    
    // If returning to dashboard, redraw canvas curve
    if (tabId === 'dashboard') {
        setTimeout(() => {
            resizeCanvas();
            renderEnergyCurve();
        }, 50);
    }
}

// Set Biological Scenario
function setScenario(scen) {
    state.scenario = scen;
    
    // Update Sidebar toggles
    document.getElementById('btn-high-energy').classList.toggle('active', scen === 'high');
    document.getElementById('btn-low-energy').classList.toggle('active', scen === 'low');
    
    updateAppView();
}

// Set Time of Day Simulated State
function setTimeOfDay(time) {
    state.timeOfDay = time;
    
    // Update Time buttons
    document.getElementById('time-morning').classList.toggle('active', time === 'morning');
    document.getElementById('time-afternoon').classList.toggle('active', time === 'afternoon');
    document.getElementById('time-evening').classList.toggle('active', time === 'evening');
    
    updateAppView();
}

// Toggle Force Push Through override
function toggleOverride(checkbox) {
    state.overrideActive = checkbox.checked;
    updateAppView();
}

// ==========================================================================
// Recommendation Matrix Data (Anya's Bio-Profiles)
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

// ==========================================================================
// Calendar Event Schemes (Anya's Schedule)
// ==========================================================================
const calendarSchedules = {
    high: [
        { title: 'Security Spec Drafting', time: '9:00 - 10:00 AM', type: 'focus', col: 1, colSpan: 1, status: 'Alone' },
        { title: 'Architecture Review', time: '10:00 - 11:30 AM', type: 'meeting', col: 2, colSpan: 2, status: 'Locked' },
        { title: 'Backlog Triage', time: '12:00 - 1:00 PM', type: 'admin', col: 4, colSpan: 1, status: 'Alone' },
        { title: 'Team Sync', time: '2:00 - 3:00 PM', type: 'meeting', col: 6, colSpan: 1, status: 'Locked' },
        { title: 'Customer Demo', time: '3:30 - 4:30 PM', type: 'meeting', col: 8, colSpan: 1, status: 'Locked' },
        { title: 'Self-Care: 1-Hr Swim', time: '5:00 - 6:00 PM', type: 'recovery', col: 9, colSpan: 1, status: 'Recovery' }
    ],
    low: [
        { title: 'Security Spec Drafting', time: '9:00 - 10:00 AM', type: 'focus', col: 1, colSpan: 1, status: 'Protected' },
        { title: 'Architecture Review', time: '10:00 - 11:30 AM', type: 'meeting', col: 2, colSpan: 2, status: 'Locked' },
        { title: 'Zero-Stimulus Buffer', time: '11:30 AM - 12:00 PM', type: 'recovery', col: 4, colSpan: 1, status: 'Recovery' },
        { title: 'Backlog Triage', time: '1:00 - 2:00 PM', type: 'admin', col: 5, colSpan: 1, status: 'Shifted' },
        { title: 'Team Sync', time: '2:00 - 3:00 PM', type: 'meeting', col: 6, colSpan: 1, status: 'Locked' },
        { title: 'Somatic Recovery Walk', time: '3:00 - 3:30 PM', type: 'recovery', col: 7, colSpan: 1, status: 'Recovery' },
        { title: 'Customer Demo', time: '3:30 - 4:30 PM', type: 'meeting', col: 8, colSpan: 1, status: 'Locked' },
        { title: 'Hair/Skin Repair Buffer', time: '5:00 - 5:30 PM', type: 'recovery', col: 9, colSpan: 1, status: 'Recovery' }
    ]
};

// ==========================================================================
// UI Rendering Engines
// ==========================================================================

// Main coordinator to update the UI based on state
function updateAppView() {
    // Select the recommendation profile based on state
    let profileKey = state.scenario;
    if (state.scenario === 'low' && state.overrideActive) {
        profileKey = 'override';
    }
    
    const data = recommendations[profileKey][state.timeOfDay];
    
    // 1. Update Metrics Bar
    document.getElementById('metric-alertness').innerText = data.alertness;
    document.getElementById('metric-alertness-desc').innerText = data.alertnessDesc;
    
    document.getElementById('metric-hrv').innerHTML = `${data.hrv} <span class="unit">ms</span>`;
    document.getElementById('metric-sleep').innerText = `Sleep: ${data.sleep}`;
    
    const casElement = document.getElementById('metric-cas');
    casElement.innerText = `${data.cas}%`;
    document.getElementById('metric-cas-desc').innerText = data.casDesc;
    
    // Change CAS color based on score
    casElement.className = 'metric-value';
    if (data.cas >= 90) {
        casElement.classList.add('alignment-glowing');
    } else if (data.cas >= 70) {
        casElement.style.color = 'var(--color-admin)';
        casElement.style.textShadow = '0 0 15px rgba(234, 179, 8, 0.4)';
    } else {
        casElement.style.color = 'var(--color-danger)';
        casElement.style.textShadow = '0 0 15px rgba(239, 68, 68, 0.5)';
    }

    // 2. Update Battery Indicator
    document.getElementById('battery-value').innerText = `${data.battery}%`;
    document.getElementById('battery-status').innerText = data.statusLabel;
    
    const progressRing = document.getElementById('battery-indicator');
    const radius = 95;
    const circumference = 2 * Math.PI * radius; // 596.90
    const offset = circumference - (data.battery / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
    
    // Battery colors: high = focus cyan, slump/medium = admin amber, warning/low = danger red
    if (data.battery >= 75) {
        progressRing.style.stroke = 'var(--color-focus)';
        progressRing.style.filter = 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.5))';
    } else if (data.battery >= 40) {
        progressRing.style.stroke = 'var(--color-admin)';
        progressRing.style.filter = 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.5))';
    } else {
        progressRing.style.stroke = 'var(--color-danger)';
        progressRing.style.filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))';
    }

    // 3. Update Coach Recommendation Card
    const recomCard = document.getElementById('recom-card');
    recomCard.className = 'recom-card-container ' + data.theme;
    
    document.getElementById('recom-icon').className = data.icon;
    document.getElementById('recom-type').innerText = data.type;
    document.getElementById('recom-title').innerText = data.title;
    document.getElementById('recom-description').innerText = data.desc;
    
    const actionBtn = document.getElementById('recom-action-btn');
    actionBtn.innerHTML = `<i class="fa-solid fa-play"></i> ${data.btnText}`;
    document.getElementById('recom-action-helper').innerText = data.helper;

    // 4. Update Time of Day Indicator line in Calendar
    const timeIndicator = document.getElementById('timeline-time-indicator');
    const indicatorTag = timeIndicator.querySelector('.time-tag');
    
    let positionPct = 5.55; // 9:30 AM default
    let timeText = '9:30 AM';
    
    if (state.timeOfDay === 'afternoon') {
        positionPct = 55.55; // 2:00 PM
        timeText = '2:00 PM';
    } else if (state.timeOfDay === 'evening') {
        positionPct = 95; // 8:00 PM (Calendar cap)
        timeText = '8:00 PM';
    }
    
    timeIndicator.style.left = `${positionPct}%`;
    indicatorTag.innerText = timeText;
    document.getElementById('recom-time-indicator').innerText = timeText;

    // 5. Update Calendar Schedule Layout
    // If override is active on low energy, revert calendar positions to high energy (unoptimized schedule)
    const calendarMode = (state.scenario === 'low' && !state.overrideActive) ? 'low' : 'high';
    renderCalendar(calendarMode);

    // 6. Update PM Insight Box
    document.getElementById('pm-insight-text').innerText = data.insight;

    // 7. Redraw the SVG Circadian Curve
    renderEnergyCurve();
}

// Render Calendar Event list into grid columns
function renderCalendar(mode) {
    const calendarContainer = document.getElementById('calendar-list');
    calendarContainer.innerHTML = '';
    
    const events = calendarSchedules[mode];
    
    events.forEach(ev => {
        const block = document.createElement('div');
        block.className = `calendar-block ${ev.type}-block`;
        
        // Add modifier classes for status
        if (ev.status === 'Shifted') {
            block.classList.add('state-shifted');
        } else if (ev.status === 'Declined') {
            block.classList.add('state-declined');
        }
        
        // Apply Grid CSS Column span
        block.style.gridColumn = `${ev.col} / span ${ev.colSpan}`;
        
        // Block Inner Markup
        block.innerHTML = `
            <div class="block-details">
                <span class="block-title">${ev.title}</span>
                <div class="block-time-range">${ev.time}</div>
            </div>
            <div class="block-meta">
                <span class="block-badge">${ev.type}</span>
                ${ev.status ? `<span class="block-status" style="color: ${getStatusColor(ev.status)}">${ev.status}</span>` : ''}
            </div>
        `;
        
        calendarContainer.appendChild(block);
    });
}

// Get Badge Status Color
function getStatusColor(status) {
    if (status === 'Protected') return 'var(--color-focus)';
    if (status === 'Shifted') return 'var(--color-recovery)';
    if (status === 'Declined') return 'var(--color-danger)';
    if (status === 'Locked') return 'var(--text-secondary)';
    if (status === 'Alone') return 'var(--color-focus)';
    if (status === 'Recovery') return 'var(--color-recovery)';
    return 'var(--text-secondary)';
}

// Render Circadian curve onto Canvas
function renderEnergyCurve() {
    if (!canvas) return;
    
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Configure Curve properties based on scenario
    let points = [];
    
    if (state.scenario === 'high') {
        // Normal high energy day: Peak mornings, slump mid-day, smaller peak late afternoon
        points = [
            { x: 0, y: h * 0.4 },            // 9:00 AM: waking alertness
            { x: w * 0.16, y: h * 0.15 },     // 10:30 AM: peak alert
            { x: w * 0.35, y: h * 0.45 },     // 12:30 PM: lunch digest
            { x: w * 0.55, y: h * 0.70 },     // 2:00 PM: afternoon slump crash
            { x: w * 0.78, y: h * 0.42 },     // 4:30 PM: second wind peak
            { x: w * 0.95, y: h * 0.85 }      // 6:00 PM: fatigue starts
        ];
    } else {
        // Low sleep recovery: Flattened morning peak, early decline, deeper slump
        points = [
            { x: 0, y: h * 0.7 },            // 9:00 AM: waking groggy
            { x: w * 0.12, y: h * 0.38 },     // 10:00 AM: compressed peak (low amp)
            { x: w * 0.28, y: h * 0.65 },     // 11:30 AM: early crash starts
            { x: w * 0.50, y: h * 0.88 },     // 1:30 PM: deep fatigue crash
            { x: w * 0.75, y: h * 0.75 },     // 4:00 PM: minor cortisol recovery
            { x: w * 0.95, y: h * 0.95 }      // 6:00 PM: exhausted
        ];
    }
    
    // Draw background guideline grids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 9; i++) {
        const xCoord = (w / 9) * i;
        ctx.beginPath();
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, h);
        ctx.stroke();
    }
    
    // Create glowing gradients
    const energyGradient = ctx.createLinearGradient(0, 0, w, 0);
    if (state.scenario === 'high') {
        energyGradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
        energyGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
        energyGradient.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
    } else {
        energyGradient.addColorStop(0, 'rgba(234, 179, 8, 0.4)');
        energyGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        energyGradient.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
    }
    
    // Draw filled curve area under path
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i+1].x) / 2;
        const yc = (points[i].y + points[i+1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = energyGradient;
    ctx.globalAlpha = 0.08;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Draw the actual path line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i+1].x) / 2;
        const yc = (points[i].y + points[i+1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
    
    ctx.strokeStyle = state.scenario === 'high' ? 'var(--color-focus)' : 'var(--color-admin)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = state.scenario === 'high' ? 'rgba(0, 242, 254, 0.5)' : 'rgba(234, 179, 8, 0.5)';
    ctx.stroke();
    
    // Reset shadow configuration
    ctx.shadowBlur = 0;
    
    // Render current position glowing dot on the curve
    let activeX = w * 0.0555; // 9:30 AM default
    if (state.timeOfDay === 'afternoon') {
        activeX = w * 0.5555;
    } else if (state.timeOfDay === 'evening') {
        activeX = w * 0.95;
    }
    
    // Approximate Y value on quadratic curve at activeX coordinates
    let activeY = h * 0.5;
    for (let i = 0; i < points.length - 1; i++) {
        if (activeX >= points[i].x && activeX <= points[i+1].x) {
            const t = (activeX - points[i].x) / (points[i+1].x - points[i].x);
            activeY = (1 - t) * points[i].y + t * points[i+1].y; // Linear interpolation fallback
            break;
        }
    }
    
    // Render glowing dot
    ctx.beginPath();
    ctx.arc(activeX, activeY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    ctx.arc(activeX, activeY, 12, 0, 2 * Math.PI);
    ctx.strokeStyle = state.scenario === 'high' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(234, 179, 8, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Action button triggers simulated actions
function triggerAction() {
    let profileKey = state.scenario;
    if (state.scenario === 'low' && state.overrideActive) {
        profileKey = 'override';
    }
    const data = recommendations[profileKey][state.timeOfDay];
    
    alert(`Ebb Simulator Action Triggered:\n----------------------------------\nExecuting: "${data.btnText}"\nRole: Anya (Staff AI Engineer)\nImpact: Alone work synchronized with somatic requirements!`);
}
