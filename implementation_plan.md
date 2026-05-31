# Implementation Plan: Ebb MVP
*1 Engineer · 12 Weeks · Prove the core idea is real*

---

## The Question This Plan Answers

One engineer. Twelve weeks. What do you cut, what do you keep, and what do you measure on Week 13 to know whether to continue or kill it?

The core idea is a single sentence: **read how someone feels, look at their calendar, move one thing, do it automatically**. Everything in this plan exists to prove that sentence works on real users. Everything not in this plan was cut because it doesn't prove that sentence — it only makes it prettier or broader.

---

## Scope Decisions

Every feature below is real, valuable, and on the roadmap. Each one is deliberately scheduled after Week 12 — not because it isn't worth building, but because shipping it before the core loop is validated would be building on an unproven foundation.

| Feature | When | Why it waits |
|---|---|---|
| Voice check-in ("Vent-to-Adjust") | v2, post-PMF | The slider validates the same input loop at a fraction of the pipeline complexity. Voice makes it richer once we know the loop works. |
| Luna Ring integration | v2, India launch | Oura + Apple Health covers the beta cohort. Luna Ring unlocks the Indian market — a deliberate second wave, not an oversight. |
| Somatic CoT / 8-stream dimensions | v2, with voice | Unlocks the full depth of what Ebb can sense. Lands when the voice pipeline does. |
| Mid-day rebuild | v1.5 | The 8:30 AM intervention is the hypothesis to prove. Once adherence is confirmed, extending to mid-day is the natural next depth. |
| Tauri desktop tray widget | v1.5 | iOS proves the interaction model. Desktop becomes the power-user surface once mobile is validated. |
| Outlook / Microsoft 365 | v2 | Unlocks enterprise and non-Google users. Scaffolded from Week 1 so adding it later is a configuration change, not a rewrite. |
| Comfort-bias / gaming detector | v2 | Needs 30+ days of behavioral data per user to fire meaningfully. A Week 12 feature by definition. |
| Team scheduling | v3 | The product earns the right to coordinate teams after it has proven it works for individuals. |
| Week-in-review email | v1.5 | A Day 30+ retention driver. Designed now, shipped when the first cohort reaches that milestone. |

---

## What Stays

The smallest version of Ebb that still proves the core idea requires exactly five things to work together:

1. **An energy signal** — Oura OAuth or Apple Health. Slider as fallback. Produces a 0–100 Energy Score on-device each morning.
2. **A calendar read** — Google Calendar API. Reads the next 8 hours. Classifies events as LOCKED or RESCHEDULABLE. Identifies the highest-complexity solo block.
3. **A proposal** — If Energy Score < 45, propose shifting the top RESCHEDULABLE block and injecting a 30-min recovery buffer after the next locked meeting.
4. **A notification** — 8:30 AM iOS push. Groq-generated copy. Two buttons: Yes, Shield Me / No, Push Through.
5. **An action** — On approval, GCal mutates. Slack draft queued for 1-tap send. CAS recalculates.

If all five work together on a real user's real Tuesday morning, the core idea is proven. The rest is optimization.

---

## 12-Week Build Schedule

### Weeks 1–2 — Foundation

Everything that must exist before anything else can be built.

- Node.js / Fastify backend with TypeScript. All planned route stubs in place.
- SQLite with SQLCipher (AES-256-GCM). Four tables: `user_profiles`, `biometrics_log`, `calendar_cache`, `shield_decisions_log`. Indexes applied.
- Google Calendar OAuth 2.0 — auth flow, token exchange, encrypted token storage, auto-refresh worker.
- Oura OAuth — same pattern. Token stored alongside GCal token.
- Morning Slider fallback endpoint — accepts `{ subjective_alertness: 1–5, sleep_hours: float }`, writes to `biometrics_log`.

**Done when**: OAuth round-trips complete for both GCal and Oura on a test account. DB survives a process restart with data intact.

---

### Weeks 3–4 — Biometric Ingestion & Energy Score

- 8:00 AM local cron fires. Pulls overnight HRV + sleep + resting HR from Oura. Writes raw values to `biometrics_log`. Raw values never leave the device.
- Apple HealthKit background fetch (iOS). Normalizes to the same `BiometricSnapshot` schema as Oura.
- Energy Score computed on-device:
  ```
  score = (hrv_delta × 0.40) + (sleep_score × 0.35) + (slider × 0.25)
  ```
  Each component normalized 0–100 against the user's rolling 30-day baseline. Result written to `biometrics_log.energy_score`.
- Cold-start: users with < 7 days of data use population baseline (HRV 42ms, confidence 0.60). Confidence rises to 1.0 at Day 14. Score surfaced with a "still learning your baseline" qualifier.
- GCal API polled at most twice daily (8 AM, 1 PM). Tokens and last-pull timestamps cached locally to avoid redundant calls.

**Done when**: Energy Score computes correctly for three fixture scenarios (high / moderate / low biometrics) without internet if wearable data is cached.

---

### Weeks 5–6 — Scheduling Engine

The core algorithmic brain. No LLM. Pure rules.

- GCal event fetch at 8:00 AM — `GET /calendar/v3/events` for next 8 hours. Stored in `calendar_cache`. Reads only: start, end, attendee count, organizer domain. **Event titles never read or stored.**
- Event classifier:
  ```
  LOCKED         if attendee_count ≥ 3
                 OR external attendee domain detected
                 OR user tagged locked during onboarding
  RESCHEDULABLE  otherwise
  ```
- Scheduling rules:
  - If Energy Score < 45 and a RESCHEDULABLE HIGH-complexity block exists → propose shifting it to next-day 9 AM.
  - If Energy Score < 45 and a LOCKED meeting with ≥ 3 attendees exists → propose a 30-min Zero-Stimulus Buffer after it ends.
- CAS projection — calculate `cas_unshielded` and `cas_shielded` without applying mutations. Used in the notification to show the before/after score.
- Write proposed actions to `shield_decisions_log` as `PENDING`.

**Done when**: Three fixture calendars (mixed LOCKED/RESCHEDULABLE, all-LOCKED, all-RESCHEDULABLE) produce the correct `proposed_actions[]` arrays. Engineer reviews 3 real-morning proposals on their own calendar and finds them sensible.

---

### Weeks 7–8 — Groq LLM Layer

Translate the scheduling engine's structured output into a human notification. All Groq, free tier.

- Groq SDK integrated. Single `GroqClient` wrapper with exponential backoff (max 3 retries) and daily request counter against free tier limits.
- `POST /api/v1/notify/generate` — sends `{ energy_score, wearable_readable, proposed_shift_description }` to `llama-3.1-8b-instant`. Returns notification copy in < 200ms. **No raw biometrics, no event titles in the prompt.**
- Slack draft generation — same endpoint, separate call to `llama-3.1-8b-instant`. Returns a one-sentence draft. Stored locally; never auto-sent.
- All system prompts versioned in `/prompts/`. Prompt changes require a version bump. Version logged in `shield_decisions_log` for debugging.
- Free tier guardrail: middleware tracks rolling request count. If approaching limit, notification copy calls queue; a cached fallback template fires if queue wait exceeds 5 seconds.

Sample notification output:
> *"HRV low (24ms). Moving your Spec Drafting to tomorrow morning and adding a 30-min buffer after your Architecture Review. Approve?"*

**Done when**: Notification copy is generated end-to-end in < 500ms. Engineer rates 8/10 of 10 real-morning outputs as copy they'd act on.

---

### Week 9 — iOS Push Notification & Approval Flow

The moment the product becomes real.

- APNs integration. Lock-screen notification delivers `notification_copy` at 8:30 AM with two actionable buttons: **Yes, Shield Me** and **No, Push Through**.
- Lock-screen approval — triggers GCal mutation without requiring the user to open the app.
- On approval: client executes `PATCH /calendar/v3/events` directly using locally cached OAuth token. Async, non-blocking. UI confirms immediately; mutation settles in background.
- `shield_decisions_log` updated to `APPROVED` or `DECLINED`. CAS recalculates and is stored.
- Slack draft surfaces in-app immediately after approval — one card, two buttons: **Send** and **Edit**. Never auto-sent.

**Done when**: Lock-screen approval correctly mutates GCal on the engineer's own calendar within 60 seconds of tapping. Declining correctly logs the override with no calendar changes.

---

### Week 10 — Onboarding

Three screens. Under 4 minutes. No tutorial.

1. **Connect Calendar** — GCal OAuth. One button. Two taps.
2. **Connect Energy Source** — Oura OAuth, Apple Health permission, or "Use morning slider." All three paths work. No wearable required.
3. **Tag Your Blocks** — simplified day view. User taps which events are flexible. Locked events (≥ 3 attendees) are pre-classified and shown as such. User only touches the ambiguous ones.

No notifications fire until all three screens are complete. Onboarding state tracked in `user_profiles`.

**Done when**: A fresh install on a test device completes onboarding and receives its first real shield proposal the following morning.

---

### Week 11 — Testing & Edge Cases

No new features. Only hardening.

- What happens if Oura API is down at 8 AM? → Fall back to yesterday's cached score. Notification fires with "Using yesterday's baseline."
- What happens if GCal returns no RESCHEDULABLE events? → No shield proposed. Notification says "Your schedule looks protected today. CAS: [score]."
- What happens if the user has no internet at 8:30 AM? → Notification queued for next connection.
- What happens if the user taps Yes but GCal mutation fails? → Retry 3× async. If all fail, surface an in-app alert with a manual reschedule link.
- Confirm no raw biometric values appear in any outbound HTTP payload. Automated test inspects all `POST` bodies against a biometric field blocklist.
- Groq API key confirmed absent from the client bundle.

**Done when**: All edge cases handled gracefully. No crash on any failure path. 48-hour uninterrupted run on engineer's own setup.

---

### Week 12 — 10-User Private Beta

Not a public launch. A structured test with real users doing real work.

- Recruit 10 users from Segment A: engineers and PMs at startups, already using Oura or Apple Watch.
- Async Slack channel for feedback. No structured interviews until Week 13.
- Each user gets a 15-minute onboarding call. After that, the product runs itself.
- Engineer monitors: notification delivery rate, approval rate, GCal mutation success rate, Groq request counts vs. free tier limits.
- No new features shipped during this week. Only critical bug fixes.

---

## Week 13 — Keep or Kill

Three numbers. That's it.

| Metric | What It Tells You | Keep | Kill |
|---|---|---|---|
| **Shield Adherence Rate** (% of proposals approved and not manually overridden within 24hrs) | Whether the proposals are trusted and accurate | > 60% | < 35% |
| **Day-7 Retention** (% of beta users who received and acted on a shield in their first 7 days) | Whether structural habit is forming before motivation wears off | > 65% | < 40% |
| **Override Recovery Rate** (% of users who declined a shield and then approved the next one) | Whether a decline is healthy disagreement or the start of abandonment | > 50% | < 25% |

**If keep thresholds are met**: open a waitlist, add Luna Ring + voice pipeline, scope Team plan.

**If kill thresholds are hit**: run 5 user exit interviews before deciding anything. The most likely failure mode is not the core loop — it's the proposal quality. If users consistently decline because the proposals are wrong (wrong block chosen, wrong timing), that is a calibration problem, not a product problem. Fix the scheduling rules and re-run beta before killing.

**The question Week 13 actually answers**: Did Ebb earn enough trust that real users let it touch their calendar? If yes, everything else is execution. If no, find out exactly why before spending another week.
