# Ebb: The Energy-Aware Calendar Shield
**Written Walkthrough — PM Assignment Submission**

---

## 1. The User and the Moment

**Who**: Anya Sharma, 29. Staff AI Engineer at a 150-person scale-up in San Francisco. $195K base. Oura Ring Gen 3. Google Calendar back-to-back from 10 AM most days. She owns her schedule — nobody is assigning her hours — but she has no tool that helps her use that ownership intelligently.

**Her Tuesday Morning**

7:15 AM: Alarm. Finds a clump of hair on her pillow — third time this week. Oura app: HRV 24ms (her baseline is 42ms). She closes the app. There is nothing to do with that number.

8:15 AM: Forces herself onto the Peloton. Stops after 10 minutes, lightheaded. Third coffee.

8:30 AM: Opens her calendar. Architecture Review at 10 AM, 20 people. Then a 2-hour solo Spec Drafting block. Then her 1:1. She stares at it. She knows she has no capacity for the spec work. She doesn't cancel anything because she doesn't know what's "allowed" to move. Guilt sets in before 9 AM.

11:30 AM: Architecture Review ends. Opens the spec doc. Types 40 words. Stares at the screen.

2:00 PM: Energy crashes. Fourth coffee. The spec has 200 words.

**Why she installs Ebb**: The landing page shows one scenario — a low-HRV Tuesday morning, a back-to-back calendar, and a notification that says: *"HRV low (24ms). Moving Spec Drafting to tomorrow morning. Adding a recovery buffer after your Architecture Review. Approve?"* She reads this and thinks: *that is my Tuesday.* She downloads it.

**What she uses today**: Oura (tells her she's tired, offers no action), Google Calendar (treats every hour identically), Reclaim.ai (protects the same hours regardless of her biometric state), Slack (bleeds into every focus block), caffeine.

---

## 2. The Product

Ebb is a calendar-integrated morning assistant. It reads biometric data from a wearable (or a 5-second manual slider), cross-references it with the next 8 hours of calendar events, and proposes one concrete schedule change — delivered as a lock-screen notification at 8:30 AM requiring a single tap to approve.

**It is not** a wellness dashboard, a habit tracker, or a data visualisation tool. It is a calendar mutation agent that closes the loop from body → schedule → action.

**The one interaction that defines the product**: The 8:30 AM lock-screen notification. Every other feature is scaffolding for this moment. It's the only interaction in any product category where software says: *"I know how you feel right now. Here is what I am doing about it. Approve?"*

**What data it uses and how it gets it**:

| Data | Source | Collection |
|---|---|---|
| HRV, sleep duration, resting HR | Oura Ring / Apple Health | OAuth pull at 8:00 AM — passive, zero user action |
| Calendar events (timing, attendee count only — never titles) | Google Calendar API | OAuth read at 8:00 AM — passive |
| Subjective energy (1–5 scale) | Morning slider | 5-second tap if no wearable connected |

**Active vs. passive — where the line is drawn**:

Everything that can be sensed passively is sensed passively. The only active input required daily is a single Yes/No tap on the shield notification. The slider is a fallback for wearable-free users, not a required daily ritual. This line is the most important design decision in this space: every wellness product that demands daily logging has already lost by Day 7.

**What happens automatically after approval**: Google Calendar executes the shift. A Slack message is drafted and queued for a 1-tap send (never auto-sent — always user-controlled). The CAS score recalculates and appears in the menu bar.

---

## 3. The Hero Metric — Cognitive Alignment Score (CAS)

**The number Anya sees every day**: CAS — the percentage of her controllable working hours where high-complexity tasks landed in high-energy windows, and low-complexity tasks landed in slump windows.

$$\text{CAS} = \frac{\text{Focus time in peak windows} + \text{Admin time in slump windows}}{\text{Total controllable hours}} \times 100$$

Multi-person locked meetings are excluded from the denominator — CAS only measures what she controls.

**Why CAS and not something else**:
- Sleep score is retrospective and unactionable
- Step count measures activity, not cognitive quality
- Tasks completed ignores whether they were the right tasks at the right time
- CAS measures *scheduling intelligence* — the exact thing Ebb controls

**Good day**: CAS ≥ 75. Her spec work landed in the 9–11 AM peak. The post-meeting buffer absorbed the crash. She did not execute complex work during a slump.

**Bad day**: CAS < 50. She overrode the shield. Ebb shows one line: *"Today's override cost ~2 hours of productive output. Tomorrow's schedule is pre-adjusted."*

**What goes wrong if she games it**: If Anya shields every high-complexity block to maintain a high CAS, she delays critical work without consequence. Mitigation: if CAS stays above 90% for 7 consecutive days while task completion rate falls below 50%, Ebb surfaces a velocity override warning. Locked multi-person meetings are also excluded from CAS — she cannot inflate the score by simply accepting all shields and skipping everything she owns.

*Note: Shield Adherence Rate — the percentage of approved shields not manually overridden within 24 hours — is Ebb's North Star business metric (target: >70%). Anya never sees this number. CAS is what she sees.*

---

## 4. The Retention Problem

Most wellness and productivity apps lose >80% of users by Day 10. The pattern: install on a motivated Sunday, open twice, forget.

**Why Ebb doesn't die this way**: Structural dependency, not motivational engagement.

By Day 14, Ebb has silently moved 8–10 calendar blocks Anya would have had to drag manually. It has drafted 4–6 Slack messages she would have had to write. It has protected ~6–8 hours of peak focus time from admin bleed. The product has been doing administrative work she would otherwise do herself.

The retention mechanism is not habit, streak, or gamification. It is the **cost of removal**. When Anya tries to uninstall Ebb, she does not lose a wellness score — she gains a to-do list. She has to reschedule blocks herself, draft manager updates herself, and manually identify which hours to protect. That overhead is the lock-in.

This is utility retention, not engagement retention. The same reason she doesn't uninstall Google Calendar.

---

## 5. What We Would Build First

**1 engineer. 12 weeks. The smallest version that proves the core idea is real.**

**The core idea is one sentence**: read how someone feels, look at their calendar, move one block, do it automatically.

Proving that sentence on a real user's real Tuesday is the entire goal of v1.

**What stays**:
- Oura OAuth pull + Apple Health + morning slider fallback → Energy Score computed on-device
- Google Calendar read (attendee count, timing only — never event titles)
- LOCKED / RESCHEDULABLE classifier + single-block shift proposal + recovery buffer injection
- Groq `llama-3.1-8b-instant` for notification copy generation (free tier)
- iOS push notification with lock-screen Yes/No
- GCal mutation executed client-side on approval
- Slack draft queued for 1-tap send
- CAS recalculation and menu bar widget
- 3-screen onboarding: connect calendar → connect energy source → tag flexible blocks

**What waits**:

| Feature | When | Why it waits |
|---|---|---|
| Voice check-in ("Vent-to-Adjust") | v2 | The slider proves the input loop at a fraction of the pipeline complexity |
| Luna Ring integration | v2, India launch | Oura + Apple Health covers the beta cohort |
| Mid-day rebuild | v1.5 | Prove the 8:30 AM intervention first; mid-day is an extension of a proven hypothesis |
| Tauri desktop tray widget | v1.5 | iOS proves the interaction model; desktop is a distribution layer |
| Outlook / Microsoft 365 | v2 | One calendar provider for PMF; Outlook scaffolded from Phase 3 |
| Team scheduling | v3 | Individual PMF before coordinating across teams |

**Week 13 — keep or kill**:

| Metric | Keep | Kill |
|---|---|---|
| Shield Adherence Rate (30-day) | > 60% | < 35% |
| Day-7 Retention | > 65% | < 40% |
| Notification Open Rate (within 1 hr) | > 55% | < 30% |

If kill thresholds are hit on adherence or retention: run 5 exit interviews before deciding anything. The most likely failure mode is not the product concept — it's proposal quality (wrong block chosen, wrong target time). That is a scheduling rules fix, not a pivot.

---

## 6. Market Sizing & Business Model

**Top-down guesstimate**:
- Global knowledge workers: ~1.1B (OECD)
- Subset with wearable + calendar: ~400M
- Experiencing chronic energy/schedule misalignment: ~200M
- Willing to pay for a productivity tool: ~40M SAM globally
- Segment A (high-output ICs at startups): ~30M — highest pain, highest WTP

**Year 1–2 target**: 300K users. ARPU $18/month. ARR: ~$64.8M at full capture; realistic Year 1 target: $1M ARR.

**Pricing**:
- Free: 1 shield per day, slider only, no Slack integration
- Pro ($18/month): full wearable sync, unlimited shields, Slack draft, CAS trends, mid-day nudge
- Team ($12/seat, 5-seat min): Pro features + team energy-aware scheduling

**Free → Pro conversion trigger**: The user hits the 1-shield daily limit on a bad-energy day. That is exactly when motivation to pay is highest.

---

## 7. ICE Prioritization & Risk

**Why this solution over alternatives**:

| Solution | Impact | Confidence | Ease | ICE Score |
|---|---|---|---|---|
| **A. Energy-aware calendar shield (Ebb)** | 9 | 8 | 7 | **504** |
| B. Somatic dashboard — 8-stream tracking | 7 | 5 | 3 | 105 |
| C. AI task prioritizer (no calendar write) | 6 | 6 | 6 | 216 |

Option A wins because it closes the action gap — it doesn't inform, it intervenes. Option B dies from logging fatigue. Option C stops short of the calendar, which is the only surface that actually changes Anya's day.

**Top risks**:

| Risk | Severity | Mitigation |
|---|---|---|
| Calendar mutation breaks trust (wrong block moved) | 🔴 Critical | All mutations require explicit Yes tap; user tags flexible vs. locked during onboarding; recurring events are always LOCKED |
| Logging fatigue kills retention | 🔴 Critical | MVP cuts all logging except the 5-second slider fallback; wearable is the primary signal |
| LLM cost per user exceeds ARPU | 🟡 High | All LLMs on Groq free tier; fallback template fires if rate limit is hit; voice gated behind Pro |
| Reclaim.ai / Motion adds energy awareness | 🟡 High | Move fast on voice + somatic parsing layer — that is the defensible moat; file method patent |

---

*Document Version: 3.0 — June 2026*
*Submission Walkthrough — Ebb PM Assignment*
