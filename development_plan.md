# Development Plan: Ebb
*Engineer's phase-by-phase technical execution guide*

---

## Repository Structure

```
ebb/
├── apps/
│   ├── mobile/              # React Native (iOS-first)
│   └── desktop/             # Tauri (v1.5, post-MVP)
├── packages/
│   ├── core/
│   │   ├── energy/          # Energy Score computation
│   │   ├── scheduler/       # LOCKED/RESCHEDULABLE engine
│   │   ├── db/              # SQLite schema + typed queries
│   │   └── groq/            # Groq client wrapper
│   └── types/               # Shared TypeScript interfaces
├── server/                  # Fastify API (AWS Lambda target)
│   ├── routes/
│   ├── prompts/             # Versioned Groq prompt files
│   └── middleware/
├── scripts/                 # verify_phase*.mjs, fixture data
└── docs/
```

## Core Dependencies

```json
{
  "server": {
    "fastify": "^4.x",
    "groq-sdk": "^0.x",
    "@googleapis/calendar": "^9.x",
    "better-sqlite3": "^9.x",
    "better-sqlite3-sqlcipher": "patch over better-sqlite3"
  },
  "mobile": {
    "react-native": "0.73.x",
    "react-native-health": "^1.x",
    "@notifee/react-native": "^7.x",
    "react-native-keychain": "^8.x"
  },
  "shared": {
    "zod": "^3.x",
    "date-fns": "^3.x",
    "typescript": "^5.x"
  }
}
```

## Environment Variables

```
GROQ_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OURA_CLIENT_ID=
OURA_CLIENT_SECRET=
DB_ENCRYPTION_SALT=        # Scrypt salt; generated once per install, stored in OS keychain
NODE_ENV=development
API_BASE_URL=
APNS_KEY_ID=
APNS_TEAM_ID=
```

**Local dev tooling**: Node 20 LTS, Xcode 15+ (iOS simulator for notification testing), `ngrok` for APNs callbacks during local development.

---

## Phase 1 — Foundation
*Weeks 1–2 · Auth, DB, OAuth scaffolding*

### Goal
Working backend with an encrypted local store and OAuth flows for Google Calendar and Oura. No UI. Verified by automated script.

### What Gets Built

**SQLite + SQLCipher**
Create `packages/core/db/migrate.ts`. Run once on install. All four MVP tables + indexes. SQLCipher key derived via Scrypt (N=32768, r=8, p=1) with a per-install salt stored in the OS keychain via `react-native-keychain` (mobile) or macOS Keychain API (desktop). Key is device-bound — never derived from a user password.

**Google Calendar OAuth**
Routes: `GET /auth/google/start` (generates authorization URL), `GET /auth/google/callback` (exchanges code for tokens, encrypts and stores in `user_profiles.oauth_google_cal`).

Scopes requested:
- `https://www.googleapis.com/auth/calendar.events` — read + write specific events only
- Do **not** request `calendar` (full access) — over-permissioned and will fail Google's verification

Token refresh: `refreshGoogleToken()` runs silently before every GCal API call. Never surfaces to the user.

**Oura OAuth**
Same pattern as GCal. Routes: `GET /auth/oura/start`, `GET /auth/oura/callback`. Token stored in `user_profiles.oauth_wearable_token`.

**Morning Slider Fallback**
`POST /biometrics/manual` — accepts `{ subjective_alertness: 1–5, sleep_hours: float }`, validates with Zod, writes to `biometrics_log`. No wearable required.

### Verification (`scripts/verify_phase1.mjs`)
```
✓ DB opens; all 4 tables and indexes present
✓ Write + read a user_profile row; encryption round-trip survives process restart
✓ GCal OAuth: exchange test auth code → store tokens → refresh → confirm refreshed token works
✓ Oura OAuth: same
✓ Slider endpoint: POST → confirm row in biometrics_log
```

### Phase Exit Criteria
All `verify_phase1.mjs` checks pass. Encrypted DB survives a process kill and restart with data intact. OAuth refresh happens silently for both providers.

---

## Phase 2 — Biometric Ingestion & Energy Score
*Weeks 3–4 · Autonomous morning data pipeline*

### Goal
Wearable data flows into the local DB automatically each morning. Energy Score computed on-device. Cold-start handled. No manual steps required after onboarding.

### What Gets Built

**8:00 AM Cron**
`packages/core/energy/cron.ts` — fires at 8:00 AM in the user's local timezone (`user_profiles.timezone`, set from device locale during onboarding). Triggers wearable sync and GCal fetch in sequence.

In development: `node-cron`. In production (Lambda): EventBridge scheduled rule. Timezone offset baked into the cron expression at schedule-creation time; recalculated on timezone change.

**Oura Pull** (`packages/core/energy/oura.ts`)
```typescript
// GET https://api.ouraring.com/v2/usercollection/daily_readiness
// Params: start_date=today, end_date=today
// Map to BiometricSnapshot:
interface BiometricSnapshot {
  hrv_ms: number;
  sleep_duration_seconds: number;
  resting_heart_rate: number;
  source: 'oura' | 'apple_health' | 'slider';
  captured_at: string;
}
```
Rate limit: poll at most twice daily (8 AM + 1 PM). Cache last-pull timestamp in `user_profiles` to prevent redundant calls.

**Apple HealthKit** (`apps/mobile/src/health.ts`)
Request permissions at onboarding: `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`, `HKCategoryTypeIdentifierSleepAnalysis`, `HKQuantityTypeIdentifierRestingHeartRate`.

Enable background delivery so iOS wakes the app at 8 AM even when backgrounded. Sleep duration = sum of `AsleepCore` + `AsleepDeep` + `AsleepREM` stages.

**Energy Score Computation** (`packages/core/energy/score.ts`)
```typescript
function computeEnergyScore(snapshot: BiometricSnapshot, profile: UserProfile): number {
  const hrvScore = Math.min(100, Math.round((snapshot.hrv_ms / profile.baseline_hrv) * 50 + 25));
  const sleepScore = Math.min(100, Math.round((snapshot.sleep_duration_seconds / 27000) * 80 + 10));
  // 27000 = 7.5 hours in seconds

  const sliderScore = snapshot.subjective_alertness
    ? (snapshot.subjective_alertness - 1) * 25
    : null;

  const raw = sliderScore !== null
    ? hrvScore * 0.40 + sleepScore * 0.35 + sliderScore * 0.25
    : hrvScore * 0.55 + sleepScore * 0.45; // reweight if no slider

  // Cold-start confidence: pull score toward 50 when baseline is uncertain
  return Math.round(raw * profile.baseline_confidence + 50 * (1 - profile.baseline_confidence));
}
```

**Cold-Start Baseline**
New users get `baseline_hrv = 42` (population median, 25–40 cohort), `baseline_confidence = 0.60`. Weekly cron recalibrates:
```sql
UPDATE user_profiles
SET baseline_hrv = (SELECT AVG(hrv_ms) FROM biometrics_log WHERE user_id = ? AND date >= date('now', '-30 days')),
    baseline_confidence = MIN(1.0, (SELECT COUNT(*) FROM biometrics_log WHERE user_id = ?) / 14.0)
WHERE id = ?
```

### Verification (`scripts/verify_phase2.mjs`)
```
✓ Fixture A (HRV 58ms, 8hr sleep)  → Energy Score 78–88
✓ Fixture B (HRV 38ms, 6hr sleep)  → Energy Score 52–62
✓ Fixture C (HRV 22ms, 5hr sleep)  → Energy Score 28–38
✓ Cold-start user                  → score pulled toward 50, baseline_confidence = 0.60
✓ Cron fires at test time (T+2min) → biometric row in DB within 60s
✓ Anomalous HRV (0ms, 220ms)       → discarded, fallback to remaining signals
```

### Phase Exit Criteria
Autonomous cron runs overnight without manual intervention for 3 consecutive days on the engineer's own device. Energy Score matches expected range for all fixtures. Stale-data fallback (edge case 1.1) works on simulated API failure.

---

## Phase 3 — Scheduling Engine
*Weeks 5–6 · Core algorithmic logic*

### Goal
Given an Energy Score and a set of calendar events, produce a concrete `proposed_actions[]` array. Pure rules — no network calls. The heart of what makes Ebb different from every other calendar tool.

### What Gets Built

**GCal Event Fetch** (`packages/core/scheduler/gcal.ts`)
```typescript
// GET https://www.googleapis.com/calendar/v3/calendars/primary/events
// timeMin: today 08:00 AM local
// timeMax: today 06:00 PM local
// singleEvents: true, orderBy: startTime
// Fields extracted: id, start, end, attendees (count + domain ONLY)
// Event titles and content are NEVER read or stored
```

Store in `calendar_cache`: `id`, `start_time`, `end_time`, `attendee_count`, `is_external`, `classification`, `complexity`.

**Event Classifier** (`packages/core/scheduler/classify.ts`)
```typescript
function classifyEvent(event: CalendarEvent, userDomain: string, lockedOverrides: Set<string>): 'LOCKED' | 'RESCHEDULABLE' {
  if (lockedOverrides.has(event.id)) return 'LOCKED';
  if (event.is_recurring_instance) return 'LOCKED'; // never touch recurring series
  if (event.attendee_count >= 3) return 'LOCKED';
  if (event.attendees.some(a => extractDomain(a.email) !== userDomain)) return 'LOCKED';
  return 'RESCHEDULABLE';
}
```

Complexity in MVP: assigned by the user during onboarding block-tagging. If not tagged, default to MEDIUM. Never inferred from event title.

**Rules Engine** (`packages/core/scheduler/rules.ts`)
```typescript
function buildShieldProposal(energyScore: number, events: ClassifiedEvent[], prefs: UserPreferences): ShieldProposal {
  if (energyScore >= 45) return noActionProposal(events);

  const actions: ProposedAction[] = [];

  // Rule 1: shift highest-complexity RESCHEDULABLE block to tomorrow morning
  const topFocusBlock = events
    .filter(e => e.classification === 'RESCHEDULABLE' && e.complexity === 'HIGH')
    .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];

  if (topFocusBlock) {
    actions.push({ type: 'SHIFT_EVENT', event_id: topFocusBlock.id, proposed_start: nextMorningSlot(prefs) });
  }

  // Rule 2: inject 30-min buffer after each heavy locked meeting
  events
    .filter(e => e.classification === 'LOCKED' && e.attendee_count >= 3)
    .forEach(meeting => actions.push({
      type: 'INJECT_BUFFER',
      after_event_id: meeting.id,
      duration_minutes: 30,
      label: 'Zero-Stimulus Buffer'
    }));

  return {
    actions,
    cas_unshielded: computeCAS(events),
    cas_shielded: computeCAS(applyProposed(events, actions)),
  };
}
```

`nextMorningSlot()` looks ahead up to 3 days for the first open 9 AM–11 AM window. If none found, surfaces a warning (edge case 2.3).

**CAS Computation**
```typescript
// CAS = (focus time in peak window + admin time in slump window) / controllable hours × 100
// Peak window: waking_time + 1hr → waking_time + 4hrs (from biometrics)
// Slump window: 14:00–16:00 local (fixed in MVP, user-adjustable in v2)
// Controllable hours = total working hours - LOCKED meeting hours
```

Write every proposal to `shield_decisions_log` as `PENDING` at generation time. Update to `APPROVED` or `DECLINED` on user action.

### Verification (`scripts/verify_phase3.mjs`)
```
✓ Fixture A (mixed calendar, energy 34)   → 1 SHIFT_EVENT + 1 INJECT_BUFFER
✓ Fixture B (all-LOCKED, energy 28)       → 0 shifts, 1 buffer
✓ Fixture C (energy 72)                   → 0 actions (above threshold)
✓ Fixture D (no HIGH-complexity blocks)   → 0 shifts, buffer only
✓ Recurring event present                 → classified LOCKED regardless of attendees
✓ cas_shielded > cas_unshielded when actions are proposed
```

### Phase Exit Criteria
All fixture tests pass. Engineer manually reviews 3 real-morning proposals on their own calendar and confirms they are sensible before moving to Phase 4.

---

## Phase 4 — Groq LLM Layer
*Weeks 7–8 · Natural language, versioned prompts, rate-limit safety*

### Goal
Translate the scheduling engine's structured output into natural-language notification copy and Slack drafts using Groq's free API. Decision logic remains entirely in the rules engine — LLM only handles copy.

### What Gets Built

**Groq Client** (`packages/core/groq/client.ts`)
```typescript
// Wrapper around groq-sdk:
// - Exponential backoff on 429: wait 1s, 2s, 4s — max 3 retries
// - Hard timeout: 8 seconds; serve fallback template on timeout
// - Request counter: tracks daily usage per model against free tier ceiling
// - Request ID logged alongside shield_decisions_log for debugging
```

**Rate-Limit Middleware** (`server/middleware/groqLimiter.ts`)
```typescript
// Daily request ceiling: ~14,400 req/day on llama-3.1-8b-instant
// At 80% (11,520): log warning, alert engineer via webhook
// At 93% (13,392): suspend Slack draft generation (lowest priority)
// At 100%: serve fallback template for all notification copy
// Counter resets at midnight UTC
const FALLBACK_COPY = "Energy is low today. Your focus block has been moved to tomorrow morning.";
```

**`POST /api/v1/notify/generate`**
Input: `{ energy_score: int, wearable_readable: string, proposed_shift: { description, from_slot, to_slot } }`
No raw biometrics. No event titles. No user PII.
Model: `llama-3.1-8b-instant`. Target: < 200ms p95.

**`POST /api/v1/notify/slack-draft`**
Input: `{ shift_description: string }`
Model: `llama-3.1-8b-instant`. Returns a ≤ 20-word schedule-neutral message. Never references health, energy, or reason.

**Prompt Files** (`server/prompts/`)

`notify-copy-v1.0.txt` (system prompt):
```
You write short push notification copy for a calendar assistant.
Input: energy score, a biometric summary, and a proposed schedule change.
Output: one message of max 25 words.
Rules: no exclamation marks. no motivational phrases. no health references.
present tense. reference the biometric signal and the proposed action.
```

`slack-draft-v1.0.txt` (system prompt):
```
You write a single Slack message a professional sends to their manager
explaining a rescheduled work block.
Rules: matter-of-fact tone. no greeting. no sign-off. no health references.
max 20 words.
```

Prompt versioning: semver filenames. Version string logged in `shield_decisions_log.proposed_shifts_json`. Never edit in place — always bump version.

**Post-Generation Validation** (`server/middleware/outputFilter.ts`)
Run on every LLM output before returning to client:
- Length: > 40 words → truncate or serve fallback
- Prohibited terms: `['unwell', 'sick', 'health', 'medical', 'tired', 'exhausted', 'recovery', 'feeling', 'energy', 'stressed', 'burnout']` → serve fallback, log
- Coherence: output must reference either the energy signal or the proposed action → else fallback

### Verification (`scripts/verify_phase4.mjs`)
```
✓ Notification copy generated for low / moderate / high energy fixtures
✓ All outputs ≤ 25 words and reference the proposed shift
✓ No prohibited terms in any output across 20 test calls
✓ Fallback template fires correctly on simulated Groq 503
✓ Rate-limit middleware suspends Slack drafts at 93% of ceiling (simulated)
✓ Request ID present in shield_decisions_log for each call
```

### Phase Exit Criteria
Engineer manually reviews 10 real-morning notification outputs and rates ≥ 8/10 as copy they would act on. Prompt version appears in every decision log entry. No raw biometrics appear in any Groq request payload (automated check).

---

## Phase 5 — Client: Push Notification & Approval Flow
*Weeks 9–10 · The product becomes real*

### Goal
Real notification on a real lock screen. Lock-screen approval mutates the calendar without the user opening the app. Full morning flow — sync → score → propose → notify → approve → mutate — runs end-to-end on real hardware.

### What Gets Built

**APNs Integration**
- Apple Developer: create APNs key (`.p8`), note Key ID + Team ID
- Notification category: `SHIELD_PROPOSAL` with two actions — `APPROVE` (`foreground: false`) and `DECLINE` (`foreground: false`)
- Use `@notifee/react-native` for scheduling; APNs for remote push

Notification payload:
```json
{
  "aps": {
    "alert": { "body": "HRV low (24ms). Moving your focus block to tomorrow morning." },
    "category": "SHIELD_PROPOSAL",
    "sound": "default",
    "mutable-content": 1
  },
  "session_id": "shield_session_abc123"
}
```

**Background Action Handler**
```typescript
// On APPROVE tap (lock screen, no app open):
// 1. iOS wakes app in background via UNNotificationActionIdentifier
// 2. Load proposed_actions from local DB using session_id
// 3. Execute GCal PATCH calls using cached OAuth token
// 4. Update shield_decisions_log: decision = 'APPROVED'
// 5. Queue Slack draft in local state
// 6. Schedule silent local notification: "Calendar updated. CAS: 79%"
// Must complete within iOS background task time limit (~30s)
```

**GCal Mutation** (`packages/core/scheduler/gcal-write.ts`)
```typescript
// PATCH /calendar/v3/calendars/primary/events/{eventId}
// Body: { start: { dateTime: newStart }, end: { dateTime: newEnd } }
// INJECT_BUFFER: POST /calendar/v3/calendars/primary/events (create new)
// On 401: refresh token silently, retry once
// On 429: queue with 5s backoff, retry max 3×
// On persistent failure: log MUTATION_FAILED, surface manual retry with deep-link to event
```

**Onboarding Flow** (`apps/mobile/src/onboarding/`)
Three screens, < 4 minutes:

1. **Connect Calendar** — trigger GCal OAuth WebView. On success: show ✓, enable Continue.
2. **Connect Energy Source** — three cards: Oura OAuth, Apple Health permission, "Use morning slider." All three are first-class options; none is de-emphasized.
3. **Tag Your Blocks** — live calendar fetch. Multi-person events pre-labeled LOCKED (grey, non-interactive). Solo events show a toggle (default OFF). On "Start Protecting": write `onboarding_complete = true`. First notification fires next morning at 8:30 AM.

State machine: `STEP_1 → STEP_2 → STEP_3 → COMPLETE`. If user closes mid-onboarding, resume at last completed step on reopen.

**Notification Expiry**
Proposals expire 2 hours after delivery (10:30 AM). Log as `EXPIRED` — not `DECLINED`. Do not re-send. Do not count against adherence metrics.

### Verification (`scripts/verify_phase5.mjs`)
```
✓ Lock-screen APPROVE correctly mutates GCal within 30s of tap (no app open)
✓ Lock-screen DECLINE logs DECLINED, no calendar changes
✓ EXPIRED proposal (simulated 2hr timeout) logs EXPIRED, no mutation
✓ Stale token (401): silent refresh, retry succeeds
✓ GCal 429: queued retry succeeds within 15s
✓ GCal persistent failure: MUTATION_FAILED logged, in-app alert surfaces
✓ Onboarding completes in < 4 minutes on clean install
✓ All three onboarding paths (Oura / Apple Health / slider) complete without error
```

### Phase Exit Criteria
Full morning flow runs autonomously for 5 consecutive days on the engineer's own device without manual intervention. End-to-end demo walkable in < 3 minutes to a non-technical person.

---

## Phase 6 — Voice Pipeline
*Week 11 · Post-MVP Pro tier feature*

### Goal
"Vent-to-Adjust" voice check-in: 20-second audio → structured somatic dimensions → augmented Energy Score. Gated behind the confidence threshold. Pro tier only.

### What Gets Built

**Tauri Voice Overlay** (`apps/desktop/src/overlay/`)
Appears at 8:30 AM alongside the notification (Pro tier only). 20-second recording with live waveform. Auto-stops at 20s; user can submit early.

**`POST /api/v1/somatic/ingest`**
Multipart upload: `audio_checkin` (binary, ≤ 30s), `energy_score` (int), `hrv_ms` (int), `sleep_seconds` (int).

Server-side pipeline:
```
1. Groq whisper-large-v3  →  text transcript
   Audio discarded immediately after transcription — not stored

2. llama-3.3-70b-versatile  →  8-stream JSON extraction
   With 20 few-shot prompts from /prompts/somatic-cot-v1.0.json
   8 dimensions: NUTRITION, MENTAL_HEALTH, ACTIVITY, PHYSIQUE,
                 WORK, SOCIAL, CREATIVE, SELF_CARE

3. Confidence gate:
   confidence = avg token log-probability per dimension
   ≥ 0.75  →  write to somatic_dimensions_log
   < 0.75  →  return as low_confidence_flags[], prompt user to verify

4. High-signal dimensions (e.g. MENTAL_HEALTH.burnout_risk_index > 0.80)
   may adjust Energy Score by ±10 before shield proposal finalizes
```

**Few-Shot Prompt Library** (`server/prompts/somatic-cot-v1.0.json`)
20 annotated examples covering: subjective-vs-biometric mismatches, technical symptom language, post-social recovery fatigue (Arjun's post-family-gathering scenario), timezone-bleed exhaustion (late-night US stakeholder calls).

**Rate-Limit Guard**
Voice calls counted separately from text calls. Capped at 1 voice ingest per user per day. Whisper free tier: ~30 req/min — queued for > 30 concurrent users.

### Verification (`scripts/verify_phase6.mjs`)
```
✓ High-fatigue fixture audio  →  correct MENTAL_HEALTH + ACTIVITY dimensions
✓ Low-confidence dimension    →  blocked from DB write, flagged in response
✓ Energy Score augmentation   →  shifts score correctly for high burnout-risk input
✓ Audio not persisted server-side  →  confirmed via log inspection
✓ Rate-limit: 31st concurrent voice request queues correctly
```

### Phase Exit Criteria
Voice pipeline processes a real audio check-in end-to-end in < 3 seconds. Confidence gate fires at least once across 10 real test inputs. Engineer confirms no audio retained server-side.

---

## Phase 7 — Hardening & Closed Beta
*Weeks 12–14 · 10-user private beta, security audit, Week 15 keep/kill*

### Goal
Make Ebb safe to put in front of 10 real users. Verify every edge case from `edge-case.md`. Ship the security audit. Run the beta. Get to Week 15 with clean data.

### What Gets Built

**Security Audit**
- Automated payload inspection: every outbound `POST` body scanned against `BIOMETRIC_FIELDS = ['hrv_ms', 'sleep_duration_seconds', 'resting_heart_rate', 'subjective_alertness']`. Any match → build fails.
- Groq API key absent from React Native bundle: confirmed via `react-native-bundle-visualizer` + grep.
- OAuth tokens: confirm all tokens encrypted in SQLite; confirm refresh tokens not logged anywhere.
- SQLCipher parameters confirmed: N=32768, r=8, p=1. Document key rotation procedure.
- Prompt injection: fuzz `somatic/ingest` with adversarial audio transcripts. Confirm no calendar data or event titles reach the LLM payload.

**Coding Standards Enforcement**
- `sanitizeCalendarEvent()` utility applied at every DB write boundary. Strips `summary`, `description`, `location` before storage.
- ESLint rule: no `any` in TypeScript. Zod validation on every Groq response shape before use.
- No raw SQL outside `packages/core/db/` repository layer. All queries use prepared statements.

**Google OAuth Verification**
- Privacy policy published (covers biometric data handling, confirms no cloud storage of raw signals)
- Submit for Google's OAuth app verification (required for `calendar.events` write scope in production)
- Prepare for Google security assessment if triggered by sensitive scope review

**Outlook Calendar Scaffold**
Implement `CalendarProvider` interface. `GoogleCalendarProvider` becomes the first implementation. `OutlookCalendarProvider` stub created — auth scaffolded, mutations stubbed. Unblocks v2 Microsoft 365 support without touching scheduling logic.

**Beta Cohort (10 Users)**
- Criteria: engineers or PMs at startups, already using Oura or Apple Watch, iOS device
- Recruitment: 5 Oura users, 5 Apple Health users
- 15-minute onboarding call per user
- Async Slack channel `#ebb-beta` for feedback
- No structured interviews until Week 15
- No new features shipped during beta — bug fixes only

**Instrumentation**
All analytics are aggregate counts — no biometrics, no event content, no notification copy logged server-side:
```sql
-- Logged per shield session (anonymized user hash):
-- shield_proposed, decision (APPROVED/DECLINED/EXPIRED),
-- gcal_mutation_success, notification_delivered
```
Daily Groq request counts logged separately and compared against free tier ceiling.

**48-Hour Clean Run**
Before opening beta to users: uninterrupted 48-hour autonomous run on the engineer's own device, all edge cases from `edge-case.md` sections 1–3 confirmed handled gracefully.

### Week 15 — Keep or Kill

| Metric | Keep | Kill |
|---|---|---|
| Shield Adherence Rate (30-day) | > 60% | < 35% |
| Day-7 Retention | > 65% | < 40% |
| Notification Open Rate (within 1 hr) | > 55% | < 30% |
| GCal mutation success rate | > 90% | < 75% |
| Groq free tier — daily ceiling hit? | No | Repeatedly |

**If keep thresholds are met**: open waitlist, begin Luna Ring integration, scope mid-day rebuild, plan Groq paid tier upgrade.

**If kill thresholds are hit on adherence or retention**: run 5 exit interviews before deciding anything. The most likely failure mode is proposal quality (wrong block chosen, wrong target time) — a scheduling rules fix, not a product pivot. Confirm the diagnosis before acting.

---

## Coding Standards

| Standard | Rule |
|---|---|
| **No event titles in logs or prompts** | `sanitizeCalendarEvent()` strips `summary`, `description`, `location` at every DB write and Groq call boundary |
| **Biometric field blocklist** | `BIOMETRIC_FIELDS` constant. Automated test confirms no match in any outbound HTTP body |
| **Prompt versioning** | All Groq prompts in `/server/prompts/` with semver filenames. Version logged in every `shield_decisions_log` entry. Never edit in place. |
| **TypeScript strict mode** | `"strict": true`. No `any`. All Groq response shapes validated with Zod before use. |
| **SQLite writes** | `better-sqlite3` is synchronous. All writes via typed repository functions in `packages/core/db/`. No raw SQL outside the repository layer. |
| **No auto-send** | Slack draft is always queued locally, never sent without a 1-tap approval. Automated test confirms no Slack API `POST` is made without a `user_decision = 'APPROVED'` log entry. |
