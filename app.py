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
.phone-container { width:390px; min-height:780px; background:#FDFBF7; border-radius:3rem; border: 1px solid rgba(0,0,0,0.08); box-shadow:0 25px 50px -12px rgba(0,0,0,0.12); overflow-y:auto; position:relative; display:flex; flex-direction:column; }
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
</style>
</head>
<body>
<div class="phone-wrapper">
    <div class="phone-container">
        
        <!-- Step 1: Landing -->
        <div id="step-1" class="screen">
            <div class="shield-logo-wrap">
                <i class="fa-solid fa-shield-halved shield-logo-icon"></i>
            </div>
            <h1 class="title-serif" style="text-align:center;">Ebb</h1>
            <p class="subtitle" style="font-weight:600;color:#366A4E;margin-bottom:0.5rem;">A Daily Decision Engine for Knowledge Workers</p>
            <p class="subtitle" style="font-size:0.88rem;color:#71717A;max-width:250px;">Sync your schedule to automatically calibrate your daily focus boundaries.</p>
            <div class="welcome-card" style="margin-top:0.5rem;">
                <i class="fa-regular fa-calendar welcome-card-icon"></i>
                <div class="welcome-card-title">Sync Your Calendar</div>
                <button class="btn-green-link" onclick="goToStep(2)">
                    <i class="fa-regular fa-calendar"></i>
                    Connect Google Calendar
                </button>
                <div class="privacy-note">
                    <i class="fa-solid fa-lock privacy-icon"></i>
                    <div>
                        <div class="privacy-title">Privacy First</div>
                        <div class="privacy-body">Ebb only analyzes timing and attendee counts to gauge your energy load. We <strong>never</strong> read or store meeting titles, descriptions, or sensitive data.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step 2: Propose Shield -->
        <div id="step-2" class="screen" style="display: none;">
            <div class="alert-card">
                <div class="alert-label">
                    <i class="fa-solid fa-battery-quarter" style="transform:rotate(270deg);"></i> MORNING SHIELD
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
                <div class="action-list-card">
                    <div class="action-list-header">
                        <i class="fa-regular fa-lightbulb"></i> One recommendation
                    </div>
                    <div style="font-size:0.92rem;font-weight:700;color:#1C1917;margin-bottom:0.65rem;">You have 6 meetings today.</div>
                    <div style="font-size:0.85rem;color:#52525B;margin-bottom:0.65rem;font-weight:600;">Based on your energy:</div>
                    <div class="action-item">
                        <i class="fa-regular fa-calendar-minus action-item-bullet"></i>
                        <span>Move roadmap planning to tomorrow.</span>
                    </div>
                    <div class="action-item">
                        <i class="fa-regular fa-circle-check action-item-bullet"></i>
                        <span>Protect 2-4 PM for focus work.</span>
                    </div>
                    <div class="action-item">
                        <i class="fa-regular fa-clock action-item-bullet"></i>
                        <span>Add a 30-minute recovery block after lunch.</span>
                    </div>
                </div>
                <button class="btn-green-link" onclick="goToStep(3)">
                    <i class="fa-solid fa-shield-halved"></i> Shield Me
                </button>
            </div>
        </div>

        <!-- Step 3: Success -->
        <div id="step-3" class="screen" style="display: none;">
            <div class="success-icon-wrap">
                <i class="fa-solid fa-calendar-check success-icon"></i>
            </div>
            <h1 class="title-serif" style="text-align:center;">Calendar Protected</h1>
            <p class="subtitle" style="max-width:280px;margin-bottom:1.5rem;">Somatic boundaries applied. We successfully adjusted your agenda based on your morning readiness baseline.</p>
            <div class="success-list">
                <div class="success-title-text">Today&#39;s Schedule Mutations</div>
                <div class="success-item">
                    <i class="fa-solid fa-check success-item-check"></i>
                    <span class="success-item-del">Roadmap Planning (Moved to tomorrow)</span>
                </div>
                <div class="success-item">
                    <i class="fa-solid fa-check success-item-check"></i>
                    <span>Focus Block Protected (2:00 – 4:00 PM)</span>
                </div>
                <div class="success-item">
                    <i class="fa-solid fa-check success-item-check"></i>
                    <span>Recovery Decompression Block (12:30 PM)</span>
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
    
    document.getElementById('step-' + num).style.display = 'flex';
}
</script>
</body>
</html>
"""

# Render as a self-contained HTML iframe
components.html(full_page, height=860, scrolling=False)
