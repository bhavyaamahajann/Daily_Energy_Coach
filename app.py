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
.phone-container { width:390px; min-height:820px; background:#FDFBF7; border-radius:3rem; border: 1px solid rgba(0,0,0,0.08); box-shadow:0 25px 50px -12px rgba(0,0,0,0.12); overflow-y:auto; position:relative; display:flex; flex-direction:column; }
.phone-container::-webkit-scrollbar { display:none; }
.phone-container { -ms-overflow-style:none; scrollbar-width:none; }
.screen { display:flex; flex-direction:column; flex:1; padding:2.2rem 1.8rem; }
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
.alert-card { background:#FDFBF7; border-radius:2rem; padding:2.2rem 1.8rem; margin-top:auto; margin-bottom:auto; box-shadow:0 4px 20px rgba(0,0,0,0.05); text-align:center; color:#1C1917; }
.alert-label { display:inline-flex; align-items:center; gap:0.5rem; color:#D4443F; font-weight:700; font-size:0.78rem; letter-spacing:0.05em; margin-bottom:0.85rem; }
.alert-title { font-family:'DM Serif Display',Georgia,serif; font-size:1.95rem; line-height:1.2; color:#1C1917; margin:0 0 1.5rem 0; font-weight:400; }
.alert-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:0.65rem; margin-bottom:1.5rem; }
.alert-metric-item { background:#F5F1E9; border-radius:1.25rem; padding:0.85rem 0.5rem; display:flex; flex-direction:column; align-items:center; }
.alert-metric-item.red-tint { background:#FDF0EE; }
.alert-metric-icon { font-size:1.1rem; margin-bottom:0.4rem; }
.alert-metric-item.red-tint .alert-metric-icon { color:#D4443F; }
.alert-metric-val { font-weight:700; font-size:0.95rem; margin-bottom:0.15rem; }
.alert-metric-lbl { font-size:0.7rem; color:#71717A; }
.action-list-card { background:#F5F1E9; border-radius:1.25rem; padding:1.25rem; text-align:left; margin-bottom:1.5rem; }
.action-list-header { font-size:0.78rem; font-weight:700; color:#8C7853; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:0.85rem; display:flex; align-items:center; gap:0.5rem; }
.action-item { display:flex; align-items:flex-start; gap:0.65rem; font-size:0.88rem; line-height:1.45; color:#52525B; margin-bottom:0.75rem; }
.action-item:last-child { margin-bottom:0; }
.action-item-bullet { color:#366A4E; font-size:0.95rem; margin-top:2px; }
.success-icon-wrap { width:80px; height:80px; border-radius:50%; background:#DCEFE0; display:flex; align-items:center; justify-content:center; margin:3rem auto 2rem auto; }
.success-icon { font-size:2.5rem; color:#366A4E; }
.success-list { background:#FFFFFF; border-radius:1.5rem; padding:1.25rem 1.5rem; margin-bottom:2rem; text-align:left; box-shadow:0 2px 10px rgba(0,0,0,0.02); }
.success-title-text { font-weight:700; font-size:0.9rem; color:#366A4E; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.85rem; }
.success-item { display:flex; align-items:center; gap:0.75rem; font-size:0.9rem; color:#1C1917; margin-bottom:0.85rem; }
.success-item:last-child { margin-bottom:0; }
.success-item-check { color:#366A4E; font-size:0.95rem; }
.success-item-del { text-decoration:line-through; color:#A1A1AA; }

/* Navigation & Elements matching images */
.back-btn { background:transparent; border:none; color:#366A4E; font-size:1.2rem; cursor:pointer; align-self:flex-start; margin-bottom:0.5rem; }
.step-dots { display:flex; justify-content:center; gap:0.5rem; margin-top:auto; padding-top:1.5rem; }
.dot { width:8px; height:8px; border-radius:50%; background:#E4E4E7; }
.dot.active { background:#4A7C59; }
.step-pill { background:#F2ECE1; color:#8C7853; font-size:0.75rem; font-weight:600; padding:0.35rem 0.85rem; border-radius:1rem; display:inline-block; }
.toggle-tabs { display:flex; background:#EFECE6; padding:0.25rem; border-radius:1rem; margin-bottom:1.5rem; }
.tab-btn { flex:1; background:transparent; border:none; border-radius:0.85rem; padding:0.6rem 0; font-weight:600; color:#71717A; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem; }
.tab-btn.active { background:#FFFFFF; color:#1C1917; box-shadow:0 2px 4px rgba(0,0,0,0.05); }
.input-group { margin-bottom:1.2rem; text-align:left; width:100%; }
.input-group label { font-size:0.72rem; font-weight:700; color:#8C7853; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:0.4rem; display:block; }
.input-group input { width:100%; border:1px solid #E4E4E7; background:#F8F5EE; border-radius:1rem; padding:0.9rem 1.1rem; font-size:0.95rem; color:#1C1917; outline:none; }
.choices-list { display:flex; flex-direction:column; gap:0.85rem; width:100%; }
.choice-card { background:#F8F5EE; border:1px solid transparent; border-radius:1.5rem; padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; cursor:pointer; }
.choice-card.selected { background:#EDF4EE; border:1px solid #4A7C59; }
.choice-icon-wrap { width:44px; height:44px; border-radius:50%; background:#EFECE6; display:flex; align-items:center; justify-content:center; }
.choice-card.selected .choice-icon-wrap { background:#DCEFE0; }
.choice-details { flex:1; text-align:left; }
.choice-title { font-family:'DM Serif Display',Georgia,serif; font-weight:700; font-size:1.15rem; color:#1C1917; }
.choice-sub { font-size:0.78rem; color:#71717A; }
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
                <button class="tab-btn active">
                    <i class="fa-regular fa-envelope"></i> Email
                </button>
                <button class="tab-btn">
                    <i class="fa-solid fa-phone"></i> Phone
                </button>
            </div>

            <div class="input-group">
                <label>Email</label>
                <input type="email" value="you@calm.com">
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
                <div class="choice-card selected">
                    <div class="choice-icon-wrap">
                        <i class="fa-solid fa-circle-dot" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Oura Ring</div>
                        <div class="choice-sub">Deep sleep & readiness insights</div>
                    </div>
                </div>

                <div class="choice-card">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-circle" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Luna Ring</div>
                        <div class="choice-sub">Holistic wellness tracking</div>
                    </div>
                </div>

                <div class="choice-card">
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
                <i class="fa-regular fa-shield-halved" style="font-size:2.2rem; color:#1C1917;"></i>
            </div>

            <h1 class="title-serif" style="text-align:center; font-size:2.1rem; color:#366A4E; margin-bottom:0.5rem;">Deepen Your Shield</h1>
            <p class="subtitle" style="margin-bottom:1.8rem; max-width:290px;">Connect optional sources to measure cognitive load with higher accuracy. Everything is processed locally.</p>

            <div class="choices-list">
                <div class="choice-card selected">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-file-lines" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Meeting Insights</div>
                        <div class="choice-sub">Identify urgent work in transcripts (e.g. Tactiq)</div>
                    </div>
                    <i class="fa-solid fa-circle-check" style="color:#366A4E; font-size:1.2rem;"></i>
                </div>

                <div class="choice-card">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-comment" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Workplace Context</div>
                        <div class="choice-sub">Detect urgent pings via Slack or Teams (MCP)</div>
                    </div>
                    <i class="fa-regular fa-circle" style="color:#D1D1D6; font-size:1.2rem;"></i>
                </div>

                <div class="choice-card">
                    <div class="choice-icon-wrap">
                        <i class="fa-regular fa-clock" style="font-size:1.1rem; color:#366A4E;"></i>
                    </div>
                    <div class="choice-details">
                        <div class="choice-title">Focus Data</div>
                        <div class="choice-sub">Measure cognitive load via Screen Time (MCP)</div>
                    </div>
                    <i class="fa-regular fa-circle" style="color:#D1D1D6; font-size:1.2rem;"></i>
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

        <!-- Screen 5: Morning Shield Propose -->
        <div id="step-5" class="screen" style="display:none;">
            <button class="back-btn" onclick="goToStep(4)">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div class="alert-card" style="width:100%; border:none; box-shadow:none; padding:0; background:transparent;">
                <div class="alert-label" style="margin-bottom:0.5rem;">
                    <i class="fa-solid fa-battery-quarter" style="transform:rotate(270deg); color:#D4443F; font-size:1rem;"></i>
                    <span style="color:#52525B; font-weight:700; font-size:0.75rem; letter-spacing:0.05em;">MORNING SHIELD</span>
                </div>
                
                <h1 class="alert-title" style="font-size:2.2rem; text-align:left; color:#1C1917; margin-bottom:1.5rem;">Your energy is low this morning</h1>
                
                <div class="alert-metrics">
                    <div class="alert-metric-item red-tint" style="border:1px solid rgba(212,68,63,0.1);">
                        <i class="fa-solid fa-battery-quarter alert-metric-icon" style="transform:rotate(270deg); color:#D4443F;"></i>
                        <div class="alert-metric-val" style="font-size:1.1rem; font-weight:800; color:#1C1917;">31<span style="font-size:0.75rem; font-weight:600;">%</span></div>
                        <div class="alert-metric-lbl">Energy</div>
                    </div>
                    <div class="alert-metric-item">
                        <i class="fa-regular fa-heart alert-metric-icon" style="color:#71717A;"></i>
                        <div class="alert-metric-val" style="font-size:1.1rem; font-weight:800; color:#1C1917;">24<span style="font-size:0.75rem; font-weight:600;">ms</span></div>
                        <div class="alert-metric-lbl">HRV</div>
                    </div>
                    <div class="alert-metric-item">
                        <i class="fa-regular fa-moon alert-metric-icon" style="color:#8C7853;"></i>
                        <div class="alert-metric-val" style="font-size:1.1rem; font-weight:800; color:#1C1917;">5.2<span style="font-size:0.75rem; font-weight:600;">h</span></div>
                        <div class="alert-metric-lbl">Sleep</div>
                    </div>
                </div>

                <div class="action-list-card" style="background:#F8F5EE; padding:1.5rem; border-radius:1.5rem; text-align:left; margin-bottom:2rem; border:1px solid rgba(0,0,0,0.02);">
                    <div style="font-size:0.75rem; font-weight:700; color:#8C7853; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fa-regular fa-calendar-plus" style="font-size:0.95rem;"></i> PROPOSED ACTION
                    </div>
                    <div style="font-size:0.98rem; line-height:1.5; color:#1C1917;">
                        Moving <strong>Spec Drafting</strong> to tomorrow at <strong>9:00 AM</strong> when your readiness is predicted to be higher.
                    </div>
                </div>

                <button class="btn-green-link" onclick="goToStep(6)">
                    <i class="fa-regular fa-shield-halved"></i> Yes, Shield Me
                </button>

                <button onclick="goToStep(6)" style="width: 100%; border-radius: 1.25rem; padding: 1.1rem; font-weight: 600; font-size: 0.95rem; border: none; background: #F5F1E9; color: #8C7853; margin-top: 0.85rem; cursor: pointer; transition:all 0.2s ease;">
                    Push Through
                </button>
            </div>
        </div>

        <!-- Screen 6: Success -->
        <div id="step-6" class="screen" style="display:none;">
            <div class="success-icon-wrap">
                <i class="fa-solid fa-calendar-check success-icon"></i>
            </div>
            
            <h1 class="title-serif" style="text-align:center;">Calendar Protected</h1>
            <p class="subtitle" style="max-width:280px; margin-bottom:1.5rem;">Somatic boundaries applied. We successfully adjusted your agenda based on your morning readiness baseline.</p>
            
            <div class="success-list">
                <div class="success-title-text">Today's Schedule Mutations</div>
                <div class="success-item">
                    <i class="fa-solid fa-check success-item-check"></i>
                    <span class="success-item-del">Spec Drafting (Moved to tomorrow)</span>
                </div>
            </div>
            
            <button class="btn-green-link" onclick="goToStep(1)" style="margin-top:auto;">
                Reset Prototype <i class="fa-solid fa-rotate-right"></i>
            </button>
        </div>

    </div>
</div>

<script>
function goToStep(num) {
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'none';
    document.getElementById('step-4').style.display = 'none';
    document.getElementById('step-5').style.display = 'none';
    document.getElementById('step-6').style.display = 'none';
    
    document.getElementById('step-' + num).style.display = 'flex';
}
</script>
</body>
</html>
"""

# Render as a self-contained HTML iframe
components.html(full_page, height=880, scrolling=False)
