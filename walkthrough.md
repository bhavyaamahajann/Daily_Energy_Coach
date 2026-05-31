# Ebb: The Energy-Aware Calendar Shield
**Product Strategy & Written Walkthrough**

---

## 1. Key Consumer Segment & Market Sizing (Guesstimate)
To understand Ebb's target market, we perform a top-down guesstimate of the problem space defined in [problemstatement.txt](file:///Users/apple/Desktop/Cursor/Daily%20Energy%20Coach/problemstatement.txt):

*   **Total US Workforce**: ~160 Million
*   **Knowledge Workers (Segment A)**: ~60% of the workforce = **96 Million** (includes office workers, administrative staff, developers, managers, designers).
*   **High-Cognitive Demand Professionals (Segment B)**: Knowledge workers whose performance is gated by deep, uninterrupted focus blocks and who face heavy meeting loads (Developers, Product Managers, Consulting Leads, Designers).
    *   *Calculation*: ~30% of Segment A = **28.8 Million**.
*   **Biometric-Tracked/Self-Quantifying Segment (Segment C)**: Professionals within Segment B who already track bio-telemetry (own an Oura Ring, Apple Watch, Garmin, or track steps) and are actively searching for ways to operationalize this data.
    *   *Calculation*: ~25% of Segment B = **7.2 Million**.
*   **The Scaled Scale-Up Tech Target (Core ICP)**: Tech workers in hyper-growth environments characterized by extreme meeting density, loose focus boundaries, and high burnout risk.
    *   *Calculation*: ~20% of Segment C = **1.44 Million active targets in the US**.

---

## 2. Selected Target Segment, Market Potential & User Persona

### Selected Segment: Scale-up Tech Professionals
This niche is selected because they suffer the highest rate of meeting-bloat and cognitive load, and have the highest willingness-to-pay ($18/month competes directly with calendar optimization software like Motion or Reclaim).
*   **TAM (Total Addressable Market)**: 7.2 Million global self-quantifying knowledge workers × $216/year = **$1.55 Billion**.
*   **SAM (Serviceable Addressable Market)**: 1.44 Million US scale-up tech workers × $216/year = **$311 Million**.

### User Persona: Anya (29) — Staff AI Engineer
*   **Context**: Staff AI Engineer at a hyper-growth, 150-person scale-up in San Francisco.
*   **Anya's Tuesday Morning**:
    *   **7:30 AM**: Wakes up exhausted after 5.2 hours of sleep. Her Oura app tells her her HRV is 24ms (her baseline is 70ms). She finds a clump of hair on her pillow (telogen effluvium) and spots a hormonal breakout on her jaw.
    *   **8:15 AM**: Forces herself onto the Peloton, but stops after 10 minutes feeling lightheaded. She drinks a double espresso to mask the fatigue, spiking her cortisol.
    *   **8:30 AM**: Opens her laptop to see a flat, unyielding calendar: a locked 10 AM Architecture Review with 20 people and a 2-hour independent Spec Drafting block. She feels paralyzed and guilty.

---

## 3. The Problem Framework

| Question | Ebb's Strategic Position |
| :--- | :--- |
| **What is the problem?** | Knowledge workers suffer from **energy-aware decision paralysis**. They have sleep data and calendar slots, but no tool connects the two. They waste peak biological hours on administrative tasks and execute complex tasks during slump hours, causing chronic burnout. |
| **Why address it now?** | 1. **Biometric Ubiquity**: Millions have wearables (Oura, Apple Watch) but experience "insights fatigue" (knowing they slept poorly without knowing what workday action to take). <br> 2. **Meeting Bloat**: Post-remote work calendars are denser than ever, demanding strict defensive boundary tools. |
| **Who is facing this?** | High-stakes knowledge workers (Staff/Senior Engineers, PMs, Leads) whose output quality dictates team velocity. |
| **How do we know it's real?** | High churn rates in wellness apps (logging fatigue) and productivity apps (ignoring user fatigue). Users explicitly report feeling like "broken machines" when forced to meet flat calendar targets on empty tanks. |
| **What is the value generated?** | Protects cognitive reserve, improves work output quality, and prevents chronic stress-induced aesthetic/physical decline (telogen effluvium, acne flareups) by enforcing boundary rules. |

---

## 4. Current Workaround (What Anya Uses Today)
Before Ebb, Anya uses a combination of high-friction manual workarounds:
1.  **Manual Calendar Blocking**: Deleting or dragging calendar blocks manually when she feels tired (requires high cognitive effort when already fatigued).
2.  **Manager Alignment Over Email/Slack**: Writing apologetic Slack updates to reschedule focus blocks (e.g. *"Sorry, feeling under the weather, spec delayed"*), which causes performative guilt.
3.  **Chemical Override**: Drinking excessive caffeine to force focus during energy slumps, leading to sleep desync and worsening the stress loop.
4.  **Static Wearable Check-ins**: Checking her Oura score to confirm she is tired, without any translation to her workday schedule.

---

## 5. MVP Product & KPI Alignment

```
  BUSINESS OUTCOME (Day-30 Retention > 60%) 
     └── PRODUCT OUTCOME (Shield Adherence Rate > 70%)
            └── USER ACTION (Accepting Morning Shield Proposal)
```

*   **Business Outcome**: Secure long-term workflow retention ($18/mo LTV) by making calendar defense automated. Target: **Day-30 Retention > 60%**.
*   **Product Outcome**: High Shield Adherence. Users must respect and keep the recovery buffers and shifted focus slots Ebb schedules. Target: **Shield Adherence Rate > 70%**.

---

## 6. The Solution & ICE Prioritization

We propose **Ebb: The Energy-Aware Calendar Shield**. Instead of displaying data dashboards, Ebb intercepts the morning calendar and proposes a single binary choice based on biometric readings.

### ICE Method Evaluation
*   **Impact (9/10)**: Directly alters the user's workday to match somatic capacity, immediately lowering burnout.
*   **Confidence (8/10)**: GCal API write integrations and Wearable API syncs are robust and technically proven.
*   **Ease (6/10)**: Medium complexity due to managing OAuth permissions and dynamic calendar shifts.
*   **ICE Score**: $(9 \times 8 \times 6) = 432$. (Ranked #1 over descriptive dashboards or wearable integrations).

---

## 7. MVP Feature Set & MoSCoW Prioritization

### Feature-to-Goal Map
*   *Oura/Apple Health Sync* ──> Establishes daily biological baseline
*   *GCal OAuth Integration* ──> Reads schedule constraints & executes shifts
*   *8:30 AM Lockscreen Nudge* ──> Obtains explicit user consent to shield
*   *Zero-Stimulus Buffers* ──> Injects physical recovery slots post-meeting
*   *Solo-Block Rescheduler* ──> Shields high-complexity deep focus blocks

### MoSCoW Prioritization
*   **M (Must Have)**: Oura sleep sync integration; GCal read/write API connector; 8:30 AM Lockscreen Consent Banner; Auto-Buffer Injection; Solo Focus Block Rescheduling.
*   **S (Should Have)**: Slack automated draft warnings (informing manager of rescheduled solo deliverables); Circadian peak shift adaptation.
*   **C (Could Have)**: 8-Stream Somatic Ledgers (nutrition macro log, acne/shedding tracker); Keystroke telemetry analysis.
*   **W (Won't Have)**: Team-wide multi-user collaborative schedule negotiation.

---

## 8. Why These Features Go in MVP (Value Proposition)
1.  **GCal Rescheduler (Must-Have)**: *Value Proposition*: Saves Anya the administrative guilt and friction of manually rearranging her calendar.
2.  **Lockscreen Nudge (Must-Have)**: *Value Proposition*: Limits decision fatigue. Anya approves a complex calendar shift with a single tap at 8:30 AM before she starts work.

---

## 9. End-to-End User Flow
```
[ Wake Up ] ──> [ Biometric Sync (Oura) ] ──> [ Lockscreen Nudge (08:30) ]
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼ (Yes, Shield Me)                              ▼ (Push Through)
                     [ Focus Protected ]                            [ Pushing Through ]
              - Spec Drafting moved to tomorrow              - Spec Drafting kept today
              - Zero-Stimulus Buffer injected                - CAS drops to 55% warning
              - CAS Score at 79% (Peak)                      - No buffer block injected
                             │                                               │
                             └───────────────────────┬───────────────────────┘
                                                     ▼
                                          [ May Monthly Review ]
                                  - View CAS 30-day progress chart
                                  - Start June (Reset prototype)
```

---

## 10. System Design & Data Ingestion Pipeline

Ebb operates on-device to maintain strict biometric privacy:

```
  [ Wearables API (Oura) ] ──┐
                             ├──> [ Ebb Local Cache ] ──> [ Somatic Rules Engine ] ──> [ GCal API write ]
  [ Calendar Cache (GCal) ] ─┘            │
                                          ▼
                               [ On-Device SQLite DB ]
```

1.  **Telemetry Fetch**: Local client pulls Oura Readiness/HRV and GCal metadata at 8:00 AM.
2.  **Somatic Evaluation**: Rules engine computes the daily Cognitive Battery. If Battery $<45\%$, it triggers the Shield Proposal.
3.  **Local Execution**: Upon tapping "Shield Me", Ebb calls GCal API to reschedule flexible focus slots and set Slack status to DND.

---

## 11. Growth Loop, Retention & Referral

```
  [ Day 1: Auth Calendar ] ──> [ Day 7: Active Shielding ] ──> [ Day 30: Calendar Hooked ] ──> [ Day 90: Referral ]
```

*   **Day 1 (Value Delivery)**: Seamless setup. Connect Oura and GCal in under 60 seconds.
*   **Day 30 (Retention Lock-In)**: The "calendar drag" friction. If Anya uninstalls Ebb, she has to manually protect her calendar. Ebb becomes an administrative utility she cannot work without.
*   **Day 90 (Referral Growth Loop)**: When Ebb reschedules a block, it queues an optional Slack update to the team: *"Adjusting my schedule via Ebb; spec draft tomorrow."* Team members see Ebb actively defending Anya's time, prompting organic viral acquisition.

---

## 12. Working Prototype Screens (Interactive Walkthrough)
The live prototype simulates the full mobile phone interface:
*   **Screen 1: Welcome Screen**: Premium light canvas (`#FDFBF7`) showing the Ebb brand and the Google Calendar connection button.
*   **Screen 2: Create Account**: Displays tab switches between Email and Phone fields.
*   **Screen 3: Connect Energy Source**: Selectable choices (Oura Ring, Luna Ring, Apple Health) displaying active states.
*   **Screen 4: Deepen Your Shield**: Toggling optional integrations (Transcripts, Slack context, Screen Time).
*   **Screen 5: Lockscreen Nudge**: Styled as a mobile lock screen showing the time (`08:30`) and a floating Ebb alert notification with action buttons.
*   **Screen 6: Focus Protected (State Protected)**: Detailed timeline demonstrating shifted Spec Drafting and active Zero-Stimulus Buffer blocks. It includes an editable textarea draft card.
*   **Screen 7: Pushing Through (State Overridden)**: Displays the active timeline under fatigue (no buffer block, low CAS score).
*   **Screen 8: May Monthly Review**: Shows the Cognitive Alignment Score chart (61% to 78%) and approvals summary metrics.

---

## 13. The Single Interaction That Matters Most
The **8:30 AM Lockscreen Nudge** is the defining interaction of Ebb.
*   **Active vs. Passive**: Biometrics and calendar checks happen *passively* in the background. The only *active* input required from Anya is tapping `[ Yes, Shield Me ]`.
*   **Why it matters**: It respects user autonomy. Ebb never changes calendar slots without explicit consent. It presents the optimal decision as a simple tap, eliminating morning triage stress.
*   **The Landing Score**: Anya sees her daily **CAS score** at the top of her timeline. This metric defines her day's efficiency.

---

## 14. Active vs. Passive Boundary Decisions

| Dimension | Active Input | Passive Sensing |
| :--- | :--- | :--- |
| **Biometrics** | Fallback 3-second sleep slider (1-5) | Heart Rate, Sleep duration, HRV from Oura |
| **Calendar** | Tapping "Yes, Shield Me" consent banner | Meeting constraints, attendee counts, start times |
| **Daily Tasks** | Tagging high-complexity alone blocks | Telemetry tracking (keyboard idle latency) |

*   **Keep or Kill Gate (Week 13)**: Keep if Shield Adherence Rate $>70\%$ and Day-30 retention $>60\%$. Kill if Adherence rate $<40\%$ (users overriding proposals).

---

## 15. The Evaluation Scorecard (Metrics Matrix)

### North Star Metric
*   **Shield Adherence Rate**: Percentage of Ebb-created buffers and shifts left untouched on the calendar. Target: **$>70\%$**.

### Leading Metrics
1.  **Day-3 Shield Acceptance Rate**: Percentage of new signups who accept the morning shield proposals in their first 3 days.
2.  **Notification Open Rate**: Rate of tapping the 8:30 AM nudge banner within 15 minutes of delivery.

### Lagging Metrics
1.  **Day-30 Retention Rate**: Percentage of active monthly users.
2.  **Pro Tier MRR Conversion Rate**: Rate of converting free users (limited to 1 shield/week) to Pro.

### Guardrail Metrics
1.  **Override Recovery Rate**: Percentage of users who override a shield but accept subsequent shields within 3 days (monitors if overrides turn into churn).
2.  **LLM API Cost per Active User**: Target **$0.50/month** to protect Pro Tier margins.

---

## 16. Monetization, Growth Channels & Top Risks

### Monetization Plan
*   **Free Tier**: 1 calendar shield proposal per week.
*   **Pro Tier ($18/month)**: Unlimited daily morning and mid-day calendar shields, Slack warnings automation, and monthly reports.

### Distribution Model
*   **Organic Virality**: Slack status updates (`🚫 Offline (Ebb Buffer)`) act as passive growth loops visible to coworkers.
*   **Wearable Integration Directories**: Listing Ebb on Oura and Apple Health App Stores.

### Top Risks & Mitigation

| Strategic Risk | Severity | Mitigation |
| :--- | :--- | :--- |
| **Broken Meeting Trust** | 🔴 Critical | Ebb **never** reschedules multiplayer meetings. It only reschedules flexible solo focus blocks and injects recovery buffers. |
| **Biometric Privacy Leaks** | 🔴 Critical | Raw metrics are kept in the on-device SQLite database. Ebb only uploads anonymous cognitive battery calculations to the cloud parser. |
| **Feature Churn** | 🟡 High | Position Ebb as a GCal calendar utility (like Reclaim.ai) rather than a wellness journal, making it a critical workflow dependency. |

---
*Document Version: 2.0 — June 2026*
*Submission Walkthrough for PM Assignment*
