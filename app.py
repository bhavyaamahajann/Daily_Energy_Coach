import streamlit as st
import streamlit.components.v1 as components

# Page configurations
st.set_page_config(page_title="ebb", page_icon="🛡️", layout="centered")

# Hide all Streamlit chrome and set a light, premium page background
st.markdown("""<style>
#MainMenu {visibility:hidden}
footer {visibility:hidden}
header {visibility:hidden}
[data-testid="stHeader"] {background:transparent !important}
section[data-testid="stSidebar"] {display:none !important}
[data-testid="stSidebarCollapseButton"] {display:none !important}
.main .block-container {padding:0 !important;max-width:100% !important}
div[data-testid="stAppViewContainer"] {background:#F4F4F6 !important}
iframe {border:none !important}
</style>""", unsafe_allow_html=True)

# --- Full self-contained HTML page with JavaScript-based step navigation ---
full_page = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { height:100%; width:100%; background:#F4F4F6; font-family:'Inter',sans-serif; color:#1C1917; }
.phone-wrapper { display:flex; justify-content:center; align-items:center; min-height:100%; padding:2rem 1rem; }
.phone-container { width:390px; height:820px; background:#FDFBF7; border-radius:3rem; border: 1px solid rgba(0,0,0,0.08); box-shadow:0 25px 50px -12px rgba(0,0,0,0.12); overflow-y:auto; position:relative; display:flex; flex-direction:column; }
.phone-container::-webkit-scrollbar { display:none; }
.phone-container { -ms-overflow-style:none; scrollbar-width:none; }
.screen { display:flex; flex-direction:column; flex:1; padding:2.2rem 1.8rem; height:100%; overflow-y:auto; }
.screen::-webkit-scrollbar { display:none; }
.screen { -ms-overflow-style:none; scrollbar-width:none; }

.title-serif { font-family:'DM Serif Display',Georgia,serif; font-size:2.25rem; font-weight:400; color:#366A4E; line-height:1.15; margin:0 0 0.75rem 0; }
.subtitle { font-size:0.95rem; color:#71717A; line-height:1.5; margin:0 auto 1.5rem auto; max-width:280px; text-align:center; }
.shield-logo-wrap { width:80px; height:80px; border-radius:50%; background:#EFECE6; display:flex; align-items:center; justify-content:center; margin:2rem auto 1.5rem auto; }
.shield-logo-icon { font-size:2.2rem; color:#1C1917; }
.welcome-card { background:#F8F5EE; border-radius:1.75rem; padding:2rem 1.5rem; margin-top:1rem; display:flex; flex-direction:column; align-items:center; }
.welcome-card-icon { font-size:1.8rem; color:#366A4E; margin-bottom:0.75rem; }
.welcome-card-title { font-family:'DM Serif Display',Georgia,serif; font-size:1.4rem; color:#1C1917; margin-bottom:1.5rem; }
.btn-green-link { width:100%; background:#4A7C59; color:#FFFFFF !important; text-decoration:none; border:none; cursor:pointer; border-radius:1.25rem; padding:1.1rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; justify-content:center; gap:0.6rem; transition:all 0.2s ease; }
.btn-green-link:hover { background:#3B6748; }
.privacy-note { display:flex; align-items:flex-start; gap:0.75rem; text-align:left; margin-top:1.5rem; width:100%; }
.privacy-icon { color:#8C7853; font-size:0.95rem; margin-top:2px; }
.privacy-title { font-weight:600; font-size:0.8rem; color:#1C1917; margin-bottom:0.15rem; }
.privacy-body { font-size:0.75rem; color:#71717A; line-height:1.4; }

/* Navigation & Elements matching images */
.back-btn { background:transparent; border:none; color:#366A4E; font-size:1.2rem; cursor:pointer; align-self:flex-start; margin-bottom:0.5rem; }
.step-dots { display:flex; justify-content:center; gap:0.5rem; margin-top:auto; padding-top:1.5rem; }
.dot { width:8px; height:8px; border-radius:50%; background:#E4E4E7; }
.dot.active { background:#4A7C59; }
.step-pill { background:#F2ECE1; color:#8C7853; font-size:0.75rem; font-weight:600; padding:0.35rem 0.85rem; border-radius:1rem; display:inline-block; }

.toggle-tabs { display:flex; background:#EFECE6; padding:0.25rem; border-radius:1rem; margin-bottom:1.5rem; }
.tab-btn { flex:1; background:transparent; border:none; border-radius:0.85rem; padding:0.6rem 0; font-weight:600; color:#71717A; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem; transition: all 0.2s ease; }
.tab-btn.active { background:#FFFFFF; color:#1C1917; box-shadow:0 2px 4px rgba(0,0,0,0.05); }

.input-group { margin-bottom:1.2rem; text-align:left; width:100%; }
.input-group label { font-size:0.72rem; font-weight:700; color:#8C7853; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:0.4rem; display:block; }
.input-group input { width:100%; border:1px solid #E4E4E7; background:#F8F5EE; border-radius:1rem; padding:0.9rem 1.1rem; font-size:0.95rem; color:#1C1917; outline:none; }

.choices-list { display:flex; flex-direction:column; gap:0.85rem; width:100%; }
.choice-card { background:#F8F5EE; border:1px solid transparent; border-radius:1.5rem; padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; cursor:pointer; transition: all 0.2s ease; }
.choice-card.selected { background:#EDF4EE; border:1px solid #4A7C59; }
.choice-icon-wrap { width:44px; height:44px; border-radius:50%; background:#EFECE6; display:flex; align-items:center; justify-content:center; }
.choice-card.selected .choice-icon-wrap { background:#DCEFE0; }
.choice-details { flex:1; text-align:left; }
.choice-title { font-family:'DM Serif Display',Georgia,serif; font-weight:700; font-size:1.15rem; color:#1C1917; }
.choice-sub { font-size:0.78rem; color:#71717A; }

/* Lock Screen Alert Card Styles */
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
.lockscreen-time-wrap { text-align: center; margin-top: 2rem; margin-bottom: 2rem; }
.lockscreen-time { font-size: 3.5rem; font-weight: 300; letter-spacing: -0.02em; color: #FFFFFF; }
.lockscreen-date { font-size: 0.95rem; font-weight: 500; color: #A1A1AA; letter-spacing: 0.05em; margin-top: 0.25rem; }

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
.notification-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.notification-appname { font-size: 0.75rem; font-weight: 700; color: #8C7853; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.35rem; }
.notification-time { font-size: 0.72rem; color: #71717A; }
.notification-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.35rem; color: #1C1917; line-height: 1.2; margin-bottom: 0.6rem; }
.notification-desc { font-size: 0.85rem; color: #52525B; line-height: 1.45; margin-bottom: 1.2rem; }

/* Focus Protected / Timeline / Graph Page styles */
.header-bar { display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:1.5rem; }
.header-bar span { font-family:'DM Serif Display',Georgia,serif; font-size:1.25rem; color:#366A4E; font-weight:700; }
.header-close { background:transparent; border:none; font-size:1.25rem; color:#71717A; cursor:pointer; }
.round-shield-container { width:90px; height:90px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0.5rem auto 1rem auto; }
.cas-badge { background:#F2ECE1; color:#366A4E; font-size:0.82rem; font-weight:700; padding:0.4rem 0.9rem; border-radius:2rem; display:inline-flex; align-items:center; gap:0.25rem; margin:0.25rem auto 1.5rem auto; }
.draft-card { background:#FDFBF7; border-radius:1.5rem; padding:1.25rem; text-align:left; margin-bottom:1.5rem; border:1px solid rgba(0,0,0,0.04); box-shadow:0 4px 15px rgba(0,0,0,0.02); }
.draft-quote { font-size:0.85rem; font-style:italic; line-height:1.45; color:#52525B; margin:0.6rem 0 1rem 0; width: 100%; border: none; background: transparent; resize: none; outline: none; font-family: inherit; }
.draft-quote:focus { background: #F5F1E9; border-radius: 0.5rem; padding: 0.25rem; }
.draft-btn-outline { width:100%; border-radius:1.25rem; padding:0.9rem; font-weight:600; font-size:0.9rem; border:1px solid #EFECE6; background:#FDFBF7; color:#366A4E; cursor:pointer; margin-top:0.6rem; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
.flow-card { background:#FDFBF7; border-radius:1.75rem; padding:1.5rem; border:1px solid rgba(0,0,0,0.04); box-shadow:0 4px 15px rgba(0,0,0,0.02); text-align:left; }
.timeline { position:relative; padding-left:1.8rem; border-left:1.5px solid #EFECE6; margin-top:1.2rem; }
.timeline-item { position:relative; margin-bottom:1.5rem; }
.timeline-item:last-child { margin-bottom:0; }
.timeline-dot { position:absolute; left:-2.35rem; top:0.25rem; width:12px; height:12px; border-radius:50%; background:#E4E4E7; border:2px solid #FDFBF7; }
.timeline-dot.active { background:#4A7C59; }
.timeline-time { font-size:0.8rem; color:#71717A; margin-bottom:0.15rem; font-weight:500; }
.timeline-title { font-family:'DM Serif Display',Georgia,serif; font-size:1.08rem; color:#1C1917; font-weight:700; }
.timeline-title.crossed { text-decoration:line-through; color:#A1A1AA; }
.timeline-sub { font-size:0.78rem; color:#71717A; }
.buffer-box { background:#EDF4EE; border-radius:1.25rem; padding:1rem; margin-top:0.5rem; }
.buffer-title { font-family:'DM Serif Display',Georgia,serif; color:#366A4E; font-weight:700; font-size:1.05rem; display:flex; align-items:center; gap:0.4rem; }
.buffer-desc { font-size:0.8rem; color:#52525B; line-height:1.4; margin-top:0.35rem; margin-bottom:0.75rem; }
.badge-pill { background:#FFFFFF; color:#4A7C59; font-weight:700; font-size:0.72rem; padding:0.25rem 0.65rem; border-radius:1rem; display:inline-block; }
.see-review-link { display:block; text-align:center; color:#366A4E; font-weight:600; font-size:0.88rem; text-decoration:underline; margin:1.5rem auto 0 auto; cursor:pointer; }
.report-card { background:#FDFBF7; border-radius:2rem; padding:1.5rem; border:1px solid rgba(0,0,0,0.04); margin-bottom:1.25rem; text-align:left; }
.report-subcard { background:#FDFBF7; border-radius:1.5rem; padding:1.2rem; border:1px solid rgba(0,0,0,0.04); }
</style>
</head>
<body>
<div class="phone-wrapper">
    <div class="phone-container">
        
        <!-- Screen 1: Welcome -->
        <div id="step-1" class="screen">
            <div style="display:flex; flex-direction:column; align-items:center; margin-top:1.5rem; margin-bottom:2rem;">
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style="color:#366A4E; margin-bottom:0.5rem;">
                    <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.5"/>
                    <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
                    <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                </svg>
                <span style="font-family:'DM Serif Display',Georgia,serif; font-size:1.8rem; color:#366A4E; font-weight:700;">ebb</span>
            </div>
            
            <h1 class="title-serif" style="text-align:center;">Welcome to Ebb</h1>
            <p class="subtitle" style="margin-bottom:1.8rem; max-width:260px;">Let's start by understanding your natural rhythm.</p>
            
            <div class="welcome-card" style="margin-top:0.5rem; width:100%;">
                <i class="fa-regular fa-calendar welcome-card-icon"></i>
                <div class="welcome-card-title">Sync Your Calendar</div>
                
                <button class="btn-green-link" onclick="goToStep(2)">
                    <i class="fa-regular fa-calendar-check"></i> Sign up with email or phone
                </button>
                
                <div class="privacy-note">
                    <i class="fa-solid fa-lock privacy-icon"></i>
                    <div>
                        <div class="privacy-title">Privacy First</div>
                        <div class="privacy-body">Ebb only analyzes timing and attendee counts to gauge your energy load. We <strong>never</strong> read or store meeting titles, descriptions, or sensitive data.</div>
                    </div>
                </div>
            </div>

            <button style="background:transparent; border:none; font-size:0.85rem; color:#366A4E; font-weight:600; display:flex; align-items:center; gap:0.4rem; justify-content:center; margin:1.5rem auto 0 auto; cursor:pointer;" onclick="goToStep(5)">
                <i class="fa-solid fa-table-cells-large"></i> Preview the dashboard
            </button>

            <div class="step-dots">
                <div class="dot active"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>

        <!-- Screen 2: Create Account -->
        <div id="step-2" class="screen" style="display:none;">
            <button class="back-btn" onclick="goToStep(1)">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div style="display:flex; flex-direction:column; align-items:center; margin-top:0.5rem; margin-bottom:1.5rem;">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style="color:#366A4E; margin-bottom:0.25rem;">
                    <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.5"/>
                    <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
                    <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                </svg>
                <span style="font-family:'DM Serif Display',Georgia,serif; font-size:1.4rem; color:#366A4E; font-weight:700;">ebb</span>
            </div>

            <h1 class="title-serif" style="text-align:center; font-size:2rem; margin-bottom:0.5rem;">Create your account</h1>
            <p class="subtitle" style="margin-bottom:1.5rem;">Sign up with your email or phone to start protecting your focus.</p>

            <div class="toggle-tabs">
                <button id="email-tab" class="tab-btn active" onclick="toggleAuthMethod('email')">
                    <i class="fa-regular fa-envelope"></i> Email
                </button>
                <button id="phone-tab" class="tab-btn" onclick="toggleAuthMethod('phone')">
                    <i class="fa-solid fa-phone"></i> Phone
                </button>
            </div>

            <div class="input-group" id="email-input-group">
                <label id="auth-label">Email</label>
                <input id="auth-input" type="email" value="you@calm.com">
            </div>

            <div class="input-group">
                <label>Password</label>
                <input type="password" value="At least 6 characters" style="color:#71717A;">
            </div>

            <button class="btn-green-link" onclick="goToStep(3)" style="margin-top:0.5rem;">
                Create account &nbsp;<i class="fa-solid fa-arrow-right"></i>
            </button>

            <div style="font-size:0.85rem; color:#71717A; text-align:center; margin-top:1.5rem;">
                Already have an account? <span style="text-decoration:underline; cursor:pointer; color:#366A4E; font-weight:600;">Sign in</span>
            </div>
        </div>

        <!-- Screen 3: Connect Energy Source -->
        <div id="step-3" class="screen" style="display:none;">
            <button class="back-btn" onclick="goToStep(2)">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div style="font-family:'DM Serif Display',Georgia,serif; font-size:1.25rem; color:#366A4E; text-align:center; margin-top:0.5rem; font-weight:700;">Ebb</div>

            <div style="text-align:center; margin-top:0.8rem; margin-bottom:1.2rem;">
                <span class="step-pill">STEP 2 OF 3</span>
            </div>

            <h1 class="title-serif" style="text-align:center; font-size:2rem; color:#1C1917; margin-bottom:0.5rem;">Connect Energy Source</h1>
            <p class="subtitle" style="margin-bottom:1.8rem;">Sync your wearable to automatically track your daily flow and recovery rhythms.</p>

            <div class="choices-list">
                <div class="choice-card selected" id="wearable-oura" onclick="selectWearable('oura')">
                    <div class="choice-icon-wrap">
                        <i class="fa-solid fa-circle-dot" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Oura Ring</div>
                        <div class="choice-sub">Deep sleep & readiness insights</div>
                    </div>
                </div>

                <div class="choice-card" id="wearable-luna" onclick="selectWearable('luna')">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-circle" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Luna Ring</div>
                        <div class="choice-sub">Holistic wellness tracking</div>
                    </div>
                </div>

                <div class="choice-card" id="wearable-apple" onclick="selectWearable('apple')">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-heart" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Apple Health</div>
                        <div class="choice-sub">Steps, activity & vital trends</div>
                    </div>
                </div>
            </div>

            <div style="text-align:center; margin-top:1.5rem; margin-bottom:2rem;">
                <span style="font-size:0.85rem; color:#8C7853; font-weight:600; text-decoration:underline; cursor:pointer;">No wearable? Use the morning slider instead</span>
            </div>

            <button class="btn-green-link" onclick="goToStep(4)">
                Continue &nbsp;<i class="fa-solid fa-arrow-right"></i>
            </button>

            <div class="step-dots">
                <div class="dot"></div>
                <div class="dot active"></div>
                <div class="dot"></div>
            </div>
        </div>

        <!-- Screen 4: Deepen Your Shield -->
        <div id="step-4" class="screen" style="display:none;">
            <button class="back-btn" onclick="goToStep(3)">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div class="shield-logo-wrap" style="background:#EFECE6; margin-top:0.5rem; margin-bottom:1rem;">
                <i class="fa-solid fa-shield-halved" style="font-size:2.2rem; color:#1C1917;"></i>
            </div>

            <h1 class="title-serif" style="text-align:center; font-size:2.1rem; color:#366A4E; margin-bottom:0.5rem;">Deepen Your Shield</h1>
            <p class="subtitle" style="margin-bottom:1.8rem; max-width:290px;">Connect optional sources to measure cognitive load with higher accuracy. Everything is processed locally.</p>

            <div class="choices-list">
                <div class="choice-card selected" id="shield-meeting" onclick="toggleShieldOpt('meeting')">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-file-lines" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Meeting Insights</div>
                        <div class="choice-sub">Identify urgent work in transcripts (e.g. Tactiq)</div>
                    </div>
                    <i class="fa-solid fa-circle-check check-icon" style="color:#366A4E; font-size:1.2rem;"></i>
                </div>

                <div class="choice-card" id="shield-workplace" onclick="toggleShieldOpt('workplace')">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-comment" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Workplace Context</div>
                        <div class="choice-sub">Detect urgent pings via Slack or Teams (MCP)</div>
                    </div>
                    <i class="fa-regular fa-circle check-icon" style="color:#D1D1D6; font-size:1.2rem;"></i>
                </div>

                <div class="choice-card" id="shield-focus" onclick="toggleShieldOpt('focus')">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-clock" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Focus Data</div>
                        <div class="choice-sub">Measure cognitive load via Screen Time (MCP)</div>
                    </div>
                    <i class="fa-regular fa-circle check-icon" style="color:#D1D1D6; font-size:1.2rem;"></i>
                </div>
            </div>

            <button class="btn-green-link" onclick="goToStep(5)" style="margin-top:1.5rem;">
                Continue
            </button>

            <div style="text-align:center; margin-top:0.8rem; margin-bottom:1.5rem;">
                <span style="font-size:0.85rem; color:#71717A; text-decoration:underline; cursor:pointer; font-weight:600;" onclick="goToStep(5)">Skip for now</span>
            </div>

            <div style="display:flex; align-items:center; justify-content:center; gap:0.4rem; font-size:0.75rem; font-weight:700; color:#8C7853; letter-spacing:0.05em; text-transform:uppercase; margin-top:auto;">
                <i class="fa-solid fa-lock"></i> Local-first & private
            </div>

            <div class="step-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot active"></div>
            </div>
        </div>

        <!-- Screen 5: Morning Shield Propose (Renders like iOS/Mobile Lock Screen notification) -->
        <div id="step-5" class="screen" style="display:none; padding:0;">
            <div class="lockscreen-bg">
                <button class="back-btn" onclick="goToStep(4)" style="color:#FFFFFF; margin-bottom:0; z-index:10;"><i class="fa-solid fa-arrow-left"></i></button>
                
                <div class="lockscreen-time-wrap">
                    <div class="lockscreen-time">08:30</div>
                    <div class="lockscreen-date">Monday, May 31</div>
                </div>

                <!-- Notification Banner -->
                <div class="notification-banner">
                    <div class="notification-header">
                        <span class="notification-appname">
                            <svg width="14" height="14" viewBox="0 0 40 40" fill="none" style="color: #366A4E;">
                                <path d="M4 14 Q12 8 20 14 T36 14" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
                                <path d="M4 21 Q12 15 20 21 T36 21" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
                                <path d="M4 28 Q12 22 20 28 T36 28" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
                            </svg>
                            EBB ALERT
                        </span>
                        <span class="notification-time">now</span>
                    </div>

                    <div class="notification-title">Your energy is low today</div>
                    <div class="notification-desc">
                        Somatic recovery is low (24ms HRV). You have a locked 10:00 AM Architecture Review. Protect your energy?
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.6rem;">
                        <button class="btn-green-link" onclick="goToStep(6)" style="padding:0.9rem; border-radius:0.9rem;">
                            <i class="fa-solid fa-shield-halved"></i> Yes, Shield Me
                        </button>
                        <button onclick="goToStep(7)" style="width:100%; border-radius:0.9rem; padding:0.9rem; font-weight:600; font-size:0.95rem; border:none; background:#EFECE6; color:#8C7853; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                            <i class="fa-solid fa-bolt"></i> Push Through
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Screen 6: State Protected (Focus Protected) -->
        <div id="step-6" class="screen" style="display:none; padding:1.8rem 1.4rem;">
            <div class="header-bar">
                <button class="back-btn" onclick="goToStep(5)" style="margin:0;"><i class="fa-solid fa-arrow-left"></i></button>
                <span>State Protected</span>
                <button class="header-close" onclick="goToStep(1)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="round-shield-container" style="background:#DCEFE0;">
                <i class="fa-solid fa-shield-halved" style="font-size:2.8rem; color:#366A4E;"></i>
            </div>

            <h1 class="title-serif" style="text-align:center; font-size:2rem; color:#1C1917; margin-bottom:0.4rem;">Focus Protected</h1>
            <p style="font-size:0.9rem; color:#71717A; text-align:center; margin-bottom:1rem; max-width:320px;">Your timeline has been adjusted to preserve your cognitive load.</p>

            <div class="cas-badge">
                <span>CAS Score</span> <strong>79%</strong> <i class="fa-solid fa-arrow-trend-up"></i>
            </div>

            <!-- Draft Card -->
            <div class="draft-card" style="border-left: 4px solid #EC4899;">
                <div style="font-family:'DM Serif Display',Georgia,serif; font-size:1.15rem; color:#1C1917; font-weight:700;">Draft created for #product</div>
                
                <textarea id="protected-draft-text" class="draft-quote" rows="4">"Hey team, just an update: I'm currently in a deep focus block. The architecture review draft is ready, but I'll be reviewing specs tomorrow. Let me know if anything is urgent."</textarea>
                
                <button class="btn-green-link" style="padding:0.8rem; font-size:0.88rem;" onclick="alert('Notification sent!')">
                    <i class="fa-regular fa-paper-plane"></i> Send Now
                </button>
                <button class="draft-btn-outline" onclick="focusDraftText('protected-draft-text')">
                    <i class="fa-regular fa-edit"></i> Edit Draft
                </button>
            </div>

            <!-- Flow Card -->
            <div class="flow-card">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:0.75rem;">
                    <span style="font-family:'DM Serif Display',Georgia,serif; font-size:1.2rem; color:#1C1917; font-weight:700;">Updated Flow</span>
                    <span style="background:#EFECE6; color:#71717A; font-size:0.72rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:1rem; letter-spacing:0.05em;">TODAY</span>
                </div>

                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-time">10:00</div>
                        <div class="timeline-title crossed">Architecture Review</div>
                        <div class="timeline-sub"><i class="fa-solid fa-lock" style="font-size:0.75rem; color:#71717A; margin-right:0.2rem;"></i> Locked by protocol</div>
                    </div>

                    <div class="timeline-item" style="margin-bottom:1rem;">
                        <div class="timeline-dot active"></div>
                        <div class="buffer-box">
                            <div class="buffer-title">
                                <i class="fa-solid fa-feather-pointed"></i> Zero-Stimulus Buffer
                            </div>
                            <div class="buffer-desc">Reclaiming cognitive capacity. All non-essential notifications silenced.</div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.85rem; color:#366A4E;">11:00 – 13:00</strong>
                                <span class="badge-pill">Active</span>
                            </div>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-time">14:00</div>
                        <div class="timeline-title crossed">Spec Drafting</div>
                        <div style="background:#F2ECE1; color:#8C7853; font-size:0.72rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:0.5rem; display:inline-block; margin-top:0.25rem;">
                            <i class="fa-solid fa-arrow-trend-up"></i> Moved to Tomorrow, 09:00
                        </div>
                    </div>
                </div>
            </div>

            <span class="see-review-link" onclick="goToStep(8)">See this month's review &nbsp;<i class="fa-solid fa-arrow-right"></i></span>
        </div>

        <!-- Screen 7: State Overridden (Push Through Screen) -->
        <div id="step-7" class="screen" style="display:none; padding:1.8rem 1.4rem;">
            <div class="header-bar">
                <button class="back-btn" onclick="goToStep(5)" style="margin:0;"><i class="fa-solid fa-arrow-left"></i></button>
                <span>State Overridden</span>
                <button class="header-close" onclick="goToStep(1)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="round-shield-container" style="background:#FDF0EE;">
                <i class="fa-solid fa-bolt" style="font-size:2.8rem; color:#D4443F;"></i>
            </div>

            <h1 class="title-serif" style="text-align:center; font-size:2rem; color:#1C1917; margin-bottom:0.4rem;">Pushing Through</h1>
            <p style="font-size:0.9rem; color:#71717A; text-align:center; margin-bottom:1rem; max-width:320px;">Timeline kept. Be mindful of your battery limit as you execute today's schedule.</p>

            <div class="cas-badge" style="background:#FDF0EE; color:#D4443F;">
                <span>CAS Score</span> <strong>55%</strong> <i class="fa-solid fa-arrow-trend-down"></i>
            </div>

            <!-- Flow Card -->
            <div class="flow-card">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:0.75rem;">
                    <span style="font-family:'DM Serif Display',Georgia,serif; font-size:1.2rem; color:#1C1917; font-weight:700;">Active Flow</span>
                    <span style="background:#FDF0EE; color:#D4443F; font-size:0.72rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:1rem; letter-spacing:0.05em;">TODAY</span>
                </div>

                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-time">10:00</div>
                        <div class="timeline-title crossed">Architecture Review</div>
                        <div class="timeline-sub"><i class="fa-solid fa-lock" style="font-size:0.75rem; color:#71717A; margin-right:0.2rem;"></i> Locked by protocol</div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-dot active" style="background:#D4443F;"></div>
                        <div class="timeline-time">14:00</div>
                        <div class="timeline-title">Spec Drafting</div>
                        <div style="background:#FDF0EE; color:#D4443F; font-size:0.72rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:0.5rem; display:inline-block; margin-top:0.25rem;">
                            <i class="fa-solid fa-triangle-exclamation"></i> High Cognitive Demand (31% Energy)
                        </div>
                    </div>
                </div>
            </div>

            <span class="see-review-link" onclick="goToStep(8)">See this month's review &nbsp;<i class="fa-solid fa-arrow-right"></i></span>
        </div>

        <!-- Screen 8: May Review -->
        <div id="step-8" class="screen" style="display:none; padding:1.8rem 1.4rem;">
            <button class="back-btn" onclick="goToStep(6)">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.75rem; font-weight:700; color:#8C7853; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:0.5rem;">
                <i class="fa-regular fa-calendar"></i> MAY REVIEW
            </div>

            <h1 class="title-serif" style="font-size:2.2rem; color:#366A4E; line-height:1.2; margin-bottom:1.5rem; text-align:left;">You found your rhythm this month.</h1>

            <!-- Score Graph Card -->
            <div class="report-card" style="margin-bottom:1.5rem;">
                <div style="font-size:0.85rem; color:#71717A; margin-bottom:0.25rem; font-weight:500;">Cognitive Alignment Score</div>
                <div style="display:flex; align-items:baseline; gap:0.5rem; margin-bottom:1.2rem;">
                    <span style="font-family:'DM Serif Display',Georgia,serif; font-size:2.2rem; color:#366A4E; font-weight:700;">78%</span>
                    <span style="font-size:0.9rem; color:#366A4E; font-weight:700;"><i class="fa-solid fa-arrow-up"></i> 17 pts</span>
                </div>

                <!-- SVG line graph -->
                <div style="width:100%; height:120px; position:relative; margin-bottom:0.5rem;">
                    <svg viewBox="0 0 300 100" style="width:100%; height:100%;">
                        <!-- Grids -->
                        <line x1="0" y1="20" x2="300" y2="20" stroke="#F5F1E9" stroke-dasharray="4" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#F5F1E9" stroke-dasharray="4" />
                        <line x1="0" y1="80" x2="300" y2="80" stroke="#F5F1E9" stroke-dasharray="4" />
                        
                        <!-- Area gradient under curve -->
                        <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#366A4E" stop-opacity="0.12" />
                                <stop offset="100%" stop-color="#366A4E" stop-opacity="0.0" />
                            </linearGradient>
                        </defs>
                        <path d="M 0 80 Q 75 75 150 45 T 300 20 L 300 100 L 0 100 Z" fill="url(#grad)" />
                        
                        <!-- Line curve -->
                        <path d="M 0 80 Q 75 75 150 45 T 300 20" fill="none" stroke="#366A4E" stroke-width="2.5" stroke-linecap="round" />
                        
                        <!-- Dot tags -->
                        <circle cx="0" cy="80" r="4" fill="#366A4E" />
                        <circle cx="300" cy="20" r="4" fill="#366A4E" />
                        
                        <!-- Labels inside graph -->
                        <text x="5" y="93" font-size="7" fill="#A1A1AA" font-family="sans-serif">61%</text>
                        <text x="282" y="13" font-size="7" fill="#366A4E" font-weight="700" font-family="sans-serif">78%</text>
                    </svg>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#A1A1AA; font-weight:600;">
                    <span>May 1</span>
                    <span>May 15</span>
                    <span>May 31</span>
                </div>
            </div>

            <!-- Approvals & Overrides row -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-bottom:1.5rem;">
                <div class="report-subcard" style="background:#DCEFE0;">
                    <div style="width:36px; height:36px; border-radius:50%; background:#366A4E; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
                        <i class="fa-regular fa-shield-halved" style="color:#FFFFFF; font-size:0.95rem;"></i>
                    </div>
                    <div style="font-family:'DM Serif Display',Georgia,serif; font-size:1.8rem; color:#1C1917; line-height:1; margin-bottom:0.25rem;">23</div>
                    <div style="font-size:0.8rem; color:#52525B;">Shields approved</div>
                </div>

                <div class="report-subcard" style="background:#F5ECE0;">
                    <div style="width:36px; height:36px; border-radius:50%; background:#8C7853; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
                        <i class="fa-solid fa-bolt" style="color:#FFFFFF; font-size:0.95rem;"></i>
                    </div>
                    <div style="font-family:'DM Serif Display',Georgia,serif; font-size:1.8rem; color:#1C1917; line-height:1; margin-bottom:0.25rem;">4</div>
                    <div style="font-size:0.8rem; color:#52525B;">Overrides required</div>
                </div>
            </div>

            <!-- Insight card -->
            <div style="background:#F8F5EE; border-radius:1.5rem; padding:1.25rem; display:flex; gap:0.85rem; text-align:left; margin-bottom:1.5rem;">
                <div style="width:36px; height:36px; border-radius:50%; background:#F2ECE1; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i class="fa-regular fa-lightbulb" style="font-size:1.1rem; color:#71717A;"></i>
                </div>
                <div style="color:#1C1917;">
                    <div style="font-family:'DM Serif Display',Georgia,serif; font-size:1.05rem; margin-bottom:0.35rem; font-weight:700;">Key Insight</div>
                    <div style="font-size:0.82rem; line-height:1.45; color:#52525B;">Your best weeks had <strong>4+ morning shields accepted</strong>. Establishing boundaries early seems to set a positive tone for your day.</div>
                </div>
            </div>

            <button class="btn-green-link" onclick="goToStep(1)" style="margin-top:auto;">
                Start June &nbsp;<i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>

    </div>
</div>

<script>
var lastVisitedStep = 6;

function goToStep(num) {
    if (num === 6 || num === 7) {
        lastVisitedStep = num;
    }

    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'none';
    document.getElementById('step-4').style.display = 'none';
    document.getElementById('step-5').style.display = 'none';
    document.getElementById('step-6').style.display = 'none';
    document.getElementById('step-7').style.display = 'none';
    document.getElementById('step-8').style.display = 'none';
    
    if (num === 8) {
        document.querySelector('#step-8 .back-btn').setAttribute('onclick', 'goToStep(' + lastVisitedStep + ')');
    }

    document.getElementById('step-' + num).style.display = 'flex';
}

function toggleAuthMethod(method) {
    var emailTab = document.getElementById('email-tab');
    var phoneTab = document.getElementById('phone-tab');
    var label = document.getElementById('auth-label');
    var input = document.getElementById('auth-input');

    if (method === 'email') {
        emailTab.classList.add('active');
        phoneTab.classList.remove('active');
        label.innerText = 'Email';
        input.type = 'email';
        input.value = 'you@calm.com';
    } else {
        phoneTab.classList.add('active');
        emailTab.classList.remove('active');
        label.innerText = 'Phone';
        input.type = 'tel';
        input.value = '+1 (555) 019-2834';
    }
}

function selectWearable(choice) {
    document.getElementById('wearable-oura').classList.remove('selected');
    document.getElementById('wearable-luna').classList.remove('selected');
    document.getElementById('wearable-apple').classList.remove('selected');

    document.querySelector('#wearable-oura .choice-icon-wrap i').className = 'fa-regular fa-circle';
    document.querySelector('#wearable-luna .choice-icon-wrap i').className = 'fa-regular fa-circle';
    document.querySelector('#wearable-apple .choice-icon-wrap i').className = 'fa-regular fa-circle';

    var activeCard = document.getElementById('wearable-' + choice);
    activeCard.classList.add('selected');
    
    var icon = activeCard.querySelector('.choice-icon-wrap i');
    if (choice === 'oura') {
        icon.className = 'fa-solid fa-circle-dot';
    } else if (choice === 'luna') {
        icon.className = 'fa-solid fa-circle-dot';
    } else {
        icon.className = 'fa-solid fa-heart';
    }
}

function toggleShieldOpt(option) {
    var card = document.getElementById('shield-' + option);
    var isSelected = card.classList.toggle('selected');
    var checkIcon = card.querySelector('.check-icon');

    if (isSelected) {
        checkIcon.className = 'fa-solid fa-circle-check check-icon';
        checkIcon.style.color = '#366A4E';
    } else {
        checkIcon.className = 'fa-regular fa-circle check-icon';
        checkIcon.style.color = '#D1D1D6';
    }
}

function focusDraftText(id) {
    var txt = document.getElementById(id);
    txt.focus();
}
</script>
</body>
</html>
"""

# Render as a self-contained HTML iframe
components.html(full_page, height=880, scrolling=False)
