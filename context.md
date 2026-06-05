# Ebb — Product Strategy & Context Document

---

## 0. Existing Landscape: Daily Energy Coach Solutions

Before designing Ebb, it is worth mapping what already exists — and where each solution stops short.

| Product | What It Does | What It Misses |
|---|---|---|
| **Oura / Whoop / Luna Ring** | Tracks HRV, sleep, readiness. Gives a daily score. | Retrospective only. Shows you how depleted you are; never tells you what to do about it. No calendar or schedule integration. |
| **Reclaim.ai / Motion** | Auto-schedules tasks and focus blocks in your calendar. | Zero energy awareness. Protects the same hours regardless of whether you slept 4 hours or 9. A rested Monday and a crashed Friday look identical. |
| **Calm / Headspace** | Guided meditation, sleep content, stress reduction. | Passive content consumption. Requires user to remember to open it. No connection to actual workday structure. |
| **Apple Health / Google Fit** | Aggregates biometric data from multiple sources. | A data warehouse with no decision layer. Shows charts; makes no recommendations. |
| **Notion / Todoist AI** | AI-assisted task management and prioritization. | Task-aware but body-blind. Suggests what to do next with no knowledge of whether the user has energy to do it. |
| **Rise Science** | Circadian rhythm tracking; predicts peak and dip windows based on sleep timing. | Prediction without action. Tells you "your peak is 9–11 AM" but doesn't protect that window or respond to today's actual biometric state. |

**The Gap Ebb Closes**: Every existing solution either (a) gives you data without action, or (b) takes action without knowing your biological state. No product closes the loop from body → schedule → calendar change → social communication. That is Ebb's singular position.

### Competitive Positioning Map

The two axes that matter in this space are **Personalization** (how well the product understands *your* specific body and schedule) and **Action Orientation** (whether the product reacts to data after the fact, or proactively intervenes before the damage is done).

```
                    HIGH PERSONALIZATION
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          │  ★ EBB          │  Oura /         │
          │  Body → Calendar│  Luna Ring      │
          │  Action (MVP)   │                 │
          │                 │  Whoop          │
          │  Rise Science   │                 │
          │  (predicts but  │                 │
          │  doesn't act)   │                 │
          │                 │                 │
PROACTIVE ├─────────────────┼─────────────────┤ REACTIVE
          │                 │                 │
          │  Reclaim.ai /   │                 │
          │  Motion         │                 │
          │  (body-blind    │                 │
          │  scheduling)    │                 │
          │                 │                 │
          │  Calm /         │                 │
          │  Headspace      │                 │
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                    LOW PERSONALIZATION / GENERIC
```

Ebb is the only product in the top-left quadrant: highly personalized (reads your actual biometrics and calendar) and proactive (acts before the crash, not after). Rise Science comes closest on personalization but stops at prediction — it never touches your schedule. Reclaim.ai/Motion are proactive but know nothing about your body. Oura and Whoop know your body but are purely reactive dashboards. The top-left is unoccupied. That is Ebb's position.

---

## 1. Guesstimate: Who Is This Product For?

**The Problem in One Line**: Knowledge workers have access to more self-data than any generation in history, yet none of it tells them what to do *right now* to feel better and perform better.

### Top-Down Market Sizing

| Layer | Estimate | Source / Logic |
|---|---|---|
| Global workforce | ~3.5B workers | ILO 2024 |
| Knowledge workers (desk-based, cognitive output) | ~1.1B (≈30%) | OECD estimates |
| Subset with a smartphone + wearable or calendar app | ~400M | ~35% wearable penetration in this cohort |
| Subset experiencing chronic energy/productivity misalignment | ~200M | 50% report persistent fatigue; Microsoft Work Trend Index 2023 |
| Addressable early adopters (willing to pay for a productivity tool) | ~40M | ~20% willing-to-pay rate in productivity SaaS |

**Total Serviceable Addressable Market (SAM): ~40M users globally**

### Segmentation of the 200M

| Segment | Size | Pain Intensity | Willingness to Pay | Tech Fluency |
|---|---|---|---|---|
| A. High-output individual contributors (engineers, PMs, analysts, lawyers) at startups/scaleups | ~30M | 🔴 Very High | 🟢 High ($15–25/mo) | 🟢 High |
| B. Mid-level managers at enterprise (chronic meeting overload) | ~50M | 🟡 High | 🟡 Medium | 🟡 Medium |
| C. Freelancers / solopreneurs (no HR wellness support) | ~40M | 🟡 High | 🟡 Medium | 🟢 High |
| D. Remote workers post-pandemic (schedule/timezone bleed) | ~50M | 🟡 Medium | 🔴 Low | 🟡 Medium |
| E. Healthcare / shift workers | ~30M | 🔴 High | 🟡 Medium | 🔴 Low |

**Chosen Segment: Segment A — High-output individual contributors at startups and scaleups.**

**Why Segment A?**
- Highest pain intensity + highest willingness to pay = fastest path to revenue
- Already using productivity tools (Linear, Notion, Figma, Slack), so integration surface exists
- Suffer public, visible burnout cycles — word of mouth travels fast in this community
- They own their own schedules enough to act on recommendations; managers don't control their every block

---

## 2. Market Potential & User Personas

### Market Potential (Segment A)

| Metric | Value |
|---|---|
| SAM (Segment A) | ~30M globally |
| SOM (Year 1–2 realistic capture, English-speaking markets) | ~300K users |
| ARPU (monthly subscription) | $18/month |
| SOM ARR at 300K users | ~$64.8M |

The productivity SaaS market is $96B and growing at 13% CAGR. The wellness + productivity intersection is largely uncaptured by any single tool — the gap is real and the timing is right (post-pandemic energy crisis, wearable ubiquity, LLM cost falling to near-zero).

### User Persona 1: Anya, 29

| Attribute | Detail |
|---|---|
| **Name** | Anya Sharma |
| **Age** | 29 |
| **Role** | Staff AI Engineer, scaling startup, San Francisco |
| **Income** | $195K base + equity |
| **Devices** | MacBook Pro, iPhone 15, Oura Ring Gen 3 |
| **Tools** | Google Calendar, Linear, Slack, Notion, VS Code |
| **Gym** | Gym membership near office |

**Her Tuesday Morning (Verbatim Reality)**

> 7:15 AM: Alarm. Feels groggy. Checks Slack in bed — 23 messages since last night.
> 7:45 AM: Skips breakfast, makes coffee. Oura app says HRV is 24ms (below her 42ms baseline). She closes the app. There's nothing she can do with that number.
> 8:30 AM: Opens Google Calendar. Back-to-back: 10 AM Architecture Review (20 people), then a 2-hour solo Spec Drafting block, then 1:1 with manager.
> 8:35 AM: Feels dread. Knows she has no capacity for the spec work. Doesn't cancel anything because she doesn't know what's "allowed" to move.
> 9:00 AM: Third coffee. Opens Linear. Opens Figma. Closes both. Opens Twitter.
> 11:30 AM: Architecture Review ends. Exhausted. Opens the spec doc. Types 40 words. Stares at screen.
> 2:00 PM: Energy crashes. Fourth coffee. Spec doc has 200 words.
> 6:30 PM: Leaves office wired and depleted. Can't sleep until 1 AM.

**Her Goals**
- Deliver high-quality engineering output without sacrificing physical health
- Stop the cycle of cortisol-driven work and resulting somatic symptoms (skin breakouts, hair shedding, fatigue)
- Feel in control of her schedule without the guilt of "not doing enough"

**Her Frustrations**
- Wearables tell her she's tired but never tell her what to do about it
- Calendar treats every hour the same regardless of her biology
- Wellness apps require too much logging; she forgets by day 3
- No tool connects her energy state to her actual work schedule

**Her Quote**
> "I feel like a machine that's running out of battery with no charger in sight and a task list that keeps growing."

---

### User Persona 2: Arjun, 31

| Attribute | Detail |
|---|---|
| **Name** | Arjun Nair |
| **Age** | 31 |
| **Role** | Product Manager, scaling B2B SaaS startup, Bengaluru |
| **Income** | ₹28L CTC + ESOP |
| **Devices** | MacBook Air, OnePlus 12, Luna Ring (₹25,000 — bought because Oura doesn't ship to India reliably) |
| **Tools** | Google Calendar, Jira, Slack, Notion |
| **Context** | Works across IST + PST time zones; has US stakeholder calls at 9–11 PM IST regularly |

**A Note on Luna Ring**: Luna Ring is priced at ~$300 in the US and ~₹25,000 in India, making it one of the few biometric-grade sleep and HRV trackers accessible in the Indian market without import complexity. For Arjun's cohort — tech PMs at funded startups in Bengaluru, Hyderabad, and Pune — it is the realistic wearable. Ebb must treat Luna Ring's API on equal footing with Oura.

**His Wednesday Morning (Verbatim Reality)**

> 10:30 PM (Tuesday night): Extended family gathering — cousin's engagement. Attended out of obligation. Ate late, had 3 drinks.
> 12:30 AM: Gets home. Luna Ring app shows elevated resting HR (88 bpm vs. his 62 bpm baseline). HRV: 19ms (baseline: 38ms). He ignores it.
> 6:30 AM: Alarm. Feels wrecked. Checks Slack — 12 messages from US team overnight. One is a founder asking for a revised PRD by noon IST.
> 6:45 AM: Despite feeling rough, opens his workout app. Decides to push through a 45-minute gym session because "missing it will make me feel worse."
> 7:50 AM: Returns from gym more depleted than before. Luna app flags: "Recovery 18%. Intense activity not recommended." He reads it after the gym.
> 8:30 AM: Opens Google Calendar. 10 AM all-hands (30 people, CTO presenting). 11 AM product sync (his facilitation). Noon: PRD deadline. 2 PM: US stakeholder call.
> 9:00 AM: Tries to write the PRD. Brain fog. Writes an introduction paragraph. Rewrites it twice. Gives up and scrolls Slack.
> 11:00 AM: Facilitates the product sync poorly — forgets two agenda items. Feels embarrassed.
> 12:30 PM: Sends a half-finished PRD with a note saying "sharing a draft, will refine today." Manager replies: "This reads like notes, not a PRD."
> 9:00 PM: US call. Is visibly tired on camera. Misses a critical decision point about the API spec.

**What Ebb Would Have Done**

At 8:00 AM, Luna Ring data syncs. Energy score: 22% (HRV 19ms, resting HR elevated, <6 hours sleep, post-alcohol recovery flag). Ebb sends:

> *"Recovery is very low (22%). You have a locked 10 AM All-Hands and a 2 PM US call. We recommend moving PRD writing to tomorrow morning and flagging the draft status to your manager now. Approve?"*
> `[ Yes, Shield Me ]` `[ No, Push Through ]`

Arjun taps Yes. Ebb shifts the PRD block to 9 AM Thursday, auto-drafts a Slack message to his manager: *"Flagging that I'll have the PRD finalized by tomorrow morning — sharing a clean draft then rather than a rough one today."* His CAS for the day: 61% — not great, but protected. He facilitates the product sync without the PRD pressure hanging over him.

**His Goals**
- Navigate late-night family and social obligations without destroying the next workday
- Stop the guilt spiral of "I should be more productive" on recovery days
- Deliver consistent PM output across time zones without burning out by age 33

**His Quote**
> "I can't skip family events — that's not Indian culture. But I also can't show up to work the next day like a zombie. I need something that handles the fallout automatically."

---

## 3. Problem Framework

### What Is the Problem?
Knowledge workers — specifically high-output individual contributors — experience a persistent mismatch between their biological energy capacity and the cognitive demands their schedule places on them. They wake up exhausted, schedule their hardest tasks at their worst hours, and compensate with caffeine, creating a feedback loop of degraded output, somatic stress symptoms, and eventual burnout.

### Why Address It Now?
- **Wearable ubiquity**: Oura, Apple Watch, Garmin, Whoop, Luna Ring — 35%+ of knowledge workers now carry biometric sensors. The data exists. No product connects it to scheduling.
- **LLM cost collapse**: Extracting intent and somatic signals from voice/text is now nearly free. This was not viable in 2020.
- **Post-pandemic normalization of remote/async work**: Calendar ownership has shifted to the individual. Workers now have more schedule flexibility than ever — but no tool to exploit it intelligently.
- **The burnout crisis is public**: Microsoft Work Trend Index 2023 — 48% of employees report burnout. This is a documented, growing market pain.
- **Existing tools have all failed in the same predictable way**: Every wellness and productivity tool treats the data and the action as separate. No one has closed the loop.

### Who Is Facing This Problem?
Primary: Anya and Arjun — Staff IC engineers, product managers, analysts, and lawyers at startups and tech companies. 25–38 years old, earning $120K+ (or ₹20L+), high ownership over their schedule, already using 3+ productivity tools.

Secondary: Mid-level managers with 8+ meetings/day who have no buffer time and no tool that fights for their recovery windows.

### How Do We Know It's a Real Problem?
- Reddit r/productivity, r/cscareerquestions: Recurring threads about "afternoon crash productivity death", "I can't think after 3 PM but my calendar doesn't care"
- Oura, Whoop, Apple Health app store reviews: Top recurring complaint is "data with no action" — users want the app to *tell them what to do*, not just show charts
- Microsoft Work Trend Index 2023: 48% burnout, 68% say they don't have enough uninterrupted focus time
- Cal Newport's Deep Work framework and its 2M+ book sales demonstrate the market's appetite for cognitive energy management
- Calendly, Reclaim.ai, Motion — all $100M+ companies solving adjacents to this problem, validating willingness to pay for calendar automation

### What Is the Value Generated by Solving This Problem?
- **For Anya**: 2–3 recovered peak-focus hours per day, reduced somatic stress symptoms over 90 days, a sense of schedule control without manual overhead
- **For Arjun**: Recovery-aware scheduling that handles the cultural reality of late nights and social obligations without destroying the next workday
- **For the market**: A net-new category — the energy-aware calendar. Not wellness. Not productivity. The intersection.

---

## 4. What Are They Using Today?

| Tool | What They Use It For | Why It Fails Them |
|---|---|---|
| **Oura Ring / Luna Ring app** | Checking HRV, readiness, sleep scores | Retrospective only. Shows a score with no action attached. They close it and move on. |
| **Google Calendar** | Scheduling meetings, blocking focus time | Treats all hours as identical. Has no awareness of their biological state. |
| **Reclaim.ai** | Auto-protecting focus blocks | Protects time from meetings but has no energy signal — it blocks the same 2 hours regardless of whether they slept 4 hours or 8 hours. |
| **Slack** | Async communication | Bleeds into focus blocks constantly. No DND enforcement tied to energy. |
| **Notion** | Task management and spec writing | Passive capture tool. Doesn't tell them which task to do first based on energy. |
| **Headspace** | Occasional meditation | Used 2 weeks/month on average. Abandoned when work gets intense. |

**The Gap**: Every tool operates in isolation. Oura/Luna Ring knows they're exhausted. Google Calendar doesn't. Reclaim.ai protects hours but not the right hours. No tool speaks across this stack. Ebb does.

---

## 5. Translating the Problem into MVP & KPIs

### Business Outcome
Reach $1M ARR within 18 months post-launch, with a Day-30 retention rate above 60%, proving that Ebb creates genuine workflow dependency rather than novelty engagement.

### Product Outcome
At least 70% of users who receive a "Shield Me" proposal act on it (either approve or consciously reject it), and report feeling more in control of their schedule within the first 2 weeks.

### KPI Framework

| Type | Metric | Target |
|---|---|---|
| **Acquisition** | Signups from organic/referral | 60% of new users |
| **Activation** | Users who complete first morning check-in | >80% within Day 1 |
| **Engagement** | Daily "Shield Me" prompt open rate | >65% |
| **Retention** | Day-30 active users | >60% |
| **Revenue** | MRR growth MoM | >15% for first 6 months |
| **Product Health** | Shield Adherence Rate | >70% |

---

## 6. The Solution & Why We Chose It

### The Solution: Ebb

Ebb is a calendar-integrated morning assistant that reads biometric data (wearable or a 5-second manual slider), synthesizes it with the user's calendar, and proposes one concrete schedule shift to protect their energy — delivered as a single lock-screen notification at 8:30 AM requiring one tap to approve.

**It is not**: a wellness dashboard, a habit tracker, a journaling app, or a fitness tracker.
**It is**: an automated calendar defense agent that connects your body's state to your schedule in real-time.

### ICE Scoring: Why This Solution?

| Solution | Impact (1–10) | Confidence (1–10) | Ease (1–10) | ICE Score |
|---|---|---|---|---|
| **A. Energy-aware calendar shield (Ebb)** — morning check-in + single "Shield Me" nudge + calendar mutation | 9 | 8 | 7 | **504** |
| B. Full somatic dashboard — 8-stream tracking, charts, trends, habit logging | 7 | 5 | 3 | **105** |
| C. AI task prioritizer — reorders task list based on energy | 6 | 6 | 6 | **216** |

**Why Ebb (Option A) wins the ICE**:
- **Impact**: Directly solves the action gap — not "here is your data," but "here is what to do." Maximum impact on the stated problem.
- **Confidence**: Calendar integration + biometric input is technically validated (Reclaim.ai, Motion). Voice/LLM parsing is proven. The combination is new but each part is de-risked.
- **Ease**: Core MVP is a calendar API + sleep score + one notification. Can ship in 12 weeks with 1 engineer. Option B requires 40+ weeks and manual logging creates instant churn.

### Why Would Anya Install It?

She installs Ebb for one reason: the morning she reads the notification that says *"Your HRV is low. We moved your Spec Drafting to tomorrow morning and added a 30-min buffer after your Architecture Review. Approve?"* — and she taps yes, and the guilt evaporates — she is hooked. The install trigger is the promise of that moment. The value proposition landing page shows her exactly that scenario. She recognizes her Tuesday morning in it.

---

## 7. MVP Feature Set & MoSCoW Prioritization

### Feature List

| # | Feature | MoSCoW | Rationale |
|---|---|---|---|
| F1 | **Morning "Shield Me" notification** — 8:30 AM prompt with proposed calendar shift based on sleep/HRV | Must Have | The hero moment. The entire product revolves around this interaction. |
| F2 | **Wearable sync (Oura / Luna Ring / Apple Health)** with fallback 5-second morning slider | Must Have | Data source for F1. Slider fallback removes hardware dependency. |
| F3 | **Google Calendar integration** — read events, write recovery buffers, shift flexible blocks | Must Have | F1 is meaningless without the ability to actually mutate the calendar. |
| F4 | **Cognitive Alignment Score (CAS)** — single daily metric visible in menu bar widget | Must Have | The North Star metric. The one number the user sees every day. Creates habit, accountability, and is the anchor for all product decisions. |
| F5 | **Auto-draft Slack update to manager** when a block is rescheduled | Should Have | Removes social friction of rescheduling. Without it, users feel they "have to explain themselves" and override Ebb instead of accepting the shield. |
| F6 | **Voice check-in ("Vent-to-Adjust")** — 20-second voice note → somatic signal extraction via LLM | Could Have | High-signal input but adds engineering complexity. Slider fallback works for v1. Add post-PMF. |

### Feature-to-Goal Map

| Feature | Business Goal | Product Goal | User Goal |
|---|---|---|---|
| F1: Shield Me notification | Activation + Retention | Shield Adherence Rate >70% | Feel in control of schedule |
| F2: Wearable/slider sync | Personalization depth | Data freshness per DAU | Accurate morning read |
| F3: Google Calendar write | Core functionality | Calendar mutation success rate | Schedule actually changes |
| F4: CAS metric (North Star) | Daily engagement habit | DAU opens menu bar widget | Understand if today is good or bad |
| F5: Slack auto-draft | Reduce override friction | Override rate <30% | No guilt when moving a block |
| F6: Voice check-in | Signal accuracy post-PMF | Somatic extraction confidence >0.75 | Faster, richer morning input |

---

## 8. Why F1 & F3 Go Into the MVP: The Feature Defense

### Why F1 (Shield Me Notification) Goes in MVP

**The product lives or dies on this interaction.** Every other feature is scaffolding. If Anya opens the app and sees a dashboard — she will close it. If she receives one notification that proposes a specific, useful action she approves with a single tap — she has experienced the product. This is the rarest thing in consumer software: an interaction that *does the thing* rather than *informs you about the thing*.

Without F1, Ebb is just another biometric dashboard with slightly better calendar integration. With F1, it's the first product that closes the loop from body → schedule → action.

### Why F3 (Google Calendar Write) Goes in MVP

F1 without F3 is a push notification that gives advice. Advice without action is the exact failure mode of every wellness app that already exists. The calendar write is what separates Ebb from a smarter Oura app. The moment Ebb moves a calendar block — not suggests it, *moves it* — the product earns a fundamentally different trust relationship with the user.

### Value Propositions

| For Anya | For Arjun | For Their Manager |
|---|---|---|
| Gets her sharpest hours protected automatically | Recovery-aware scheduling handles post-family-event mornings without planning overhead | Slack draft keeps them informed without the user having to write it |
| No guilt when moving a solo block — Ebb drafted the explanation | No more misfire PRDs written in a fog — the block moves before the damage is done | Fewer last-minute cancellations; proactive communication feels professional |
| Somatic symptoms reduce over 90 days as recovery windows compound | Consistent output quality across IST + PST time zones | — |

---

## 9. User Flow: From Install to Day-30

### Why Would They Install It?

The install trigger is recognition. The landing page shows one scenario: a low-HRV Tuesday morning, a back-to-back calendar, and Ebb's notification proposing to move the solo spec block and add a recovery buffer. Anya reads this and thinks *"that is my Tuesday."* She downloads it.

The secondary trigger is a referral from a colleague whose output quality has visibly improved: "Ebb moved my afternoon spec block when I was wrecked this morning. I didn't have to do anything."

### Onboarding Flow (Day 0)

```
Install Ebb
    │
    ▼
Connect Google Calendar (OAuth — 2 taps)
    │
    ▼
Connect Oura / Luna Ring / Apple Health OR set baseline manually
(Slider: "What's your average sleep?" + "How do you usually feel at 8 AM?")
    │
    ▼
Set preferences: Locked meetings (can't move) vs. Flexible blocks (Ebb can shift)
    │
    ▼
Set notification time (default: 8:30 AM)
    │
    ▼
Day 1 Morning: First "Shield Me" notification arrives
    │
    ▼
User taps "Yes, Shield Me" → Calendar updates → Slack draft sent → CAS shown
    │
    ▼
Menu bar widget shows CAS for the day: 78%
```

### Recurring Daily Flow

```
[8:00 AM] Oura/Luna Ring/Apple Health sync fires automatically
    │
[8:30 AM] Lock-screen notification delivered:
    "HRV low (24ms). Move Spec Drafting to tomorrow?
     [ Yes, Shield Me ]  [ No, Push Through ]"
    │
    ├── YES → Calendar mutation executes
    │          Slack draft auto-queued for user to send (1 tap)
    │          CAS recalculates and displays in menu bar
    │
    └── NO  → Calendar unchanged
               CAS displays in warning state
               Ebb logs the override (learns user's threshold)
    │
[6:00 PM] Wind-down alert:
    "Caffeine cut-off passed 2 hours ago. CAS today: 74%. Tomorrow looks clearer."
```

---

## 10. Data Sources, Systems Design & LLM Usage

### Data Sources

| Source | Data Collected | Collection Method | User Action Required |
|---|---|---|---|
| **Oura Ring API** | HRV, sleep duration, readiness score, resting HR | Passive sync at 8:00 AM via OAuth | None after initial connect |
| **Luna Ring API** | HRV, sleep duration, readiness, resting HR | Passive sync at 8:00 AM via SDK | None after initial connect |
| **Apple Health / Google Fit** | HRV, sleep, steps, resting HR | HealthKit / Fit SDK background read | None after permission grant |
| **Google Calendar API** | Events, durations, attendee count, flexibility tags | OAuth read + write | User tags which blocks are flexible during onboarding |
| **Morning Slider (fallback)** | Subjective energy (1–5 scale), sleep hours | 5-second in-app input at notification tap | 1 tap daily |
| **Voice Check-in (v2)** | Somatic state description | Groq Whisper API transcription + LLM somatic parsing | 20-second voice note |
| **Implicit behavioral signal** | Override rate, notification open time, ignored nudges | App telemetry | None |

### Systems Design & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        DATA INPUTS                          │
│                                                             │
│  [Oura/Luna Ring]  [Apple Health]  [GCal API]  [Slider]    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   INGESTION LAYER                           │
│  • OAuth token refresh at 8:00 AM cron                      │
│  • HealthKit background fetch (iOS)                         │
│  • Slider input captured on notification tap                │
│  • All data written to encrypted local SQLite cache         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   SCORING ENGINE                            │
│                                                             │
│  Energy Score = weighted composite:                         │
│    HRV delta (vs. 30-day baseline)     → 40%               │
│    Sleep duration (vs. 7.5hr target)   → 35%               │
│    Subjective slider (if provided)     → 25%               │
│                                                             │
│  If Energy Score < 45%: trigger Shield Me proposal          │
│  If Energy Score 45–70%: optional nudge                     │
│  If Energy Score > 70%: no intervention                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  CALENDAR ANALYSIS ENGINE                   │
│                                                             │
│  Read GCal events for next 8 hours                         │
│  Classify: Locked (≥3 attendees) vs. Flexible (solo)       │
│  Identify highest-complexity solo block                     │
│  Find nearest open slot post-locked meetings               │
│  Generate proposed shift: [Block X] → [Tomorrow 9 AM]      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    LLM LAYER (Cloud)                        │
│                                                             │
│  Input: Energy score + calendar context + proposed shift    │
│  Model: GPT-4o-mini (cost-optimized) / Llama-3.3-70B       │
│  Output: Natural language notification copy                 │
│    "HRV low (24ms). Moving Spec Drafting to tomorrow        │
│     and adding a 30-min buffer post Architecture Review."   │
│                                                             │
│  v2 Voice: Groq Whisper → transcription → Somatic CoT     │
│  parser → structured extraction → confidence gate          │
│  If confidence < 0.75: prompt manual confirmation           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  NOTIFICATION DELIVERY                       │
│  • iOS/macOS push notification at 8:30 AM                   │
│  • Lock-screen: "Shield Me" / "Push Through" CTA            │
│  • On approval: GCal API write executes                     │
│  • Slack draft queued for 1-tap send                        │
│  • CAS recalculates and updates menu bar widget             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK LOOP                            │
│  • Override logged → adjusts personal threshold             │
│  • Adherence logged → weekly trend written to SQLite        │
│  • CAS trend used to tighten Energy Score weighting         │
│    over 30 days (personalization improves with use)         │
└─────────────────────────────────────────────────────────────┘
```

### LLM Usage Summary

| Usage | Model | Why |
|---|---|---|
| Notification copy generation | GPT-4o-mini | Low latency, low cost, high quality for short outputs |
| Somatic voice parsing (v2) | Groq Whisper + Llama-3.3-70B | Fastest transcription available; 70B for CoT signal extraction |
| Slack draft generation | GPT-4o-mini | Short, templated output |

### Text Processing & Recursive Chunking Model

For features requiring analysis of long-form, unstructured text (such as meeting transcripts from Tactiq or workplace chat history from Slack/Teams to determine cognitive load), Ebb utilizes a **Recursive Character/Token Chunking Model**:

* **Semantic Integrity**: Rather than splitting text at arbitrary limits (which cuts words/sentences in half), it splits recursively down a prioritized list of delimiters (`\n\n`, `\n`, ` `, `""`). This preserves full context of threads, dialogue, and complete sentences for LLM ingestion.
* **Context Overlap**: Implements a sliding overlap window (e.g., 100–150 tokens) between consecutive chunks, preventing critical semantic action items that cross chunk boundaries from being lost.
* **Local Processing Efficiency**: Creates small, highly dense semantic chunks (500–1,000 tokens) that can be handled quickly by local models via MCP. This enforces Ebb's privacy-first architecture while preventing high battery/resource drain.
| Task complexity classification (v2) | Local Llama-3B (on-device) | Privacy-sensitive; ticket/doc text stays on device |

### Compliance: Trade-offs & Risks

Ebb sits at a sensitive intersection: biometric health data (HRV, sleep) cross-referenced with workplace data (calendar, Slack). This creates obligations across three jurisdictions — BIPA (Illinois/US), GDPR Article 9 (EU/UK), and DPDP Act 2023 (India, directly relevant for Arjun's Luna Ring data).

**The Core Trade-off**: The Slack auto-draft is Ebb's single biggest compliance risk and its single biggest retention driver simultaneously. Every time it sends "adjusting my schedule to recover," it reduces a health signal to a workplace disclosure — even without sharing a number. A perceptive manager draws conclusions over time regardless of what biometric data was or wasn't transmitted. Disabling the feature eliminates the risk but removes the friction-reducing mechanism that makes users stay. The resolution: Slack draft is always queued, never auto-sent, and users are reminded quarterly that it exists and can be turned off independently.

**Architecture Mitigation**: Raw biometrics never leave the device. Only the computed Energy Score (0–100, no biometric payload) reaches the cloud. For Indian users, Ebb processes Luna Ring data on-device and routes the computed score to AWS Mumbai — no raw health data crosses borders. This is a structural constraint, not a policy claim.

**Remaining Risk**: No architecture eliminates inference risk entirely. The deeper risk is enterprise adoption — if a company pays for Ebb as a wellness benefit, the employer becomes a data processor and HIPAA/GDPR obligations escalate significantly. Ebb defers enterprise deals until SOC 2 is complete and a DPA template is reviewed by counsel. For v1, Ebb is personal software, not corporate infrastructure.

---

## 11. Monetization, Growth Loop & Retention

### How Ebb Makes Money

**Pricing Tiers**

| Tier | Price | What's Included |
|---|---|---|
| **Free** | $0/month | Manual slider only, 1 calendar block shield/day, no Slack integration |
| **Pro** | $18/month | Full wearable sync, unlimited shields, Slack auto-draft, CAS trends, voice check-in |

**Revenue Model**: SaaS subscription. No ads. No data resale. Privacy is a core product value, not a nice-to-have.

**Monetization Logic**: The free tier is functional enough to demonstrate value (1 shield/day) but restrictive enough that hitting the limit is a natural upsell moment — the user gets the notification, taps Yes, and sees "You've used your 1 shield today. Go Pro for unlimited." This happens on a bad-energy day, which is exactly when they are most motivated to pay.

### Growth Loop

The loop does not start with referrals, points, or rewards. It starts from the core product value — and referral is a downstream consequence of real outcomes, not a mechanic bolted on top.

The product framing this loop is built around is **"Protect my best hours"** — not "track my energy." The first is concrete, defensible, and creates a story. The second is a feature description. A user who says *"I got 6 protected focus hours this week"* is more likely to tell someone than a user who says *"my CAS went from 61 to 74."*

```
Better Energy Alignment
(Ebb reads HRV + calendar, proposes one shift)
           ↓
Better Work Output
(Spec draft lands in peak hours, not the crash slot)
           ↓
Protected Focus Blocks
(Anya consistently gets 5–6 deep-work hours/week she didn't have before)
           ↓
Visible Team Signals
(Slack auto-drafts: "Adjusting schedule today — spec coming tomorrow morning")
           ↓
Coworker Curiosity
("What tool is she using? She never scrambles on deadlines anymore.")
           ↓
New User Activation
(Coworker installs, recognizes their own Tuesday morning on the landing page)
           ↓
More Team-Level Energy Intelligence
(Two people on the same team using Ebb → fewer back-to-back collisions,
 fewer last-minute reschedules, shared calendar breathing room)
           ↓
Better Scheduling
(Protected blocks compound across the team without anyone coordinating it)
           ↓
More Daily Value
(Loop tightens — Ebb gets more accurate as it learns each user's pattern)
           ↓
      [Back to top]
```

The growth vector here is **social proof through output quality**, not viral mechanics. The user does not share a referral link — they ship better work and their calendar visibly reflects it. The Slack auto-draft is the passive distribution artifact: every time a block gets rescheduled, a message goes to someone who could become a user. The loop originates from value, not from a growth team's playbook.

### Day 1 → Day 30 → Day 90 Retention Flow

**Day 1**: Installs after recognizing their Tuesday morning in the landing page scenario. Completes onboarding in under 4 minutes. Gets first Shield Me notification. Taps Yes. Calendar shifts. Feels relief. CAS: 74%.

**Day 7**: Has approved 5 of 7 shield proposals. Spec work is consistently landing in the morning peak. The 2 PM slot (previously the crash) has become a recovery buffer 3 days out of 5. Hasn't had to explain a rescheduled block to their manager once — Ebb drafted all of them.

**Day 14**: CAS trend shows weekly average improving from 61% → 73%. Converts from Free to Pro because they hit the 1-shield limit on a particularly bad day.

**Day 30**: Ebb has become invisible infrastructure. The difference vs. removing Reclaim.ai: if they remove Ebb, they have to manually block recovery windows, draft Slack messages themselves when they reschedule, and lose the morning CAS read. The friction of *not having Ebb* is what keeps them retained. This is structural retention, not motivational retention.

**Day 90**: Has referred Ebb to 2 teammates. Mentions it in a Slack message visible to 40 people: "Ebb is the only tool that's actually helped my schedule." 3 more installs that week.

---

## 12. Prototype Ideation & Wireframe Direction

### Prototype Scope

Build a clickable flow covering the single critical path: the Tuesday morning scenario from lock-screen notification to CAS confirmation. This is the one flow that must be experienced to understand the product. Everything else is secondary.

### Screens to Build

1. **Onboarding: Connect** — Google Calendar OAuth + Oura/Luna Ring connect (or slider fallback). Clean, two-step, <60 seconds.
2. **Onboarding: Tag Your Blocks** — Simple calendar view. User taps which blocks are flexible. Toggle or drag-and-drop.
3. **Morning Lock-Screen Notification** — The hero screen. HRV or sleep data shown. Proposed shift shown. Two CTAs: "Yes, Shield Me" (primary) and "Push Through" (secondary, muted).
4. **Shield Confirmation** — After tapping Yes: shows the updated calendar for the day. Recovery buffer visible in green. Shifted block shown greyed-out tomorrow. CAS score animates in: **78%**.
5. **Menu Bar Widget** — macOS/iOS persistent widget: CAS score. Color-coded (green/yellow/red). Tapping opens a single-screen daily summary.
6. **Good Day vs. Bad Day State** — Show both states via toggle. Good day: CAS 82%, green, focused blocks protected. Bad day: CAS 42% (override activated), red, warning panel showing recovery recommendations.
7. **End-of-Month CAS Summary** — Simple line chart. CAS trend over 30 days. One insight line: "Your best weeks had 4+ morning shields accepted."

---

## 13. The Single Interaction That Matters Most

### The Interaction: The 8:30 AM "Shield Me" Lock-Screen Notification

**Why this one?** Every other screen in the product is scaffolding for this moment. This is where the product earns its place on the user's phone. It is the only moment in any product category where the software says: *"I know how you feel right now. Here is what I am going to do about it. Approve?"*

### Active vs. Passive: Where We Draw the Line

| | Passive (Automatic) | Active (User Input) |
|---|---|---|
| **What Ebb does** | Wearable sync, calendar read, energy scoring, calendar write on approval, Slack draft queue | Morning slider (fallback only), "Yes / No" on Shield Me, flexible block tagging (once, during onboarding) |
| **Design principle** | Everything that can be sensed should be sensed. Never ask for data the system can infer. | Only ask when inference fails or when the action requires explicit consent. |

**Why this line?** Logging fatigue is the primary cause of death in wellness apps. Every manual input beyond the minimum is a churn risk. The only truly required active input is the daily Yes/No — and that is not logging, it is consent. Ebb is a permissions agent, not a data collection tool.

### The One Metric: Cognitive Alignment Score (CAS)

$$\text{CAS} = \frac{\text{Time in high-energy tasks during peak windows} + \text{Time in low-demand tasks during recovery windows}}{\text{Total working hours}} \times 100$$

**Why CAS and not something else?**
- Step count: Measures activity, not cognitive quality
- Sleep score: Retrospective, not actionable
- Tasks completed: Ignores whether they were the *right* tasks at the *right* time
- CAS measures *scheduling intelligence* — the thing Ebb actually controls

**Good Day**: CAS ≥ 75%. Morning spec block landed in peak hours. Recovery buffer absorbed the post-meeting crash.

**Bad Day**: CAS < 50%. User overrode the shield. Spec drafting collided with the energy floor. Ebb shows a red CAS and a single line: "Today's override cost you ~2 hours of productive output. Tomorrow's schedule is pre-adjusted."

### Patterns That Break Old Cycles

| Old Pattern | Ebb's Break |
|---|---|
| Stack hardest work in worst hours (post-crash) | CAS shows the cost in real-time; Shield shifts it automatically |
| Caffeine as energy management | Wind-down alert + CAS red state makes the caffeine cost visible |
| Guilt when moving solo blocks | Slack auto-draft eliminates the social friction |
| Ignoring wearable data because it has no action | Shield Me converts a data point into a calendar action |

---

## 14. Passive vs. Active Inputs & 30-Day Relevance

### The Passive/Active Line in Detail

**Fully Passive (zero user effort after onboarding)**
- Wearable sync (Oura/Luna Ring/Apple Health)
- Google Calendar read
- Energy score calculation
- Shield proposal generation
- Calendar write (post-approval)
- Slack draft (queued, user sends with 1 tap)
- CAS recalculation
- Behavioral signal logging (override rate, adherence)

**Minimal Active (1 input/day maximum)**
- Morning Yes/No on Shield Me notification (10 seconds)
- Slider fallback if no wearable (5 seconds)

**One-Time Active (during onboarding only)**
- Calendar OAuth
- Wearable connection
- Flexible block tagging

### Why Would They Still Have It at Day 30?

The question is not "why would they keep opening it" — it's "would the cost of removing it exceed the cost of keeping it?"

By Day 14, Ebb has:
- Moved 8–10 calendar blocks the user would have had to move manually
- Drafted 4–6 Slack messages to their manager that they would have had to write themselves
- Protected ~6–8 hours of peak focus time that would otherwise have been consumed by low-energy execution

The administrative cost of doing this manually is the retention lock. Ebb is not a habit app. It is a utility. You don't decide to keep your calendar app every morning. You keep it because losing it creates immediate overhead.

### Keep or Kill?

**Keep if** (Week 13 measurement):
- Shield Adherence Rate > 70%
- Day-30 retention > 60%
- At least 30% of Day-30 users have referred at least one other person

**Kill if**:
- Adherence rate < 40% (users approve shields but then manually override them — low trust in proposals)
- Day-30 retention < 30% (structural dependency is not forming)
- LLM API costs exceed 40% of ARPU at scale (unit economics broken)

---

## 15. North Star, Leading, Lagging & Guardrail Metrics

### North Star Metric

**Shield Adherence Rate** — the percentage of Ebb-created calendar shields that are kept (not manually overridden or deleted) by the user.

> *"Did Ebb's action earn enough trust that the user let it stand?"*

This is the one number that tells us whether the product is working. High adherence means the proposals are accurate, timely, and trusted. Low adherence means the energy model is wrong, the proposals are disruptive, or the UI is creating friction.

**Target**: >70% at steady state.

### Leading Metrics (predict future NSM health)

1. **Day-3 Shield Acceptance Rate** — users who accept their first 3 shield proposals in the first 3 days are 3x more likely to hit Day-30 retention. If this drops, the onboarding energy model is miscalibrated.
2. **Notification Open Rate** — the rate at which users open the 8:30 AM notification within 15 minutes of delivery. Low open rate signals notification fatigue or mistimed delivery.

### Lagging Metrics (confirm past NSM performance)

1. **Day-30 Retention Rate** — users active 30 days after install. Confirms whether structural workflow dependency has formed.
2. **MRR Conversion Rate (Free → Pro)** — the rate at which free users hit the 1-shield limit and convert. Confirms monetization hypothesis.

### Guardrail Metrics (signal if we're breaking something while optimizing NSM)

1. **Override Recovery Rate** — the percentage of users who override a shield and then return to accepting shields within 3 days. If this drops, we are training users to distrust the product rather than engage with it.
2. **LLM API Cost per Active User** — must stay below $0.50/user/month for Pro unit economics to work. If voice parsing (v2) drives this above threshold, the feature must be rate-limited or moved to a higher tier.

---

## 16. Monetization Plan, Distribution Model, Top Risks & Mitigation

### Monetization Plan

| Phase | Strategy | Mechanism |
|---|---|---|
| **0–6 months** | Free → Pro conversion | 1-shield daily limit on Free tier. Upsell on the highest-pain day (bad HRV, high meeting load). |
| **6–18 months** | Pro retention + referral | Referral program: 2 months free per converted referral. CAS trend email drives re-engagement for at-risk churners. |
| **18M+** | Enterprise / HR integration | Position Ebb as an individual wellness benefit offered by employers. Annual contract per seat. SOC 2 compliance required before this phase opens. |

**Pricing Rationale**: $18/month competes on ROI, not relaxation. The anchor is not Calm ($5.83/month for content) — it is Reclaim.ai ($8–20/month for calendar automation). Ebb does what Reclaim does, plus knows your body.

### Distribution Model

| Channel | Tactic | Why It Works |
|---|---|---|
| **Organic / Word of Mouth** | Slack auto-draft message is a passive distribution artifact — the recipient becomes a potential user | Built into the product; zero marginal cost |
| **Product Hunt Launch** | Target Segment A directly. Engineers and PMs are the PH core audience. | High alignment with ICP |
| **Oura / Luna Ring / Apple Health integration directories** | Listed as a compatible app in wearable partner ecosystems | Reaches users already biometric-aware and looking for action on their data |
| **Tech Twitter / X & LinkedIn** | Founder-led content: "I built this because Oura kept showing me a bad readiness score with nothing to do about it" | Authentic, resonant with Segment A |
| **Referral program (Day 90+)** | 2 months free for each referred user who converts to Pro | Aligns the referral incentive with the most loyal cohort |

### Top Risks & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| **Calendar mutation breaks trust** — Ebb proposes the wrong shift on a day the user can't move anything | 🔴 Critical | All mutations require explicit Yes tap; Ebb never acts unilaterally. Onboarding forces users to tag flexible vs. locked blocks once. A misfire is an inconvenience, not a disaster — trust is rebuilt by the next accurate proposal. |
| **Biometric data becomes a liability** — a breach, or a manager inferring health status from repeated "adjusting my schedule" Slack drafts | 🔴 Critical | Raw biometrics never leave the device; only the computed Energy Score (0–100) reaches the cloud. Slack draft is always queued, never auto-sent. Users are reminded quarterly that the feature can be disabled independently. |
| **Reclaim.ai or Motion ships energy awareness** — closing Ebb's core differentiation | 🟡 High | Calendar tools have no biometric data access and no consent architecture to acquire it. Ebb's moat is not the calendar write — it is the body-to-schedule inference layer and the trust model built around it. Accelerate voice + somatic parsing (v2) to deepen the gap before incumbents react. |

---

*Document version: 2.0 — Rewritten June 2026*
*Product: Ebb — The Energy-Aware Calendar Shield*
*Prepared for: PM Assignment Submission + Discussion Walkthrough*
