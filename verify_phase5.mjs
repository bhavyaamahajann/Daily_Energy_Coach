import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'child_process';
import assert from 'assert';
import crypto from 'node:crypto';
import { calculateShieldAdherence, calculateCAS } from './audit.mjs';

console.log('==========================================================================');
console.log('Ebb Verification Test Suite: Part 1 Phase 5 (Hardening & E2E)');
console.log('==========================================================================\n');

const DB_PATH = 'ebb.db';
const ANYA_ID = 'anya-uuid-123456';
const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0];

const ENCRYPTION_KEY = crypto.scryptSync('ebb-secret-passphrase-key-1234567890', 'ebb-salt', 32);

function decrypt(encryptedJson) {
    try {
        const { iv, content, tag } = JSON.parse(encryptedJson);
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        let decrypted = decipher.update(content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        return null;
    }
}

// 1. Start the server
console.log('Launching backend server...');
const serverProcess = spawn('node', ['server.mjs'], { stdio: 'inherit' });

// Give server 1.5 seconds to spin up and bind port 3000
await new Promise(resolve => setTimeout(resolve, 1500));

try {
    const localDb = new DatabaseSync(DB_PATH);

    // 2. Perform Wearable Sync
    console.log('\nStep 1: Running wearable sync...');
    const syncRes = await fetch('http://localhost:3000/api/v1/oauth/oura/sync', { method: 'POST' });
    const syncData = await syncRes.json();
    assert.strictEqual(syncData.status, 'OURA_SYNC_COMPLETE');
    console.log('✔ Wearable Sync Completed.');

    // 3. Ingest Somatic Transcript via Vent-to-Adjust pipeline
    console.log('\nStep 2: Submitting 20-second Somatic Voice Check-In...');
    const voiceCheckin = 'Jawline breakouts and severe hair shedding this morning, feeling stressed. Peloton is not happening.';
    const ingestRes = await fetch('http://localhost:3000/api/v1/somatic/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            audio_checkin_transcript: voiceCheckin,
            wearable_sleep_seconds: 20880, // 5.8 hours
            wearable_hrv_ms: 24,
            subjective_alertness: 2
        })
    });
    const ingestData = await ingestRes.json();
    assert.strictEqual(ingestData.status, 'INGEST_SUCCESS');
    assert(ingestData.confidence_score >= 0.75);
    console.log('✔ Ingest Success. Quality gate passed. Confidence score:', ingestData.confidence_score);

    // Verify DB dimensions are encrypted at rest
    console.log('\nVerifying Somatic Dimensions encryption at rest...');
    const dims = localDb.prepare('SELECT * FROM somatic_dimensions_log WHERE user_id = ? AND date = ?').all(ANYA_ID, todayStr);
    assert(dims.length > 0, 'Somatic dimensions ledger should have records');
    
    dims.forEach(dim => {
        const payloadObj = JSON.parse(dim.payload_json);
        assert(payloadObj.iv && payloadObj.tag && payloadObj.content, 'Dimension payload MUST contain GCM encryption parameters');
        
        const decryptedPayload = decrypt(dim.payload_json);
        assert(decryptedPayload !== null, 'Payload decryption should succeed');
        console.log(`- Dimension [${dim.dimension_name}] encrypted correctly. Decrypted sample:`, decryptedPayload.substring(0, 80) + '...');
    });
    console.log('✔ Verification 1: Somatic dimensions securely encrypted at rest.');

    // 4. Generate Shield Calendar Proposal
    console.log('\nStep 3: Generating Somatic Calendar Shield proposal...');
    const proposalRes = await fetch('http://localhost:3000/api/v1/calendar/shield-proposal', { method: 'POST' });
    const proposalData = await proposalRes.json();
    assert.strictEqual(proposalData.somatic_battery, 45);
    assert(proposalData.proposed_actions.length > 0);
    console.log('✔ Proposal generated successfully.');

    // 5. Confirm Proposal and mutate cache
    console.log('\nStep 4: Confirming shield proposal actions...');
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
    console.log('✔ Proposal confirmed and Slack DND triggered.');

    // 6. Ingest Telemetry Logs
    console.log('\nStep 5: Logging mouse/keyboard idle telemetry...');
    const telemetryData = [
        { keystroke_count: 30, mouse_jitter_score: 1.1, idle_seconds: 4 },
        { keystroke_count: 55, mouse_jitter_score: 0.9, idle_seconds: 8 }
    ];

    for (const log of telemetryData) {
        const res = await fetch('http://localhost:3000/api/v1/telemetry/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
        });
        const d = await res.json();
        assert.strictEqual(d.status, 'TELEMETRY_BUFFERED');
    }

    // Flush telemetry
    const flushRes = await fetch('http://localhost:3000/api/v1/telemetry/flush', { method: 'POST' });
    const flushData = await flushRes.json();
    assert.strictEqual(flushData.status, 'TELEMETRY_FLUSHED');
    console.log('✔ Telemetry logs buffered and flushed successfully.');

    // 7. Submit Calibration answers
    console.log('\nStep 6: Submitting weekly subjective calibration...');
    const calSubmitRes = await fetch('http://localhost:3000/api/v1/calibration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            answers: { focus_rating: 4, ideal_sleep_hours: 7.5, stress_acne_present: false }
        })
    });
    const calSubmitData = await calSubmitRes.json();
    assert.strictEqual(calSubmitData.status, 'CALIBRATION_SUBMITTED');
    console.log('✔ Calibration survey submitted.');

    // 8. Execute Mid-Day Reset Rebuild
    console.log('\nStep 7: Executing Mid-Day reset rebuild at 1:00 PM...');
    const rebuildRes = await fetch('http://localhost:3000/api/v1/calendar/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            current_time: `${todayStr}T13:00:00Z`
        })
    });
    const rebuildData = await rebuildRes.json();
    assert.strictEqual(rebuildData.rebuild_executed, true);
    console.log('✔ Mid-Day Reset executed.');

    // 9. Run SQL Performance metrics audit (Shield Adherence and CAS)
    console.log('\nStep 8: Calculating operational SQL metrics...');
    const adherenceResult = calculateShieldAdherence(ANYA_ID, localDb);
    const casResult = calculateCAS(ANYA_ID, todayStr, localDb);
    
    console.log('---------------------------------------------------------');
    console.log('EBB OPERATIONAL PERFORMANCE AUDIT:');
    console.log('---------------------------------------------------------');
    console.log('Shield Adherence Rate   :', adherenceResult.adherence_rate_percentage + '%');
    console.log('  Total Proposed Shifts :', adherenceResult.total_proposed_shifts);
    console.log('  Total Kept/Approved   :', adherenceResult.total_kept_shifts);
    console.log('Cognitive Alignment Score (CAS) :', casResult.cas_score_percentage + '%');
    console.log('  Total Working Minutes :', casResult.total_working_minutes);
    console.log('  Aligned Focus/Rest    :', casResult.aligned_minutes);
    console.log('---------------------------------------------------------');

    // Assert metrics show high performance because Ebb optimized calendar
    assert(adherenceResult.adherence_rate_percentage >= 70.0, 'Shield Adherence Rate should exceed 70.0% for successful sync');
    assert(casResult.cas_score_percentage >= 80, 'Cognitive Alignment Score should be >= 80% after shield mutations and rebuild resets');

    console.log('✔ Verification 2: Shield Adherence and CAS queries executed and validated.');

    console.log('\n==========================================================================');
    console.log('✔ E2E HARDENING & BETA PILOT VALIDATION PASSED SUCCESSFULLY!');
    console.log('==========================================================================');

} catch (err) {
    console.error('\n✖ TEST SUITE FAILED with error:');
    console.error(err);
    process.exitCode = 1;
} finally {
    console.log('\nShutting down server...');
    serverProcess.kill('SIGINT');
}
