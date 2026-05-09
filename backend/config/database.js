const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR  = process.env.DB_DIR || path.join(__dirname, '..', '..', 'database');
const DB_PATH = path.join(DB_DIR, 'entityx.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV !== 'production' ? console.log : null,
});

// WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

/* ── Initialize all tables ── */
db.exec(`
  -- Download tracking
  CREATE TABLE IF NOT EXISTS downloads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ip          TEXT,
    user_agent  TEXT,
    platform    TEXT DEFAULT 'windows',
    version     TEXT DEFAULT 'latest',
    country     TEXT,
    referer     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Contact / Support messages
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    subject     TEXT NOT NULL,
    message     TEXT NOT NULL,
    type        TEXT DEFAULT 'general',  -- general | bug | feature | security
    status      TEXT DEFAULT 'open',     -- open | read | replied | closed
    ip          TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Waitlist (for macOS/mobile coming soon)
  CREATE TABLE IF NOT EXISTS waitlist (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT NOT NULL UNIQUE,
    platform    TEXT NOT NULL,           -- macos | linux | mobile | extension
    name        TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Page analytics
  CREATE TABLE IF NOT EXISTS page_views (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    path        TEXT DEFAULT '/',
    referer     TEXT,
    user_agent  TEXT,
    ip          TEXT,
    session_id  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Button click events
  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type  TEXT NOT NULL,   -- download_click | github_click | section_view | cta_click
    element     TEXT,
    page        TEXT DEFAULT '/',
    session_id  TEXT,
    ip          TEXT,
    meta        TEXT,            -- JSON string for extra data
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Admin users
  CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,           -- bcrypt hash
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- GitHub release cache
  CREATE TABLE IF NOT EXISTS release_cache (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    version     TEXT,
    tag_name    TEXT,
    download_url TEXT,
    size_bytes  INTEGER,
    release_notes TEXT,
    published_at TEXT,
    fetched_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_downloads_created   ON downloads(created_at);
  CREATE INDEX IF NOT EXISTS idx_contacts_status     ON contacts(status);
  CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts(email);
  CREATE INDEX IF NOT EXISTS idx_waitlist_email      ON waitlist(email);
  CREATE INDEX IF NOT EXISTS idx_pageviews_path      ON page_views(path);
  CREATE INDEX IF NOT EXISTS idx_events_type         ON events(event_type);
  CREATE INDEX IF NOT EXISTS idx_events_created      ON events(created_at);
`);

console.log(`[DB] SQLite database initialized at ${DB_PATH}`);

module.exports = db;
