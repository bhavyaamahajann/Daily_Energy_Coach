# Ebb: The Energy-Aware Calendar Shield
**Product Strategy & Written Walkthrough (Anya's Case)**

---

## The Naming Philosophy: Why "Ebb"?
The name **Ebb** is a deliberate rejection of standard productivity tools that focus exclusively on constant "flow" and peak output:
* **Honoring the Receding Tide (Ebb vs. Flow)**: You cannot have flow without ebb. The name represents the period where biological capacity recedes—the necessary downtime for system recovery.
* **Defensive Calendar Scheduling**: Ebb shields Anya's schedule when her energy levels crash, automatically carving out buffers and shifting tasks to prevent exhaustion from manifesting as physical decay.
* **A Calm Brand Voice**: Ebb acts as a permissions agent, signaling to knowledge workers that it is biologically optimal to step back, recover, and let the tide go out.

---

## 1. The User and the Moment

### Target Persona
**Anya (29) is a Staff AI Engineer** at a hyper-growth, 150-person scale-up in San Francisco. She leads high-stakes projects, manages a team of machine learning engineers, and faces heavy meeting loads. 

Anya is the "extreme user" of the knowledge economy—combining back-to-back meeting loads, deep-focus coding demands, and high susceptibility to cognitive burnout and somatic stress (severe fatigue, cortisol spikes, hormonal breakouts, and stress-induced hair thinning/telogen effluvium). By solving Anya's problem, Ebb creates a biological schedule-governance model that generalizes to millions of knowledge workers dealing with standard afternoon crashes, calendar bloat, and performative productivity.

### Tuesday Morning Timeline (The Moment Ebb Enters)
*   **7:30 AM**: Anya wakes up feeling physically exhausted and anxious (HRV 24ms). She finds a clump of hair on her pillow, checks a hormonal cystic breakout on her jawline, and begins to spiral.
*   **8:15 AM**: She forces herself onto the Peloton, but feels lightheaded and stops. She grabs a double espresso to force alertness, spiking her cortisol.
*   **8:30 AM (The "Vent-to-Adjust" check-in)**: Before she starts work, Anya records a 20-second voice note: *"Waking breakouts, heavy hair shedding, nauseous during Peloton."* 
*   **The Transformation (The Hero Moment)**: The local LLM processes the check-in on-device. Ebb intercepts her calendar and dispatches a single lock-screen notification:
    > **Ebb Alert**: *Somatic recovery is low (HRV 24ms). Shield your energy today?*
    > `[ Yes, Shield Me ]`  `[ No, Push Through ]`
*   **Tapping "Yes, Shield Me"** executes Ebb's calendar boundaries:
    *   *Locked Events*: It keeps her 10:00 AM Architecture Review (20 people, locked) and Scrum in place since multiplayer meetings cannot be moved unilaterally.
    *   *Recovery Buffers*: It auto-blocks a 30-minute "Zero-Stimulus Recovery Buffer" right after her heavy 10 AM review, muting Slack and calls.
    *   *Shifts*: It shifts her alone *Security Spec Drafting* block earlier to capture her peak window and slides her low-priority backlog triage to the afternoon.
    *   *Somatic Governor*: It deletes her intense Peloton slot, replacing it with a slow somatic walk.
    *   *Slack Update*: It auto-drafts a Slack message to her manager: *"Adjusting my schedule to focus offline; spec draft coming tomorrow."*

---

## 2. The Product Itself

### Core Experience: Next-Action Direction
Ebb is **not a health dashboard** or a wearable recovery tracker. The core job-to-be-done is **energy-aware next-action decision-making** (*"What should I do right now?"*). When Anya opens Ebb, she doesn't see biometric charts; she sees her Cognitive Battery (0-100%) and a single, dominant recommendation card showing her next optimal task context based on her calendar and biology:
*   *Peak State*: `[Peak Focus: 45 min] Write Security Spec`
*   *Trough State*: `[Somatic Reset: 20 min] Step away from screen. Mute notifications.`

### Data Ingestion & Boundary Rules
*   **90% Passive Sensing**: Syncs sleep stages and HRV from wearable APIs (Oura/Apple Health) + Google Calendar meeting metadata (attendee counts, duration) + keyboard/mouse telemetry.
*   **10% Active Input**: The 20-second "Vent-to-Adjust" morning voice check-in, falling back to a 3-second lock-screen slider when wearable data is missing.
*   **The 8-Stream Somatic Database**:
    *   *Nutrition*: Logs macros and micronutrients (Zinc, Iron, Selenium) that support hair follicle strength and thyroid stability under stress.
    *   *Physique & Aesthetic*: Tracks scale weight, breakouts, and hair shedding. Over time, the engine maps the **90-day lag between work stress and telogen effluvium** to prove to Anya that rest is necessary for her aesthetic goals.
    *   *Self-Care*: Deletes Peloton workouts on low-readiness days, replacing them with somatic recovery sequences, and schedules routines.
    *   *Work*: Reschedules flexible alone tasks and injects post-meeting rest buffers.
    *   *Mental Health*, *Activity*, *Social*, and *Creative* streams complete the ledger.

---

## 3. The Hero Metric: Cognitive Alignment Score (CAS)

Ebb tracks scheduling efficiency using the **Cognitive Alignment Score (CAS)**, shown as a daily percentage:
$$\text{CAS} = \frac{\text{Time in Focus (Peak State) + Time in Recovery/Admin (Slump State)}}{\text{Total Working Hours}} \times 100$$

### Second-Order Risks (PM Maturity Check)
1.  **Comfort Bias (Avoiding hard work)**: Anya might report low energy or choose "Shield Me" repeatedly to avoid difficult tasks and keep her CAS high.
    *   *Mitigation*: Ebb implements a **Velocity Guardrail**. If CAS is high but Jira task completions drop below baseline for 2 weeks, Ebb triggers a **Velocity Override**, disabling low-energy reschedules for 7 days.
2.  **Meeting Anxiety & Social Withdrawal**: Since multiplayer meetings during focus windows reduce CAS, she might decline critical syncs.
    *   *Mitigation*: Locked multiplayer meetings are excluded from CAS calculations to prevent score anxiety.
3.  **Learned Helplessness & Autonomy Loss**: Anya might stop listening to her own body, relying blindly on the score.
    *   *Mitigation*: Subjective voice check-ins override wearable data, and baseline weights calibrate to user override compliance.

---

## 4. The Retention Problem: Why Ebb Won't Die

Wellness apps suffer from $>80\%$ churn inside 90 days due to logging fatigue. Ebb breaks this pattern through **structural calendar lock-in / workflow dependency**:
*   Ebb is a **workflow utility, not a tracking habit**. Anya doesn't need to open Ebb to get value. The value is delivered at the calendar level.
*   **The Day 30 Retention Hook**: If Anya uninstalls Ebb, she has to manually block rest slots, handle manager updates, and protect her time when exhausted. The administrative friction of *managing her calendar without Ebb* is what keeps her retained.

---

## 5. What We Would Build First (v1 MVP)

### Scope: 1 Engineer, 12 Weeks
To prove the core value proposition (biologically aligned alone-block rescheduling), we build a simple GCal blocker:
*   **Keep (The Core 20%)**: Oura sleep sync integration, Google Calendar API connector, the 8:30 AM "Shield Me" consent prompt, and a simple menu-bar widget.
*   **Cut (90% of Ebb)**: STT voice parser engines (replaces with morning slider), local telemetry daemons, and multi-lifestyle ledger streams (nutrition, aesthetics).
*   **Week 13 Success Metric**: **Shield Adherence Rate** (percentage of Ebb-created recovery buffers and focus shifts kept/completed by the user over a 4-week trial). Target: **$>70\%$ adherence**.

---

## 6. Live UI Verification & Test Cases

The live UI in [index.html](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/index.html) models three validation states:
1.  **Stable Recovery (Standard Day)**: Renders Anya at 85% battery with a standard calendar layout (writing specs and Peloton workout active).
2.  **Cortisol Red-line (Stress Day)**: Renders Anya at 45% battery. Alone focus sessions shift earlier, scrums/reviews lock, Peloton is replaced by a Somatic Walk, and a post-review buffer is injected.
3.  **Override Checkbox ("Force Push Through")**: Simulates manual override. Calendar reverts, CAS drops to a red **42%**, and the PM Insights panel warns of telogen effluvium (hair loss) and skin breakouts.

---

## 7. Backend Implementation & Verification (Phase 3)

The backend rules engine, live SQLite cache database mutations, and webhook dispatchers have been fully implemented and integrated into [scheduler.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/scheduler.mjs) and [server.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/server.mjs).

### Features Delivered
- **Multiplayer Classifier**: Scans the attendee list ($Attendees \ge 3 \rightarrow LOCKED$, otherwise $RESCHEDULABLE$) to protect collective time boundaries.
- **Somatic Calendar Rescheduler**: Auto-shifts flexible alone tasks (e.g. *Security Spec Drafting*) to biological peak hours, replaces intense workouts with somatic recovery walks, and schedules 30-minute Zero-Stimulus Recovery Buffers post locked meetings on low-readiness days.
- **Mid-Day Reset Rebuild API**: Exposes `/api/v1/calendar/rebuild` to shift remaining afternoon reschedulable tasks to tomorrow's afternoon peak and inject an immediate emergency 30-minute somatic decompression buffer on sudden biometrics/HRV crashes.
- **Slack Presence & Snooze Webhooks**: Dynamically update Slack profile status to `Offline (Ebb Buffer)` and activate Do Not Disturb (DND) when boundaries are triggered or rebuilds executed.

### Automated Verification
An automated runner [verify_phase3.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/verify_phase3.mjs) verifies Ebb's calendar shields:

```bash
node verify_phase3.mjs
```

**Verification Log Summary:**
- **Verification 1: Cache Seeding**: Verified Anya's Tuesday morning schedule is auto-seeded and classified ($Scrum, ArchReview \rightarrow LOCKED$, $Triage, Spec, Peloton \rightarrow RESCHEDULABLE$).
- **Verification 2: Rescheduler Proposals**: Checked that low-readiness inputs (HRV 24ms, sleep 5.8 hours) generate the correct focus shifts, buffer injections, and exercise replacements.
- **Verification 3: Database Mutation Commit**: Confirmed that approving the proposal successfully mutates GCal cached SQLite records and records approval details in the somatic shifts log table.
- **Verification 4: Mid-Day Rebuild API**: Verified that a mid-day rebuild at 1:00 PM shifts afternoon flexible blocks to tomorrow's afternoon slot and injects an immediate 30-minute emergency decompression buffer.

---

## 8. Tauri Tray Widget & Telemetry Implementation & Verification (Phase 4)

The Tauri tray client, local telemetry daemon, and weekly calibration prompts have been successfully implemented and integrated.

### Features Delivered
- **In-Memory Telemetry Buffering**: High-frequency mouse/keyboard active events are logged via `POST /api/v1/telemetry/log` to an in-memory JS array cache, avoiding disk-write bottlenecks during heavy user focus blocks.
- **Batch Database Flushing**: Cached logs are committed to SQLite disk database `telemetry_log` via `POST /api/v1/telemetry/flush` in a single SQL transaction.
- **Subjective Calibration System**:
  - `GET /api/v1/calibration/prompt`: Delivers weekly subjective prompts (focus rating slider, sleep needs number, hormonal symptoms boolean).
  - `POST /api/v1/calibration/submit`: Encrypts responses using AES-256-GCM and persists them securely in `calibration_logs`.
- **Tauri Desktop Tray Client**: 
  - Created [Cargo.toml](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/src-tauri/Cargo.toml) package configuration.
  - Configured [tauri.conf.json](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/src-tauri/tauri.conf.json) settings (frameless transparent overlay, templated tray icon, and auto-focus toggle window).
  - Programmed system tray construction in Rust ([main.rs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/src-tauri/src/main.rs)), displaying battery charge (`Battery: 45% (Cortisol Red-line)`) and current recommendation context (`Next Action: Somatic Recovery Walk`).
  - Formatted the HTML5 tray widget UI overlay ([tray.html](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/ui/tray.html)), drawing the color-coded battery charge arc and recommendation card.

### Automated Verification
An automated test suite [verify_phase4.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/verify_phase4.mjs) confirms all components of Phase 4:

```bash
node verify_phase4.mjs
```

**Verification Log Summary:**
- **Verification 1: In-Memory Isolation**: Telemetry data posts correctly buffer in-memory and do not touch disk prior to flushing.
- **Verification 2: Batch Commit**: Telemetry flush endpoint successfully writes the buffered batch to the disk database.
- **Verification 3: Prompt Retrieval**: Calibration prompts correctly return formatted sliders, number inputs, and booleans.
- **Verification 4: Cryptographic Persistence**: Answers are verified as encrypted at rest in SQLite, and decrypt back to their exact original JSON structure.
- **Verification 5: Backward Compatibility**: Oura syncing, STT parser engines, calendar rescheduler proposed boundaries, and Slack snooze hooks function without regressions.

---

## 9. Hardening, Performance Audits & Beta Pilot Verification (Phase 5)

Ebb's local cryptography layers, Google Calendar API OAuth review requirements, and operational performance audit queries have been fully prepared and tested.

### Features Delivered
- **Performance Evaluation Queries (`audit.mjs`)**:
  - `calculateShieldAdherence`: Queries the SQLite database to compute the percentage of proposed/approved somatic calendar adjustments actually kept on the user's cache.
  - `calculateCAS`: Queries the cache dynamically to compute the user's daily Cognitive Alignment Score by cross-referencing focus and recovery/admin allocations with their daily biological windows.
- **OAuth Audit Report (`oauth_audit_report.md`)**:
  - Outlines requested Google Calendar permission scopes and workflows.
  - Documents Ebb's zero-knowledge local-first storage design (all syncing, text-parsing, and rescheduling mutations occur locally in an SQLite store encrypted with AES-256-GCM).
- **E2E Hardening & Validation Runner (`verify_phase5.mjs`)**:
  - Implements the complete integrated test flow: synchronization, voice checks, reschedules, Slack DND pauses, telemetry flushes, calibrations, resets, and performance metrics queries.

### E2E Pilot Verification
An automated test runner [verify_phase5.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/verify_phase5.mjs) validates Ebb:

```bash
node verify_phase5.mjs
```

**E2E Output Summary:**
- **Verification 1: Encryption Verification**: All somatic ledgers and voice check-ins write to the local SQLite tables in an encrypted GCM standard, with successful user-profile key decryption.
- **Verification 2: CAS and Shield Adherence Query Validation**: Runs the SQL metric audit on the live DB:
  - **Shield Adherence Rate**: **100%** (all 3 proposed shifts were approved and preserved).
  - **Cognitive Alignment Score (CAS)**: **100%** (all working minutes on the low-readiness day align perfectly with biological focus and recovery rules).

---

## 10. Prototype & Success Metric Verification (Part 2 & Part 3)

The interactive prototype validations (manual checks) and Week 13 retention metrics criteria have been programmatically verified.

### Features Delivered
- **Prototype State Transition Auditing**: Programmatically exercises Anya's biological profiles and override paths:
  - **TC-1: Stable Recovery**: Verifies 85% battery, 95% CAS, standard spec writing, and active status display.
  - **TC-2: Cortisol Red-line**: Verifies 45% morning battery, 88% CAS, standup locking, and morning early focus compression.
  - **TC-3: Time Transitions**: Verifies 25% afternoon battery and somatic walk recommendation.
  - **TC-4: Override Friction**: Verifies CAS drops to 42% under user override, triggering forehead breakout and screen sleep disruption alerts.
- **Week 13 Evaluation Boundaries**: Automates decision-tree sorting:
  - **SUCCESS Outcome (> 70% Adherence)**: Flags transition into Phase 6 scheduling features.
  - **FAILURE Outcome (< 50% Adherence)**: Halts project development to pivot focus or terminate.

### Automated Verification
An automated test runner [verify_part2_part3.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/verify_part2_part3.mjs) validates Part 2 & Part 3 constraints:

```bash
node verify_part2_part3.mjs
```

**Verification Log Summary:**
- **Verification 1: Stable Recovery**: Correctly checks high-energy scenario properties.
- **Verification 2: Cortisol Red-Line**: Validates early morning focus shifts and locked scrums.
- **Verification 3: Time Transitions**: Confirms afternoon somatic walk triggers.
- **Verification 4: Override Friction**: Successfully verifies 42% CAS penalty and skin/sleep debt alerts.
- **Verification 5: Retention Decisions**: Asserts that >70% adherence triggers Phase 6 roadmap, and <50% triggers a project pivot or termination.

---

## 11. React Migration Walkthrough (Vite + React Integration)

The vanilla prototype frontend has been migrated to a modern single-page application structure under the `client/` subdirectory.

### Features Delivered
- **Project Scaffolding**: Initialized a JavaScript React + Vite setup inside a separate `client` folder, separating front-end packages from native backend engines.
- **Reverse Proxy Routing**: Configured proxy settings in [vite.config.js](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/client/vite.config.js) to redirect front-end `/api` requests to `http://localhost:3000` (Node API backend).
- **Componentized State Architecture ([App.jsx](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/client/src/App.jsx))**:
  - Rewrote the state triggers (`scenario`, `timeOfDay`, `overrideActive`, `activeTab`) using React's state management hook (`useState`).
  - Extracted biometrics, calendar cache lists, and proposed actions into local components.
  - Linked front-end events to **live backend endpoints** (performing real somatic ingests, fetching proposals, committing database cache mutations, triggering DND webhooks, and retrieving CAS/Shield Adherence audit metrics dynamically from `/api/v1/audit/metrics`).
  - Rendered a custom svg wave curve and a dynamic grid calendar list based on the active scenario.
- **Integrated Fullstack Launcher ([start.mjs](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/start.mjs))**:
  - Implemented a single entry launcher that starts the Node API server (port 3000) and the Vite React server (port 5173) concurrently.

### Build and Launch Instructions
To run the full stack:
```bash
# Launch both backend and frontend servers
node start.mjs
```
The React development server is available at `http://localhost:5173/`.

---

## 12. Streamlit Deployment & High-Fidelity UI Alignment

To deploy Ebb on the Streamlit Community Cloud and match the high-fidelity Figma dashboard design prototype, we completed a comprehensive visual and layout polish of the Streamlit app [app.py](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/app.py):

* **Biological Profile State Selector**: Expanded the Simulation Hub biological scenarios options to include the intermediate `"Compressed Peak (HRV 52ms)"` state, matching the three states in Figma.
* **Dynamic Background Mesh Gradients**: Programmed a dynamic `<style>` block injection that targets Streamlit's container `div[data-testid="stAppViewContainer"]` with state-specific CSS `radial-gradient` rules (Cyan-Purple, Amber-Orange, and Red-Rose mesh glows).
* **Glassmorphic Container Stabilization**: Resolved Streamlit's Markdown element splitting behavior by consolidating Resting Biometrics, circular Energy Battery, and Circadian Waves cards into unified, single-block `st.markdown` HTML elements.
* **Dynamic Circular SVG Energy Battery**: Polished the battery ring selector to render with linear gradient strokes and glows (Cyan-to-Purple for Stable, Orange-to-Red for Compressed, and Red-to-Dark-Rose for Red-line).
* **Circadian Wave Area Charts**: Customized the SVG wave path and linear gradient fill opacity under the Bezier curves to dynamically represent the circadian cycle matching the biometrics state.
* **Layout Repositioning**: Moved the Vent-to-Adjust Voice Ingress pipeline card below the Next-Action Recommendations to align with the visual flow in Figma.
* **Time Markers Bar**: Added an interactive horizontal timeline bar (`9:00`, `10:00`, `11:00` ... `5:00`) highlighting the active simulated time (9:30 AM/Morning -> 9:00, 2:00 PM/Afternoon -> 2:00, 8:00 PM/Evening -> 5:00).
* **Timeline Item Enhancement**: Polished GCAL cache elements, rendering zero-stimulus recovery buffers with repeating linear striped green backgrounds and shifted events with dashed orange borders.
* **Telemetry Button Duplicate Key Fix**: Resolved a `StreamlitDuplicateElementKey` crash by removing duplicate telemetry buttons ("🖱️ Mouse Log" and "⌨️ Key Log") from the top of the sidebar, keeping them exclusively in the correct Figma visual layout position under the "Passive Sensors" card.
* **HTML/SVG Indentation Rendering Fix**: Resolved a layout issue where multi-line HTML and SVG cards (e.g. Energy Battery, Circadian Waves, time markers, and timeline events) were displayed as raw text blocks. This was caused by Python triple-quoted string indentations being interpreted by the Markdown parser as code blocks. Fixed by wrapping the markup strings in `textwrap.dedent` and flattening dynamic elements.

---

## 13. React UI Alignment & Walkthrough (Vite + React Integration)

We rebuilt the Ebb React client interface in [App.jsx](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/client/src/App.jsx) to match the exact visual assets and user flows in the Figma mockup images for the three biological states:
*   **Three Biological State Architecture**: We expanded the state machine to natively support `'stable'`, `'compressed'`, and `'redline'` scenarios.
*   **Left Sidebar Selector option cards**: Designed a stacked layout of selection cards with custom metrics, theme borders, and circle checkmarks indicating the active selection.
*   **Horizontal Time-of-Day Swappers**: Styled simulator time buttons with the active state's CSS linear-gradients, creating a highly responsive highlighting glow.
*   **Active/Passive Sensors & Telemetry**: Added side-by-side active Mouse Log and Key Log triggers at the bottom of the Passive Sensors card in the sidebar.
*   **Theme Glow Cards**: Applied dynamically computed box-shadows (`box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 16px ${activeState.cardGlow}`) and borders on the biometrics, battery, and circadian wave panels.
*   **Circular SVG Battery meter**: Ported the exact dimensions (`175x175`), radius (`60`), stroke-width (`10`), and rotation from the polished python script to achieve high-fidelity animations.
*   **Circadian Waves area chart**: Built the responsive wave SVG with a custom area gradient fill and vertical grid lines mapping standard local working hours (`10:00 AM` to `5:00 PM`).
*   **GCAL Local SQL Cache Layout**: Implemented the vertical list of GCal events with colored timeline borders (Protected, Locked, Recovery Buffer, Shifted, Recovery Activity) and a custom flex time markers bar.
*   **Bespoke Written Walkthrough Reader**: Configured the navigation tabs to seamlessly toggle between the Interactive Dashboard viewport and the product strategy document, including clean, formatted fraction box layouts.



