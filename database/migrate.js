/**
 * database/migrate.js
 * Runs all pending SQL migrations in order.
 * Usage: node database/migrate.js
 */
require('dotenv').config({ path: '../backend/.env' });
const Database = require('better-sqlite3');
const path = require('path');
const fs   = require('fs');

const DB_PATH = path.join(__dirname, 'entityx.db');
const MIG_DIR = path.join(__dirname, 'migrations');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migrations tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    filename   TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const applied = new Set(
  db.prepare('SELECT filename FROM _migrations').all().map(r => r.filename)
);

const files = fs.readdirSync(MIG_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

let count = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`  ✓ Already applied: ${file}`);
    continue;
  }
  const sql = fs.readFileSync(path.join(MIG_DIR, file), 'utf8');
  db.exec(sql);
  db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(file);
  console.log(`  ✔ Applied: ${file}`);
  count++;
}

console.log(`\nMigrations complete. ${count} new migration(s) applied.`);
db.close();
