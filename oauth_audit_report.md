# Google API OAuth Verification & Security Audit Report: Ebb

This document outlines the security architecture, permission scopes, and data privacy policies for **Ebb: The Unified Somatic & Energy Operating System**, prepared for Google API OAuth review.

---

## 1. App Identification
- **App Name**: Ebb: The Unified Somatic & Energy Operating System
- **Product Architecture**: Local-first macOS / Windows Desktop Widget (Tauri client + local server)
- **Target Audience**: Knowledge workers suffering from cognitive burnout and chronic stress

---

## 2. OAuth Scopes Requested

| Scope | Permission Level | Justification |
| :--- | :--- | :--- |
| `https://www.googleapis.com/auth/calendar.events` | View and edit events on user calendars | Required to read event metadata (attendees count, duration) for multiplayer classification, and to automate focus shifts, workout replacements, and Zero-Stimulus buffer injections. |

### Detailed Scope Justification & Workflows
1. **Multiplayer Classification (Read)**:
   Ebb scans upcoming calendar event metadata to count attendees and check domains. If an event has $\ge 3$ attendees or contains an external client domain, it is marked as `LOCKED`. Other alone events are marked as `RESCHEDULABLE`.
2. **Somatic Boundary Shifting (Write)**:
   When biometric sensors detect low readiness (HRV $< 45$ms or sleep $< 6$ hours), Ebb shifts reschedulable alone blocks (e.g. *Security Spec Drafting*) to the morning peak focus window, deletes high-intensity workouts (replacing them with somatic walks), and injects a 30-minute `Zero-Stimulus Recovery Buffer` post locked meetings.
3. **Mid-Day Reset (Write)**:
   Upon a sudden midday HRV drop ($> 40\%$ below baseline), Ebb triggers a reset. Remaining afternoon alone tasks are shifted to tomorrow's afternoon peak, and an immediate emergency decompression block is added.

---

## 3. Privacy & Cryptography Architecture

Ebb is engineered around a **local-first privacy architecture**:
- **On-Device Data Storage**: All synced calendar caches, wearable biometrics (HRV, Sleep stages, Resting Heart Rate), subjective voice transcripts, and calibration survey inputs are stored in a local SQLite file (`ebb.db`) on the user's hard drive.
- **Encryption at Rest**: Column and payload data is protected using **AES-256-GCM** encryption. Key derivation is handled locally via Scrypt Sync utilizing a user passphrase.
- **Zero Ingress Leakage**: No calendar entries or biometrics details are sent to Ebb servers. All somatic parsing (STT engine) and chrono-scheduling rules execute locally.
- **Secure Key Storage**: OAuth access and refresh tokens are fully encrypted using AES-256-GCM before write-commits to the SQLite database.

---

## 4. Slack DND Webhook Integration

Ebb synchronizes boundaries with the user's Slack workspace:
- **DND Snooze**: During recovery buffers (Zero-Stimulus or Emergency Decompression), Ebb issues a POST request to Slack's profile API to update status to `Offline (Ebb Buffer)` and trigger a 30-minute snooze.
- **Presence Muting**: Auto-pauses incoming notifications during peak focus sessions to safeguard cognitive reserves.
