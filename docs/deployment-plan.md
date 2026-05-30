# Ebb Deployment Plan: Streamlit Migration & Hosting

This document details the architectural migration and step-by-step instructions to deploy **Ebb: The Energy-Aware Calendar Shield** on the Streamlit Community Cloud.

---

## 1. Architectural Alignment: Node/React to Python Streamlit

Streamlit is a Python-native web application framework. Because Ebb's prototype is currently built on a native Node.js backend (ES Modules + SQLite) and a React + Vite frontend, deploying directly on Streamlit requires porting our logic to a Python-native equivalent.

Below is the mapping of components:

| Current Component (Node/React) | Streamlit (Python Equivalent) | Purpose |
| :--- | :--- | :--- |
| **Vite Frontend (`client/`)** | `streamlit` layout & custom HTML components | Render the dashboard grid, circular battery, and calendar timeline. |
| **Rules Engine (`scheduler.mjs`)** | `scheduler.py` (Python OOP) | Multiplayer meeting classification, buffer injections, somatic walk swaps. |
| **API Endpoints (`server.mjs`)** | Streamlit `st.session_state` + callback handlers | Trigger synchronization, voice ingestion transcript parsing, and calendar mutations. |
| **Encryption (`crypto` built-in)** | `cryptography.hazmat` (AES-256-GCM) | Encrypting the 8 somatic ledger streams and surveys at rest. |
| **Database (`better-sqlite3`)** | `sqlite3` (Python Standard Library) | Local/persistent SQLite cache database storage. |

---

## 2. Directory Structure for Streamlit

Create the following file layout in a clean deployment branch or repository:

```
ebb-streamlit/
├── app.py                  # Main entry point (Dashboard UI & State Manager)
├── scheduler.py            # Calendar shifting rules and Somatic Governor logic
├── database.py             # SQLite helper and AES-256-GCM encryption/decryption layers
├── requirements.txt        # Python package dependencies
├── .streamlit/
│   └── config.toml         # Theme settings (dark mode by default)
└── README.md
```

---

## 3. Step-by-Step Implementation Specification

### A. Environment Dependencies (`requirements.txt`)
Specify the required Python libraries for UI rendering, database manipulation, and cryptography:
```text
streamlit>=1.30.0
cryptography>=41.0.0
pandas>=2.0.0
plotly>=5.15.0
```

### B. Core Encryption & DB Handler (`database.py`)
Use the cryptography package to replicate our local AES-256-GCM encryption strategy:
```python
import sqlite3
import json
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class SomaticDB:
    def __init__(self, db_path="ebb.db", key_hex=None):
        self.db_path = db_path
        # Derive key or use a provided 256-bit key from environment
        self.key = bytes.fromhex(key_hex or os.environ.get("EBB_ENCRYPTION_KEY", "00" * 32))
        self.aesgcm = AESGCM(self.key)
        self.init_db()

    def init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS biometrics_log (
                    date TEXT PRIMARY KEY,
                    sleep_duration_seconds INTEGER,
                    hrv_ms INTEGER,
                    battery_percentage INTEGER
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS somatic_dimensions_log (
                    date TEXT,
                    dimension_name TEXT,
                    encrypted_payload BLOB,
                    nonce BLOB,
                    tag BLOB,
                    confidence_score REAL,
                    PRIMARY KEY (date, dimension_name)
                )
            """)
            conn.commit()

    def encrypt_and_save(self, date, dimension, payload_dict, confidence):
        nonce = os.urandom(12)
        data = json.dumps(payload_dict).encode('utf-8')
        # Encrypt
        encrypted_data = self.aesgcm.encrypt(nonce, data, None)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO somatic_dimensions_log 
                (date, dimension_name, encrypted_payload, nonce, confidence_score) 
                VALUES (?, ?, ?, ?, ?)
            """, (date, dimension, encrypted_data, nonce, confidence))
            conn.commit()
```

### C. The Chrono-Scheduler (`scheduler.py`)
Port the multiplayer meeting classifier and calendar auto-shifter:
```python
def classify_meeting(attendees, is_external):
    if len(attendees) >= 3 or is_external:
        return "LOCKED"
    return "RESCHEDULABLE"

def apply_somatic_shield(events, hrv):
    is_low_energy = hrv < 30
    mutated_events = []
    
    for event in events:
        classification = classify_meeting(event.get("attendees", []), event.get("is_external", False))
        event["classification"] = classification
        
        if is_low_energy:
            if classification == "RESCHEDULABLE":
                if event["type"] == "focus":
                    # Shift earlier to biological peak
                    event["time"] = "9:00 - 10:00 AM"
                    event["status"] = "Protected"
                elif event["type"] == "workout":
                    # Replace intense workouts with a walk
                    event["title"] = "Somatic Recovery Walk"
                    event["status"] = "Recovery Swapped"
            elif classification == "LOCKED":
                # Inject a recovery buffer after heavy meeting
                mutated_events.append(event)
                mutated_events.append({
                    "title": "Zero-Stimulus Recovery Buffer",
                    "time": "11:30 AM - 12:00 PM",
                    "type": "recovery",
                    "status": "Injected"
                })
                continue
        mutated_events.append(event)
    return mutated_events
```

### D. Main UI Dashboard (`app.py`)
Render the layout using Streamlit widgets, columns, and SVG embeddings:
```python
import streamlit as st
import datetime
from scheduler import apply_somatic_shield

st.set_page_config(page_title="Ebb: Calendar Shield", layout="wide")

# Dark Theme styling override
st.markdown("""
    <style>
    .main { background-color: #0b0f19; color: #ffffff; }
    .stButton>button { background: linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%); color: #0b0f19; font-weight: bold; }
    </style>
""", unsafe_allow_html=True)

# 1. Sidebar Simulator Controls
st.sidebar.title("ebb Simulation Hub")
scenario = st.sidebar.radio("Somatic State", ["Stable Recovery (HRV 78ms)", "Cortisol Red-line (HRV 24ms)"])
override = st.sidebar.checkbox("Force Push Through (Override)")

# Convert to state variables
hrv = 78 if "Stable" in scenario else 24
battery = 85 if hrv == 78 else (30 if override else 45)
cas = 95 if hrv == 78 else (42 if override else 88)

# 2. Main Dashboard Layout
col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Biometric Battery")
    # Draw circular SVG Battery Gauge
    st.markdown(f"""
        <div style='position: relative; width: 180px; height: 180px; margin: auto;'>
            <svg width='180' height='180' viewBox='0 0 140 140'>
                <circle cx='70' cy='70' r='60' fill='none' stroke='#1f2937' stroke-width='10'/>
                <circle cx='70' cy='70' r='60' fill='none' stroke='{"#00f2fe" if battery > 50 else "#ef4444"}' 
                    stroke-width='10' stroke-dasharray='377' stroke-dashoffset='{377 - (battery/100)*377}' stroke-linecap='round'/>
            </svg>
            <div style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;'>
                <span style='font-size: 2.2rem; font-weight: bold; color: white;'>{battery}%</span><br/>
                <span style='font-size: 0.7rem; color: #9ca3af;'>BATTERY</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

with col2:
    st.subheader("Resting Biometrics")
    st.metric(label="Resting HRV", value=f"{hrv} ms", delta="Stable" if hrv > 50 else "-54ms Warning")
    st.metric(label="Cognitive Alignment Index (CAS)", value=f"{cas}%")

# 3. Calendar Grid Timeline
st.subheader("GCAL Local SQL Cache (Timeline)")
# Feed static mock calendar
mock_events = [
    {"title": "Security Spec Drafting", "time": "2:00 - 3:00 PM", "type": "focus", "attendees": []},
    {"title": "Architecture Review", "time": "10:00 - 11:30 AM", "type": "meeting", "attendees": ["manager@co.com", "eng@co.com", "vp@co.com"]},
    {"title": "Peloton Cardio", "time": "8:00 - 8:30 AM", "type": "workout", "attendees": []}
]

shielded_events = apply_somatic_shield(mock_events, hrv)
for ev in shielded_events:
    status_color = "#10b981" if ev.get("status") in ["Protected", "Injected"] else "#3b82f6"
    st.markdown(f"""
        <div style='padding: 10px; border-left: 4px solid {status_color}; background-color: #1e293b; margin-bottom: 8px; border-radius: 4px;'>
            <strong>{ev['title']}</strong> | {ev['time']} | Status: {ev.get('status', 'Unchanged')}
        </div>
    """, unsafe_allow_html=True)
```

---

## 4. Deploying to Streamlit Community Cloud

Once code implementation is completed in python, follow these steps to host:

1.  **Commit Code to GitHub**:
    Ensure `requirements.txt`, `app.py`, `scheduler.py`, and `database.py` are committed to your GitHub repository root.
2.  **Access Streamlit Cloud**:
    *   Navigate to [share.streamlit.io](https://share.streamlit.io/).
    *   Sign in with your GitHub Credentials.
3.  **Create New App**:
    *   Click the **"New app"** button.
    *   Select your repository, the deployment branch (e.g. `main`), and specify the main path file as `app.py`.
4.  **Configure Secrets (Crucial)**:
    Ebb requires a 256-bit encryption key to initialize the SQLite database encryption.
    *   Open the app settings on Streamlit Cloud.
    *   Add your key to the secrets panel:
        ```toml
        EBB_ENCRYPTION_KEY = "your-64-char-hexadecimal-aes-key-here"
        ```
5.  **Launch**:
    Click **"Deploy!"**. Streamlit will provision the Python environment, download packages from `requirements.txt`, and boot the dashboard.
