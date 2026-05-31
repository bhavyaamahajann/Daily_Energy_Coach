import streamlit as st
import textwrap

# Initialize session state variables
if "current_step" not in st.session_state:
    st.session_state.current_step = 1
if "selected_source" not in st.session_state:
    st.session_state.selected_source = None
if "meeting_insights" not in st.session_state:
    st.session_state.meeting_insights = False
if "workplace_context" not in st.session_state:
    st.session_state.workplace_context = False
if "focus_data" not in st.session_state:
    st.session_state.focus_data = False

# Read query parameters for step and option updates
params = st.query_params
if "step" in params:
    try:
        st.session_state.current_step = int(params["step"])
    except ValueError:
        pass

if "source" in params:
    st.session_state.selected_source = params["source"]

if "toggle" in params:
    t = params["toggle"]
    if t == "meeting":
        st.session_state.meeting_insights = not st.session_state.meeting_insights
    elif t == "workplace":
        st.session_state.workplace_context = not st.session_state.workplace_context
    elif t == "focus":
        st.session_state.focus_data = not st.session_state.focus_data

# Page configurations
st.set_page_config(page_title="ebb", page_icon="🛡️", layout="centered")

# Hide standard Streamlit header, footer, and sidebar elements
st.markdown("""
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
[data-testid="stHeader"] {
    background-color: transparent !important;
}
section[data-testid="stSidebar"] {
    display: none !important;
    width: 0 !important;
}
[data-testid="stSidebarCollapseButton"] {
    display: none !important;
}
.main .block-container {
    padding: 0 !important;
    max-width: 100% !important;
}
div[data-testid="stAppViewContainer"] {
    background: #0F0F10 !important;
}
</style>
""", unsafe_allow_html=True)

# Global styles injection
st.markdown("""
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');

body {
    background-color: #0F0F10;
    color: #1c1917;
    font-family: 'Inter', sans-serif;
}

.phone-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem 1rem;
    box-sizing: border-box;
}

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
}

/* Hide scrollbar */
.phone-container::-webkit-scrollbar {
    display: none;
}
.phone-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.screen {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 2.2rem 1.8rem;
    box-sizing: border-box;
}

/* Typography matching image exactly */
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

/* Welcome Screen */
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

.btn-green-link {
    width: 100%;
    background: #4A7C59;
    color: #FFFFFF !important;
    text-decoration: none;
    border-radius: 1.25rem;
    padding: 1.1rem;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    box-sizing: border-box;
    transition: all 0.2s ease;
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

/* Dots */
.dots-container {
    display: flex;
    justify-content: center;
    gap: 0.45rem;
    margin-top: auto;
    padding-top: 1.5rem;
}

.dot-link {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #E4E4E7;
    text-decoration: none;
}

.dot-link.active {
    background: #4A7C59;
}

/* Header bar on step 2 & 3 */
.step-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 1.5rem;
}

.back-link {
    color: #366A4E;
    font-size: 1.2rem;
    text-decoration: none;
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

/* Choice Cards (Step 2 & 3) */
.choices-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    width: 100%;
}

.choice-card-link {
    background: #F5EFE6;
    border: 2px solid transparent;
    border-radius: 1.5rem;
    padding: 1.1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
    color: #1C1917 !important;
    text-align: left;
    transition: all 0.2s ease;
}

.choice-card-link.selected {
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

.choice-card-link.selected .choice-icon-wrap {
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

.choice-card-link.selected .choice-checkbox {
    border-color: #4A7C59;
    background: #4A7C59;
}

.choice-checkbox-inner {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
}

.choice-card-link.selected .choice-checkbox-inner {
    background: #FFFFFF;
}

.slider-fallback-link {
    display: block;
    margin: 1.5rem auto 1.5rem auto;
    font-size: 0.85rem;
    color: #8C7853;
    font-weight: 600;
    text-decoration: underline;
    text-align: center;
}

/* Button Disabled */
.btn-gray-link {
    width: 100%;
    background: #EFECE6;
    color: #A1A1AA !important;
    text-decoration: none;
    border-radius: 1.25rem;
    padding: 1.1rem;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    box-sizing: border-box;
}

/* Deepen your shield step */
.skip-link {
    display: block;
    margin: 1rem auto 0 auto;
    font-size: 0.85rem;
    color: #71717A;
    text-decoration: underline;
    font-weight: 600;
    text-align: center;
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
}

/* Screen 4: Morning Shield Style (dark phone layout wrapper) */
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

.action-card {
    background: #F5F1E9;
    border-radius: 1.25rem;
    padding: 1.1rem 1.25rem;
    text-align: left;
    display: flex;
    gap: 0.85rem;
    margin-bottom: 1.5rem;
}

.action-card-icon {
    font-size: 1.2rem;
    color: #366A4E;
    margin-top: 2px;
}

.action-details {
    font-size: 0.85rem;
    line-height: 1.4;
    color: #52525B;
}

.action-details strong {
    color: #1C1917;
    font-weight: 700;
}

.btn-white-outline {
    width: 100%;
    background: transparent;
    color: #8C7853 !important;
    text-decoration: none;
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
    transition: all 0.2s ease;
}

.btn-white-outline:hover {
    background: #F5F1E9;
}

/* Screen 5: May Review Style */
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

/* Review Side-by-side Cards */
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

/* Insight Card */
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
</style>
""", unsafe_allow_html=True)

# Render main phone frame centered
st.write('<div class="phone-wrapper">', unsafe_allow_html=True)

current_step = st.session_state.current_step

# Step 4 renders in a dark-tinted phone container
container_class = "phone-container dark-phone" if current_step == 4 else "phone-container"
st.write(f'<div class="{container_class}">', unsafe_allow_html=True)

if current_step == 1:
    # Screen 1: Welcome to Ebb
    st.write(f"""
    <div class="screen">
        <div class="shield-logo-wrap">
            <i class="fa-solid fa-shield-halved shield-logo-icon"></i>
        </div>
        
        <h1 class="title-serif" style="text-align: center;">Welcome to Ebb</h1>
        <p class="subtitle">Let's start by understanding your natural rhythm.</p>
        
        <div class="welcome-card">
            <i class="fa-regular fa-calendar welcome-card-icon"></i>
            <div class="welcome-card-title">Sync Your Calendar</div>
            
            <a class="btn-green-link" href="?step=2" target="_self">
                <i class="fa-regular fa-calendar"></i>
                Connect Google Calendar
            </a>
            
            <div class="privacy-note">
                <i class="fa-solid fa-lock privacy-icon"></i>
                <div>
                    <div class="privacy-title">Privacy First</div>
                    <div class="privacy-body">
                        Ebb only analyzes timing and attendee counts to gauge your energy load. We <strong>never</strong> read or store meeting titles, descriptions, or sensitive data.
                    </div>
                </div>
            </div>
        </div>
        
        <div class="dots-container">
            <a class="dot-link active" href="?step=1" target="_self"></a>
            <a class="dot-link" href="?step=2" target="_self"></a>
            <a class="dot-link" href="?step=3" target="_self"></a>
        </div>
    </div>
    """, unsafe_allow_html=True)

elif current_step == 2:
    # Screen 2: Connect Energy Source
    selected_source = st.session_state.selected_source
    
    # Active class mappings
    oura_selected = "selected" if selected_source == "oura" else ""
    luna_selected = "selected" if selected_source == "luna" else ""
    apple_selected = "selected" if selected_source == "apple" else ""
    
    # Active continue button
    btn_html = ""
    if selected_source:
        btn_html = f'<a class="btn-green-link" href="?step=3" target="_self">Continue <i class="fa-solid fa-arrow-right"></i></a>'
    else:
        btn_html = f'<div class="btn-gray-link">Continue <i class="fa-solid fa-arrow-right"></i></div>'

    st.write(f"""
    <div class="screen">
        <div class="step-header">
            <a class="back-link" href="?step=1" target="_self"><i class="fa-solid fa-arrow-left"></i></a>
            <span class="step-header-title">Ebb</span>
            <div style="width:20px;"></div>
        </div>
        
        <div style="text-align: center;">
            <span class="step-pill">Step 2 of 3</span>
            <h1 class="title-serif">Connect Energy Source</h1>
            <p class="subtitle">Sync your wearable to automatically track your daily flow and recovery rhythms.</p>
        </div>
        
        <div class="choices-list">
            <a class="choice-card-link {oura_selected}" href="?step=2&source=oura" target="_self">
                <div class="choice-icon-wrap">
                    <i class="fa-solid fa-circle-dot choice-icon"></i>
                </div>
                <div class="choice-details">
                    <div class="choice-title">Oura Ring</div>
                    <div class="choice-sub">Deep sleep & readiness insights</div>
                </div>
                <div class="choice-checkbox"><div class="choice-checkbox-inner"></div></div>
            </a>
            
            <a class="choice-card-link {luna_selected}" href="?step=2&source=luna" target="_self">
                <div class="choice-icon-wrap">
                    <i class="fa-regular fa-circle choice-icon"></i>
                </div>
                <div class="choice-details">
                    <div class="choice-title">Luna Ring</div>
                    <div class="choice-sub">Holistic wellness tracking</div>
                </div>
                <div class="choice-checkbox"><div class="choice-checkbox-inner"></div></div>
            </a>
            
            <a class="choice-card-link {apple_selected}" href="?step=2&source=apple" target="_self">
                <div class="choice-icon-wrap">
                    <i class="fa-regular fa-heart choice-icon"></i>
                </div>
                <div class="choice-details">
                    <div class="choice-title">Apple Health</div>
                    <div class="choice-sub">Steps, activity & vital trends</div>
                </div>
                <div class="choice-checkbox"><div class="choice-checkbox-inner"></div></div>
            </a>
        </div>
        
        <a class="slider-fallback-link" href="?step=2&source=slider" target="_self">No wearable? Use the morning slider instead</a>
        
        <div style="margin-top: auto; padding-top: 1rem;">
            {btn_html}
        </div>
    </div>
    """, unsafe_allow_html=True)

elif current_step == 3:
    # Screen 3: Deepen Your Shield
    meeting_active = "selected" if st.session_state.meeting_insights else ""
    workplace_active = "selected" if st.session_state.workplace_context else ""
    focus_active = "selected" if st.session_state.focus_data else ""
    
    st.write(f"""
    <div class="screen">
        <div class="shield-logo-wrap" style="margin-top:0.5rem; margin-bottom:1rem;">
            <i class="fa-solid fa-shield-halved shield-logo-icon"></i>
        </div>
        
        <h1 class="title-serif" style="text-align: center;">Deepen Your Shield</h1>
        <p class="subtitle">Connect optional sources to measure cognitive load with higher accuracy. Everything is processed locally.</p>
        
        <div class="choices-list">
            <a class="choice-card-link {meeting_active}" href="?step=3&toggle=meeting" target="_self">
                <div class="choice-icon-wrap">
                    <i class="fa-regular fa-file-lines choice-icon"></i>
                </div>
                <div class="choice-details">
                    <div class="choice-title">Meeting Insights</div>
                    <div class="choice-sub">Identify urgent work in transcripts (e.g. Tactiq)</div>
                </div>
                <div class="choice-checkbox"><div class="choice-checkbox-inner"></div></div>
            </a>
            
            <a class="choice-card-link {workplace_active}" href="?step=3&toggle=workplace" target="_self">
                <div class="choice-icon-wrap">
                    <i class="fa-regular fa-comment-dots choice-icon"></i>
                </div>
                <div class="choice-details">
                    <div class="choice-title">Workplace Context</div>
                    <div class="choice-sub">Detect urgent pings via Slack or Teams (MCP)</div>
                </div>
                <div class="choice-checkbox"><div class="choice-checkbox-inner"></div></div>
            </a>
            
            <a class="choice-card-link {focus_active}" href="?step=3&toggle=focus" target="_self">
                <div class="choice-icon-wrap">
                    <i class="fa-regular fa-clock choice-icon"></i>
                </div>
                <div class="choice-details">
                    <div class="choice-title">Focus Data</div>
                    <div class="choice-sub">Measure cognitive load via Screen Time (MCP)</div>
                </div>
                <div class="choice-checkbox"><div class="choice-checkbox-inner"></div></div>
            </a>
        </div>
        
        <div style="margin-top: auto; padding-top: 1rem; text-align: center;">
            <a class="btn-green-link" href="?step=4" target="_self">Continue</a>
            <a class="skip-link" href="?step=4" target="_self">Skip for now</a>
            <div class="local-private-badge">
                <i class="fa-solid fa-lock"></i> LOCAL-FIRST & PRIVATE
            </div>
            
            <div class="dots-container" style="padding-top:1.2rem;">
                <a class="dot-link" href="?step=1" target="_self"></a>
                <a class="dot-link active" href="?step=2" target="_self"></a>
                <a class="dot-link" href="?step=3" target="_self"></a>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

elif current_step == 4:
    # Screen 4: Morning Shield
    st.write("""
    <div class="screen">
        <div class="alert-card">
            <div class="alert-label">
                <i class="fa-solid fa-battery-quarter" style="transform: rotate(270deg);"></i> MORNING SHIELD
            </div>
            <h1 class="alert-title">Your energy is low this morning</h1>
            
            <div class="alert-metrics">
                <div class="alert-metric-item red-tint">
                    <i class="fa-solid fa-bolt alert-metric-icon"></i>
                    <div class="alert-metric-val">31%</div>
                    <div class="alert-metric-lbl">Energy</div>
                </div>
                <div class="alert-metric-item">
                    <i class="fa-regular fa-heart alert-metric-icon"></i>
                    <div class="alert-metric-val">24ms</div>
                    <div class="alert-metric-lbl">HRV</div>
                </div>
                <div class="alert-metric-item">
                    <i class="fa-regular fa-moon alert-metric-icon"></i>
                    <div class="alert-metric-val">5.2h</div>
                    <div class="alert-metric-lbl">Sleep</div>
                </div>
            </div>
            
            <div class="action-card">
                <i class="fa-regular fa-calendar-minus action-card-icon"></i>
                <div class="action-details">
                    <strong>PROPOSED ACTION</strong><br/>
                    Moving <strong>Spec Drafting</strong> to tomorrow at <strong>9:00 AM</strong> when your readiness is predicted to be higher.
                </div>
            </div>
            
            <a class="btn-green-link" href="?step=5" target="_self">
                <i class="fa-solid fa-shield-halved"></i> Yes, Shield Me
            </a>
            
            <a class="btn-white-outline" href="?step=5" target="_self">
                Push Through
            </a>
        </div>
    </div>
    """, unsafe_allow_html=True)

elif current_step == 5:
    # Screen 5: May Review
    st.write("""
    <div class="screen">
        <div class="review-header">
            <i class="fa-regular fa-calendar-check" style="font-size:0.95rem;"></i> MAY REVIEW
        </div>
        
        <h1 class="title-serif">You found your rhythm this month.</h1>
        
        <div class="cas-chart-card">
            <div class="cas-card-lbl">Cognitive Alignment Score</div>
            <div class="cas-card-val-row">
                <span class="cas-card-val">78%</span>
                <span class="cas-card-pts"><i class="fa-solid fa-arrow-up"></i> 17 pts</span>
            </div>
            
            <!-- Beautiful inline Sparkline Graph matching the image exact points and gradient curves -->
            <div style="width: 100%; height: 110px;">
                <svg width="100%" height="100%" viewBox="0 0 300 110" style="overflow: visible;">
                    <defs>
                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#4A7C59" stop-opacity="0.1" />
                            <stop offset="100%" stop-color="#4A7C59" stop-opacity="0.3" />
                        </linearGradient>
                    </defs>
                    <!-- Horizontal reference lines -->
                    <line x1="0" y1="45" x2="300" y2="45" stroke="#E4E4E7" stroke-dasharray="6 6" stroke-width="1.5" />
                    <line x1="0" y1="90" x2="300" y2="90" stroke="#E4E4E7" stroke-dasharray="6 6" stroke-width="1.5" />
                    
                    <!-- Graph line gradient area -->
                    <path d="M 10 75 C 60 72, 130 52, 195 50 T 290 20 L 290 90 L 10 90 Z" fill="url(#gradient-line)" opacity="0.3"/>
                    
                    <!-- The trend line -->
                    <path d="M 10 75 C 60 72, 130 52, 195 50 T 290 20" fill="none" stroke="#4A7C59" stroke-width="4.5" stroke-linecap="round"/>
                    
                    <!-- Nodes -->
                    <circle cx="10" cy="75" r="5" fill="#FAF8F5" stroke="#4A7C59" stroke-width="3" />
                    <circle cx="290" cy="20" r="5" fill="#4A7C59" />
                    
                    <!-- Value text -->
                    <text x="10" y="93" fill="#A1A1AA" font-size="9" font-family="Inter" text-anchor="middle">61%</text>
                    <text x="290" y="12" fill="#366A4E" font-size="9.5" font-family="Inter" font-weight="700" text-anchor="middle">78%</text>
                </svg>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #A1A1AA; margin-top: 0.6rem; font-family: Inter;">
                <span>May 1</span>
                <span>May 15</span>
                <span>May 31</span>
            </div>
        </div>
        
        <div class="review-metrics-row">
            <div class="review-metric-card review-card-green">
                <div class="review-card-icon-wrap">
                    <i class="fa-solid fa-shield-halved review-card-icon"></i>
                </div>
                <div class="review-card-val">23</div>
                <div class="review-card-lbl">Shields approved</div>
            </div>
            <div class="review-metric-card review-card-tan">
                <div class="review-card-icon-wrap">
                    <i class="fa-solid fa-bolt review-card-icon"></i>
                </div>
                <div class="review-card-val">4</div>
                <div class="review-card-lbl">Overrides required</div>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-icon-wrap">
                <i class="fa-regular fa-lightbulb insight-icon"></i>
            </div>
            <div class="insight-details">
                <div class="insight-title">Key Insight</div>
                <div class="insight-desc">
                    Your best weeks had <strong>4+ morning shields accepted</strong>. Establishing boundaries early seems to set a positive tone for your day.
                </div>
            </div>
        </div>
        
        <a class="btn-green-link" href="?step=1" target="_self" style="margin-top: auto;">
            Start June <i class="fa-solid fa-arrow-right"></i>
        </a>
    </div>
    """, unsafe_allow_html=True)

st.write('</div>', unsafe_allow_html=True) # close phone-container
st.write('</div>', unsafe_allow_html=True) # close phone-wrapper
