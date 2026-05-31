import Database from 'better-sqlite3';
import { scryptSync, randomBytes } from 'crypto';

// SQLCipher key derivation
export function deriveKey(salt: string): Buffer {
  return scryptSync(salt, 'ebb-key-derivation', 32768, { N: 32768, r: 8, p: 1, keylen: 32 });
}

export function createDatabase(dbPath: string, encryptionSalt: string): Database.Database {
  const key = deriveKey(encryptionSalt);
  const db = new Database(dbPath);
  
  // Set SQLCipher encryption key
  db.pragma(`key = "x'${key.toString('hex')}'"`);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      baseline_hrv REAL NOT NULL DEFAULT 42,
      baseline_confidence REAL NOT NULL DEFAULT 0.60,
      oauth_google_cal TEXT,
      oauth_wearable_token TEXT,
      onboarding_complete INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS biometrics_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hrv_ms REAL,
      sleep_duration_seconds REAL,
      resting_heart_rate REAL,
      subjective_alertness INTEGER,
      energy_score REAL,
      source TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      data_freshness TEXT DEFAULT 'FRESH',
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_cache (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      attendee_count INTEGER NOT NULL DEFAULT 0,
      is_external INTEGER NOT NULL DEFAULT 0,
      classification TEXT NOT NULL,
      complexity TEXT DEFAULT 'MEDIUM',
      cached_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS shield_decisions_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      energy_score REAL NOT NULL,
      proposed_actions_json TEXT NOT NULL,
      cas_unshielded REAL NOT NULL,
      cas_shielded REAL NOT NULL,
      decision TEXT DEFAULT 'PENDING',
      copy_source TEXT,
      notification_copy TEXT,
      slack_draft TEXT,
      gcal_mutation_success INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE INDEX IF NOT EXISTS idx_biometrics_user_date ON biometrics_log(user_id, captured_at);
    CREATE INDEX IF NOT EXISTS idx_calendar_user_time ON calendar_cache(user_id, start_time);
    CREATE INDEX IF NOT EXISTS idx_shield_user_date ON shield_decisions_log(user_id, created_at);
  `);
  
  return db;
}

export function getDatabase(dbPath: string, encryptionSalt: string): Database.Database {
  const key = deriveKey(encryptionSalt);
  const db = new Database(dbPath);
  db.pragma(`key = "x'${key.toString('hex')}'"`);
  return db;
}
