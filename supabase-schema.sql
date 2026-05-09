-- Entity X — Supabase Schema
-- Run this in: https://app.supabase.com → Your Project → SQL Editor → New Query

-- Download tracking
CREATE TABLE IF NOT EXISTS downloads (
  id         BIGSERIAL PRIMARY KEY,
  ip         TEXT,
  user_agent TEXT,
  platform   TEXT DEFAULT 'windows',
  version    TEXT DEFAULT 'latest',
  country    TEXT,
  referer    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact / Support messages
CREATE TABLE IF NOT EXISTS contacts (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'general',   -- general | bug | feature | security
  status     TEXT DEFAULT 'open',      -- open | read | replied | closed
  ip         TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist (macOS / Linux / mobile / extension)
CREATE TABLE IF NOT EXISTS waitlist (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  platform   TEXT NOT NULL,            -- macos | linux | mobile | extension
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, platform)
);

-- Page analytics
CREATE TABLE IF NOT EXISTS page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT DEFAULT '/',
  referer    TEXT,
  user_agent TEXT,
  ip         TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Button / UI click events
CREATE TABLE IF NOT EXISTS events (
  id         BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  element    TEXT,
  page       TEXT DEFAULT '/',
  session_id TEXT,
  ip         TEXT,
  meta       TEXT,                     -- JSON string
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub release cache (refreshed every 1 hour)
CREATE TABLE IF NOT EXISTS release_cache (
  id            BIGSERIAL PRIMARY KEY,
  version       TEXT,
  tag_name      TEXT,
  download_url  TEXT,
  size_bytes    BIGINT,
  release_notes TEXT,
  published_at  TEXT,
  fetched_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_downloads_created  ON downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_status    ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email     ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_pageviews_path     ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_events_type        ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created     ON events(created_at);
