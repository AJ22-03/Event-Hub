"""
EventHub Database Initializer & Seeder
Uses Python's built-in sqlite3 to build eventhub.db from eventhub_schema.sql.
"""
import sqlite3
import os

DB_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA_PATH = os.path.join(DB_DIR, "eventhub_schema.sql")
DB_PATH = os.path.join(DB_DIR, "eventhub.db")

def init_db():
    print(f"Reading schema from: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        sql_script = f.read()

    print(f"Generating SQLite database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript(sql_script)
    conn.commit()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Successfully created {len(tables)} tables: {', '.join(tables)}")

    cursor.execute("SELECT COUNT(*) FROM events;")
    event_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM quiz_questions;")
    quiz_count = cursor.fetchone()[0]

    print(f"Database Stats: {user_count} Users, {event_count} Events, {quiz_count} Quiz Questions.")
    conn.close()
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db()
