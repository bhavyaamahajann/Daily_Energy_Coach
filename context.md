# Context: Ebb – The Energy-Aware Calendar Shield

This document outlines the refined product strategy and core definition for **Ebb**, a next-action director for knowledge workers. It strips out platform bloat to focus on a single, transformative calendar-protection interaction.

---

## 1. Naming Philosophy: Why Ebb?
The name **Ebb** is a deliberate rejection of standard productivity tools that focus exclusively on constant "flow" and peak output:
* **Honoring the Receding Tide (Ebb vs. Flow)**: You cannot have flow without ebb. The name represents the period where biological capacity recedes—the necessary downtime for system recovery.
* **Defensive Calendar Scheduling**: Ebb shields Anya's schedule when her energy levels crash, automatically carving out buffers and shifting tasks to prevent exhaustion from manifesting as physical decay.
* **A Calm Brand Voice**: Ebb acts as a permissions agent, signaling to knowledge workers that it is biologically optimal to step back, recover, and let the tide go out.

---

## 1. The Core Problem Statement: Energy-Aware Decision Making

Most knowledge workers are running on borrowed energy, but the fundamental problem is **not a wellness tracking gap**.
*   **The Real Pain Point**: Knowledge workers have enough trackers telling them they slept poorly. The gap is **energy-aware decision making**. When Meera/Anya sits at her desk at 8:30 AM exhausted, she is faced with a flat calendar and a task list that ignore her biology. The question she wants answered is: *"What should I do right now, with the energy I actually have, to get my core work done without burning out?"*
*   **Existing Tool Failures**:
    *   *Wearables*: Retrospective and judgmental. They show sleep scores but never help you decide what to do next.
    *   *Calendars*: Treat all hours as identical 60-minute blocks. They schedule time, ignoring capacity.
    *   *Wellness/Journaling Apps*: Require manual inputs and die due to logging fatigue.

---

## 2. Product Brief & Strategic Framing

### Product Concept: **Ebb**
Ebb is a calendar-integrated assistant that matches workday actions to biological capacity. It operates as a next-action shield, protecting the user's energy boundaries.

### A. The Generalizable Persona: Anya (29)
*   **Profile**: Anya is a Staff AI Engineer at a San Francisco scale-up. She represents the "extreme user" of the knowledge economy—high-stakes output, back-to-back meeting loads, and high susceptibility to cognitive burnout and somatic stress (severe fatigue, brain fog).
*   **Why Anya Generalizes**: By solving the problem for Anya (the extreme user whose physical recovery is highly volatile), Ebb builds a framework that generalizes to millions of knowledge workers who struggle with standard afternoon crashes, meeting bloat, and the guilt of performative productivity.
*   **The Waking Reality (The Reddit Pain Point)**:
    > *"I woke up at 7:30 AM feeling physically exhausted (HRV 24ms). My calendar has a locked 10 AM Architecture Review with 20 people and a 2-hour independent spec writing block. I want to cancel everything but I can't. I feel paralyzed. I forced myself to work, drank three coffees, and ended up staring blankly at my screen for 3 hours, getting nothing done. I feel like a machine that's broken."*

### B. The Hero Moment: The "Vent-to-Adjust" Voice Nudge
Ebb does not feature a complex dashboard or try to automate her whole life. The entire product revolves around **one transformative interaction at 8:30 AM**:
1.  **Audio Check-In**: Anya records a 20-second voice note describing her somatic state (e.g. *"waking breakouts, hair shedding, nauseous during Peloton"*).
2.  **The "Vent-to-Adjust" Pipeline**: The local client sends the audio payload statelessly to the cloud-hosted Groq API. Whisper (`whisper-large-v3`) transcribes the audio, and the Somatic CoT parser (`llama-3.3-70b-versatile`) extracts the 8-stream somatic metrics. If confidence exceeds the 0.75 gate, the structured payload is written to the encrypted local SQLite database cache.
3.  **The Proposal**: Before she starts work, she receives a single lock-screen notification:
    > **Ebb Alert**: *Somatic recovery is low (24ms). You have a locked 10:00 AM Architecture Review. Protect your energy?*
    > `[ Yes, Shield Me ]`  `[ No, Push Through ]`
4.  Tapping **"Yes, Shield Me"** triggers Ebb to execute **one simple shift**:
    *   It auto-blocks a 30-minute "Offline Recovery Buffer" right after her locked 10 AM meeting.
    *   It shifts her alone Spec Drafting block to tomorrow morning, auto-drafting a Slack update to her manager: *"Adjusting my schedule to focus offline; spec draft coming tomorrow."*
    *   It places a "Focus Limit" tag on her calendar, signaling to her tray widget to keep her in low-stimulus mode.
*   **Why this moment works**: It solves the trust problem. The software does not unilaterally rearrange her schedule; it proposes a single, high-leverage shift that she approves with a single tap.

### C. The Hero Metric: Cognitive Alignment Score (CAS)
Instead of tracking hours worked or tasks completed, Ebb calculates the **Cognitive Alignment Score (CAS)**:
$$\text{CAS} = \frac{\text{Time in Focus (Peak State) + Time in Recovery/Admin (Slump State)}}{\text{Total Working Hours}} \times 100$$
*   **Second-Order Risks (PM Maturity Check)**:
    1.  *Over-Optimization for Comfort*: A user might gamify CAS by avoiding difficult, complex tasks altogether when their energy isn't perfect, delaying critical milestones.
    2.  *Meeting Anxiety / Social Withdrawal*: Since meetings scheduled during peak times might lower their score, users may decline essential team syncs, leading to team isolation.
    3.  *Autonomy Reduction*: The user might stop listening to their own body and rely blindly on Ebb's recommendation, creating tool-dependency.
*   **Mitigation**: locked multiplayer meetings are excluded from CAS calculations, and Ebb limits the score weight of recovery blocks to prevent users from over-resting.

### D. The Retention Mechanism: Workflow Dependency
Ebb does not rely on motivation, gamification, or push reminders (which users eventually mute).
*   **The Habit Hook**: Ebb embeds itself directly into **Google Calendar / Outlook**. The value is delivered at the schedule level. Once Ebb blocks recovery slots and reschedules alone focus tasks, it reduces Anya's daily planning overhead.
*   **The Day 30 Retention Lock-in**: If Anya uninstalls Ebb, she has to manually block rest slots, handle manager updates, and protect her time when exhausted. The administrative friction of *managing her calendar without Ebb* is what keeps her retained. Ebb is a utility, not a tracking habit.

### E. The V1 MVP Scope (12 Weeks, 1 Engineer)
*   **Keep (The Core)**:
    *   A simple menu-bar widget displaying the current optimal activity state (Focus vs. Recovery).
    *   Wearable sync interface (Oura sleep-duration/HRV data sync, fallback to a 3-second morning slider).
    *   Google Calendar API integration: Auto-blocking a daily 90-minute focus window and the 8:30 AM "Shield Me" lock-screen prompt.
*   **Cut (90% of Ebb)**:
    *   All voice ingestion and STT parser APIs (Replaced with a simple morning slider in the bare v1 deployment to reduce launch risk).
    *   All 8-stream lifestyle ledgers (nutrition, physique, social, creative logs).
    *   Desktop keyboard/mouse telemetry agents.
    *   Advanced team-wide collective schedule blockers.
*   **Prototype Validation Note**: Although the bare v1 production scope cuts the voice pipeline and somatic ledgers to guarantee a fast 12-week shipping cycle, the Phase 1 and Phase 2 prototypes have successfully implemented and verified the encrypted SQLite database schemas and the Groq LLM parsing pipelines. This demonstrates technical feasibility for post-MVP releases.
*   **Success Metric (Week 13)**: **Shield Adherence Rate** (percentage of Ebb-created recovery buffers and focus shifts kept/completed by the user over a 4-week trial). Target: $>70\%$.

---

## 3. The 8-Stream Somatic Database: Strategy & Intent

Ebb runs a local 8-stream ledger tracking Anya's somatic and cognitive health to defend her energy levels:
1.  **Nutrition**: Automatically logs macros and critical micronutrients (Zinc, Iron, Selenium) that support hair follicle strength and thyroid stability under chronic stress.
2.  **Physique & Aesthetic**: Tracks scale weight, skin breakouts, and daily hair shedding counts. Over time, the analytical engine maps the **90-day lag between work stress and telogen effluvium** (stress-induced hair loss), proving to Anya that scheduling buffers and rest are physiologically necessary to achieve her aesthetic goals.
3.  **Self-Care**: Actively deletes high-intensity workouts (like Peloton) on low-recovery days, replacing them with restorative somatic walking sequences, and schedules designated hair care or skincare routine windows.
4.  **Mental Health**: Logs mood, burnout index, and physical symptom markers (e.g. cystic acne flareups, heavy legs).
5.  **Work**: Manages target alone focus tasks, complexity tags, and calendars. Under low-recovery days, Google Calendar locks multiplayer meetings (e.g. Architecture Review) but shifts flexible alone spec-drafting blocks and injects a "Zero-Stimulus Rest Window" post-meeting.
6.  **Activity**: Tracks steps, stand hours, and scheduled workout intents (e.g. swims).
7.  **Social**: Keeps contact frequency and connection intents (family calls, close relationships).
8.  **Creative**: Preserves quiet windows for independent research or unstructured thinking.

---

## 4. Insight Philosophy: From Data to Decision

Anya does not need another dashboard telling her she is tired. Ebb's core design philosophy is: **No retrospective graphs; direct scheduling decisions instead.**

```
   RAW INPUTS (Oura/Voice/GCal) ──> [ Somatic CoT Ingestion ] ──> DIRECT DECISION (Shield Nudge)
```

Instead of asking Anya to interpret complex biometric correlations, Ebb does the analysis in the background and presents it as a concrete binary choice on her calendar. If her biometrics redline, Ebb doesn't show a warning chart—it immediately modifies her GCal blocks to enforce physiological recovery boundaries.

---

## 5. How These Dimensions Work Together (Somatic Loop)

The 8 streams are not independent ledgers; they represent a interconnected physiological loop:

```
     [Work Load / Stress] ──(90-Day Lag)──> [Physique: Hair Loss & Acne]
              │                                      ▲
              ▼                                      │
       [Mental Burnout] ────────(Triggers)─────── [Self-Care Slump]
              │                                      ▲
              ▼                                      │
  [Activity: High-Int Peloton] ──(Worsens)──> [Nutrition: Micronutrient Depletion]
```

1.  **Stress Trigger**: High meeting load and complex tasks (Work) deplete cognitive batteries, spiking cortisol.
2.  **Somatic Feedback**: Cortisol red-lining causes sleep latencies (Mental Health) and depletes thyroid-stabilizing elements like Iron and Zinc (Nutrition).
3.  **Somatic Lag**: The chronic physiological strain manifests 90 days later as acute skin breakouts and severe telogen effluvium hair shedding (Physique & Aesthetic).
4.  **Behavioral Correction**: Ebb intercepts this loop by shifting focus blocks (Work) and replacing Peloton rides with recovery walks and skincare windows (Self-Care).

---

## 6. Alert Thresholds & Actions

Ebb triggers specific calendar mutations and system notifications based on biometric thresholds:

| Trigger Metric | Threshold Condition | Target Action |
| :--- | :--- | :--- |
| **Readiness Score** | Battery $< 45\%$ | Trigger **8:30 AM "Shield Me" Nudge**: Shift alone spec coding, inject 30-min recovery buffer post-meetings. |
| **Real-time HRV** | Dip $> 40\%$ below baseline | Trigger **Mid-Day Re-build**: Re-schedule remaining afternoon blocks, set Slack to DND. |
| **Sleep Quality** | Sleep Duration $< 6.0$ hours | Automatically replace high-intensity Peloton workouts with slow Somatic Recovery walks on calendar. |
| **Extraction Confidence** | Token log-probability $< 0.75$ | Block silent database write. Dispatch local client verification modal for manual check-in confirmation. |

---

## 7. Insights Framework

Ebb translates unstructured somatic inputs into actionable calendar defense mechanics:

| Somatic Insight | How AI Detects This | Why It Matters | Decision Enabled |
| :--- | :--- | :--- | :--- |
| **Cortisol Red-Line** | Voice sentiments ("exhausted", "nauseous") matching HRV $< 30$ms. | High risk of mental block and 90-day telogen effluvium hair loss. | Reschedules alone Spec Drafting, injects post-meeting rest buffers, mutes Slack. |
| **Circadian Desync** | timezone delta $> 3$ hours on GCal metadata. | Mismatch between clock time and internal physiological peak performance windows. | Adjusts peak window forward by 1.5 hrs/day, blocking local mornings for sleep. |
| **Comfort Bias Gaming** | High CAS score combined with zero task velocity in telemetry. | User is over-shielding and avoiding difficult work to maintain score. | Triggers Velocity Override, disabling low-energy reschedules for 7 days. |

---

## 8. Communication Examples & Rhythm

### A. Communication Examples
*   **8:30 AM Lock-Screen Prompt**:
    > *"Shield your calendar today? Sleep was 5.2 hours. We will move Spec Drafting to tomorrow and add a 30-min recovery buffer post-Architecture Review."*
*   **Slack Status Update (Automated)**:
    > Status: 🚫 `Offline (Ebb Buffer)` — *Auto-mute alerts, auto-decline calls.*
*   **Slack Auto-Draft to Manager**:
    > *"Hey! I am adjusting my schedule today to focus offline on deep spec writing. The spec draft will come tomorrow morning instead."*

### B. Daily Communication Rhythm
```
  [8:00 AM]                     [8:30 AM]                     [1:00 PM]                  [6:00 PM]
Wearables API Sync  ──>  Voice "Vent-to-Adjust"  ──>  Mid-Day Re-build Check  ──>  Caffeine Cut-off
                          Check-in & Shield Nudge        (Only if HRV drops)         and Wind-Down Alert
```

---

## 9. Evaluation Metrics & Validation

Ebb measures product success and behavioral changes using four key vectors:

1.  **Shield Adherence Rate (Primary Metric)**:
    $$\text{Adherence Rate} = \frac{\text{Recovery and Focus Shifts Kept on Calendar}}{\text{Total Buffers Created by Ebb}} \times 100$$
    *Target: $>70\%$. Measures if users trust and respect Ebb's calendar boundary protections.*
2.  **Cognitive Alignment Score (CAS)**:
    *Target: Daily average $>80\%$. Measures alignment between biological peak hours and high-complexity task contexts.*
3.  **Somatic Aesthetic Recovery Rate**:
    *Target: 30% reduction in self-reported acne breakouts and hair-shedding counts over a 90-day window.*
4.  **Day 30 User Churn Rate**:
    *Target: $<10\%$ churn. Evaluates workflow retention and structural dependency.*

---

## 10. Live UI Interactive Workflows & Verification

To validate the somatic calendar shield, the following core workflows must be simulated and tested in the interface:

1.  **Stable Recovery (Standard Day)**: Renders Anya in an optimal state (battery 85%). The calendar displays her standard schedule, including intense workouts (Peloton) and scheduled coding sessions.
2.  **Cortisol Red-line (Stress Day)**: Simulated after a low sleep score or a high-fatigue audio check-in:
    *   *Locked Events*: The Daily Standup and multiplayer Architecture Review remain locked in place.
    *   *Shifts*: Flexible alone blocks (*Backlog Triage* and *Security Spec Drafting*) are compressed and shifted into her morning peak window.
    *   *Activity Replacement*: High-intensity Peloton workout is deleted and replaced with a slow, restorative *Somatic Recovery Walk*.
    *   *Buffer Injection*: A 30-minute *Zero-Stimulus Buffer* is injected immediately following the heavy Architecture Review.
3.  **Override Checkbox ("Force Push Through")**: Activating this state under a Cortisol crash simulates a manual override. The calendar reverts to the unoptimized, back-to-back layout. Consequently, the CAS score drops to a glowing warning red **42%** and the **PM Insights panel** at the bottom updates to warning states highlighting acute telogen effluvium (hair loss) and skin flareup risks.

---

## 11. Confidence Scoring & Verification Gates

*   **Log-Probability Evaluation**: The extraction confidence score is derived directly from the average token log-probabilities output by the local LLM during the parsing of voice transcripts.
*   **The 0.75 Quality Gate**: If any dimension's confidence score falls **below 0.75**, Ebb blocks the silent write to the local database. Instead, it triggers a confirmation alert in the client application, requiring Anya to edit or verify the parsed details before final database commit.

---

## 12. Strategic Trade-offs & Risks

### A. Core Trade-offs
*   **Career Velocity vs. Somatic Longevity**: Using Ebb is a trade-off. It accepts that Anya will work fewer hours at maximum stress (declining performative work) to ensure her sustained output remains high-quality over months, avoiding major burnout cycles.
*   **Autonomy vs. Algorithmic Guardrails**: The user trades away some active calendar control to reduce decision fatigue, trusting an algorithm to define when they should write specs or rest.

### B. Product Risks
*   **Dependency Risk**: Anya might lose intuitive connection to her body, relying entirely on the "somatic score" to decide if she has the energy to perform a task.
*   **Consensus Churn**: If team members use conflicting calendar filters, Ebb’s dynamic rescheduling can lead to "schedule ping-pong" where meetings are shifted back and forth.
*   **Biometric Data Privacy**: Collecting sleep, heart rate, and hormonal acne logs locally requires a highly secure encrypted sandbox. Any data leakage to corporate dashboards represents a catastrophic breach of trust.

---

## 13. Areas of Future Improvement

To evolve Ebb from a personal utility into a comprehensive workflow system:
1.  **Multi-User Somatic Scheduling**: Build group calendar schedulers that identify the intersection of everyone's physiological peaks to schedule heavy design reviews, preventing team-wide meeting fatigue.
2.  **Zero-Hardware Biometrics**: Abstract wearables by utilizing native device telemetry (mouse scroll velocity, keystroke latency, vocal fatigue index during scrums) to estimate cognitive battery without requiring an Oura ring or Apple Watch.
3.  **Jira/GitHub Semantic Task Mapping**: Automate task difficulty estimation by scanning ticket descriptions and assigning weight (High, Medium, Low cognitive complexity) using a local LLM, eliminating the need for manual task classification.

---

## 14. Interviewer Defense (Core Objections)

*   **Q: Why is this not just a smarter calendar?**
    *   *A*: Calendars schedule time, treating all hours identically. Ebb schedules *biological context*. It maps task complexity to physiological availability.
*   **Q: What happens if I don't own a wearable?**
    *   *A*: Ebb falls back to a 3-second morning lock-screen slider: *"How did you sleep? (1-5)"* and uses historical schedules to estimate the circadian curve.
*   **Q: Why won't I uninstall this after two weeks?**
    *   *A*: Because uninstalling it introduces scheduling friction. It acts as an automated admin assistant. Removing it means you take back the cognitive load of defending your time.
*   **Q: Why should I care about CAS?**
    *   *A*: It is a metric of scheduling efficiency. It teaches you to stop wasting your sharpest biological hours on Slack triage and administrative tasks.
*   **Q: Why should I let software rearrange my calendar?**
    *   *A*: It doesn't. Ebb operates on explicit consent. The "Shield Me" notification at 8:30 AM presents the proposed calendar shift; it is only executed if you tap approve.
*   **Q: What is the absolute smallest version we can ship in Week 12?**
    *   *A*: A Google Calendar integration that sends a morning push notification based on sleep data, auto-blocking one 90-minute focus block and one 30-minute post-meeting buffer if sleep is $<6.5$ hours.
