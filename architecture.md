# Technical Architecture & Systems Design: Ebb
*Version 4.0 — June 2026*
*Product: Ebb — The Energy-Aware Calendar Shield*

---

## 1. Architectural Philosophy

Ebb sits at a technically sensitive intersection: it reads biometric health signals and cross-references them with workplace calendar and communication data. Three constraints are non-negotiable and shape every subsequent decision:

1. **Local-first privacy.** Raw biometric data (HRV, sleep, resting HR) never leaves the device. Only the computed Energy Score — a 0–100 integer with no biometric payload — is transmitted to cloud services.
2. **Minimal active input.** Every data point that can be passively sensed must be. The only required daily interaction is a single Yes/No tap.
3. **Mutation requires consent.** Ebb never writes to Google Calendar or queues a Slack message without an explicit user approval for that session's shield proposal.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Desktop client** | Tauri (Rust + WebView) | Native macOS/Windows tray widget; ~10 MB binary; no Electron overhead |
| **Mobile client** | React Native (iOS-first) | Shares business logic with Tauri via shared TypeScript services |
| **Local database** | SQLite via Node 22 `node:sqlite` + AES-256-GCM field encryption | Built-in; no native compile; encryption enforced at application layer |
| **Backend API** | Node.js (Fastify) on AWS Lambda | Stateless; handles only LLM relay and calendar mutation acknowledgment |
| **LLM — notification copy** | Groq: `llama-3.1-8b-instant` | Sub-200ms latency; free tier; sufficient for short copy |
| **LLM — shield reasoning** | Groq: `llama-3.3-70b-versatile` | Stronger reasoning for multi-step calendar shift decisions |
| **LLM — voice STT (v2)** | Groq: `whisper-large-v3` | Fastest available STT; free tier |
| **LLM — somatic CoT parsing (v2)** | Groq: `llama-3.3-70b-versatile` | 70B for chain-of-thought somatic extraction with few-shot prompts |
| **LLM — task classification (v2)** | Groq: `llama-3.1-8b-instant` | Fast, free; task titles sent without any biometric context |
| **Cloud infra** | AWS us-east-1 (default) | Stateless Lambda + API Gateway |
| **Calendar integration** | Google Calendar API v3 (read + write) | Outlook / Microsoft 365 scaffolded for v2 |
| **Wearable integration** | Oura Cloud API, Luna Ring SDK (on-device), Apple HealthKit, Google Fit SDK | All normalize to internal `BiometricSnapshot` schema |

**Groq free tier.** All Groq models run on the free API tier through development and closed beta. Free tier limits apply (~14,400 req/day on `llama-3.1-8b-instant`; ~30 req/min on `whisper-large-v3`). At scale, Groq's paid tier remains significantly cheaper than OpenAI equivalents. Voice parsing is rate-limited to 1 call/day per user and gated behind the Pro tier.

---

## 3. Privacy Architecture

Compliance is an architectural constraint, not a feature. It shapes what goes on-device, what crosses the network, and what the cloud API is permitted to receive.

### Data Boundary Map

| Data Type | Lives Where | Crosses Network? | What Is Sent |
|---|---|---|---|
| Raw HRV (ms) | Local SQLite only | Never | — |
| Raw sleep duration | Local SQLite only | Never | — |
| Energy Score (0–100) | Local → cloud notification call | Yes | Integer only |
| Proposed shift summary | Local → notification copy call | Yes | Text; no event titles, no attendee names |
| Voice transcript (v2) | In-memory → Groq STT → discarded server-side | Yes (STT only) | Audio bytes; no persistent cloud storage |
| Slack draft text | Queued locally | User-controlled | Never sent without explicit 1-tap approval |

### Inference Risk

No architecture fully eliminates inference risk. A manager who receives 15 Slack messages saying "adjusting my schedule" over three months can draw health conclusions regardless of what data was shared. Mitigations:
- Slack drafts are never auto-sent — always a manual 1-tap action
- Draft templates default to schedule-neutral language (no health or recovery references)
- Users receive a periodic in-app reminder that the Slack draft feature can be disabled without affecting the core shield

---

## 4. System Topology & Data Flow

Ebb uses a **local-first hybrid topology**. The scoring engine, scheduling logic, and all biometric storage run on-device. Cloud services are invoked statelessly for two operations: LLM notification copy generation and calendar mutation acknowledgment. The v2 voice path adds a third: Groq STT transcription.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Ring as Wearable (Oura / Luna Ring / Apple Health)
    participant App as Client (Tauri / React Native)
    participant DB as SQLite (AES-256-GCM, local)
    participant GCal as Google Calendar API
    participant API as Ebb API Gateway (AWS Lambda)
    participant LLM as Groq (llama-3.1-8b-instant)

    %% Morning Ingestion
    Ring->>App: Sync biometrics via BLE / OAuth (8:00 AM cron)
    App->>DB: Write raw biometrics (stays on device)
    App->>App: Compute Energy Score on-device
    App->>GCal: GET events (read-only, next 8 hours)
    GCal-->>App: Return event metadata (duration, attendee count, time)
    App->>App: Classify events LOCKED / RESCHEDULABLE; identify shift candidate

    %% Notification Generation
    App->>API: POST /notify/generate {energy_score: 34, shift_summary: "..."}
    API->>LLM: Generate notification copy (no biometric payload)
    LLM-->>API: Return copy string
    API-->>App: Return notification copy

    %% User Decision
    App->>User: 8:30 AM lock-screen notification — "Shield Me" / "Push Through"
    alt Approved
        App->>GCal: PATCH events (shift block + inject recovery buffer)
        App->>DB: Log decision = APPROVED; recalculate CAS
        App->>App: Queue Slack draft (user sends with 1 tap)
    else Declined
        App->>DB: Log decision = DECLINED; log override
    end

    %% v2 Voice Path (post-MVP, Pro tier only)
    opt Voice check-in enabled
        User->>App: Record 20-second "Vent-to-Adjust" audio
        App->>API: POST /somatic/ingest {audio, energy_score}
        Note over API: Groq whisper-large-v3 → llama-3.3-70b CoT extraction
        API-->>App: Return 8-stream JSON + confidence scores
        App->>DB: Write dimensions; block write if confidence < 0.75
    end
```

---

## 5. Wearable Integration Layer

Wearable integration is progressive enhancement, not a requirement. The morning slider fallback ensures Ebb works without hardware from Day 1.

### Supported Sources

| Source | Data Collected | Collection Method | Notes |
|---|---|---|---|
| **Oura Ring** | HRV, sleep duration, readiness, resting HR | OAuth; polled at 8 AM + 1 PM | Cloud API; tokens cached locally |
| **Luna Ring** | HRV, sleep duration, recovery score, resting HR | On-device SDK; no cloud relay | Primary for Indian market |
| **Apple Health / HealthKit** | HRV, sleep, resting HR, steps | Background HealthKit fetch | On-device; HealthKit enforces access |
| **Google Fit** | Steps, active minutes, resting HR | WorkManager background job | Android only |
| **Morning Slider (fallback)** | Subjective energy (1–5), sleep hours | 5-second input on notification tap | Used when no wearable is connected |

All sources normalize to a shared `BiometricSnapshot` before Energy Score computation. Luna Ring and Apple Health data is processed on-device via their respective SDKs; no raw biometric payload reaches Ebb's backend.

### Energy Score Computation (On-Device)

```
Energy Score (0–100) = weighted composite

  HRV delta vs. 30-day personal baseline   → 40%
  Sleep duration vs. 7.5-hour target       → 35%
  Subjective slider (if provided)          → 25%

Action thresholds:
  Score < 45    →  Shield Me proposal triggered (mandatory)
  Score 45–70   →  Optional nudge (user preference setting)
  Score > 70    →  No intervention
```

**Cold-start handling.** New users use a population baseline (HRV 42ms) with 0.60 confidence for the first 14 days. Confidence rises linearly to 1.0, pulling scores toward 50 until the baseline personalises. After 7 days, the rolling 30-day window takes over.

---

## 6. Scheduling & Alert Engine

### Event Classification

Ebb reads only: event duration, attendee count, start/end time, and the flexibility tag assigned by the user during onboarding. **Event titles and meeting content are never read or stored.**

```
For every calendar event in the next 8 hours:

  LOCKED         if  attendee_count ≥ 3
                 OR  any attendee domain ≠ user domain (external)
                 OR  recurring event instance (never mutate a series)
                 OR  user tagged locked during onboarding

  RESCHEDULABLE  otherwise
```

### Scheduling Rules

| Rule | Condition | Action |
|---|---|---|
| **Morning Peak Protection** | Energy Score < 45; highest-complexity RESCHEDULABLE block found | Shift to next-day 9 AM (up to 3 days ahead if needed) |
| **Recovery Buffer Injection** | Energy Score < 45; LOCKED meeting with ≥ 3 attendees | Insert 20–30 min zero-stimulus buffer after meeting end |
| **Slump Window Routing** | Energy Score 45–70; low-complexity admin blocks present | Route admin tasks to 2–4 PM biological slump window |
| **Mid-Day Rebuild** | Current HRV < 60% of morning baseline at 1 PM check | Shift all remaining RESCHEDULABLE blocks to tomorrow; inject 30-min decompression buffer |

### Scheduling Engine (Core Logic)

```python
def run_scheduling_engine(energy_score, calendar_events, current_time=None):
    locked, reschedulable = [], []
    for event in calendar_events:
        if current_time and event.end_time <= current_time:
            continue  # skip past events on mid-day rebuild
        classification = classify_event(event, user_locked_tags)
        (locked if classification == "LOCKED" else reschedulable).append(event)

    if energy_score < 45:
        # Shift the highest-complexity solo block to tomorrow morning
        high_priority = [e for e in reschedulable if e.complexity == "HIGH"]
        if high_priority:
            high_priority[0].proposed_start = next_morning_slot()
            high_priority[0].status = "SHIFT_PROPOSED"

        # Inject recovery buffer after each heavy locked meeting
        for meeting in locked:
            if len(meeting.attendees) >= 3:
                inject_buffer(after=meeting.end_time, minutes=30, label="Zero-Stimulus Buffer")

def run_midday_rebuild(reschedulable, current_time):
    for session in reschedulable:
        if session.start_time > current_time:
            session.proposed_start = tomorrow_at(session.start_time.time())
            session.status = "MIDDAY_REBUILT"
    inject_buffer(after=current_time, minutes=30, label="Emergency Decompression")
```

### Alert Thresholds

```python
def evaluate_alerts(biometrics, dimensions_log, db_conn):
    energy_score = compute_energy_score(biometrics)

    # 1. Morning shield trigger
    if energy_score < 45:
        dispatch_shield_proposal(biometrics.user_id, energy_score)

    # 2. Mid-day rebuild trigger
    baseline = db_conn.scalar("SELECT baseline_hrv FROM user_profiles WHERE id = ?", user_id)
    if biometrics.hrv_ms < baseline * 0.60:
        dispatch_midday_rebuild(biometrics.user_id)

    # 3. LLM confidence gate (v2 voice path)
    for dim in dimensions_log:
        if dim.confidence_score < 0.75:
            block_db_write(dim)
            prompt_manual_verification(dim)

    # 4. Comfort-bias / CAS gaming detector
    cas_7d = avg_cas(biometrics.user_id, days=7)
    vel_7d = task_completion_rate(biometrics.user_id, days=7)
    if cas_7d > 90 and vel_7d < 0.50:
        surface_velocity_override_warning(biometrics.user_id)
```

---

## 7. LLM Usage

Ebb uses Groq for four narrow tasks. Raw biometric data is excluded from every prompt.

| Task | Model | Cloud Input | Tier |
|---|---|---|---|
| Notification copy | `llama-3.1-8b-instant` | Energy score (int) + shift summary (text) | Free |
| Slack draft | `llama-3.1-8b-instant` | Shift summary (text) | Free |
| Shield reasoning | `llama-3.3-70b-versatile` | Energy score + calendar context (no PII) | Free |
| Voice STT (v2, Pro) | `whisper-large-v3` | Audio bytes | Free |
| Somatic CoT parsing (v2, Pro) | `llama-3.3-70b-versatile` | Voice transcript (text) | Free |
| Task classification (v2) | `llama-3.1-8b-instant` | Task title only | Free |

### Somatic CoT Pipeline (v2 Voice Path)

The 8 somatic dimensions extracted from voice input are: `NUTRITION`, `MENTAL_HEALTH`, `ACTIVITY`, `PHYSIQUE`, `WORK`, `SOCIAL`, `CREATIVE`, `SELF_CARE`. Each is returned as a structured JSON payload with a confidence score derived from average token log-probabilities.

```
1. Audio → Groq whisper-large-v3 → text transcript
   Audio discarded immediately after transcription

2. Transcript → llama-3.3-70b-versatile (20 few-shot prompts seeded)
   Reasoning trace:
     a. Biometric Alignment  — reconcile subjective claims with wearable data
     b. Root Cause Diagnosis — resolve symptoms across physiological lag times
     c. Urgency Classification — detect red-lines requiring immediate schedule change

3. Output → 8-stream JSON + per-dimension confidence scores
   Gate: confidence < 0.75 → block DB write → surface manual verification prompt

4. Confirmed dimensions → augment Energy Score → update Shield Me proposal
```

---

## 8. Database Schema (SQLite, Local, Encrypted At Rest)

Uses Node 22 built-in `node:sqlite`. Sensitive fields encrypted at the application layer with AES-256-GCM (Scrypt key derivation, per-install salt). Nothing in this schema is replicated to cloud storage.

```sql
-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id                   TEXT PRIMARY KEY,
  email                TEXT NOT NULL UNIQUE,
  oauth_google_cal     TEXT,           -- encrypted { access_token, refresh_token }
  oauth_wearable_token TEXT,           -- encrypted { access_token, refresh_token }
  wearable_source      TEXT NOT NULL DEFAULT 'slider',
                                       -- 'oura' | 'luna_ring' | 'apple_health' | 'slider'
  baseline_hrv         INTEGER NOT NULL DEFAULT 42,
  baseline_confidence  REAL NOT NULL DEFAULT 0.60,
  timezone             TEXT NOT NULL DEFAULT 'UTC',
  onboarding_complete  INTEGER NOT NULL DEFAULT 0,
  data_region          TEXT NOT NULL DEFAULT 'us-east-1',
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- DAILY BIOMETRICS (raw; never transmitted)
CREATE TABLE IF NOT EXISTS biometrics_log (
  id                     TEXT PRIMARY KEY,
  user_id                TEXT NOT NULL,
  date                   TEXT NOT NULL,
  sleep_duration_seconds INTEGER NOT NULL,
  resting_heart_rate     INTEGER NOT NULL,
  hrv_ms                 INTEGER NOT NULL,
  subjective_alertness   INTEGER,                -- 1–5 slider; NULL if wearable used
  energy_score           INTEGER NOT NULL,       -- 0–100 computed on-device
  data_freshness         TEXT NOT NULL DEFAULT 'FRESH',
                                                 -- 'FRESH' | 'STALE'
  source                 TEXT NOT NULL DEFAULT 'slider',
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE (user_id, date)
);

-- CALENDAR EVENT CACHE
-- PRIVACY BOUNDARY: event titles are NEVER stored here.
CREATE TABLE IF NOT EXISTS calendar_cache (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  event_id        TEXT NOT NULL,
  start_time      TEXT NOT NULL,
  end_time        TEXT NOT NULL,
  attendee_count  INTEGER NOT NULL DEFAULT 1,
  is_external     INTEGER NOT NULL DEFAULT 0,
  is_recurring    INTEGER NOT NULL DEFAULT 0,
  classification  TEXT NOT NULL DEFAULT 'RESCHEDULABLE',
                  -- 'LOCKED' | 'RESCHEDULABLE'
  complexity      TEXT NOT NULL DEFAULT 'MEDIUM',
                  -- 'HIGH' | 'MEDIUM' | 'LOW'
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE (user_id, event_id)
);

-- SHIELD DECISIONS LOG
CREATE TABLE IF NOT EXISTS shield_decisions_log (
  id                        TEXT PRIMARY KEY,
  user_id                   TEXT NOT NULL,
  date                      TEXT NOT NULL,
  energy_score              INTEGER NOT NULL,
  proposed_shifts_json      TEXT NOT NULL,    -- JSON array; no event titles
  user_decision             TEXT NOT NULL DEFAULT 'PENDING',
                            -- 'PENDING'|'APPROVED'|'DECLINED'|'EXPIRED'|'MUTATION_FAILED'
  cognitive_alignment_score INTEGER,
  prompt_version            TEXT,
  copy_source               TEXT DEFAULT 'llm',
                            -- 'llm' | 'fallback_template'
  created_at                TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- SOMATIC DIMENSIONS LOG (v2 voice feature)
CREATE TABLE IF NOT EXISTS somatic_dimensions_log (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL,
  date             TEXT NOT NULL,
  dimension_name   TEXT NOT NULL,
  payload_json     TEXT NOT NULL,             -- AES-256-GCM encrypted JSON
  confidence_score REAL NOT NULL,
  status           TEXT NOT NULL DEFAULT 'CONFIRMED',
                   -- 'CONFIRMED' | 'PENDING_VERIFICATION'
  device_source    TEXT,
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE (user_id, date, dimension_name)
);

CREATE INDEX IF NOT EXISTS idx_biometrics_user_date  ON biometrics_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_shield_user_date      ON shield_decisions_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_user_time    ON calendar_cache(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_somatic_user_date     ON somatic_dimensions_log(user_id, date);
```

---

## 9. API Endpoints

The backend API is stateless. No user data or biometrics are persisted server-side. Every call is idempotent.

### POST /api/v1/notify/generate
Generates the lock-screen notification copy. Receives only the computed score and a text summary — no event titles, no raw biometrics.

**Request**
```json
{
  "energy_score": 34,
  "wearable_readable": "HRV 24ms (42ms baseline), 5.2hrs sleep",
  "proposed_shift": {
    "description": "Solo focus block",
    "from_slot": "Today 2:00 PM",
    "to_slot": "Tomorrow 9:00 AM"
  }
}
```
**Response**
```json
{
  "notification_copy": "HRV low (24ms). Moving your afternoon focus block to tomorrow morning and adding a buffer after your 10 AM review. Approve?",
  "cta_primary": "Yes, Shield Me",
  "cta_secondary": "No, Push Through"
}
```

### POST /api/v1/somatic/ingest *(v2, Pro tier)*
Accepts audio for voice parsing. Audio is transcribed via Groq Whisper and discarded server-side after extraction.

**Request** — multipart form: `audio_checkin` (binary), `energy_score` (int), `hrv_ms` (int), `sleep_seconds` (int)

**Response**
```json
{
  "date": "2026-05-31",
  "transcript": "Woke up exhausted, skin breaking out, brain fog since yesterday.",
  "dimensions_extracted": [
    { "name": "MENTAL_HEALTH",    "confidence": 0.92 },
    { "name": "SOMATIC_AESTHETIC","confidence": 0.88 },
    { "name": "NUTRITION",        "confidence": 0.76 }
  ],
  "low_confidence_flags": [],
  "actions_queued": true
}
```

### POST /api/v1/calendar/shield-confirm
Records the user's approval decision. The actual GCal PATCH calls are executed client-side using the locally cached OAuth token — this endpoint logs the decision for aggregate analytics only (no PII, no event content).

**Request**
```json
{
  "user_id": "usr_abc123",
  "session_date": "2026-05-31",
  "decision": "APPROVED",
  "shift_count": 1,
  "buffer_count": 1
}
```
**Response**
```json
{ "status": "LOGGED", "slack_draft_instruction": "QUEUE" }
```

### POST /api/v1/calendar/rebuild
Records a mid-day rebuild event. Client executes the GCal mutations; server logs the trigger.

**Request**
```json
{
  "user_id": "usr_abc123",
  "triggered_at": "2026-05-31T13:00:00Z",
  "trigger_reason": "REAL_TIME_HRV_DIP",
  "energy_score_current": 19
}
```
**Response**
```json
{ "status": "LOGGED" }
```

---

## 10. Daemon Schedule

`ebb-daemon` runs as a local background process. All triggers fire on-device using `setInterval` + `Intl.DateTimeFormat` for timezone-aware scheduling — no external cron dependency.

| Time | Trigger | Action |
|---|---|---|
| **8:00 AM** | Local cron | Wearable OAuth refresh; biometric sync to local DB |
| **8:00 AM** | Post-sync | GCal read (next 8 hours); event classification |
| **8:15 AM** | Post-classification | Energy Score computed; shield proposal generated |
| **8:30 AM** | Push notification | Lock-screen "Shield Me" / "Push Through" delivered |
| **8:30 AM** *(v2)* | Notification tap | Voice recorder overlay available |
| **1:00 PM** | Local cron | Mid-day HRV pull; rebuild dispatched if threshold breached |
| **6:00 PM** | Local cron | Wind-down alert; tomorrow's CAS projection |
| **Monday 8:00 AM** | Weekly cron | Rolling baseline recalibration for all users |

---

## 11. Cognitive Alignment Score (CAS)

CAS is the single number visible in the menu bar widget. It measures scheduling intelligence — whether the user's task-energy alignment improved — not raw productivity output.

```
CAS = (Time in high-complexity tasks during peak energy windows
       + Time in low-complexity tasks during slump windows)
      ÷ Total controllable working hours
      × 100
```

`LOCKED` multi-person meetings are excluded from the denominator. CAS only reflects what the user controls.

**Interpretation:**
- CAS ≥ 75 — Good. Peak-focus work landed in peak-energy windows.
- CAS 50–74 — Moderate. Some misalignment.
- CAS < 50 — Override day. Shows a single recovery insight: "Tomorrow is pre-adjusted."

**Analytics Queries**

```sql
-- Daily CAS
SELECT date, cognitive_alignment_score
FROM shield_decisions_log
WHERE user_id = ? AND date = CURRENT_DATE;

-- 30-day Shield Adherence Rate (North Star metric; target > 70%)
SELECT ROUND(
  SUM(CASE WHEN user_decision = 'APPROVED' THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100, 1
) AS shield_adherence_rate
FROM shield_decisions_log
WHERE user_id = ?
  AND user_decision IN ('APPROVED', 'DECLINED')
  AND date >= date('now', '-30 days');

-- Override Recovery Rate (guardrail metric)
SELECT ROUND(
  SUM(CASE WHEN user_decision = 'APPROVED' THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100, 1
) AS recovery_rate
FROM shield_decisions_log
WHERE user_id = ?
  AND date >= date('now', '-3 days')
  AND EXISTS (
    SELECT 1 FROM shield_decisions_log s2
    WHERE s2.user_id = shield_decisions_log.user_id
      AND s2.user_decision = 'DECLINED'
      AND s2.date BETWEEN date('now', '-6 days') AND date('now', '-4 days')
  );
```

---

## 12. Implementation Roadmap (1 Engineer, 12 Weeks)

| Phase | Weeks | Status | Deliverables |
|---|---|---|---|
| **1** — Auth, Ingestion & Local Store | 1–2 | ✅ Complete | Fastify server, AES-256-GCM SQLite, GCal OAuth, Oura OAuth, slider endpoint — 53/53 checks |
| **2** — Biometric Ingestion & Energy Score | 3–4 | ✅ Complete | Oura pull worker, anomaly validator, stale-data fallback, baseline recalibration, daemon — 47/47 checks |
| **3** — Scheduling Engine & Mid-Day Reset | 5–6 | 🔜 Upcoming | LOCKED/RESCHEDULABLE classifier, buffer injection, mid-day rebuild API, Slack draft queue |
| **4** — Groq LLM Layer | 7–8 | 🔜 Upcoming | Notification copy, shield reasoning, Slack drafts, prompt versioning, rate-limit safety |
| **5** — Client: Push Notification & Approval | 9–10 | 🔜 Upcoming | APNs, lock-screen approval, GCal mutation, onboarding flow |
| **6** — Voice Pipeline | 11 | 🔜 Upcoming | Whisper STT, somatic CoT, confidence gate, 8-stream JSON |
| **7** — Hardening & Beta | 12–14 | 🔜 Upcoming | Security audit, Google OAuth verification, 10-user closed beta |

### Week 15 — Keep or Kill

| Metric | Keep | Kill |
|---|---|---|
| Shield Adherence Rate (30-day) | > 60% | < 35% |
| Day-7 Retention | > 65% | < 40% |
| Notification Open Rate (within 1 hr) | > 55% | < 30% |
| GCal mutation success rate | > 90% | < 75% |

---

## 13. Known Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Biometric data leakage** | 🔴 Critical | Zero-knowledge API boundary; only Energy Score (integer) transmitted. Automated payload inspection confirms no biometric fields in any outbound POST. |
| **Google Calendar write latency** (500–1200ms) | 🟡 High | Mutations are async and client-executed post-approval; never block the notification UI |
| **OAuth token rate limiting** (Oura, GCal) | 🟡 High | Cloud polling capped at 2×/day; tokens cached in local SQLite; Luna Ring bypasses cloud via on-device SDK |
| **Multi-user scheduling conflicts** | 🟡 High | LOCKED events are read-only for all Ebb instances; only RESCHEDULABLE solo blocks are mutated |
| **Groq free tier exhaustion at scale** | 🟡 High | Rate-limit middleware tracks daily counts; suspends Slack drafts at 93% ceiling; serves fallback template at 100% |
| **User gaming CAS** | 🟠 Medium | Comfort-bias detector fires if CAS > 90 and task completion rate < 50% for 7 days |
| **Single calendar provider risk** | 🟠 Medium | Outlook OAuth scaffolded from Phase 3; calendar layer abstracted behind a provider interface |

---

## 14. Post-MVP Architectural Improvements

**Zero-hardware telemetry.** Local classifier estimating cognitive fatigue from keystroke interval distributions and mouse jitter — removes wearable dependency entirely and unlocks the ~60% of Segment A who track nothing.

**On-device NLP quantization.** Replace Groq Whisper + cloud LLM with a quantized Llama-3-8B-Instruct-4bit model running inside the Tauri client (GGUF format, ~5 GB). Eliminates all cloud transmission for voice data; strengthens the privacy guarantee and removes per-call cost at scale.

**Outlook / Microsoft 365.** `CalendarProvider` abstraction interface scaffolded in Phase 3. `OutlookCalendarProvider` plugs in without touching scheduling logic. Required before any enterprise motion.

**Team scheduling coordination.** Phase 1: surface conflicts to the user before confirming a mutation. Phase 2: lightweight shared availability layer where Ebb reads teammates' buffer windows before proposing a shift target — no biometric data shared across users.
