// ==========================================================================
// Ebb: SQL Performance Evaluation & Audit Engine
// ==========================================================================

export function calculateShieldAdherence(userId, db) {
    // Fetch all approved shifts
    const approvedLogs = db.prepare("SELECT proposed_shifts_json FROM somatic_shifts_log WHERE user_id = ? AND user_decision = 'APPROVED'").all(userId);
    
    let totalProposedShifts = 0;
    let totalKeptShifts = 0;

    approvedLogs.forEach(row => {
        const actions = JSON.parse(row.proposed_shifts_json);
        
        actions.forEach(action => {
            totalProposedShifts++;
            if (action.type === 'SHIFT_EVENT') {
                // Check if event start time in cache matches the proposed start
                const event = db.prepare('SELECT start_time FROM calendar_cache WHERE user_id = ? AND event_id = ?').get(userId, action.event_id);
                if (event && event.start_time === action.proposed_start) {
                    totalKeptShifts++;
                }
            } else if (action.type === 'REPLACE_WORKOUT') {
                // Check if workout title is updated
                const event = db.prepare('SELECT event_title FROM calendar_cache WHERE user_id = ? AND event_id = ?').get(userId, action.event_id);
                if (event && event.event_title === action.replacement_title) {
                    totalKeptShifts++;
                }
            } else if (action.type === 'INJECT_BUFFER') {
                // Check if buffer event exists in cache
                const event = db.prepare('SELECT COUNT(*) as count FROM calendar_cache WHERE user_id = ? AND event_title = ? AND start_time = ?').get(userId, action.title, action.start);
                if (event && event.count > 0) {
                    totalKeptShifts++;
                }
            }
        });
    });

    const rate = totalProposedShifts === 0 ? 100.0 : (totalKeptShifts / totalProposedShifts) * 100.0;
    return {
        total_proposed_shifts: totalProposedShifts,
        total_kept_shifts: totalKeptShifts,
        adherence_rate_percentage: parseFloat(rate.toFixed(2))
    };
}

export function calculateCAS(userId, dateStr, db) {
    // 1. Fetch biometrics for the day to check readiness
    const bio = db.prepare('SELECT hrv_ms, sleep_duration_seconds, calculated_battery_percentage FROM biometrics_log WHERE user_id = ? AND date = ?').get(userId, dateStr);
    
    // Default to high energy if no biometrics synced
    const hrv = bio ? bio.hrv_ms : 70;
    const isLowEnergy = hrv < 45;

    // 2. Fetch all events for today
    const events = db.prepare('SELECT * FROM calendar_cache WHERE user_id = ?').all(userId);
    
    // Filter events that occur on dateStr
    const todayEvents = events.filter(e => e.start_time.startsWith(dateStr));

    if (todayEvents.length === 0) {
        return { cas_score_percentage: 100 }; // Clean slate
    }

    let totalWorkingMinutes = 0;
    let alignedMinutes = 0;

    todayEvents.forEach(evt => {
        const start = new Date(evt.start_time);
        const end = new Date(evt.end_time);
        const durationMins = (end.getTime() - start.getTime()) / 60000;
        
        totalWorkingMinutes += durationMins;

        const startHour = start.getUTCHours();
        const title = evt.event_title.toLowerCase();

        if (isLowEnergy) {
            // Low-readiness alignment rules:
            if (title.includes('scrum') || title.includes('architecture review') || title.includes('standup')) {
                // Multiplayer meetings are locked and accepted as aligned
                alignedMinutes += durationMins;
            } else if (title.includes('spec') || title.includes('drafting')) {
                // Focus spec-drafting is aligned ONLY if shifted to morning (before 12 PM UTC/local)
                if (startHour < 12) {
                    alignedMinutes += durationMins;
                }
            } else if (title.includes('buffer') || title.includes('decompression') || title.includes('somatic') || title.includes('walk')) {
                // Buffers and recovery walks are aligned
                alignedMinutes += durationMins;
            } else if (title.includes('backlog') || title.includes('triage') || title.includes('admin')) {
                // Admin triage is aligned during slump hours (12 PM to 5 PM UTC/local)
                if (startHour >= 12 && startHour < 17) {
                    alignedMinutes += durationMins;
                }
            } else if (title.includes('peloton') || title.includes('hiit') || title.includes('workout')) {
                // Intense workouts are NOT aligned on low-readiness days
                // 0 aligned minutes
            } else {
                // Default fallback
                alignedMinutes += durationMins * 0.5;
            }
        } else {
            // High-readiness alignment rules (all standard tasks aligned)
            if (!title.includes('buffer')) {
                alignedMinutes += durationMins;
            } else {
                // Buffers are not strictly necessary on high readiness but okay
                alignedMinutes += durationMins * 0.8;
            }
        }
    });

    const score = totalWorkingMinutes === 0 ? 100 : (alignedMinutes / totalWorkingMinutes) * 100;
    return {
        total_working_minutes: totalWorkingMinutes,
        aligned_minutes: alignedMinutes,
        cas_score_percentage: Math.min(100, Math.round(score))
    };
}
