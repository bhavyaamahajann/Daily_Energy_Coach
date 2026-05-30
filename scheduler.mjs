// ==========================================================================
// Ebb: Chrono-Scheduling Rules Engine (Somatic Rescheduler)
// ==========================================================================
import crypto from 'node:crypto';

export function classifyEvent(event) {
    // Multiplayer Classifier: Locked if >= 3 attendees or is external client domain
    const attendeeCount = event.attendee_count || 1;
    const isExternal = event.is_external === 1 || event.is_external === true;
    
    if (attendeeCount >= 3 || isExternal) {
        return 'LOCKED';
    }
    return 'RESCHEDULABLE';
}

export function generateShieldProposal(userId, dateStr, db) {
    // 1. Fetch biometrics
    const bio = db.prepare('SELECT hrv_ms, sleep_duration_seconds, calculated_battery_percentage FROM biometrics_log WHERE user_id = ? AND date = ?').get(userId, dateStr);
    if (!bio) {
        return { error: 'No biometrics synced for today. Run biometrics/Oura sync first.' };
    }

    const battery = bio.calculated_battery_percentage;
    const isLowEnergy = battery <= 45 || bio.hrv_ms < 45 || bio.sleep_duration_seconds < 21600;

    // 2. Fetch cache calendar events
    const events = db.prepare('SELECT * FROM calendar_cache WHERE user_id = ?').all(userId);

    // Classify all active events
    const lockedMeetings = [];
    const reschedulableSessions = [];

    events.forEach(evt => {
        // Re-classify to make sure state is correct
        evt.classification = classifyEvent(evt);
        if (evt.classification === 'LOCKED') {
            lockedMeetings.append ? lockedMeetings.append(evt) : lockedMeetings.push(evt);
        } else {
            reschedulableSessions.append ? reschedulableSessions.append(evt) : reschedulableSessions.push(evt);
        }
    });

    const proposedActions = [];

    if (isLowEnergy) {
        // Step 1: Shift and compress flexible alone spec-drafting blocks to morning peak (9:00 AM)
        const specWriting = reschedulableSessions.find(s => s.event_title.toLowerCase().includes('spec') || s.event_title.toLowerCase().includes('drafting'));
        if (specWriting) {
            proposedActions.push({
                type: 'SHIFT_EVENT',
                event_id: specWriting.event_id,
                title: specWriting.event_title,
                original_start: specWriting.start_time,
                proposed_start: `${dateStr}T09:00:00Z`
            });
        }

        // Step 2: Inject a 30-minute zero-stimulus buffer post locked meetings
        lockedMeetings.forEach(meeting => {
            // Check if duration is heavy (>= 60 mins)
            const start = new Date(meeting.start_time);
            const end = new Date(meeting.end_time);
            const durationMins = (end.getTime() - start.getTime()) / 60000;

            if (durationMins >= 60) {
                proposedActions.push({
                    type: 'INJECT_BUFFER',
                    after_event_id: meeting.event_id,
                    title: 'Zero-Stimulus Recovery Buffer',
                    start: meeting.end_time,
                    end: new Date(end.getTime() + 30 * 60000).toISOString()
                });
            }
        });

        // Step 3: Replace high-intensity Peloton workouts with slow somatic walks
        const workout = reschedulableSessions.find(s => s.event_title.toLowerCase().includes('peloton') || s.event_title.toLowerCase().includes('hiit'));
        if (workout) {
            proposedActions.push({
                type: 'REPLACE_WORKOUT',
                event_id: workout.event_id,
                title: workout.event_title,
                replacement_title: 'Somatic Recovery Walk'
            });
        }
    }

    return {
        somatic_battery: battery,
        cas_projection_standard: isLowEnergy ? 35 : 95,
        cas_projection_shielded: isLowEnergy ? 88 : 95,
        proposed_actions: proposedActions
    };
}

export function confirmShieldProposal(userId, dateStr, confirmedActions, db) {
    db.prepare('DELETE FROM somatic_shifts_log WHERE user_id = ? AND date = ?').run(userId, dateStr);

    // Save decision to DB
    const shiftUuid = crypto.randomUUID ? crypto.randomUUID() : 'shift-uuid-' + Date.now();
    db.prepare(`
        INSERT INTO somatic_shifts_log (id, user_id, date, proposed_shifts_json, user_decision, cognitive_alignment_score)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        shiftUuid,
        userId,
        dateStr,
        JSON.stringify(confirmedActions),
        'APPROVED',
        88
    );

    // Mutate local GCal SQLite Cache
    confirmedActions.forEach(action => {
        if (action.type === 'SHIFT_EVENT') {
            // Update start/end times in SQLite cache
            db.prepare('UPDATE calendar_cache SET start_time = ?, end_time = ? WHERE event_id = ?')
              .run(action.proposed_start, addMinutesToIso(action.proposed_start, 60), action.event_id);
        } else if (action.type === 'REPLACE_WORKOUT') {
            // Rename workout
            db.prepare('UPDATE calendar_cache SET event_title = ? WHERE event_id = ?')
              .run(action.replacement_title, action.event_id);
        } else if (action.type === 'INJECT_BUFFER') {
            // Insert a new buffer event into GCal Cache
            const bufferId = 'evt-buffer-' + Date.now() + Math.random().toString(36).substr(2, 5);
            db.prepare(`
                INSERT OR REPLACE INTO calendar_cache (id, user_id, event_id, event_title, start_time, end_time, attendee_count, is_external, classification)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                bufferId,
                userId,
                bufferId,
                action.title,
                action.start,
                action.end,
                1,
                0,
                'RESCHEDULABLE'
            );
        }
    });

    return { status: 'MUTATION_COMPLETE', slack_dnd_active: true };
}

export function executeMiddayRebuild(userId, currentTimeStr, db) {
    const todayStr = currentTimeStr.split('T')[0];
    const current = new Date(currentTimeStr);

    // Fetch alone events that have start times after current_time
    const events = db.prepare('SELECT * FROM calendar_cache WHERE user_id = ?').all(userId);
    const tomorrowStr = new Date(current.getTime() + 24 * 3600000).toISOString().split('T')[0];

    const shiftedEvents = [];
    const injectedBuffers = [];

    events.forEach(evt => {
        const start = new Date(evt.start_time);
        const classification = classifyEvent(evt);
        
        // 1. Shift remaining alone events to tomorrow morning
        if (classification === 'RESCHEDULABLE' && start.getTime() > current.getTime() && !evt.event_title.toLowerCase().includes('buffer')) {
            const originalStart = evt.start_time;
            const newStart = `${tomorrowStr}T14:00:00Z`; // Shift to tomorrow afternoon peak
            
            db.prepare('UPDATE calendar_cache SET start_time = ?, end_time = ? WHERE event_id = ?')
              .run(newStart, addMinutesToIso(newStart, 60), evt.event_id);

            shiftedEvents.push({
                event_id: evt.event_id,
                title: evt.event_title,
                original_start: originalStart,
                new_start: newStart
            });
        }
    });

    // 2. Inject emergency 30m decompression recovery buffer immediately after current time
    const bufferId = 'evt-midday-buffer-' + Date.now();
    const bufferStart = currentTimeStr;
    const bufferEnd = new Date(current.getTime() + 30 * 60000).toISOString();

    db.prepare(`
        INSERT OR REPLACE INTO calendar_cache (id, user_id, event_id, event_title, start_time, end_time, attendee_count, is_external, classification)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        bufferId,
        userId,
        bufferId,
        'Emergency Somatic Decompression',
        bufferStart,
        bufferEnd,
        1,
        0,
        'RESCHEDULABLE'
    );

    injectedBuffers.push({
        title: 'Emergency Somatic Decompression',
        start: bufferStart,
        end: bufferEnd
    });

    return {
        rebuild_executed: true,
        shifted_events: shiftedEvents,
        injected_buffers: injectedBuffers
    };
}

// Helpers
function addMinutesToIso(isoStr, mins) {
    const d = new Date(isoStr);
    return new Date(d.getTime() + mins * 60000).toISOString();
}
