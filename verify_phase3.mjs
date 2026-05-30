import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'child_process';
import assert from 'assert';
import fs from 'fs';

console.log('==========================================================================');
console.log('Ebb Verification Test Suite: Part 1 Phase 3');
console.log('==========================================================================\n');

const DB_PATH = 'ebb.db';
const ANYA_ID = 'anya-uuid-123456';
const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0];

// 1. Launch the server in the background
console.log('Starting local backend server...');
const serverProcess = spawn('node', ['server.mjs'], { stdio: 'inherit' });

// Give server 1.5 seconds to spin up
await new Promise(resolve => setTimeout(resolve, 1500));

try {
    const localDb = new DatabaseSync(DB_PATH);

    // 2. Verify Multiplayer Classification and Initial Seed
    console.log('\nChecking calendar cache seed and classification...');
    const seededEvents = localDb.prepare('SELECT * FROM calendar_cache WHERE user_id = ? ORDER BY start_time ASC').all(ANYA_ID);
    
    assert.strictEqual(seededEvents.length, 5, 'Should have seeded 5 default calendar items');
    
    // Check classifier output for seeded events
    const standup = seededEvents.find(e => e.event_title.includes('Scrum'));
    const archReview = seededEvents.find(e => e.event_title.includes('Architecture Review'));
    const backlog = seededEvents.find(e => e.event_title.includes('Backlog Triage'));
    const specWriting = seededEvents.find(e => e.event_title.includes('Security Spec Drafting'));
    const peloton = seededEvents.find(e => e.event_title.includes('Peloton'));

    assert.strictEqual(standup.classification, 'LOCKED', 'Scrum (attendees >= 3) should be LOCKED');
    assert.strictEqual(archReview.classification, 'LOCKED', 'Architecture Review (attendees >= 3) should be LOCKED');
    assert.strictEqual(backlog.classification, 'RESCHEDULABLE', 'Backlog Triage (attendees < 3) should be RESCHEDULABLE');
    assert.strictEqual(specWriting.classification, 'RESCHEDULABLE', 'Security Spec Drafting (attendees < 3) should be RESCHEDULABLE');
    assert.strictEqual(peloton.classification, 'RESCHEDULABLE', 'Peloton Ride (attendees < 3) should be RESCHEDULABLE');

    console.log('✔ Verification 1: Seeding and multiplayer classification verified.');

    // 3. Sync low-readiness biometrics (HRV = 24ms, Sleep = 5.8 hours)
    console.log('\nSyncing low-readiness biometrics via mock Oura sync...');
    const syncRes = await fetch('http://localhost:3000/api/v1/oauth/oura/sync', { method: 'POST' });
    const syncData = await syncRes.json();
    assert.strictEqual(syncData.status, 'OURA_SYNC_COMPLETE');
    console.log('✔ Sync completed:', syncData.synced_metrics);

    // 4. Test Calendar Shield Proposal API
    console.log('\nFetching calendar shield proposals...');
    const proposalRes = await fetch('http://localhost:3000/api/v1/calendar/shield-proposal', { method: 'POST' });
    const proposalData = await proposalRes.json();
    
    console.log('Proposed Actions:', proposalData.proposed_actions);
    
    assert.strictEqual(proposalData.somatic_battery, 45, 'Battery score should match the synced low value');
    assert.strictEqual(proposalData.cas_projection_standard, 35);
    assert.strictEqual(proposalData.cas_projection_shielded, 88);

    const shiftAction = proposalData.proposed_actions.find(a => a.type === 'SHIFT_EVENT');
    const bufferAction = proposalData.proposed_actions.find(a => a.type === 'INJECT_BUFFER');
    const replaceAction = proposalData.proposed_actions.find(a => a.type === 'REPLACE_WORKOUT');

    assert(shiftAction, 'Should propose to shift Security Spec Drafting');
    assert.strictEqual(shiftAction.proposed_start, `${todayStr}T09:00:00Z`);
    
    assert(bufferAction, 'Should propose a post-meeting Zero-Stimulus Recovery Buffer');
    assert.strictEqual(bufferAction.after_event_id, 'evt_arch_review_456');
    assert.strictEqual(bufferAction.start, archReview.end_time);

    assert(replaceAction, 'Should propose replacing Peloton HIIT workout with Somatic Recovery Walk');

    console.log('✔ Verification 2: Somatic Calendar Rescheduler proposal logic validated.');

    // 5. Test Confirm Shield Modifications API
    console.log('\nConfirming shield proposals...');
    const confirmRes = await fetch('http://localhost:3000/api/v1/calendar/shield-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            confirmed_actions: proposalData.proposed_actions
        })
    });
    const confirmData = await confirmRes.json();
    assert.strictEqual(confirmData.status, 'MUTATION_COMPLETE');
    assert.strictEqual(confirmData.slack_dnd_active, true);
    console.log('✔ Confirm Response:', confirmData);

    // Verify DB mutations in calendar_cache
    console.log('\nVerifying calendar cache database mutations...');
    const updatedEvents = localDb.prepare('SELECT * FROM calendar_cache WHERE user_id = ?').all(ANYA_ID);
    
    const dbSpecWriting = updatedEvents.find(e => e.event_id === 'evt_spec_writing_123');
    const dbPeloton = updatedEvents.find(e => e.event_id === 'evt_peloton_789');
    const dbBuffer = updatedEvents.find(e => e.event_title.includes('Zero-Stimulus'));

    assert.strictEqual(dbSpecWriting.start_time, `${todayStr}T09:00:00Z`, 'Spec drafting should be shifted to 9:00 AM');
    assert.strictEqual(dbPeloton.event_title, 'Somatic Recovery Walk', 'Peloton ride should be renamed to Somatic Recovery Walk');
    assert(dbBuffer, 'Recovery buffer should have been inserted into calendar cache database');
    assert.strictEqual(dbBuffer.start_time, archReview.end_time, 'Recovery buffer must start right after Architecture Review');

    // Verify SOMATIC_SHIFTS_LOG entry
    const shiftsLog = localDb.prepare('SELECT * FROM somatic_shifts_log WHERE user_id = ? AND date = ?').get(ANYA_ID, todayStr);
    assert(shiftsLog, 'Somatic shifts log entry should be recorded');
    assert.strictEqual(shiftsLog.user_decision, 'APPROVED');
    assert.strictEqual(shiftsLog.cognitive_alignment_score, 88);

    console.log('✔ Verification 3: Database mutations and shifts log entry verified.');

    // 6. Test Mid-Day Reset API Rebuild
    console.log('\nTesting Mid-Day Reset Rebuild API at 1:00 PM...');
    const rebuildTime = `${todayStr}T13:00:00Z`;
    const rebuildRes = await fetch('http://localhost:3000/api/v1/calendar/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            current_time: rebuildTime
        })
    });
    const rebuildData = await rebuildRes.json();
    console.log('Rebuild Response:', rebuildData);

    assert.strictEqual(rebuildData.rebuild_executed, true);
    
    // Peloton (now Somatic Recovery Walk at 5:00 PM) should be shifted to tomorrow
    const shiftedPeloton = rebuildData.shifted_events.find(e => e.event_id === 'evt_peloton_789');
    assert(shiftedPeloton, 'Somatic Recovery Walk should be shifted to tomorrow because it is in the afternoon');
    assert.strictEqual(shiftedPeloton.new_start, `${tomorrowStr}T14:00:00Z`);

    // Injected emergency buffer
    const emergencyBuffer = rebuildData.injected_buffers.find(b => b.title.includes('Emergency'));
    assert(emergencyBuffer, 'Should inject Emergency Somatic Decompression buffer');
    assert.strictEqual(emergencyBuffer.start, rebuildTime, 'Emergency buffer must start immediately at the rebuild time');

    // Verify DB update after rebuild
    console.log('\nVerifying rebuild database updates...');
    const dbEventsAfterRebuild = localDb.prepare('SELECT * FROM calendar_cache WHERE user_id = ?').all(ANYA_ID);
    const dbSomaticWalk = dbEventsAfterRebuild.find(e => e.event_id === 'evt_peloton_789');
    const dbEmergencyBuffer = dbEventsAfterRebuild.find(e => e.event_title.includes('Emergency'));

    assert.strictEqual(dbSomaticWalk.start_time, `${tomorrowStr}T14:00:00Z`, 'Somatic walk should be in database as shifted to tomorrow');
    assert(dbEmergencyBuffer, 'Emergency decompression buffer should be in database');

    console.log('✔ Verification 4: Mid-Day Reset and database rebuilding verified.');

    console.log('\n==========================================================================');
    console.log('✔ ALL PHASE 3 TEST CASES PASSED SUCCESSFULLY!');
    console.log('==========================================================================');

} catch (error) {
    console.error('\n✖ TEST SUITE FAILED with error:');
    console.error(error);
    process.exitCode = 1;
} finally {
    console.log('\nShutting down server...');
    serverProcess.kill('SIGINT');
}
