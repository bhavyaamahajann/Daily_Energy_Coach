# Ebb 🛡️ — Daily Energy Coach

Ebb is a privacy-first, somatic-aware daily energy coaching application designed specifically for knowledge workers. It bridges the gap between biological state (wearable telemetry) and workplace productivity (calendar events/task execution), helping users protect their focus hours, prevent burnout, and manage cognitive load.

---

## 🌟 Key Features

1. **Integrated Welcome & Onboarding**: A seamless, modern onboarding experience detailing Ebb's privacy-first calendar and health data posture.
2. **Flexible Auth Setup**: Create accounts with Email or Phone with simple click-throughs.
3. **Biometric Ingestion (Connect Energy Source)**: Syncs with wearable integrations (Oura Ring, Luna Ring, Apple Health) or allows a 5-second morning slider input fallback.
4. **Deepen Your Shield**: Granular, local context-gathering integrations (Meeting transcripts like Tactiq, workplace pings via Slack/Teams, screen-time focus metrics).
5. **iOS Lock-screen Alert Simulation**: Translates raw somatic state (e.g. 24ms HRV) and locked calendar events into a low-latency, lock-screen notification asking the user to decide: *Yes, Shield Me* (protect focus) or *Push Through*.
6. **Focus Protected (State Protected)**: Generates automated Slack/workplace update drafts, highlights shifted tasks, and schedules a *Zero-Stimulus Buffer* (silencing non-essential notifications). Includes direct mock-draft text editing.
7. **May Monthly Review**: A premium data dashboard showcasing:
   * **Cognitive Alignment Score (CAS)** graph.
   * **Energy-Matched Completion Rate** (measuring how effectively high-cognitive work was aligned with somatic energy peaks).
   * Total shields approved vs. overrides requested tracker.
   * Personal action-oriented key productivity insights.

---

## 🛠️ Technology Stack

* **Streamlit Core (`app.py`)**: A fully self-contained HTML/CSS/JS onboarding wizard and interactive demo experience.
* **React Frontend (`client/`)**: A modular production application built with React, styled-components/vanilla CSS, and Vite.
* **Node.js Backend (`server/`)**: Built on Fastify for routing calendar mutations and token exchanges, paired with an SQLite cache (`ebb.db`) for encrypted biometrics.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Python (3.9+)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bhavyaamahajann/Daily_Energy_Coach.git
   cd Daily_Energy_Coach
   ```

2. **Configure Environment Secrets**:
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. **Run Node.js Server**:
   ```bash
   npm install
   npm run dev
   ```

4. **Run Python Streamlit Interface**:
   ```bash
   pip install -r requirements.txt
   streamlit run app.py
   ```

5. **Build/Run React Client**:
   ```bash
   cd client
   npm install
   npm run build  # Compiles to client/dist
   ```

---

## 🔒 Privacy & Safety First

* **On-Device Ingestion**: Biometric raw values never leave the user's local hardware context. Only the computed composite Energy Score (0–100) is used to generate schedule recommendations.
* **Consent Gated**: Workspace drafts (like Slack auto-drafts) are placed in a queue and are never auto-sent without explicit user verification.
* **No Database Leak**: Environment tokens and API keys are stored exclusively in `.env` and kept untracked by version control.
