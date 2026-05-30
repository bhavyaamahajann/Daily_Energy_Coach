import streamlit as st
import datetime
import random
import json
import sqlite3
from database import SomaticDB
import scheduler

# Initialize database
db = SomaticDB()

# Seed mock database calendar cache if empty
def seed_calendar():
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM calendar_cache")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("""
                INSERT OR REPLACE INTO calendar_cache 
                (event_id, event_title, start_time, end_time, attendee_count, classification)
                VALUES (?, ?, ?, ?, ?, ?)
            """, [
                ('evt_spec_1', 'Security Spec Drafting', '2026-05-30T09:00:00Z', '2026-05-30T10:00:00Z', 1, 'RESCHEDULABLE'),
                ('evt_review_2', 'Architecture Review', '2026-05-30T10:00:00Z', '2026-05-30T11:30:00Z', 5, 'LOCKED'),
                ('evt_triage_3', 'Backlog Triage', '2026-05-30T12:00:00Z', '2026-05-30T13:00:00Z', 1, 'RESCHEDULABLE'),
                ('evt_workout_4', 'Peloton HIIT Session', '2026-05-30T17:00:00Z', '2026-05-30T17:30:00Z', 1, 'RESCHEDULABLE')
            ])
            conn.commit()

seed_calendar()

# ---------------------------------------------------------
# Page Configurations & CSS styling
# ---------------------------------------------------------
st.set_page_config(page_title="ebb", page_icon="🌬️", layout="wide")

st.markdown("""
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
    /* Global glassmorphism variables */
    :root {
        --color-focus: #00f2fe;
        --color-recovery: #a855f7;
        --color-admin: #eab308;
        --color-danger: #ef4444;
    }
    
    .reportview-container {
        background-color: #0b0f19 !important;
    }
    
    /* Main Layout Styling */
    div[data-testid="stSidebar"] {
        background-color: rgba(15, 23, 42, 0.95) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        backdrop-filter: blur(20px);
    }
    
    /* Custom brand header styling */
    .brand-title {
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 2.5rem;
        background: linear-gradient(120deg, #fff 40%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 15px;
        margin-bottom: 25px;
    }
    
    .user-profile-widget {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 8px 16px;
    }
    
    .profile-details {
        text-align: right;
    }
    
    .profile-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: #ffffff;
    }
    
    .profile-role {
        font-size: 0.7rem;
        color: #9ca3af;
    }
    
    .indicator-dot {
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
        box-shadow: 0 0 8px #10b981;
    }
    
    .avatar-img {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.1);
        object-fit: cover;
    }
    
    /* Card Glassmorphic container */
    .glass-card {
        background: rgba(17, 24, 39, 0.5) !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        border-radius: 16px !important;
        padding: 20px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(12px);
        margin-bottom: 20px;
    }
    
    .card-title {
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #9ca3af;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    /* Coach Recommendation Card */
    .recom-box {
        position: relative;
        padding: 20px 24px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(17, 24, 39, 0.4);
        margin-top: 20px;
        margin-bottom: 20px;
        overflow: hidden;
    }
    
    .recom-box::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
    }
    
    .recom-box.focus::before { background: var(--color-focus); }
    .recom-box.recovery::before { background: var(--color-recovery); }
    .recom-box.admin::before { background: var(--color-admin); }
    
    /* GCal caching lists */
    .gcal-timeline-item {
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 10px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .badge-status {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }
    
    </style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Sidebar Simulator Panel
# ---------------------------------------------------------
st.sidebar.markdown('<h1 class="brand-title"><i class="fa-solid fa-wind"></i> ebb</h1>', unsafe_allow_html=True)

st.sidebar.subheader("SIMULATION HUB")
st.sidebar.write("Toggle biological parameters and watch Ebb adapt the calendar cached configurations in real time.")

# 1. Biological State Selection
somatic_scenario = st.sidebar.radio(
    "Biological Profile (Anya)",
    ["Stable Recovery (HRV 78ms)", "Cortisol Red-line (HRV 24ms)"],
    index=0
)

# 2. Time switches
time_of_day = st.sidebar.select_slider(
    "Time of Day Simulator",
    options=["Morning", "Afternoon", "Evening"]
)

# 3. Override switch
override_mode = st.sidebar.checkbox(
    "Force 'Push Through' Override",
    value=False,
    help="Simulates Anya ignoring schedule safety recommendations, dropping CAS alignment index"
)

# Active Sensor Caching System
st.sidebar.subheader("PASSIVE SENSORS")

# Keep a local memory cache for telemetry inputs
if "telemetry_cache" not in st.session_state:
    st.session_state.telemetry_cache = 0

# Handle telemetry events
def click_telemetry_event():
    st.session_state.telemetry_cache += 1

col_t1, col_t2 = st.sidebar.columns(2)
with col_t1:
    st.button("🖱️ Mouse Telemetry", on_click=click_telemetry_event, use_container_width=True)
with col_t2:
    st.button("⌨️ Key Telemetry", on_click=click_telemetry_event, use_container_width=True)

if st.session_state.telemetry_cache > 0:
    st.sidebar.warning(f"{st.session_state.telemetry_cache} Telemetry entries buffered in memory.")
    if st.sidebar.button("💾 Flush to Encrypted DB", use_container_width=True):
        for _ in range(st.session_state.telemetry_cache):
            db.log_telemetry(random.randint(10, 80), round(random.random() * 2.5, 2), random.randint(0, 15))
        st.session_state.telemetry_cache = 0
        st.sidebar.success("Telemetry batch flushed successfully!")

# Weekly Baseline survey modal setup
if "survey_open" not in st.session_state:
    st.session_state.survey_open = False

if st.sidebar.button("📝 Weekly Baseline Survey", use_container_width=True):
    st.session_state.survey_open = True

# ---------------------------------------------------------
# Dynamic state mappings
# ---------------------------------------------------------
is_redline = "Cortisol" in somatic_scenario
hrv = 78 if not is_redline else 24
sleep_hours = 8.2 if not is_redline else 5.8
battery = 85 if not is_redline else (30 if override_mode else 45)

# Seed biometrics log dynamically
db_date = datetime.date.today().isoformat()
with db.get_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO biometrics_log 
        (id, date, sleep_duration_seconds, resting_heart_rate, hrv_ms, battery_percentage)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (db_date, db_date, int(sleep_hours * 3600), 62, hrv, battery))
    conn.commit()

# Voice Pipeline Trigger
st.subheader("VENT-TO-ADJUST VOICE PIPELINE")
voice_text = st.text_input(
    "Describe physical symptoms (e.g. breakouts, hair shedding, exhaustion)",
    placeholder="Woke up with heavy hair shedding and jawline acne breakouts...",
    key="voice_ingress_input"
)
if st.button("Parse Ingress", type="secondary"):
    if voice_text:
        is_stress_detected = any(w in voice_text.lower() for w in ["breakout", "shedding", "exhausted", "peloton", "acne", "hair"])
        if is_stress_detected:
            # Force write Low HRV biometrics to trigger redline scheduling rules
            with db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO biometrics_log 
                    (id, date, sleep_duration_seconds, resting_heart_rate, hrv_ms, battery_percentage)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (db_date, db_date, int(5.5 * 3600), 75, 22, 40))
                conn.commit()
            st.success("Whisper parsed stress symptoms! Shield triggered. Please refresh or update simulation hub.")
        else:
            st.info("Ingest complete. Biometrics stable.")

# ---------------------------------------------------------
# Layout Rendering - Header
# ---------------------------------------------------------
st.markdown(f"""
    <div class="header-bar">
        <h2 style='margin: 0; font-family: Outfit; font-weight: 700; color: #ffffff;'>Ebb Command Dashboard</h2>
        <div class="user-profile-widget">
            <div class="profile-details">
                <span class="profile-name">Anya</span><br/>
                <span class="profile-role"><span class="indicator-dot"></span>Active Shielding (Staff Eng)</span>
            </div>
            <img class="avatar-img" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" alt="Avatar"/>
        </div>
    </div>
""", unsafe_allow_html=True)

# Survey Modal logic
if st.session_state.survey_open:
    st.markdown("### Weekly Subjective Survey Calibration")
    with st.form("survey_form"):
        focus_slider = st.slider("Focus capacity rating (1-5)", 1, 5, 3)
        ideal_hours = st.number_input("Ideal sleep hours", min_value=4.0, max_value=12.0, value=8.0, step=0.5)
        breakout = st.checkbox("Active skin breakouts present?")
        submitted = st.form_submit_form_button("Commit Calibration Survey")
        if submitted:
            db.save_calibration(db_date, {
                "focus_rating": focus_slider,
                "ideal_sleep_hours": ideal_hours,
                "stress_acne_present": breakout
            })
            st.session_state.survey_open = False
            st.success("Survey responses encrypted and committed to ebb.db successfully!")

# ---------------------------------------------------------
# Metrics Dashboard Row
# ---------------------------------------------------------
col1, col2, col3 = st.columns(3)

# 1. Resting Biometrics Card
with col1:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.markdown('<div class="card-title"><i class="fa-solid fa-heart-pulse"></i> Resting Biometrics</div>', unsafe_allow_html=True)
    
    # Calculate performance metrics
    shield_adherence = db.calculate_shield_adherence()
    cas_score = 42.0 if (is_redline and override_mode) else (db.calculate_cas())

    st.markdown(f"""
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
                <span style="font-size: 0.75rem; color: #9ca3af;">HRV (Today)</span><br/>
                <strong style="font-size: 1.5rem; color: #00f2fe;">{hrv} ms</strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: #9ca3af;">Cognitive Battery</span><br/>
                <strong style="font-size: 1.25rem; color: {'#10b981' if hrv > 50 else '#ef4444'};">
                    {"Stable" if hrv > 50 else "Red-line"}
                </strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: #9ca3af;">Alignment Index (CAS)</span><br/>
                <strong style="font-size: 2.2rem; font-family: Outfit; font-weight: 800; color: {'#10b981' if cas_score > 70 else '#ef4444'}">{cas_score}%</strong>
                <div style="font-size: 0.7rem; color: #9ca3af;">Adherence rate: {shield_adherence}%</div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# 2. Battery Ring Card
with col2:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.markdown('<div class="card-title"><i class="fa-solid fa-battery-half"></i> Biometric Battery</div>', unsafe_allow_html=True)
    
    ring_offset = 377 - (battery / 100.0) * 377
    stroke_color = "var(--color-focus)" if hrv > 50 else ("var(--color-admin)" if not override_mode else "var(--color-danger)")
    st.markdown(f"""
        <div style="position: relative; width: 175px; height: 175px; margin: auto;">
            <svg width="175" height="175" viewBox="0 0 140 140" style="transform: rotate(-90deg);">
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="10"/>
                <circle cx="70" cy="70" r="60" fill="none" stroke="{stroke_color}" stroke-width="10" 
                    stroke-dasharray="377" stroke-dashoffset="{ring_offset}" stroke-linecap="round" 
                    style="filter: drop-shadow(0 0 6px {stroke_color}); transition: stroke-dashoffset 0.8s ease;"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <span style="font-size: 2.2rem; font-family: Outfit; font-weight: 800; color: #ffffff;">{battery}%</span><br/>
                <span style="font-size: 0.65rem; color: #9ca3af; text-transform: uppercase;">
                    {"Stable" if hrv > 50 else ("Compressed" if not override_mode else "Severe Strain")}
                </span>
            </div>
        </div>
    """, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# 3. Circadian Curves Card
with col3:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.markdown('<div class="card-title"><i class="fa-solid fa-chart-line"></i> Circadian Wave</div>', unsafe_allow_html=True)
    
    # Render Bezier energy curves matching the selected state
    wave_path = "M 0 60 Q 35 20 70 60 T 140 100" if hrv > 50 else "M 0 100 Q 30 50 60 100 T 140 120"
    wave_color = "#00f2fe" if hrv > 50 else "#ef4444"
    st.markdown(f"""
        <div style="width: 100%; height: 140px; margin-top: 15px;">
            <svg width="100%" height="100%" viewBox="0 0 140 140">
                <path d="{wave_path}" fill="none" stroke="{wave_color}" stroke-width="3" style="filter: drop-shadow(0 0 5px {wave_color});"/>
                <line x1="0" y1="0" x2="0" y2="140" stroke="rgba(255,255,255,0.05)"/>
                <line x1="35" y1="0" x2="35" y2="140" stroke="rgba(255,255,255,0.05)"/>
                <line x1="70" y1="0" x2="70" y2="140" stroke="rgba(255,255,255,0.05)"/>
                <line x1="105" y1="0" x2="105" y2="140" stroke="rgba(255,255,255,0.05)"/>
            </svg>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #9ca3af; margin-top: 5px;">
                <span>9:00 AM</span>
                <span>12:00 PM</span>
                <span>3:00 PM</span>
                <span>6:00 PM</span>
            </div>
        </div>
    """, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# ---------------------------------------------------------
# Dynamic Adaptive Coach Recommendations
# ---------------------------------------------------------
st.subheader("ebb ADAPTIVE NEXT-ACTION RECOMMENDATION")

# Determine active recommendation rules
recom_class = "focus"
recom_title = "Deep Work: Security Specification"
recom_desc = "Your morning cognitive capacity is stable. Focus on drafting independent specifications. The automatic calendar protection is currently active."
recom_btn = "Start Focus block"
recom_badge = "PEAK FOCUS"
recom_helper = "Protected Focus Block (Alone)"

# Apply redline scheduling recommendations
if is_redline:
    if override_mode:
        recom_class = "recovery"
        recom_title = "Friction Alert: Straining System"
        recom_desc = "Anya is ignoring Ebb's advice. Her CAS alignment score has dropped to 42% because she skipped her morning focus shifts and is trying to write specifications on 30% battery."
        recom_btn = "Restore Ebb Optimal Schedule"
        recom_badge = "BIOLOGICAL MISALIGNMENT"
        recom_helper = "Extreme Burnout Risk"
    else:
        if time_of_day == "Morning":
            recom_class = "focus"
            recom_title = "Deep Work: Security Spec (Early Peak)"
            recom_desc = "Cortisol is red-lined, peak is compressed. Ebb reschedules triage, locks standup at 10 AM, and inserts a recovery window post-review."
            recom_btn = "Confirm Calendar Shield"
            recom_badge = "COMPRESSED PEAK"
            recom_helper = "Somatic Governor active"
        elif time_of_day == "Afternoon":
            recom_class = "recovery"
            recom_title = "Somatic Recovery: Cortisol-Drop Walk"
            recom_desc = "Post-review crash detected. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels."
            recom_btn = "Mid-Day Rebuild Reset"
            recom_badge = "RECOVERY BLOCK"
            recom_helper = "Slack Auto-Paused (20m)"
        else:
            recom_class = "recovery"
            recom_title = "Urgent: Sleep Debt Recovery"
            recom_desc = "Severe sleep debt detected. Hair shedding risk high. Ebb triggers wind-down protocol now to restore hormone baseline."
            recom_btn = "Start Sleep Prep"
            recom_badge = "SLEEP DEBT RECOVERY"
            recom_helper = "Active Debt Payback"

# Display Coach Recommendation Box
st.markdown(f"""
    <div class="recom-box {recom_class}">
        <span class="badge-status" style="background: rgba(255,255,255,0.06); color: #ffffff; border: 1px solid rgba(255,255,255,0.1);">{recom_badge}</span>
        <h3 style="margin-top: 10px; margin-bottom: 8px;">{recom_title}</h3>
        <p style="margin-bottom: 20px;">{recom_desc}</p>
    </div>
""", unsafe_allow_html=True)

# Confirmation Action buttons
if is_redline and not override_mode and time_of_day == "Morning":
    if st.button("Confirm Calendar Shield", key="btn_confirm_shield"):
        proposal = scheduler.generate_shield_proposal(db_date, db)
        if "proposed_actions" in proposal:
            res = scheduler.confirm_shield_proposal(db_date, proposal["proposed_actions"], db)
            st.success("Calendar boundaries committed! Slack snooze active.")
elif is_redline and not override_mode and time_of_day == "Afternoon":
    if st.button("Execute Mid-Day Rebuild Reset", key="btn_midday_rebuild"):
        today_iso = f"{db_date}T13:00:00Z"
        res = scheduler.execute_midday_rebuild(today_iso, db)
        st.success("Reset Complete! Somatic decompression window injected at 1:00 PM.")
else:
    st.button(recom_btn, key="btn_standard_recom")
st.caption(recom_helper)

# ---------------------------------------------------------
# Calendar Cached Timeline list
# ---------------------------------------------------------
st.subheader("GCAL LOCAL SQL CACHE")

# Fetch current events
with db.get_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT event_title, start_time, end_time, classification FROM calendar_cache ORDER BY start_time")
    rows = cursor.fetchall()

for title, start_time, end_time, classification in rows:
    start_hr = start_time.split("T")[-1][:5]
    end_hr = end_time.split("T")[-1][:5]
    
    # Classify colors
    border_color = "#3b82f6"
    badge_bg = "rgba(59, 130, 246, 0.1)"
    badge_text = "#3b82f6"
    status_label = classification
    
    if "buffer" in title.lower() or "decompression" in title.lower():
        border_color = "#a855f7"
        badge_bg = "rgba(168, 85, 247, 0.1)"
        badge_text = "#a855f7"
        status_label = "RECOVERY BUFFER"
    elif "walk" in title.lower():
        border_color = "#10b981"
        badge_bg = "rgba(16, 185, 129, 0.1)"
        badge_text = "#10b981"
        status_label = "SOMATIC SHIFT"
    elif classification == "LOCKED":
        border_color = "#6b7280"
        badge_bg = "rgba(107, 114, 128, 0.1)"
        badge_text = "#9ca3af"

    st.markdown(f"""
        <div class="gcal-timeline-item" style="border-left: 4px solid {border_color};">
            <div>
                <strong style="color: #ffffff;">{title}</strong><br/>
                <span style="font-size: 0.72rem; color: #9ca3af;"><i class="fa-regular fa-clock"></i> {start_hr} - {end_hr}</span>
            </div>
            <span class="badge-status" style="background: {badge_bg}; color: {badge_text};">{status_label}</span>
        </div>
    """, unsafe_allow_html=True)
