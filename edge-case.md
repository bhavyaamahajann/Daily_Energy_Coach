# Edge Cases & Recovery Protocols: Ebb

This document outlines the product requirements and technical mitigation strategies for handling edge cases, failure states, and user behavioral deviations in **Ebb: The Unified Somatic & Energy Operating System**.

---

## 1. Chronic Biometric Mismatch (Cortisol Red-line vs. Mental Drive)

*   **The Scenario**: Anya's wearables register poor physical recovery (HRV is down 40%, resting HR is elevated at 76, sleep was 5.2 hours). However, Anya feels highly caffeinated, hyper-focused, and wants to push through. Or conversely, the Oura ring reports a "90% Readiness Score," but cortisol-induced chronic burnout makes her mentally paralyzed.
*   **The Product Rule**: **Subjective alignment overrides passive sensing, with proactive crash buffers.**
*   **Mitigation Strategy**:
    *   *Somatic Alignment Check*: During the 8:30 AM voice check-in, Anya's subjective speech inputs act as the ultimate truth source.
    *   *Mismatch Alert*: If a mismatch is detected, Ebb displays a warning toast:
        > *"Your body indicators suggest high strain today, but you report feeling sharp. We've optimized your schedule for high energy, but expect an earlier energy crash. We have added a recovery block at 1:30 PM just in case."*
    *   *Auto-Calibration*: The Chrono-Engine tracks historical subjective-to-objective variance. If Anya consistently reports high energy despite low HRV, the system auto-calibrates her baseline to prevent false "low sleep" schedules.

---

## 2. Multi-Person Locked Meetings (Architecture Reviews / Board Meetings)

*   **The Scenario**: Ebb detects a low HRV day and attempts to shift a meeting to the afternoon. However, the meeting is a critical cross-functional architecture review with 20+ participants. Unilateral rescheduling is impossible without permission.
*   **The Product Rule**: **Ebb locks multi-person meetings and reschedules alone sessions around them.**
*   **Mitigation Strategy**:
    *   *Sensing Attendee Counts*: The Calendar API inspects the attendee array size. If the attendee count is $\ge 3$, or if it contains external client domains, Ebb flags the event classification status as `LOCKED`.
    *   *Alone-Time Rescheduling*: Ebb dynamically reschedules Anya's independent blocks (such as *Security Spec Drafting* or *Backlog Triage*) to fit her peak biological hours.
    *   *Recovery Buffers*: For locked meetings scheduled during Anya's biological energy crashes, Ebb keeps the meeting in place but inserts a mandatory 30-minute `Zero-Stimulus Recovery Buffer` immediately after, muting all Slack alerts to protect her health.

---

## 3. Wearable Sync Failure (Dead Battery / Charger Left at Home)

*   **The Scenario**: Anya forgets to wear her ring to bed, or the battery dies mid-sleep, resulting in a complete lack of overnight sleep metrics or morning HRV.
*   **The Product Rule**: **Graceful degradation to historical baseline + manual fallback.**
*   **Mitigation Strategy**:
    *   *Baseline Backfill*: If no sleep data is ingested by 8:00 AM, Ebb checks the user's average sleep/HRV metrics for that specific day of the week (e.g., average Tuesday metrics).
    *   *Morning Slider Fallback*: When Anya opens her laptop, the desktop widget initiates a fallback prompt:
        > *"No wearable data detected. How did you sleep last night?"* (Options: 1-5 slider).
    *   *Circadian Estimation*: The slider input is combined with the historical Tuesday baseline to estimate the daily circadian curve.

---

## 4. Timezone Shifts & Jetlag

*   **The Scenario**: Anya travels from San Francisco to London (a 5-hour time difference) for a conference. Her calendar shifts to London local time, but her biological clock is still running on San Francisco time.
*   **The Product Rule**: **Gradual phase-shifting protocol.**
*   **Mitigation Strategy**:
    *   *Timezone Gap Detection*: Ebb monitors device GPS/timezone settings and the Google Calendar timezone profile.
    *   *Jetlag Adjustment Protocol*: Upon detecting a timezone gap of >3 hours, Ebb initiates the transition curve:
        *   It does *not* immediately match the circadian curve to London local hours.
        *   It maps a 3-day transition curve, shifting her predicted peak window forward by 1.5 hours each day.
        *   During this transition, GCal places high-complexity blocks during Anya's actual biological peak (even if it's late afternoon local London time) and blocks out mornings for sleep/recovery.

---

## 5. Low Confidence Extractions (Under 0.75 Gate)

*   **The Scenario**: Anya's 8:30 AM voice check-in transcript is muddy or contains ambiguous terms (e.g. mumbling while brushing teeth), causing the LLM parsing confidence score for one or more somatic dimensions to fall below 0.75.
*   **The Product Rule**: **Halt silent database commit and prompt manual confirmation.**
*   **Mitigation Strategy**:
    *   *Transaction Queueing*: The ingestion pipeline blocks the database commit for the affected dimensions, writing the payloads in a `PENDING_VERIFICATION` state.
    *   *Tauri Verification Modal*: Ebb dispatches a localized UI alert showing the extracted draft:
        > *"We had trouble parsing your mental health check-in. Did we get this right?"*
    *   *Manual Override*: Anya can edit or confirm the details with a single tap in the system tray menu before final database commit.

---

## 6. Comfort Bias & Performance Gaming

*   **The Scenario**: Anya gamifies the CAS score by repeatedly choosing "Shield Me" or reporting low subjective energy to clear her calendar of difficult, high-cognitive tasks, delaying critical scale-up engineering milestones.
*   **The Product Rule**: **Task velocity monitoring and automatic Velocity Override.**
*   **Mitigation Strategy**:
    *   *Velocity Mapping*: The engine monitors Jira ticket completions and GitHub pull request rates alongside CAS scores.
    *   *Friction Enforcement*: If CAS remains high ($>90\%$) but task velocity falls below 50% for two consecutive weeks, or if she shields $>8$ blocks in 14 days, Ebb triggers a **Velocity Override**.
    *   *Action*: Ebb disables low-energy calendar reschedules for 7 days, forcing Anya to confront her planned schedule and prevent performance avoidance.

---

## 7. Mid-Day Reset Deadlocks

*   **The Scenario**: A mid-day biometrics crash occurs (real-time HRV drop $>40\%$), triggering `POST /api/v1/calendar/rebuild` at 2:00 PM. However, Anya's remaining afternoon calendar consists entirely of locked multiplayer meetings, leaving no flexible alone blocks to reschedule.
*   **The Product Rule**: **DND escalation and immediate buffer injection.**
*   **Mitigation Strategy**:
    *   *Immediate Buffer*: If there are no reschedulable blocks left, Ebb cannot shift work. Instead, it injects an immediate 30-minute *Zero-Stimulus Recovery Buffer* post-meeting.
    *   *Slack Escalation*: Ebb sets her Slack status to DND immediately, overriding the calendar grid constraints, and sends a system tray toast:
        > *"Your calendar has no reschedulable blocks remaining, but biometrics show critical depletion. We have set Slack to DND and scheduled a post-meeting rest buffer."*

---

## 8. 90-Day Somatic Stress Lag Detection Failure

*   **The Scenario**: Anya's wearable battery dies or she leaves the tracker off for a week during a high-stress sprint. Months later, she experiences hair shedding (telogen effluvium) or acne flaring, but Ebb has no objective HRV/sleep data from 90 days prior to demonstrate the stress-lag correlation.
*   **The Product Rule**: **Multi-modal metadata backfilling.**
*   **Mitigation Strategy**:
    *   *Metadata Reconstruction*: If wearable biometrics are missing, Ebb queries historical calendar cache metadata (average daily meeting loads) and desktop telemetry logs (keyboard keystroke density histories) from that period.
    *   *Correlative Estimation*: Ebb estimates the historical stress baseline from the metadata, mapping the 90-day lag to prove to Anya that somatic recovery is physiologically required.

---

## 9. Paxos Scheduling Churn (Rescheduling Deadlocks)

*   **The Scenario**: Ebb attempts to reschedule a meeting on Anya's calendar. However, another team member's energy coach attempts to shift it back to optimize for their peak biological hour, causing infinite calendar shifting loops.
*   **The Product Rule**: **Read-only multi-player locks and Paxos consensus scheduling.**
*   **Mitigation Strategy**:
    *   *Multiplayer Lock*: Unilateral moves only apply to `RESCHEDULABLE` alone working blocks. All multiplayer meetings ($\ge 3$ attendees) are marked strictly read-only (`LOCKED`) by the local engine.
    *   *Paxos Consent Voting*: If a team sync needs rescheduling, Ebb compiles three proposed slots where the team's average biological batteries are optimized. It sends a Slack voting block rather than executing automated changes.
