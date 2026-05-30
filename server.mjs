import { DatabaseSync } from 'node:sqlite';
import http from 'node:http';
import crypto from 'node:crypto';
import { URL } from 'url';
import { parseSomaticTranscript } from './parser.mjs';
import { generateShieldProposal, confirmShieldProposal, executeMiddayRebuild } from './scheduler.mjs';
import { calculateShieldAdherence, calculateCAS } from './audit.mjs';


// ==========================================================================
// 1. Cryptographic Mocking (AES-256-GCM Encryption at Rest)
// ==========================================================================
const ENCRYPTION_KEY = crypto.scryptSync('ebb-secret-passphrase-key-1234567890', 'ebb-salt', 32); // 32 bytes
const IV_LENGTH = 12; // GCM standard

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return JSON.stringify({
        iv: iv.toString('hex'),
        content: encrypted,
        tag: authTag
    });
}

function decrypt(encryptedJson) {
    try {
        const { iv, content, tag } = JSON.parse(encryptedJson);
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        let decrypted = decipher.update(content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        return '[DECRYPTION_ERROR: Invalid Key or Corrupted Data]';
    }
}

// ==========================================================================
// 2. Database Initialization & Seed
// ==========================================================================
const db = new DatabaseSync('ebb.db');

// Run DDL scripts
db.exec(`
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    oauth_google_cal TEXT NOT NULL, -- Encrypted Google Calendar tokens
    oauth_wearable_token TEXT,      -- Encrypted wearable API tokens
    baseline_hrv INTEGER DEFAULT 70,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biometrics_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    date TEXT NOT NULL UNIQUE,
    sleep_duration_seconds INTEGER NOT NULL,
    resting_heart_rate INTEGER NOT NULL,
    hrv_ms INTEGER NOT NULL,
    subjective_alertness_rating INTEGER, -- 1-5 fallback slider
    calculated_battery_percentage INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS calendar_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_id TEXT NOT NULL UNIQUE,
    event_title TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    attendee_count INTEGER DEFAULT 1,
    is_external INTEGER DEFAULT 0, -- 0 = false, 1 = true
    classification TEXT NOT NULL,   -- 'LOCKED' or 'RESCHEDULABLE'
    FOREIGN KEY(user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS somatic_shifts_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    date TEXT NOT NULL,
    proposed_shifts_json TEXT NOT NULL, -- Detailed event movements proposed
    user_decision TEXT NOT NULL,        -- 'PENDING', 'APPROVED', 'DECLINED'
    cognitive_alignment_score INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS somatic_dimensions_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    date TEXT NOT NULL,
    dimension_name TEXT NOT NULL,       -- 'NUTRITION', 'MENTAL_HEALTH', etc.
    payload_json TEXT NOT NULL,          -- JSON payload representing the dimension data
    confidence_score REAL NOT NULL,      -- CoT extraction confidence score (0.0 to 1.0)
    device_source TEXT,                 -- 'Luna Ring', 'Oura Cloud', 'Manual Slider', 'Whisper STT'
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_profiles(id),
    UNIQUE(user_id, date, dimension_name)
);

CREATE TABLE IF NOT EXISTS telemetry_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    timestamp TEXT NOT NULL,
    keystroke_count INTEGER DEFAULT 0,
    mouse_jitter_score REAL DEFAULT 0.0,
    idle_seconds INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS calibration_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    date TEXT NOT NULL,
    answers_json_encrypted TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user_profiles(id)
);
`);

// Seed Initial User (Anya)
const ANYA_ID = 'anya-uuid-123456';
const checkUser = db.prepare('SELECT id FROM user_profiles WHERE id = ?').get(ANYA_ID);
if (!checkUser) {
    db.prepare(`
        INSERT INTO user_profiles (id, email, oauth_google_cal, oauth_wearable_token, baseline_hrv)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        ANYA_ID,
        'anya.ai@scaleup.io',
        encrypt(JSON.stringify({ access_token: 'gcal-token-xyz', refresh_token: 'gcal-refresh-abc' })),
        encrypt(JSON.stringify({ access_token: 'oura-token-xyz', refresh_token: 'oura-refresh-abc' })),
        70
    );
    console.log('Seeded User: Anya');
}

function seedCalendarCache(db, userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const events = [
        {
            id: 'evt_daily_scrum_123',
            event_id: 'evt_daily_scrum_123',
            event_title: 'Daily Scrum',
            start_time: `${todayStr}T09:00:00Z`,
            end_time: `${todayStr}T09:30:00Z`,
            attendee_count: 5,
            is_external: 0,
            classification: 'LOCKED'
        },
        {
            id: 'evt_arch_review_456',
            event_id: 'evt_arch_review_456',
            event_title: 'Architecture Review',
            start_time: `${todayStr}T10:00:00Z`,
            end_time: `${todayStr}T11:30:00Z`,
            attendee_count: 20,
            is_external: 0,
            classification: 'LOCKED'
        },
        {
            id: 'evt_backlog_triage_889',
            event_id: 'evt_backlog_triage_889',
            event_title: 'Backlog Triage',
            start_time: `${todayStr}T12:00:00Z`,
            end_time: `${todayStr}T13:00:00Z`,
            attendee_count: 1,
            is_external: 0,
            classification: 'RESCHEDULABLE'
        },
        {
            id: 'evt_spec_writing_123',
            event_id: 'evt_spec_writing_123',
            event_title: 'Security Spec Drafting',
            start_time: `${todayStr}T14:00:00Z`,
            end_time: `${todayStr}T16:00:00Z`,
            attendee_count: 1,
            is_external: 0,
            classification: 'RESCHEDULABLE'
        },
        {
            id: 'evt_peloton_789',
            event_id: 'evt_peloton_789',
            event_title: 'Peloton HIIT Ride',
            start_time: `${todayStr}T17:00:00Z`,
            end_time: `${todayStr}T18:00:00Z`,
            attendee_count: 1,
            is_external: 0,
            classification: 'RESCHEDULABLE'
        }
    ];

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO calendar_cache (id, user_id, event_id, event_title, start_time, end_time, attendee_count, is_external, classification)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const evt of events) {
        insertStmt.run(
            evt.id,
            userId,
            evt.event_id,
            evt.event_title,
            evt.start_time,
            evt.end_time,
            evt.attendee_count,
            evt.is_external,
            evt.classification
        );
    }
    console.log('Seeded calendar cache for user:', userId);
}

// Seed/reset Calendar Cache for Anya to today's date
db.prepare('DELETE FROM calendar_cache WHERE user_id = ?').run(ANYA_ID);
db.prepare('DELETE FROM telemetry_log WHERE user_id = ?').run(ANYA_ID);
db.prepare('DELETE FROM calibration_logs WHERE user_id = ?').run(ANYA_ID);
seedCalendarCache(db, ANYA_ID);

async function dispatchSlackDnd(statusText, dndEnabled) {
    try {
        const response = await fetch(`http://localhost:${PORT}/api/v1/slack/dnd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status_text: statusText,
                dnd_enabled: dndEnabled
            })
        });
        return await response.json();
    } catch (err) {
        console.error('Failed to dispatch Slack DND status:', err.message);
        return null;
    }
}

let telemetryBuffer = [];

// ==========================================================================
// 3. HTTP Server and Request Handling
// ==========================================================================
const PORT = 3000;

const server = http.createServer(async (req, res) => {
    // Enable CORS for frontend prototyping
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // Helper to read JSON request body
    const getBody = () => new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(body ? JSON.parse(body) : {}));
    });

    try {
        // --- 1. Audio and Biometrics Ingest ---
        if (pathname === '/api/v1/somatic/ingest' && req.method === 'POST') {
            const body = await getBody();
            const { audio_checkin_transcript, wearable_sleep_seconds, wearable_hrv_ms, subjective_alertness } = body;

            // Call the real Somatic Chain-of-Thought parsing engine
            const parseResult = parseSomaticTranscript(audio_checkin_transcript || '', {
                hrv_ms: wearable_hrv_ms || 24,
                sleep_duration_seconds: wearable_sleep_seconds || 20880
            });

            const confidence = parseResult.confidence_score;
            const dimensions = Object.keys(parseResult.dimensions).map(name => ({
                name,
                payload: parseResult.dimensions[name]
            }));

            const todayStr = new Date().toISOString().split('T')[0];

            if (confidence < 0.75) {
                // Confidence score gate fail: Block silent write, return warning
                res.writeHead(422, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'CONFIDENCE_GATE_FAIL',
                    confidence_score: confidence,
                    message: 'Confidence log-probability fell below 0.75 threshold. Manually verify parsed data.',
                    payload_pending: dimensions
                }));
                return;
            }

            // Success Gate: Write records to SQLite (with encrypted payloads)
            db.prepare('DELETE FROM somatic_dimensions_log WHERE user_id = ? AND date = ?').run(ANYA_ID, todayStr);
            
            const insertDim = db.prepare(`
                INSERT INTO somatic_dimensions_log (id, user_id, date, dimension_name, payload_json, confidence_score, device_source)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (const dim of dimensions) {
                const uuid = crypto.randomUUID();
                insertDim.run(
                    uuid,
                    ANYA_ID,
                    todayStr,
                    dim.name,
                    encrypt(JSON.stringify(dim.payload)),
                    confidence,
                    'Luna Ring Voice'
                );
            }

            // Log biometrics record
            const sleepSec = wearable_sleep_seconds || 20880; // 5.8 hrs default
            const hrv = wearable_hrv_ms || 24;

            db.prepare(`
                INSERT OR REPLACE INTO biometrics_log (id, user_id, date, sleep_duration_seconds, resting_heart_rate, hrv_ms, subjective_alertness_rating, calculated_battery_percentage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                crypto.randomUUID(),
                ANYA_ID,
                todayStr,
                sleepSec,
                68,
                hrv,
                subjective_alertness || null,
                hrv < 30 ? 45 : 85
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'INGEST_SUCCESS',
                confidence_score: confidence,
                somatic_battery_percentage: hrv < 30 ? 45 : 85,
                dimensions_written: dimensions.map(d => d.name)
            }));
            return;
        }

        // --- 2. Generate Calendar Shield Proposal ---
        else if (pathname === '/api/v1/calendar/shield-proposal' && req.method === 'POST') {
            const todayStr = new Date().toISOString().split('T')[0];
            const proposal = generateShieldProposal(ANYA_ID, todayStr, db);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(proposal));
            return;
        }

        // --- 3. Confirm Shield Modifications ---
        else if (pathname === '/api/v1/calendar/shield-confirm' && req.method === 'POST') {
            const body = await getBody();
            const todayStr = new Date().toISOString().split('T')[0];
            
            const result = confirmShieldProposal(ANYA_ID, todayStr, body.confirmed_actions || [], db);
            
            // Dispatch Slack DND integration update
            await dispatchSlackDnd('Offline (Ebb Buffer)', true);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: result.status,
                google_cal_sync_token: 'mock-sync-token-456',
                slack_dnd_active: result.slack_dnd_active
            }));
            return;
        }

        // --- 4. Mid-Day Reset API (Re-build) ---
        else if (pathname === '/api/v1/calendar/rebuild' && req.method === 'POST') {
            const body = await getBody();
            const currentTime = body.current_time || new Date().toISOString();
            
            const result = executeMiddayRebuild(ANYA_ID, currentTime, db);
            
            // Dispatch Slack DND integration update
            await dispatchSlackDnd('Offline (Ebb Buffer)', true);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }

        // --- Slack DND status webhook ---
        else if (pathname === '/api/v1/slack/dnd' && req.method === 'POST') {
            const body = await getBody();
            console.log(`[Slack API Mock] Status updated to: "${body.status_text || 'Offline (Ebb Buffer)'}", DND snooze active: ${body.dnd_enabled}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'SLACK_MUTATION_COMPLETE',
                status_text: body.status_text || 'Offline (Ebb Buffer)',
                dnd_active: body.dnd_enabled !== false
            }));
            return;
        }

        // --- 5. Mock Oura API Ingress Sync Worker ---
        else if (pathname === '/api/v1/oauth/oura/sync' && req.method === 'POST') {
            const todayStr = new Date().toISOString().split('T')[0];
            // Mock sync sleep and HRV from Oura APIs
            db.prepare(`
                INSERT OR REPLACE INTO biometrics_log (id, user_id, date, sleep_duration_seconds, resting_heart_rate, hrv_ms, calculated_battery_percentage)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                crypto.randomUUID(),
                ANYA_ID,
                todayStr,
                20880, // 5.8 hours
                68,
                24,    // Low HRV
                45     // Battery
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'OURA_SYNC_COMPLETE',
                synced_metrics: { sleep_hours: 5.8, resting_hr: 68, hrv_ms: 24 }
            }));
            return;
        }

        // --- 6. Somatic Dashboard Read API ---
        else if (pathname === '/api/v1/somatic/dashboard' && req.method === 'GET') {
            const todayStr = new Date().toISOString().split('T')[0];
            
            const bio = db.prepare('SELECT * FROM biometrics_log WHERE user_id = ? AND date = ?').get(ANYA_ID, todayStr);
            const dims = db.prepare('SELECT dimension_name, payload_json, confidence_score FROM somatic_dimensions_log WHERE user_id = ? AND date = ?').all(ANYA_ID, todayStr);

            // Decrypt payload JSONs
            const decryptedDims = dims.map(d => ({
                dimension_name: d.dimension_name,
                confidence_score: d.confidence_score,
                payload: JSON.parse(decrypt(d.payload_json))
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                user_id: ANYA_ID,
                date: todayStr,
                biometrics: bio || null,
                dimensions: decryptedDims
            }));
            return;
        }

        // --- 7. Ingest Desktop Telemetry Log ---
        else if (pathname === '/api/v1/telemetry/log' && req.method === 'POST') {
            const body = await getBody();
            const logEntry = {
                id: crypto.randomUUID(),
                user_id: ANYA_ID,
                timestamp: body.timestamp || new Date().toISOString(),
                keystroke_count: body.keystroke_count || 0,
                mouse_jitter_score: body.mouse_jitter_score || 0.0,
                idle_seconds: body.idle_seconds || 0
            };
            telemetryBuffer.push(logEntry);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'TELEMETRY_BUFFERED',
                buffered_count: telemetryBuffer.length
            }));
            return;
        }

        // --- 8. Flush Desktop Telemetry Logs to encrypted SQLite DB ---
        else if (pathname === '/api/v1/telemetry/flush' && req.method === 'POST') {
            const flushedCount = telemetryBuffer.length;
            if (flushedCount > 0) {
                // Bulk insert in a single transaction
                db.exec('BEGIN TRANSACTION');
                try {
                    const insertStmt = db.prepare(`
                        INSERT INTO telemetry_log (id, user_id, timestamp, keystroke_count, mouse_jitter_score, idle_seconds)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `);
                    for (const entry of telemetryBuffer) {
                        insertStmt.run(
                            entry.id,
                            entry.user_id,
                            entry.timestamp,
                            entry.keystroke_count,
                            entry.mouse_jitter_score,
                            entry.idle_seconds
                        );
                    }
                    db.exec('COMMIT');
                    telemetryBuffer = [];
                } catch (err) {
                    db.exec('ROLLBACK');
                    throw err;
                }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'TELEMETRY_FLUSHED',
                flushed_count: flushedCount
            }));
            return;
        }

        // --- 9. Subjective Calibration Prompt ---
        else if (pathname === '/api/v1/calibration/prompt' && req.method === 'GET') {
            const prompts = [
                {
                    question_id: 'focus_rating',
                    prompt_text: 'On a scale of 1-5, how would you rate your focus capacity over the past week?',
                    input_type: 'slider',
                    min_val: 1,
                    max_val: 5
                },
                {
                    question_id: 'ideal_sleep_hours',
                    prompt_text: 'How many hours of sleep do you typically need to feel biologically functional?',
                    input_type: 'number',
                    min_val: 4,
                    max_val: 12
                },
                {
                    question_id: 'stress_acne_present',
                    prompt_text: 'Are you experiencing any skin breakouts or hair shedding this week?',
                    input_type: 'boolean'
                }
            ];

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                prompts_version: 'weekly-v1',
                prompts: prompts
            }));
            return;
        }

        // --- 10. Submit Subjective Calibration Answers ---
        else if (pathname === '/api/v1/calibration/submit' && req.method === 'POST') {
            const body = await getBody();
            const todayStr = new Date().toISOString().split('T')[0];
            const encryptedAnswers = encrypt(JSON.stringify(body.answers || {}));

            db.prepare(`
                INSERT INTO calibration_logs (id, user_id, date, answers_json_encrypted)
                VALUES (?, ?, ?, ?)
            `).run(
                crypto.randomUUID(),
                ANYA_ID,
                todayStr,
                encryptedAnswers
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'CALIBRATION_SUBMITTED',
                date: todayStr
            }));
            return;
        }

        // --- 11. Fetch SQL Performance Audit Metrics ---
        else if (pathname === '/api/v1/audit/metrics' && req.method === 'GET') {
            const todayStr = new Date().toISOString().split('T')[0];
            const adherence = calculateShieldAdherence(ANYA_ID, db);
            const cas = calculateCAS(ANYA_ID, todayStr, db);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                shield_adherence: adherence,
                cognitive_alignment: cas
            }));
            return;
        }

        // Not Found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint Not Found' }));

    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
});

server.listen(PORT, () => {
    console.log(`Ebb Somatic Backend Server running on http://localhost:${PORT}`);
});
