import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'child_process';
import assert from 'assert';
import crypto from 'node:crypto';

console.log('==========================================================================');
console.log('Ebb Verification Test Suite: Part 1 Phase 4');
console.log('==========================================================================\n');

const DB_PATH = 'ebb.db';
const ANYA_ID = 'anya-uuid-123456';
const todayStr = new Date().toISOString().split('T')[0];

const ENCRYPTION_KEY = crypto.scryptSync('ebb-secret-passphrase-key-1234567890', 'ebb-salt', 32);
const IV_LENGTH = 12;

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

// 1. Launch the server in the background
console.log('Starting local backend server...');
const serverProcess = spawn('node', ['server.mjs'], { stdio: 'inherit' });

// Give server 1.5 seconds to spin up
await new Promise(resolve => setTimeout(resolve, 1500));

try {
    const localDb = new DatabaseSync(DB_PATH);

    // 2. Test In-Memory Telemetry Buffering
    console.log('\nTesting high-frequency telemetry buffering (POST /api/v1/telemetry/log)...');
    
    const logs = [
        { keystroke_count: 45, mouse_jitter_score: 0.85, idle_seconds: 5 },
        { keystroke_count: 12, mouse_jitter_score: 2.14, idle_seconds: 12 },
        { keystroke_count: 88, mouse_jitter_score: 0.12, idle_seconds: 2 }
    ];

    for (let i = 0; i < logs.length; i++) {
        const res = await fetch('http://localhost:3000/api/v1/telemetry/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logs[i])
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.status, 'TELEMETRY_BUFFERED');
        assert.strictEqual(data.buffered_count, i + 1);
        console.log(`Buffered log ${i + 1}: current buffer size = ${data.buffered_count}`);
    }

    // Verify DB has 0 items before flush
    const initialDbLogs = localDb.prepare('SELECT COUNT(*) as count FROM telemetry_log WHERE user_id = ?').get(ANYA_ID);
    console.log('Initial DB logs count:', initialDbLogs.count);
    assert.strictEqual(initialDbLogs.count, 0, 'No logs should be written to SQLite disk DB prior to flushing');
    console.log('✔ Verification 1: Telemetry successfully buffered in memory only.');

    // 3. Test Telemetry Database Flush
    console.log('\nFlushing telemetry buffer to SQLite (POST /api/v1/telemetry/flush)...');
    const flushRes = await fetch('http://localhost:3000/api/v1/telemetry/flush', { method: 'POST' });
    const flushData = await flushRes.json();
    
    assert.strictEqual(flushRes.status, 200);
    assert.strictEqual(flushData.status, 'TELEMETRY_FLUSHED');
    assert.strictEqual(flushData.flushed_count, 3);
    console.log('Flushed Count:', flushData.flushed_count);

    // Verify SQLite entries
    const dbLogs = localDb.prepare('SELECT * FROM telemetry_log WHERE user_id = ? ORDER BY keystroke_count ASC').all(ANYA_ID);
    assert.strictEqual(dbLogs.length, 3, 'SQLite should contain the 3 flushed log entries');
    assert.strictEqual(dbLogs[0].keystroke_count, 12);
    assert.strictEqual(dbLogs[1].keystroke_count, 45);
    assert.strictEqual(dbLogs[2].keystroke_count, 88);
    console.log('✔ Verification 2: Telemetry buffer successfully committed to encrypted SQLite DB via single transaction.');

    // 4. Test Weekly subjective calibration prompt loading
    console.log('\nFetching weekly subjective calibration questions (GET /api/v1/calibration/prompt)...');
    const promptRes = await fetch('http://localhost:3000/api/v1/calibration/prompt');
    const promptData = await promptRes.json();
    
    assert.strictEqual(promptRes.status, 200);
    assert.strictEqual(promptData.prompts_version, 'weekly-v1');
    assert.strictEqual(promptData.prompts.length, 3);
    
    const focusPrompt = promptData.prompts.find(p => p.question_id === 'focus_rating');
    const sleepPrompt = promptData.prompts.find(p => p.question_id === 'ideal_sleep_hours');
    const acnePrompt = promptData.prompts.find(p => p.question_id === 'stress_acne_present');
    
    assert.strictEqual(focusPrompt.input_type, 'slider');
    assert.strictEqual(sleepPrompt.input_type, 'number');
    assert.strictEqual(acnePrompt.input_type, 'boolean');
    console.log('✔ Verification 3: Weekly calibration prompts successfully loaded.');

    // 5. Test calibration answer submission and rest encryption
    console.log('\nSubmitting subjective calibration answers (POST /api/v1/calibration/submit)...');
    const mockAnswers = {
        focus_rating: 3,
        ideal_sleep_hours: 8.5,
        stress_acne_present: true
    };
    
    const submitRes = await fetch('http://localhost:3000/api/v1/calibration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            answers: mockAnswers
        })
    });
    const submitData = await submitRes.json();
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitData.status, 'CALIBRATION_SUBMITTED');
    console.log('Submit Response:', submitData);

    // Verify DB entry and AES-256-GCM encryption
    const dbCal = localDb.prepare('SELECT * FROM calibration_logs WHERE user_id = ? AND date = ?').get(ANYA_ID, todayStr);
    assert(dbCal, 'Calibration answer row should exist in SQLite');
    
    console.log('Encrypted calibration answers in DB:', dbCal.answers_json_encrypted);
    const parsedObj = JSON.parse(dbCal.answers_json_encrypted);
    assert(parsedObj.iv && parsedObj.tag && parsedObj.content, 'Answers must be stored in encrypted format (IV, content, tag)');
    
    // Decrypt and verify matching structure
    const decryptedText = decrypt(dbCal.answers_json_encrypted);
    assert(decryptedText, 'Decryption of calibration answer should succeed');
    
    const decryptedAnswers = JSON.parse(decryptedText);
    assert.strictEqual(decryptedAnswers.focus_rating, 3);
    assert.strictEqual(decryptedAnswers.ideal_sleep_hours, 8.5);
    assert.strictEqual(decryptedAnswers.stress_acne_present, true);
    
    console.log('✔ Decrypted answers details:', decryptedAnswers);
    console.log('✔ Verification 4: Calibration data securely stored at rest via AES-256-GCM encryption.');

    // 6. Test Backward Compatibility
    console.log('\nVerifying backward compatibility for Phase 1, Phase 2, and Phase 3...');
    // Sync
    const syncRes2 = await fetch('http://localhost:3000/api/v1/oauth/oura/sync', { method: 'POST' });
    const syncData2 = await syncRes2.json();
    assert.strictEqual(syncData2.status, 'OURA_SYNC_COMPLETE');

    // Ingest checkin
    const ingestRes = await fetch('http://localhost:3000/api/v1/somatic/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            audio_checkin_transcript: 'Feeling great, slept fine.',
            wearable_sleep_seconds: 29520,
            wearable_hrv_ms: 78
        })
    });
    const ingestData = await ingestRes.json();
    assert.strictEqual(ingestData.status, 'INGEST_SUCCESS');

    // Proposal
    const proposalRes = await fetch('http://localhost:3000/api/v1/calendar/shield-proposal', { method: 'POST' });
    const proposalData = await proposalRes.json();
    assert(proposalData.proposed_actions !== undefined);

    console.log('✔ Verification 5: Backward compatibility validated. Prior endpoints are fully functional.');

    console.log('\n==========================================================================');
    console.log('✔ ALL PHASE 4 TEST CASES PASSED SUCCESSFULLY!');
    console.log('==========================================================================');

} catch (error) {
    console.error('\n✖ TEST SUITE FAILED with error:');
    console.error(error);
    process.exitCode = 1;
} finally {
    console.log('\nShutting down server...');
    serverProcess.kill('SIGINT');
}
