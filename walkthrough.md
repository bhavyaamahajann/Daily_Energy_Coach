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
