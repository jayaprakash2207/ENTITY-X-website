-- 001_initial_schema.sql
-- Entity X website database schema

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

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'general',
  status      TEXT DEFAULT 'open',
  ip          TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waitlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  platform    TEXT NOT NULL,
  name        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, platform)
);

CREATE TABLE IF NOT EXISTS page_views (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  path        TEXT DEFAULT '/',
  referer     TEXT,
  user_agent  TEXT,
  ip          TEXT,
  session_id  TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type  TEXT NOT NULL,
  element     TEXT,
  page        TEXT DEFAULT '/',
  session_id  TEXT,
  ip          TEXT,
  meta        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS release_cache (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  version       TEXT,
  tag_name      TEXT,
  download_url  TEXT,
  size_bytes    INTEGER,
  release_notes TEXT,
  published_at  TEXT,
  fetched_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dl_created   ON downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_ct_status    ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_ct_email     ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_wl_email     ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_pv_path      ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_ev_type      ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_ev_created   ON events(created_at);
