import sqlite3
import json
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Fallback Key for local execution if not provided in environment
DEFAULT_KEY = "e2c3b2f15a3c9e6d8a7c2b5d4e1f8a7c6b5d4e3f2a1c0b9e8d7c6b5a4d3c2b1a"

class SomaticDB:
    def __init__(self, db_path="ebb_streamlit.db"):
        self.db_path = db_path
        # Use key from environment or default key
        key_hex = os.environ.get("EBB_ENCRYPTION_KEY", DEFAULT_KEY)
        self.key = bytes.fromhex(key_hex)
        self.aesgcm = AESGCM(self.key)
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # User profile table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_profiles (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    baseline_hrv INTEGER DEFAULT 70
                )
            """)
            # Seeding user profile
            cursor.execute("""
                INSERT OR IGNORE INTO user_profiles (id, email, baseline_hrv)
                VALUES ('anya-uuid-123456', 'anya@co.com', 70)
            """)
            
            # Biometrics log table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS biometrics_log (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL UNIQUE,
                    sleep_duration_seconds INTEGER,
                    hrv_ms INTEGER,
                    battery_percentage INTEGER
                )
            """)
            
            # Calendar cache table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS calendar_cache (
                    event_id TEXT PRIMARY KEY,
                    event_title TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    attendee_count INTEGER DEFAULT 1,
                    classification TEXT NOT NULL
                )
            """)
            
            # Somatic shifts log table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS somatic_shifts_log (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL,
                    proposed_shifts_json TEXT NOT NULL,
                    user_decision TEXT NOT NULL,
                    cognitive_alignment_score INTEGER NOT NULL
                )
            """)
            
            # Somatic dimensions (8-stream ledger) table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS somatic_dimensions_log (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL,
                    dimension_name TEXT NOT NULL,
                    encrypted_payload TEXT NOT NULL, -- JSON containing iv, ciphertext, tag
                    confidence_score REAL NOT NULL,
                    UNIQUE(date, dimension_name)
                )
            """)
            
            # Subjective Calibration Survey table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS calibration_logs (
                    date TEXT PRIMARY KEY,
                    encrypted_answers TEXT NOT NULL
                )
            """)
            
            # Telemetry logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS telemetry_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keystroke_count INTEGER,
                    mouse_jitter_score REAL,
                    idle_seconds INTEGER,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def encrypt_data(self, payload_dict):
        nonce = os.urandom(12)
        data = json.dumps(payload_dict).encode('utf-8')
        ciphertext = self.aesgcm.encrypt(nonce, data, None)
        # We store as JSON containing hex string representations
        return {
            "iv": nonce.hex(),
            "ciphertext": ciphertext.hex()
        }

    def decrypt_data(self, encrypted_json_str):
        try:
            encrypted_data = json.loads(encrypted_json_str)
            nonce = bytes.fromhex(encrypted_data["iv"])
            ciphertext = bytes.fromhex(encrypted_data["ciphertext"])
            decrypted = self.aesgcm.decrypt(nonce, ciphertext, None)
            return json.loads(decrypted.decode('utf-8'))
        except Exception as e:
            return {"error": f"Decryption Failed: {str(e)}"}

    def save_dimension(self, date, dimension, payload_dict, confidence=1.0):
        encrypted_obj = self.encrypt_data(payload_dict)
        encrypted_json_str = json.dumps(encrypted_obj)
        id_val = f"{date}_{dimension}"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO somatic_dimensions_log 
                (id, date, dimension_name, encrypted_payload, confidence_score) 
                VALUES (?, ?, ?, ?, ?)
            """, (id_val, date, dimension, encrypted_json_str, confidence))
            conn.commit()

    def get_decrypted_dimension(self, date, dimension):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT encrypted_payload FROM somatic_dimensions_log
                WHERE date = ? AND dimension_name = ?
            """, (date, dimension))
            row = cursor.fetchone()
            if row:
                return self.decrypt_data(row[0])
            return None

    def save_calibration(self, date, answers_dict):
        encrypted_obj = self.encrypt_data(answers_dict)
        encrypted_json_str = json.dumps(encrypted_obj)
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO calibration_logs (date, encrypted_answers)
                VALUES (?, ?)
            """, (date, encrypted_json_str))
            conn.commit()

    def save_shift_decision(self, shift_id, date, proposed_shifts_list, decision, cas_score):
        shifts_json_str = json.dumps(proposed_shifts_list)
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO somatic_shifts_log 
                (id, date, proposed_shifts_json, user_decision, cognitive_alignment_score)
                VALUES (?, ?, ?, ?, ?)
            """, (shift_id, date, shifts_json_str, decision, cas_score))
            conn.commit()

    def log_telemetry(self, keystrokes, mouse_jitter, idle_sec):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO telemetry_log (keystroke_count, mouse_jitter_score, idle_seconds)
                VALUES (?, ?, ?)
            """, (keystrokes, mouse_jitter, idle_sec))
            conn.commit()

    def get_telemetry_count(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM telemetry_log")
            return cursor.fetchone()[0]

    def clear_telemetry(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM telemetry_log")
            conn.commit()

    def calculate_shield_adherence(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM somatic_shifts_log")
            total = cursor.fetchone()[0]
            if total == 0:
                return 100.0  # Default to 100% if no shifts proposed
            cursor.execute("SELECT COUNT(*) FROM somatic_shifts_log WHERE user_decision = 'APPROVED'")
            approved = cursor.fetchone()[0]
            return round((approved / total) * 100, 1)

    def calculate_cas(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT AVG(cognitive_alignment_score) FROM somatic_shifts_log")
            avg_score = cursor.fetchone()[0]
            return round(avg_score, 1) if avg_score is not None else 95.0
