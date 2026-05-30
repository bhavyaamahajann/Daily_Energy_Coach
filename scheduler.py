import datetime
import uuid

def classify_event(event):
    # Multiplayer Classifier: Locked if >= 3 attendees or is external client domain
    attendee_count = event.get("attendee_count", 1)
    is_external = event.get("is_external", 0) == 1 or event.get("is_external") is True
    
    if attendee_count >= 3 or is_external:
        return 'LOCKED'
    return 'RESCHEDULABLE'

def generate_shield_proposal(date_str, db):
    # 1. Fetch biometrics
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT hrv_ms, sleep_duration_seconds, battery_percentage 
            FROM biometrics_log 
            WHERE date = ?
        """, (date_str,))
        row = cursor.fetchone()
    
    if not row:
        return { "error": "No biometrics synced for today. Run biometrics sync first." }

    hrv, sleep_sec, battery = row
    # Determine if low energy
    is_low_energy = battery <= 45 or hrv < 45 or sleep_sec < 21600

    # 2. Fetch cache calendar events
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT event_id, event_title, start_time, end_time, attendee_count, classification FROM calendar_cache")
        columns = [col[0] for col in cursor.description]
        events = [dict(zip(columns, r)) for r in cursor.fetchall()]

    locked_meetings = []
    reschedulable_sessions = []

    for evt in events:
        evt["classification"] = classify_event(evt)
        if evt["classification"] == 'LOCKED':
            locked_meetings.append(evt)
        else:
            reschedulable_sessions.append(evt)

    proposed_actions = []

    if is_low_energy:
        # Step 1: Shift and compress flexible alone spec-drafting blocks to morning peak (9:00 AM)
        spec_writing = next((s for s in reschedulable_sessions if 'spec' in s['event_title'].lower() or 'drafting' in s['event_title'].lower()), None)
        if spec_writing:
            proposed_actions.append({
                "type": "SHIFT_EVENT",
                "event_id": spec_writing["event_id"],
                "title": spec_writing["event_title"],
                "original_start": spec_writing["start_time"],
                "proposed_start": f"{date_str}T09:00:00Z"
            })

        # Step 2: Inject a 30-minute zero-stimulus buffer post locked meetings >= 60 mins
        for meeting in locked_meetings:
            try:
                start = datetime.datetime.fromisoformat(meeting["start_time"].replace("Z", "+00:00"))
                end = datetime.datetime.fromisoformat(meeting["end_time"].replace("Z", "+00:00"))
                duration_mins = (end - start).total_seconds() / 60.0
            except Exception:
                duration_mins = 60 # Default fallback
            
            if duration_mins >= 60:
                end_iso = end.isoformat().replace("+00:00", "Z")
                buffer_end = (end + datetime.timedelta(minutes=30)).isoformat().replace("+00:00", "Z")
                proposed_actions.append({
                    "type": "INJECT_BUFFER",
                    "after_event_id": meeting["event_id"],
                    "title": "Zero-Stimulus Recovery Buffer",
                    "start": end_iso,
                    "end": buffer_end
                })

        # Step 3: Replace high-intensity Peloton workouts with slow somatic walks
        workout = next((s for s in reschedulable_sessions if 'peloton' in s['event_title'].lower() or 'hiit' in s['event_title'].lower()), None)
        if workout:
            proposed_actions.append({
                "type": "REPLACE_WORKOUT",
                "event_id": workout["event_id"],
                "title": workout["event_title"],
                "replacement_title": "Somatic Recovery Walk"
            })

    return {
        "somatic_battery": battery,
        "cas_projection_standard": 35 if is_low_energy else 95,
        "cas_projection_shielded": 88 if is_low_energy else 95,
        "proposed_actions": proposed_actions
    }

def confirm_shield_proposal(date_str, confirmed_actions, db):
    # Remove older shifts
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM somatic_shifts_log WHERE date = ?", (date_str,))
        conn.commit()

    # Save decision
    shift_uuid = str(uuid.uuid4())
    db.save_shift_decision(shift_uuid, date_str, confirmed_actions, 'APPROVED', 88)

    # Mutate local GCal Cache
    with db.get_connection() as conn:
        cursor = conn.cursor()
        for action in confirmed_actions:
            if action["type"] == 'SHIFT_EVENT':
                # Update start/end times in SQLite cache
                new_start = action["proposed_start"]
                new_end = (datetime.datetime.fromisoformat(new_start.replace("Z", "+00:00")) + datetime.timedelta(minutes=60)).isoformat().replace("+00:00", "Z")
                cursor.execute("""
                    UPDATE calendar_cache 
                    SET start_time = ?, end_time = ? 
                    WHERE event_id = ?
                """, (new_start, new_end, action["event_id"]))
            elif action["type"] == 'REPLACE_WORKOUT':
                # Rename workout
                cursor.execute("""
                    UPDATE calendar_cache 
                    SET event_title = ? 
                    WHERE event_id = ?
                """, (action["replacement_title"], action["event_id"]))
            elif action["type"] == 'INJECT_BUFFER':
                # Insert buffer event
                buffer_id = f"evt-buffer-{int(datetime.datetime.now().timestamp())}"
                cursor.execute("""
                    INSERT OR REPLACE INTO calendar_cache 
                    (event_id, event_title, start_time, end_time, attendee_count, classification)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (buffer_id, action["title"], action["start"], action["end"], 1, 'RESCHEDULABLE'))
        conn.commit()

    return { "status": "MUTATION_COMPLETE", "slack_dnd_active": True }

def execute_midday_rebuild(current_time_str, db):
    today_str = current_time_str.split('T')[0]
    current = datetime.datetime.fromisoformat(current_time_str.replace("Z", "+00:00"))
    tomorrow_str = (current + datetime.timedelta(days=1)).isoformat().split('T')[0]

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT event_id, event_title, start_time, end_time, attendee_count, classification FROM calendar_cache")
        columns = [col[0] for col in cursor.description]
        events = [dict(zip(columns, r)) for r in cursor.fetchall()]

    shifted_events = []
    injected_buffers = []

    with db.get_connection() as conn:
        cursor = conn.cursor()
        for evt in events:
            start = datetime.datetime.fromisoformat(evt["start_time"].replace("Z", "+00:00"))
            classification = classify_event(evt)
            
            # Shift remaining alone events to tomorrow morning
            if classification == 'RESCHEDULABLE' and start.timestamp() > current.timestamp() and 'buffer' not in evt["event_title"].lower():
                original_start = evt["start_time"]
                new_start = f"{tomorrow_str}T14:00:00Z" # Shift to tomorrow afternoon peak
                new_end = f"{tomorrow_str}T15:00:00Z"
                
                cursor.execute("""
                    UPDATE calendar_cache 
                    SET start_time = ?, end_time = ? 
                    WHERE event_id = ?
                """, (new_start, new_end, evt["event_id"]))

                shifted_events.append({
                    "event_id": evt["event_id"],
                    "title": evt["event_title"],
                    "original_start": original_start,
                    "new_start": new_start
                })

        # Inject emergency 30m buffer
        buffer_id = f"evt-midday-buffer-{int(datetime.datetime.now().timestamp())}"
        buffer_start = current_time_str
        buffer_end = (current + datetime.timedelta(minutes=30)).isoformat().replace("+00:00", "Z")

        cursor.execute("""
            INSERT OR REPLACE INTO calendar_cache 
            (event_id, event_title, start_time, end_time, attendee_count, classification)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (buffer_id, 'Emergency Somatic Decompression', buffer_start, buffer_end, 1, 'RESCHEDULABLE'))
        conn.commit()

    injected_buffers.append({
        "title": "Emergency Somatic Decompression",
        "start": buffer_start,
        "end": buffer_end
    })

    return {
        "rebuild_executed": True,
        "shifted_events": shifted_events,
        "injected_buffers": injected_buffers
    }
