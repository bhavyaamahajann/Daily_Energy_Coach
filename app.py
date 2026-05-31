import streamlit as st
import datetime
import random
import json
import sqlite3
from database import SomaticDB
import scheduler
import textwrap

# Initialize database
db = SomaticDB()

def st_html(html_str, sidebar=False):
    cleaned = "\n".join([line.strip() for line in html_str.split("\n") if line.strip() != ""])
    if sidebar:
        st.sidebar.markdown(cleaned, unsafe_allow_html=True)
    else:
        st.markdown(cleaned, unsafe_allow_html=True)

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
# Page Configurations
# ---------------------------------------------------------
st.set_page_config(page_title="ebb", page_icon="🌬️", layout="wide")

# ---------------------------------------------------------
# State Router Initialization
# ---------------------------------------------------------
if "current_view" not in st.session_state:
    st.session_state.current_view = "onboarding"
if "onboarding_step" not in st.session_state:
    st.session_state.onboarding_step = 1

# Check query params for navigation triggers
params = st.query_params
if "view" in params:
    st.session_state.current_view = params["view"]
if "step" in params:
    try:
        st.session_state.onboarding_step = int(params["step"])
    except ValueError:
        pass

# ---------------------------------------------------------
# Sidebar Simulator Panel (Dashboard view only)
# ---------------------------------------------------------
if st.session_state.current_view == "dashboard":
    st.sidebar.markdown('<h1 class="brand-title"><i class="fa-solid fa-wind"></i> ebb</h1>', unsafe_allow_html=True)
    st.sidebar.subheader("SIMULATION HUB")
    st.sidebar.write("Toggle biological parameters and watch Ebb adapt the calendar cached configurations in real time.")
    
    # 1. Biological State Selection
    somatic_scenario = st.sidebar.radio(
        "Biological Profile (Anya)",
        ["Stable Recovery (HRV 78ms)", "Compressed Peak (HRV 52ms)", "Cortisol Red-line (HRV 24ms)"],
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
else:
    # Defaults for onboarding rendering
    somatic_scenario = "Stable Recovery (HRV 78ms)"
    time_of_day = "Morning"
    override_mode = False

# Keep a local memory cache for telemetry inputs
if "telemetry_cache" not in st.session_state:
    st.session_state.telemetry_cache = 0

# Handle telemetry events
def click_telemetry_event():
    st.session_state.telemetry_cache += 1

# Weekly Baseline survey modal setup
if "survey_open" not in st.session_state:
    st.session_state.survey_open = False

# ---------------------------------------------------------
# Dynamic state mappings
# ---------------------------------------------------------
if "Stable" in somatic_scenario:
    state = "stable"
    hrv = 78
    sleep_hours = 8.2
    battery = 78
    cas_score = 95
    cognitive_battery_text = "Stable"
    cognitive_battery_color = "#00f2fe"
    cognitive_badge_bg = "rgba(0, 242, 254, 0.08)"
    cognitive_badge_border = "rgba(0, 242, 254, 0.15)"
    theme_color = "#00f2fe"
    theme_gradient = "linear-gradient(135deg, #00f2fe 0%, #a855f7 100%)"
    card_glow = "rgba(0, 242, 254, 0.08)"
    theme_bg_gradient = "radial-gradient(circle at 10% 20%, rgba(0, 242, 254, 0.08) 0%, rgba(7, 9, 14, 0) 60%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.06) 0%, rgba(7, 9, 14, 0) 60%)"
    
    gradient_id = "battery-grad-stable"
    grad_stops = """
    <stop offset="0%" stop-color="#00f2fe" />
    <stop offset="100%" stop-color="#a855f7" />
    """
    shadow_color = "rgba(0, 242, 254, 0.4)"
    status_label = "OPTIMAL"
    
    area_gradient_id = "circadian-area-stable"
    area_stop = """
    <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.25" />
    <stop offset="100%" stop-color="#00f2fe" stop-opacity="0" />
    """
    wave_color = "#00f2fe"
    wave_path = "M 0 80 Q 35 15, 70 60 T 140 40"
    fill_path = "M 0 80 Q 35 15, 70 60 T 140 40 L 140 140 L 0 140 Z"
elif "Compressed" in somatic_scenario:
    state = "compressed"
    hrv = 52
    sleep_hours = 8.2
    battery = 45
    cas_score = 72
    cognitive_battery_text = "Compressed"
    cognitive_battery_color = "#eab308"
    cognitive_badge_bg = "rgba(234, 179, 8, 0.08)"
    cognitive_badge_border = "rgba(234, 179, 8, 0.15)"
    theme_color = "#eab308"
    theme_gradient = "linear-gradient(135deg, #eab308 0%, #ef4444 100%)"
    card_glow = "rgba(234, 179, 8, 0.08)"
    theme_bg_gradient = "radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.08) 0%, rgba(7, 9, 14, 0) 60%), radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.06) 0%, rgba(7, 9, 14, 0) 60%)"
    
    gradient_id = "battery-grad-compressed"
    grad_stops = """
    <stop offset="0%" stop-color="#eab308" />
    <stop offset="100%" stop-color="#ef4444" />
    """
    shadow_color = "rgba(234, 179, 8, 0.4)"
    status_label = "COMPRESSED PEAK"
    
    area_gradient_id = "circadian-area-compressed"
    area_stop = """
    <stop offset="0%" stop-color="#eab308" stop-opacity="0.25" />
    <stop offset="100%" stop-color="#eab308" stop-opacity="0" />
    """
    wave_color = "#eab308"
    wave_path = "M 0 90 Q 25 30, 55 90 T 140 110"
    fill_path = "M 0 90 Q 25 30, 55 90 T 140 110 L 140 140 L 0 140 Z"
else: # Cortisol Red-line
    state = "redline"
    hrv = 24
    sleep_hours = 8.2
    battery = 18
    cas_score = 34
    cognitive_battery_text = "Red-line"
    cognitive_battery_color = "#ef4444"
    cognitive_badge_bg = "rgba(239, 68, 68, 0.08)"
    cognitive_badge_border = "rgba(239, 68, 68, 0.15)"
    theme_color = "#ef4444"
    theme_gradient = "linear-gradient(135deg, #ef4444 0%, #881337 100%)"
    card_glow = "rgba(239, 68, 68, 0.08)"
    theme_bg_gradient = "radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.08) 0%, rgba(7, 9, 14, 0) 60%), radial-gradient(circle at 90% 80%, rgba(136, 19, 55, 0.06) 0%, rgba(7, 9, 14, 0) 60%)"
    
    gradient_id = "battery-grad-redline"
    grad_stops = """
    <stop offset="0%" stop-color="#ef4444" />
    <stop offset="100%" stop-color="#881337" />
    """
    shadow_color = "rgba(239, 68, 68, 0.4)"
    status_label = "DEPLETED"
    
    area_gradient_id = "circadian-area-redline"
    area_stop = """
    <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25" />
    <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
    """
    wave_color = "#ef4444"
    wave_path = "M 0 110 Q 30 70, 60 110 T 140 130"
    fill_path = "M 0 110 Q 30 70, 60 110 T 140 130 L 140 140 L 0 140 Z"

# Set recommendation content based on scenario & time of day
if state == "stable":
    if time_of_day == "Morning":
        recom_badge = "PEAK FOCUS"
        recom_title = "Deep Work: Security Specification"
        recom_desc = "Your morning cognitive capacity is stable. Focus on drafting independent specifications. The automatic calendar protection is currently active."
        recom_btn = "Start Focus block"
        recom_helper = "Protected Focus Block (Alone)"
        recom_class = "focus"
    elif time_of_day == "Afternoon":
        recom_badge = "ADMIN WINDOW"
        recom_title = "Backlog Catch-up & Review"
        recom_desc = "You are entering a natural circadian slump. Dedicate this block to low-cognitive tasks like sorting backlog cards or clearing Slack updates."
        recom_btn = "Open Backlog Triage"
        recom_helper = "Low Cognitive Demand (Alone)"
        recom_class = "admin"
    else: # Evening
        recom_badge = "WIND DOWN"
        recom_title = "Disconnect: Turn Off Screens"
        recom_desc = "Work hours are complete. Ebb is auto-muting Slack notifications to protect your sleep hygiene. Sleep prep begins soon."
        recom_btn = "Mute Notifications"
        recom_helper = "Active Sleep Protection"
        recom_class = "recovery"
else: # compressed or redline
    if time_of_day == "Morning":
        if state == "compressed":
            recom_badge = "COMPRESSED PEAK"
            recom_title = "Deep Work: Security Spec (Early Peak)"
            recom_desc = "Cortisol is red-lined, peak is compressed. Ebb reschedules triage, locks standup at 10 AM, and inserts a recovery window post-review."
            recom_btn = "Confirm Calendar Shield"
            recom_helper = "Somatic Governor active"
            recom_class = "focus"
        else: # redline
            recom_badge = "CRITICAL ALERT"
            recom_title = "Recovery Protocol: Cancel Non-Critical"
            recom_desc = "Critical burnout detected. Ebb has cancelled all non-essential meetings, blocked your calendar for recovery, and sent auto-responses to Slack. Prioritize rest."
            recom_btn = "Confirm Calendar Shield"
            recom_helper = "Slack Auto-Paused (20m)"
            recom_class = "recovery"
    elif time_of_day == "Afternoon":
        recom_badge = "RECOVERY BLOCK"
        recom_title = "Somatic Recovery: Cortisol-Drop Walk"
        recom_desc = "Post-review crash detected. Since the multiplayer review could not be moved, Ebb automatically schedules a 30-minute somatic walk buffer immediately after to let Anya lower cortisol levels."
        recom_btn = "Mid-Day Rebuild Reset"
        recom_helper = "Slack Auto-Paused (20m)"
        recom_class = "recovery"
    else: # Evening
        recom_badge = "SLEEP DEBT RECOVERY"
        recom_title = "Urgent: Sleep Debt Recovery"
        recom_desc = "Severe sleep debt detected. Hair shedding risk high. Ebb triggers wind-down protocol now to restore hormone baseline."
        recom_btn = "Start Sleep Prep"
        recom_helper = "Active Debt Payback"
        recom_class = "recovery"

# If override mode is checked, CAS drops and friction alert displays
if override_mode:
    cas_score = 42
    recom_badge = "BIOLOGICAL MISALIGNMENT"
    recom_title = "Friction Alert: Straining System"
    recom_desc = f"Anya is ignoring Ebb's advice. Her CAS alignment score has dropped to 42% because she skipped her morning focus shifts and is trying to write specifications on {battery}% battery."
    recom_btn = "Restore Ebb Optimal Schedule"
    recom_helper = "Extreme Burnout Risk"
    recom_class = "recovery"

# Apply recommendation configuration
if recom_class == "focus":
    recom_bg = "radial-gradient(circle at top left, rgba(0, 242, 254, 0.06), transparent), rgba(17, 24, 39, 0.4)"
    recom_border_color = "rgba(0, 242, 254, 0.2)"
elif recom_class == "admin":
    recom_bg = "radial-gradient(circle at top left, rgba(234, 179, 8, 0.06), transparent), rgba(17, 24, 39, 0.4)"
    recom_border_color = "rgba(234, 179, 8, 0.2)"
else: # recovery
    recom_bg = f"radial-gradient(circle at top left, {theme_color}0f, transparent), rgba(17, 24, 39, 0.4)"
    recom_border_color = f"{theme_color}33"

btn_text_color = "#ffffff" if state == "redline" else "#07090e"

# Hiding the sidebar and other Streamlit frames in onboarding view
sidebar_override_css = ""
if st.session_state.current_view == "onboarding":
    sidebar_override_css = """
    section[data-testid="stSidebar"] {
        display: none !important;
        width: 0 !important;
    }
    [data-testid="stSidebarCollapseButton"] {
        display: none !important;
    }
    .main .block-container {
        padding-left: 0 !important;
        padding-right: 0 !important;
        max-width: 100% !important;
    }
    div[data-testid="stAppViewContainer"] {
        background: #09090b !important;
    }
    """

# Inject Global Page Background and Styles
st_html(f"""
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

:root {{
    --color-focus: #00f2fe;
    --color-recovery: #a855f7;
    --color-admin: #eab308;
    --color-danger: #ef4444;
    --primary-color: {theme_color} !important;
}}

/* Streamlit defaults override */
#MainMenu {{visibility: hidden;}}
footer {{visibility: hidden;}}
header {{visibility: hidden;}}
[data-testid="stHeader"] {{
    background-color: transparent !important;
}}

{sidebar_override_css}

html, body, [data-testid="stAppViewContainer"], [data-testid="stHeader"] {{
    font-family: 'Inter', sans-serif !important;
}}
h1, h2, h3, h4, h5, h6, .brand-title, .brand-name, .metric-value, .percentage, .recom-title, .card-title, .ebb-nav-wordmark, .onb-wordmark, .onb-h1, .onb-card-h2, .preview-metric-val {{
    font-family: 'Outfit', sans-serif !important;
}}
div[data-testid="stAppViewContainer"] {{
    background: {theme_bg_gradient}, #07090e !important;
    background-attachment: fixed !important;
}}
section[data-testid="stSidebar"] {{
    background-color: #0a0f19 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(20px) !important;
}}
section[data-testid="stSidebar"] h2, 
section[data-testid="stSidebar"] h3 {{
    font-family: 'Outfit', sans-serif !important;
    font-weight: 700 !important;
    font-size: 0.95rem !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    color: #ffffff !important;
    margin-top: 15px !important;
    margin-bottom: 12px !important;
}}
section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {{
    font-size: 0.85rem !important;
    color: #9ca3af !important;
    line-height: 1.4 !important;
}}
section[data-testid="stSidebar"] [data-testid="stWidgetLabel"] p {{
    font-weight: 700 !important;
    font-family: 'Outfit', sans-serif !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    font-size: 0.8rem !important;
    color: #9ca3af !important;
}}
section[data-testid="stSidebar"] label {{
    color: #ffffff !important;
    font-size: 0.85rem !important;
}}
section[data-testid="stSidebar"] [data-testid="stSlider"] div {{
    color: #ffffff !important;
}}
section[data-testid="stSidebar"] .stButton button {{
    font-family: 'Inter', sans-serif !important;
    font-size: 0.82rem !important;
    font-weight: 600 !important;
}}
.brand-title {{
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 2.2rem;
    background: linear-gradient(120deg, #fff 40%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 20px;
}}
.header-bar {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 15px;
    margin-bottom: 25px;
    margin-top: 60px; /* offset for fixed global nav */
}}
.user-profile-widget {{
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 8px 16px;
}}
.profile-details {{
    text-align: right;
    line-height: 1.2;
}}
.profile-name {{
    font-size: 0.85rem;
    font-weight: 600;
    color: #ffffff;
}}
.profile-role {{
    font-size: 0.7rem;
    color: #9ca3af;
    display: flex;
    align-items: center;
}}
.indicator-dot {{
    width: 6px;
    height: 6px;
    background-color: #10b981;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
    box-shadow: 0 0 8px #10b981;
}}
.glass-card {{
    background: rgba(18, 24, 38, 0.45) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    backdrop-filter: blur(12px) !important;
    color: #ffffff !important;
}}
.card-title {{
    font-size: 0.95rem;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 10px;
    margin-bottom: 15px;
}}
.recom-box {{
    border-radius: 14px !important;
    padding: 24px !important;
    backdrop-filter: blur(12px) !important;
    margin-bottom: 25px !important;
}}
.badge-status {{
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}}
.gcal-timeline-item {{
    transition: transform 0.2s ease;
}}
.gcal-timeline-item:hover {{
    transform: translateX(4px);
}}
button[data-testid="baseButton-primary"] {{
    background: {theme_gradient} !important;
    border: none !important;
    color: {btn_text_color} !important;
    border-radius: 8px !important;
    padding: 10px 24px !important;
    font-weight: 700 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.85rem !important;
    box-shadow: 0 4px 15px {theme_color}33 !important;
    transition: all 0.2s ease !important;
}}
button[data-testid="baseButton-primary"]:hover {{
    box-shadow: 0 4px 20px {theme_color}55 !important;
    transform: translateY(-1px) !important;
}}
button[data-testid="baseButton-secondary"] {{
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    color: #ffffff !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.85rem !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
}}
button[data-testid="baseButton-secondary"]:hover {{
    background: rgba(255, 255, 255, 0.06) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
}}

/* ==========================================================================
   GLOBAL NAV BAR
   ========================================================================== */
.ebb-nav {{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: rgba(9, 9, 11, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
}}
.ebb-nav-logo-link {{
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    transition: opacity 0.2s ease;
}}
.ebb-nav-logo-link:hover {{
    opacity: 0.75;
}}
.ebb-nav-wave {{
    color: #a8eddc;
    stroke: #a8eddc;
}}
.ebb-nav-wordmark {{
    font-family: 'DM Serif Display', Georgia, serif !important;
    font-size: 1.35rem;
    font-weight: 400;
    color: #fafaf9;
    letter-spacing: -0.02em;
}}
.ebb-nav-right {{
    display: flex;
    align-items: center;
    gap: 0.75rem;
}}
.nav-dropdown {{
    position: relative;
    display: inline-block;
}}
.nav-dropdown-trigger {{
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #e5e5e5;
    border-radius: 8px;
    padding: 0.45rem 0.85rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}}
.nav-dropdown:hover .nav-dropdown-trigger {{
    background: rgba(255,255,255,0.1);
    color: #fff;
}}
.nav-chevron {{
    font-size: 0.65rem;
}}
.nav-dropdown-menu {{
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 220px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 0.4rem;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-6px);
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}}
.nav-dropdown:hover .nav-dropdown-menu {{
    opacity: 1;
    pointer-events: all;
    transform: translateY(0);
}}
.nav-dropdown-item-link {{
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    background: none;
    border: none;
    color: #d4d4d8;
    border-radius: 8px;
    padding: 0.65rem 0.75rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    cursor: pointer;
    text-align: left;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
}}
.nav-dropdown-item-link:hover {{
    background: rgba(255,255,255,0.06);
    color: #fff;
}}
.nav-dropdown-item-link > i {{
    font-size: 0.85rem;
    color: #a1a1aa;
    width: 16px;
    flex-shrink: 0;
}}
.nav-item-label {{
    font-weight: 500;
    font-size: 0.82rem;
    line-height: 1.2;
    color: #ffffff;
}}
.nav-item-sub {{
    font-size: 0.7rem;
    color: #71717a;
    margin-top: 1px;
}}
.nav-signin-btn-link {{
    background: linear-gradient(135deg, #a8eddc 0%, #78c6b4 100%);
    border: none;
    color: #09090b !important;
    border-radius: 8px;
    padding: 0.45rem 1rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
}}
.nav-signin-btn-link:hover {{
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(168, 237, 220, 0.35);
}}

/* ==========================================================================
   ONBOARDING LAYOUT (Neutral styling)
   ========================================================================== */
.view-onboarding {{
    background: #09090b;
    min-height: 100vh;
    padding-top: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}}
.onb-bg {{
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}}
.onb-blob {{
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
}}
.onb-blob-1 {{
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(168, 237, 220, 0.3) 0%, transparent 70%);
    top: -160px;
    left: -120px;
}}
.onb-blob-2 {{
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(120, 198, 180, 0.25) 0%, transparent 70%);
    bottom: -100px;
    right: -80px;
}}
.phone-frame-wrapper {{
    position: relative;
    z-index: 1;
    padding: 2rem 1rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}}
.phone-frame {{
    width: 390px;
    min-height: 720px;
    background: #fafaf9;
    border-radius: 2.75rem;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
}}
.phone-screen {{
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 720px;
    padding: 2.5rem 2rem 1rem;
    text-align: center;
    color: #09090b;
}}
.onb-logo-lockup {{
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    justify-content: center;
}}
.onb-wave-icon {{
    color: #2d8c77;
}}
.onb-wordmark {{
    font-family: 'DM Serif Display', Georgia, serif !important;
    font-size: 1.6rem;
    font-weight: 400;
    color: #09090b;
    letter-spacing: -0.025em;
}}
.onb-h1 {{
    font-family: 'DM Serif Display', Georgia, serif !important;
    font-size: 2.15rem;
    font-weight: 400;
    color: #09090b;
    line-height: 1.15;
    margin-bottom: 0.65rem;
    letter-spacing: -0.02em;
}}
.onb-tagline {{
    font-size: 0.92rem;
    color: #52525b;
    line-height: 1.5;
    max-width: 260px;
    margin: 0 auto 1.5rem auto;
}}
.onb-card {{
    margin-top: 1.25rem;
    width: 100%;
    background: #fff;
    border-radius: 1.5rem;
    padding: 1.5rem 1.25rem;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
}}
.onb-card-icon-wrap {{
    margin-bottom: 0.75rem;
}}
.onb-card-icon {{
    font-size: 1.6rem;
    color: #2d8c77;
}}
.onb-card-h2 {{
    font-family: 'DM Serif Display', Georgia, serif !important;
    font-size: 1.4rem;
    font-weight: 400;
    color: #09090b;
    margin-bottom: 1.25rem;
    letter-spacing: -0.01em;
}}
.onb-primary-btn-link {{
    width: 100%;
    background: #09090b;
    color: #fafaf9 !important;
    border: none;
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: all 0.22s ease;
    box-sizing: border-box;
}}
.onb-primary-btn-link:hover {{
    background: #1c1c1e;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}}
.onb-privacy-note {{
    margin-top: 1.1rem;
    background: #f4f4f5;
    border-radius: 1rem;
    padding: 0.9rem 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    text-align: left;
    width: 100%;
}}
.onb-lock-icon {{
    color: #52525b;
    font-size: 0.9rem;
    margin-top: 2px;
    flex-shrink: 0;
}}
.onb-privacy-title {{
    font-weight: 600;
    font-size: 0.82rem;
    color: #09090b;
    margin-bottom: 0.25rem;
}}
.onb-privacy-body {{
    font-size: 0.77rem;
    color: #71717a;
    line-height: 1.5;
}}
.onb-preview-link-a {{
    margin-top: 1.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: #2d8c77 !important;
    font-weight: 500;
    background: none;
    border: none;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
}}
.onb-preview-link-a:hover {{
    opacity: 0.7;
}}
.step-dots-wrap {{
    padding: 1rem 0 1.5rem;
    display: flex;
    justify-content: center;
    margin-top: auto;
}}
.step-dots {{
    display: flex;
    gap: 0.4rem;
    align-items: center;
}}
.step-dot-a {{
    height: 7px;
    border-radius: 10px;
    background: rgba(9,9,11,0.15);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    width: 7px;
}}
.step-dot-a.active {{
    width: 22px;
    background: #09090b;
}}

/* Form fields */
.onb-back-btn-link {{
    align-self: flex-start;
    background: none;
    border: none;
    color: #52525b !important;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.25rem;
    margin-bottom: 1rem;
    text-decoration: none;
    transition: color 0.2s ease;
}}
.onb-back-btn-link:hover {{
    color: #09090b;
}}
.onb-form {{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-top: 1rem;
    text-align: left;
}}
.form-group {{
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}}
.form-label {{
    font-size: 0.78rem;
    font-weight: 600;
    color: #3f3f46;
}}
.form-input {{
    background: #f4f4f5;
    border: 1.5px solid transparent;
    border-radius: 0.75rem;
    padding: 0.75rem 0.9rem;
    font-size: 0.88rem;
    color: #09090b;
    outline: none;
    width: 100%;
    box-sizing: border-box;
}}
.onb-divider {{
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1rem 0 0.75rem;
    color: #a1a1aa;
    font-size: 0.75rem;
}}
.onb-divider::before,
.onb-divider::after {{
    content: '';
    flex: 1;
    height: 1px;
    background: #e4e4e7;
}}
.oauth-buttons {{
    display: flex;
    gap: 0.6rem;
    width: 100%;
}}
.oauth-btn-link {{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    border-radius: 0.75rem;
    padding: 0.7rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: #09090b !important;
    text-decoration: none;
    transition: all 0.2s ease;
}}
.oauth-btn-link:hover {{
    background: #e4e4e7;
}}
.onb-terms {{
    font-size: 0.72rem;
    color: #a1a1aa;
    text-align: center;
    margin-top: 0.85rem;
    line-height: 1.5;
}}
.onb-terms a {{
    color: #52525b;
}}

/* Preview view inside phone */
.preview-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}}
.preview-chip {{
    font-size: 0.68rem;
    font-weight: 600;
    background: rgba(45,140,119,0.12);
    color: #2d8c77;
    border: 1px solid rgba(45,140,119,0.2);
    border-radius: 6px;
    padding: 0.15rem 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}}
.preview-metrics {{
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 0.6rem;
    width: 100%;
    margin: 1.25rem 0;
}}
.preview-metric {{
    background: #fff;
    border-radius: 0.85rem;
    padding: 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}}
.preview-metric-val {{
    font-family: 'DM Serif Display', Georgia, serif !important;
    font-size: 1.2rem;
    color: #09090b;
    line-height: 1;
}}
.preview-metric-lbl {{
    font-size: 0.62rem;
    color: #71717a;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}}
.preview-cyan {{ color: #0e9f8c; }}
.preview-green {{ color: #16a34a; }}
.preview-cal {{
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    width: 100%;
    margin-bottom: 1.25rem;
}}
.preview-cal-block {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 0.75rem;
    padding: 0.6rem 0.85rem;
    font-size: 0.78rem;
    box-sizing: border-box;
}}
.preview-cal-title {{
    font-weight: 600;
    color: #09090b;
}}
.preview-cal-time {{
    font-size: 0.68rem;
    color: #71717a;
}}
.preview-focus   {{ background: rgba(14,159,140,0.1); border: 1px solid rgba(14,159,140,0.2); }}
.preview-meeting {{ background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); }}
.preview-recovery{{ background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); }}
.preview-admin   {{ background: rgba(234,179,8,0.1);  border: 1px solid rgba(234,179,8,0.2);  }}
</style>
""")

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

# Render PASSIVE SENSORS section in sidebar (Dashboard view only)
if st.session_state.current_view == "dashboard":
    st_html(f"""
    <div style="margin-top: 25px; margin-bottom: 15px;">
        <span style="font-family: Outfit; font-weight: 700; font-size: 0.85rem; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase;">Passive Sensors</span>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px; font-family: Inter;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px; font-size: 0.8rem;">
                <span style="color: #f3f4f6;"><i class="fa-solid fa-cloud" style="color: #9ca3af; margin-right: 6px;"></i> Oura Cloud</span>
                <span style="color: #10b981; font-size: 0.72rem; font-weight: 600;"><span style="display: inline-block; width: 6px; height: 6px; background: #10b981; border-radius: 50%; margin-right: 4px; box-shadow: 0 0 6px #10b981;"></span>Connected</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px; font-size: 0.8rem;">
                <span style="color: #f3f4f6;"><i class="fa-solid fa-calendar-days" style="color: #9ca3af; margin-right: 6px;"></i> Google Calendar</span>
                <span style="color: #10b981; font-size: 0.72rem; font-weight: 600;"><span style="display: inline-block; width: 6px; height: 6px; background: #10b981; border-radius: 50%; margin-right: 4px; box-shadow: 0 0 6px #10b981;"></span>Connected</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px; font-size: 0.8rem;">
                <span style="color: #f3f4f6;"><i class="fa-solid fa-desktop" style="color: #9ca3af; margin-right: 6px;"></i> Desktop Telemetry</span>
                <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">Active &bull; {st.session_state.telemetry_cache} logs</span>
            </div>
        </div>
    </div>
    """, sidebar=True)

    # Custom Telemetry triggers
    col_t1, col_t2 = st.sidebar.columns(2)
    with col_t1:
        st.button("🖱️ Mouse Log", on_click=click_telemetry_event, key="btn_mouse_telemetry", use_container_width=True)
    with col_t2:
        st.button("⌨️ Key Log", on_click=click_telemetry_event, key="btn_key_telemetry", use_container_width=True)

    if st.session_state.telemetry_cache > 0:
        st.sidebar.warning(f"{st.session_state.telemetry_cache} logs buffered.")
        if st.sidebar.button("💾 Flush Logs to DB", key="btn_flush_telemetry", type="primary", use_container_width=True):
            for _ in range(st.session_state.telemetry_cache):
                db.log_telemetry(random.randint(10, 80), round(random.random() * 2.5, 2), random.randint(0, 15))
            st.session_state.telemetry_cache = 0
            st.sidebar.success("Logs flushed successfully!")
            st.rerun()

    st.sidebar.markdown("<div style='margin-top: 15px;'></div>", unsafe_allow_html=True)
    if st.sidebar.button("📝 Weekly Baseline Survey", key="btn_survey_trigger", use_container_width=True):
        st.session_state.survey_open = True

# ---------------------------------------------------------
# Global Navigation Bar
# ---------------------------------------------------------
st_html("""
<nav class="ebb-nav">
    <div class="ebb-nav-logo">
        <a href="?view=onboarding&step=1" target="_self" class="ebb-nav-logo-link">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" class="ebb-nav-wave" aria-hidden="true">
                <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.5"/>
                <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
                <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            </svg>
            <span class="ebb-nav-wordmark">ebb</span>
        </a>
    </div>

    <div class="ebb-nav-right">
        <!-- Dashboard Dropdown -->
        <div class="nav-dropdown">
            <button class="nav-dropdown-trigger" id="nav-dropdown-btn">
                <i class="fa-solid fa-table-cells-large" style="font-size:0.8rem;"></i>
                <span>Dashboard</span>
                <i class="fa-solid fa-chevron-down nav-chevron"></i>
            </button>
            <div class="nav-dropdown-menu">
                <a class="nav-dropdown-item-link" href="?view=dashboard" target="_self">
                    <i class="fa-solid fa-chart-line"></i>
                    <div>
                        <div class="nav-item-label">Interactive Dashboard</div>
                        <div class="nav-item-sub">Anya's live energy view</div>
                    </div>
                </a>
                <a class="nav-dropdown-item-link" href="?view=onboarding&step=1" target="_self">
                    <i class="fa-solid fa-mobile-screen"></i>
                    <div>
                        <div class="nav-item-label">Onboarding Flow</div>
                        <div class="nav-item-sub">App landing experience</div>
                    </div>
                </a>
            </div>
        </div>
        <!-- Sign in pill -->
        <a class="nav-signin-btn-link" href="?view=onboarding&step=2" target="_self">Get started</a>
    </div>
</nav>
""")

# ---------------------------------------------------------
# View-specific Page Content Rendering
# ---------------------------------------------------------
if st.session_state.current_view == "onboarding":
    step = st.session_state.onboarding_step
    
    screen_html = ""
    if step == 1:
        screen_html = """
        <div class="phone-screen" id="screen-1">
            <div class="onb-logo-lockup">
                <svg width="52" height="52" viewBox="0 0 40 40" fill="none" class="onb-wave-icon" aria-hidden="true">
                    <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.5"/>
                    <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.78"/>
                    <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                </svg>
                <span class="onb-wordmark">ebb</span>
            </div>
            
            <h1 class="onb-h1">Welcome to Ebb</h1>
            <p class="onb-tagline">Let's start by understanding your natural rhythm.</p>
            
            <section class="onb-card">
                <div class="onb-card-icon-wrap">
                    <i class="fa-regular fa-calendar onb-card-icon"></i>
                </div>
                <h2 class="onb-card-h2">Sync Your Calendar</h2>
                
                <a class="onb-primary-btn-link" href="?view=onboarding&step=2" target="_self">
                    <i class="fa-regular fa-calendar"></i>
                    Sign up with email or phone
                </a>
                
                <div class="onb-privacy-note">
                    <i class="fa-solid fa-lock onb-lock-icon"></i>
                    <div>
                        <p class="onb-privacy-title">Privacy First</p>
                        <p class="onb-privacy-body">Ebb only analyzes timing and attendee counts to gauge your energy load. We <strong>never</strong> read or store meeting titles, descriptions, or sensitive data.</p>
                    </div>
                </div>
            </section>
            
            <a class="onb-preview-link-a" href="?view=dashboard" target="_self">
                <i class="fa-solid fa-layout-dashboard" style="font-size:0.8rem;"></i>
                Preview the dashboard
            </a>
            
            <div class="step-dots-wrap">
                <div class="step-dots">
                    <a class="step-dot-a active" href="?view=onboarding&step=1" target="_self"></a>
                    <a class="step-dot-a" href="?view=onboarding&step=2" target="_self"></a>
                    <a class="step-dot-a" href="?view=onboarding&step=3" target="_self"></a>
                </div>
            </div>
        </div>
        """
    elif step == 2:
        screen_html = """
        <div class="phone-screen" id="screen-2">
            <a class="onb-back-btn-link" href="?view=onboarding&step=1" target="_self">
                <i class="fa-solid fa-arrow-left"></i> Back
            </a>
            
            <div class="onb-logo-lockup" style="margin-bottom:0.5rem;">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none" class="onb-wave-icon" aria-hidden="true">
                    <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.5"/>
                    <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.78"/>
                    <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                </svg>
            </div>
            
            <h1 class="onb-h1" style="font-size:1.85rem;">Create your account</h1>
            <p class="onb-tagline">Your focus calendar starts here.</p>
            
            <div class="onb-form">
                <div class="form-group">
                    <label class="form-label">Full name</label>
                    <input class="form-input" type="text" placeholder="Anya Sharma" value="Anya Sharma">
                </div>
                <div class="form-group">
                    <label class="form-label">Email or phone</label>
                    <input class="form-input" type="email" placeholder="anya@company.com" value="anya@company.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input class="form-input" type="password" placeholder="••••••••" value="password123">
                </div>
                
                <a class="onb-primary-btn-link" href="?view=onboarding&step=3" target="_self" style="margin-top:0.5rem;">
                    Continue <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
            
            <div class="onb-divider"><span>or continue with</span></div>
            
            <div class="oauth-buttons">
                <a class="oauth-btn-link" href="?view=onboarding&step=3" target="_self">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                </a>
                <a class="oauth-btn-link" href="?view=onboarding&step=3" target="_self">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    Apple
                </a>
            </div>
            
            <p class="onb-terms">By continuing you agree to our <a href="#" onclick="return false;">Terms</a> and <a href="#" onclick="return false;">Privacy Policy</a>.</p>
            
            <div class="step-dots-wrap">
                <div class="step-dots">
                    <a class="step-dot-a" href="?view=onboarding&step=1" target="_self"></a>
                    <a class="step-dot-a active" href="?view=onboarding&step=2" target="_self"></a>
                    <a class="step-dot-a" href="?view=onboarding&step=3" target="_self"></a>
                </div>
            </div>
        </div>
        """
    elif step == 3:
        screen_html = """
        <div class="phone-screen" id="screen-3">
            <div class="preview-header">
                <div class="onb-logo-lockup" style="margin-bottom:0;">
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" class="onb-wave-icon" aria-hidden="true">
                        <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.5"/>
                        <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.78"/>
                        <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                    </svg>
                    <span class="onb-wordmark" style="font-size:1.1rem;">ebb</span>
                </div>
                <span class="preview-chip">Preview</span>
            </div>
            
            <h1 class="onb-h1" style="font-size:1.6rem;margin-top:1rem;">Your energy, mapped.</h1>
            <p class="onb-tagline">Here's what your dashboard will look like once connected.</p>
            
            <div class="preview-metrics">
                <div class="preview-metric">
                    <span class="preview-metric-val preview-cyan">78 ms</span>
                    <span class="preview-metric-lbl">HRV</span>
                </div>
                <div class="preview-metric">
                    <span class="preview-metric-val preview-green">95%</span>
                    <span class="preview-metric-lbl">CAS Score</span>
                </div>
                <div class="preview-metric">
                    <span class="preview-metric-val">8.2 hrs</span>
                    <span class="preview-metric-lbl">Sleep</span>
                </div>
            </div>
            
            <div class="preview-cal">
                <div class="preview-cal-block preview-focus">
                    <span class="preview-cal-title">Deep Work Focus</span>
                    <span class="preview-cal-time">9:00 – 10:30 AM</span>
                </div>
                <div class="preview-cal-block preview-meeting">
                    <span class="preview-cal-title">Architecture Review</span>
                    <span class="preview-cal-time">10:30 – 11:30 AM</span>
                </div>
                <div class="preview-cal-block preview-recovery">
                    <span class="preview-cal-title">Recovery Buffer</span>
                    <span class="preview-cal-time">11:30 – 12:00 PM</span>
                </div>
                <div class="preview-cal-block preview-admin">
                    <span class="preview-cal-title">Backlog Triage</span>
                    <span class="preview-cal-time">1:00 – 2:00 PM</span>
                </div>
            </div>
            
            <a class="onb-primary-btn-link" href="?view=dashboard" target="_self" style="margin-top:auto;">
                Open full dashboard <i class="fa-solid fa-arrow-right"></i>
            </a>
            
            <div class="step-dots-wrap">
                <div class="step-dots">
                    <a class="step-dot-a" href="?view=onboarding&step=1" target="_self"></a>
                    <a class="step-dot-a" href="?view=onboarding&step=2" target="_self"></a>
                    <a class="step-dot-a active" href="?view=onboarding&step=3" target="_self"></a>
                </div>
            </div>
        </div>
        """

    st_html(f"""
    <div class="view-onboarding">
        <div class="onb-bg">
            <div class="onb-blob onb-blob-1"></div>
            <div class="onb-blob onb-blob-2"></div>
        </div>
        <div class="phone-frame-wrapper">
            <div class="phone-frame">
                {screen_html}
            </div>
        </div>
    </div>
    """)
    st.stop()

# Layout Rendering - Header
st.markdown(textwrap.dedent(f"""
    <div class="header-bar">
        <div style="display: flex; gap: 16px; align-items: center;">
            <div style="background: linear-gradient(135deg, #00f2fe 0%, #a855f7 100%); padding: 8px 16px; border-radius: 8px; font-weight: 700; color: #07090e; font-family: Outfit; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,242,254,0.15);">
                <i class="fa-solid fa-gauge-high"></i> Dashboard
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
            <div class="user-profile-widget">
                <div class="profile-details">
                    <span class="profile-name">Anya</span><br/>
                    <span class="profile-role"><span class="indicator-dot"></span>Active Shielding (Staff AI Eng)</span>
                </div>
                <div style="width: 38px; height: 38px; border-radius: 50%; background: #3b82f6; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: Outfit; border: 2px solid rgba(255,255,255,0.1);">A</div>
            </div>
            <div style="color: #9ca3af; font-size: 1.2rem; cursor: pointer;"><i class="fa-solid fa-sun"></i></div>
        </div>
    </div>
"""), unsafe_allow_html=True)

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
            st.rerun()

# ---------------------------------------------------------
# Metrics Dashboard Row
# ---------------------------------------------------------
col1, col2, col3 = st.columns(3)

# Calculate performance metrics
shield_adherence = db.calculate_shield_adherence()

# 1. Resting Biometrics Card
with col1:
    card1_html = f"""
    <div class="glass-card" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px {card_glow} !important; border: 1px solid rgba(255,255,255,0.06) !important; height: 100%;">
        <div class="card-title"><i class="fa-solid fa-heart-pulse" style="color: {theme_color};"></i> Resting Biometrics</div>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 15px;">
            <div>
                <span style="font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">HRV</span><br/>
                <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 2px;">
                    <strong style="font-size: 2.2rem; font-family: Outfit; font-weight: 800; color: #ffffff; line-height: 1;">{hrv}</strong>
                    <span style="font-size: 0.9rem; color: #9ca3af; font-family: Inter;">ms</span>
                </div>
                <span style="font-size: 0.75rem; color: #6b7280; font-family: Inter;">Sleep: {sleep_hours} hrs</span>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
                <span style="font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Cognitive Battery</span><br/>
                <div style="margin-top: 6px;">
                    <span style="background: {cognitive_badge_bg}; color: {cognitive_battery_color}; border: 1px solid {cognitive_badge_border}; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; font-family: Inter; text-transform: capitalize;">{cognitive_battery_text}</span>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
                <span style="font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Alignment Index (CAS)</span><br/>
                <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 4px;">
                    <strong style="font-size: 2.2rem; font-family: Outfit; font-weight: 800; color: #ffffff; line-height: 1;">{cas_score}</strong>
                    <span style="font-size: 0.9rem; color: #9ca3af; font-family: Inter;">%</span>
                </div>
                <div style="font-size: 0.7rem; color: #6b7280; font-family: Inter; margin-top: 4px;">Adherence rate: {shield_adherence}%</div>
            </div>
        </div>
    </div>
    """
    st_html(card1_html)

# 2. Battery Ring Card
with col2:
    ring_offset = 377 - (battery / 100.0) * 377
    card2_html = f"""
    <div class="glass-card" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px {card_glow} !important; border: 1px solid rgba(255,255,255,0.06) !important; height: 100%;">
        <div class="card-title"><i class="fa-solid fa-battery-half" style="color: {theme_color};"></i> Energy Battery</div>
        <div style="position: relative; width: 175px; height: 175px; margin: 20px auto 10px auto;">
            <svg width="175" height="175" viewBox="0 0 140 140" style="transform: rotate(-90deg);">
                <defs>
                    <linearGradient id="{gradient_id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        {grad_stops}
                    </linearGradient>
                </defs>
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="10"/>
                <circle cx="70" cy="70" r="60" fill="none" stroke="url(#{gradient_id})" stroke-width="10" 
                    stroke-dasharray="377" stroke-dashoffset="{ring_offset}" stroke-linecap="round" 
                    style="filter: drop-shadow(0 0 6px {shadow_color}); transition: stroke-dashoffset 0.8s ease;"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 100%;">
                <span style="font-size: 2.2rem; font-family: Outfit; font-weight: 800; color: #ffffff; line-height: 1;">{battery}%</span><br/>
                <span style="font-size: 0.65rem; color: #9ca3af; text-transform: uppercase; font-family: Inter; letter-spacing: 0.05em; font-weight: 600; display: block; margin-top: 4px;">{status_label}</span>
            </div>
        </div>
    </div>
    """
    st_html(card2_html)

# 3. Circadian Curves Card
with col3:
    card3_html = f"""
    <div class="glass-card" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px {card_glow} !important; border: 1px solid rgba(255,255,255,0.06) !important; height: 100%;">
        <div class="card-title"><i class="fa-solid fa-chart-line" style="color: {theme_color};"></i> Circadian Waves</div>
        <div style="width: 100%; height: 140px; margin-top: 15px;">
            <svg width="100%" height="100%" viewBox="0 0 140 140" style="overflow: visible;">
                <defs>
                    <linearGradient id="{area_gradient_id}" x1="0%" y1="0%" x2="0%" y2="100%">
                        {area_stop}
                    </linearGradient>
                </defs>
                <circle cx="0" cy="0" r="0" />
                <line x1="0" y1="0" x2="0" y2="140" stroke="rgba(255,255,255,0.03)"/>
                <line x1="35" y1="0" x2="35" y2="140" stroke="rgba(255,255,255,0.03)"/>
                <line x1="70" y1="0" x2="70" y2="140" stroke="rgba(255,255,255,0.03)"/>
                <line x1="105" y1="0" x2="105" y2="140" stroke="rgba(255,255,255,0.03)"/>
                <line x1="140" y1="0" x2="140" y2="140" stroke="rgba(255,255,255,0.03)"/>
                
                <path d="{fill_path}" fill="url(#{area_gradient_id})" />
                <path d="{wave_path}" fill="none" stroke="{wave_color}" stroke-width="3.5" style="filter: drop-shadow(0 0 5px {wave_color});"/>
            </svg>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #9ca3af; margin-top: 15px; font-family: Inter;">
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
    """
    st_html(card3_html)

# ---------------------------------------------------------
# Dynamic Adaptive Coach Recommendations
# ---------------------------------------------------------
st.markdown("<div style='margin-top: 25px;'></div>", unsafe_allow_html=True)

recom_html = f"""
<div class="recom-box" style="border: 1px solid {recom_border_color} !important; background: {recom_bg} !important; border-left: 4px solid {theme_color} !important; box-shadow: 0 4px 20px {theme_color}0a !important;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="badge-status" style="background: rgba(255,255,255,0.06); color: {theme_color}; border: 1px solid {recom_border_color}; font-weight: 700; font-family: Inter;">{recom_badge}</span>
        <span style="font-size: 0.72rem; color: #9ca3af; font-family: Inter;"><i class="fa-regular fa-clock"></i> Recommended Right Now</span>
    </div>
    <h3 style="margin-top: 10px; margin-bottom: 8px; font-family: Outfit; font-weight: 700; font-size: 1.6rem; color: #ffffff;">{recom_title}</h3>
    <p style="margin-bottom: 10px; font-size: 0.9rem; color: #9ca3af; line-height: 1.5; font-family: Inter;">{recom_desc}</p>
</div>
"""
st_html(recom_html)

# Confirmation Action buttons
is_low_state = state in ["compressed", "redline"]
col_btn1, col_btn2, _ = st.columns([1.5, 1.5, 2])
with col_btn1:
    if is_low_state and not override_mode and time_of_day == "Morning":
        confirm_shield_clicked = st.button("Confirm Calendar Shield", key="btn_confirm_shield", type="primary", use_container_width=True)
        if confirm_shield_clicked:
            proposal = scheduler.generate_shield_proposal(db_date, db)
            if "proposed_actions" in proposal:
                res = scheduler.confirm_shield_proposal(db_date, proposal["proposed_actions"], db)
                st.success("Calendar boundaries committed! Slack snooze active. Refreshing dashboard...")
                st.rerun()
    elif is_low_state and not override_mode and time_of_day == "Afternoon":
        midday_reset_clicked = st.button("Execute Mid-Day Rebuild Reset", key="btn_midday_rebuild", type="primary", use_container_width=True)
        if midday_reset_clicked:
            today_iso = f"{db_date}T13:00:00Z"
            res = scheduler.execute_midday_rebuild(today_iso, db)
            st.success("Reset Complete! Somatic decompression window injected at 1:00 PM. Refreshing...")
            st.rerun()
    else:
        st.button(recom_btn, key="btn_standard_recom", type="primary", use_container_width=True)
        
with col_btn2:
    st.button("Slack Auto-Paused (20m)", key="btn_slack_snooze", type="secondary", use_container_width=True)

# ---------------------------------------------------------
# Voice Pipeline Trigger - Placed below recommendations
# ---------------------------------------------------------
st_html("<div style='margin-top: 25px;'></div>")

with st.container(border=True):
    st_html(f'<div class="card-title" style="margin-bottom: 12px;"><i class="fa-solid fa-microphone" style="color: {theme_color};"></i> Vent-to-Adjust Voice Pipeline</div>')
    voice_text = st.text_input(
        "Describe physical symptoms (e.g. breakouts, hair shedding, exhaustion)",
        placeholder="Woke up with heavy hair shedding and jawline acne breakouts...",
        key="voice_ingress_input",
        label_visibility="collapsed"
    )
    col_v1, _ = st.columns([1.5, 3.5])
    with col_v1:
        parse_clicked = st.button("Parse Ingress →", key="btn_parse_ingress", type="primary", use_container_width=True)
        
    if parse_clicked:
        if voice_text:
            is_stress_detected = any(w in voice_text.lower() for w in ["breakout", "shedding", "exhausted", "peloton", "acne", "hair"])
            if is_stress_detected:
                with db.get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT OR REPLACE INTO biometrics_log 
                        (id, date, sleep_duration_seconds, resting_heart_rate, hrv_ms, battery_percentage)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (db_date, db_date, int(5.5 * 3600), 75, 22, 40))
                    conn.commit()
                st.success("Whisper parsed stress symptoms! Shield triggered. Updating page...")
                st.rerun()
            else:
                st.info("Ingest complete. Biometrics stable.")

# ---------------------------------------------------------
# Calendar Cached Timeline list
# ---------------------------------------------------------
st_html("<div style='margin-top: 25px;'></div>")

with st.container(border=True):
    st_html(f'<div class="card-title" style="margin-bottom: 15px;"><i class="fa-solid fa-calendar-check" style="color: {theme_color};"></i> GCAL Local SQL Cache (Today)</div>')
    
    # Time markers bar matching Figma layout
    highlighted_time = "9:00"
    if time_of_day == "Afternoon":
        highlighted_time = "2:00"
    elif time_of_day == "Evening":
        highlighted_time = "5:00"
        
    time_markers_html = '<div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 8px; font-family: Inter;">'
    for t in ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00"]:
        if t == highlighted_time:
            time_markers_html += f'<div style="background: {theme_gradient}; border: 1px solid {theme_color}; padding: 6px 16px; border-radius: 8px; font-size: 0.75rem; color: #07090e; font-weight: 700; box-shadow: 0 0 10px {theme_color}55;">{t}</div>'
        else:
            time_markers_html += f'<div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 6px 16px; border-radius: 8px; font-size: 0.75rem; color: #9ca3af; font-weight: 500;">{t}</div>'
    time_markers_html += "</div>"
    st_html(time_markers_html)

    # Fetch current events
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT event_title, start_time, end_time, classification FROM calendar_cache ORDER BY start_time")
        rows = cursor.fetchall()
    
    for title, start_time, end_time, classification in rows:
        start_hr = start_time.split("T")[-1][:5]
        end_hr = end_time.split("T")[-1][:5]
        
        # Convert 24h to 12h format
        try:
            sh, sm = map(int, start_hr.split(":"))
            eh, em = map(int, end_hr.split(":"))
            s_ampm = "AM" if sh < 12 else "PM"
            e_ampm = "AM" if eh < 12 else "PM"
            sh = sh if sh <= 12 else sh - 12
            sh = 12 if sh == 0 else sh
            eh = eh if eh <= 12 else eh - 12
            eh = 12 if eh == 0 else eh
            start_formatted = f"{sh}:{sm:02d} {s_ampm}"
            end_formatted = f"{eh}:{em:02d} {e_ampm}"
        except Exception:
            start_formatted = start_hr
            end_formatted = end_hr

        # Classify styles
        border_color = "#3b82f6"
        border_style = "solid"
        badge_bg = "rgba(59, 130, 246, 0.1)"
        badge_text = "#3b82f6"
        item_bg = "rgba(255, 255, 255, 0.02)"
        status_label = classification
        
        if "buffer" in title.lower() or "decompression" in title.lower():
            border_color = "#10b981"
            badge_bg = "rgba(16, 185, 129, 0.1)"
            badge_text = "#10b981"
            status_label = "RECOVERY BUFFER"
            item_bg = "repeating-linear-gradient(45deg, rgba(16, 185, 129, 0.02), rgba(16, 185, 129, 0.02) 10px, rgba(16, 185, 129, 0.08) 10px, rgba(16, 185, 129, 0.08) 20px)"
        elif "walk" in title.lower():
            border_color = "#a855f7"
            badge_bg = "rgba(168, 85, 247, 0.1)"
            badge_text = "#a855f7"
            status_label = "RECOVERY ACTIVITY"
        elif classification == "RESCHEDULABLE" and (state in ["compressed", "redline"]) and "spec" not in title.lower():
            # Shifted
            border_color = "#eab308"
            border_style = "dashed"
            badge_bg = "rgba(234, 179, 8, 0.1)"
            badge_text = "#eab308"
            status_label = "SHIFTED"
            item_bg = "rgba(234, 179, 8, 0.02)"
        elif classification == "LOCKED":
            border_color = "#6b7280"
            badge_bg = "rgba(107, 114, 128, 0.1)"
            badge_text = "#9ca3af"
            status_label = "LOCKED"
        elif "spec" in title.lower():
            border_color = "#00f2fe"
            badge_bg = "rgba(0, 242, 254, 0.1)"
            badge_text = "#00f2fe"
            status_label = "PROTECTED"

        st_html(f"""
            <div class="gcal-timeline-item" style="border-left: 4px {border_style} {border_color}; background: {item_bg} !important; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 10px; margin-bottom: 10px; border-top: 1px solid rgba(255,255,255,0.02); border-right: 1px solid rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.02); font-family: Inter;">
                <div>
                    <strong style="color: #ffffff; font-size: 0.95rem;">{title}</strong><br/>
                    <span style="font-size: 0.75rem; color: #9ca3af;"><i class="fa-regular fa-clock"></i> {start_formatted} - {end_formatted}</span>
                </div>
                <span class="badge-status" style="background: {badge_bg}; color: {badge_text}; border: 1px solid {border_color}33; font-weight: 600; font-family: Inter;">{status_label}</span>
            </div>
        """)
