/**
 * database/seed.js
 * Seeds the database with realistic demo data.
 * Usage: node database/seed.js
 */
require('dotenv').config({ path: '../backend/.env' });
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'entityx.db');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

console.log('Seeding database...\n');

/* ── Downloads ── */
const platforms = ['windows','windows','windows','macos','linux'];
const versions  = ['v1.5.0','v1.4.0','v1.3.0'];
const referers  = [
  'https://github.com/jayaprakash2207/ENTITY-X',
  'https://www.google.com/',
  'https://reddit.com/r/deepfakes',
  '',''
];
const agents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
];

const insertDownload = db.prepare(`
  INSERT INTO downloads (ip, user_agent, platform, version, referer, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (let i = 0; i < 120; i++) {
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
  insertDownload.run(
    `10.${r(255)}.${r(255)}.${r(255)}`,
    agents[r(agents.length)],
    platforms[r(platforms.length)],
    versions[r(versions.length)],
    referers[r(referers.length)],
    date.toISOString()
  );
}
console.log('✔ Inserted 120 sample downloads');

/* ── Contacts ── */
const types    = ['general','bug','feature','security'];
const statuses = ['open','read','replied'];
const sampleContacts = [
  { name:'Arjun Kumar',    email:'arjun@example.com',    subject:'False positive on my photo', message:'Entity X flagged my profile picture as a deepfake but it is real. Can you help?' },
  { name:'Priya Singh',    email:'priya@example.com',    subject:'Feature request: Chrome extension', message:'Would love to have a Chrome extension that works directly in the browser without needing the desktop app installed.' },
  { name:'Rohan Mehta',    email:'rohan@example.com',    subject:'Security concern with API keys', message:'I noticed the installer includes API keys baked in. Is this intentional? What is the risk?' },
  { name:'Ananya Sharma',  email:'ananya@example.com',   subject:'macOS version ETA?', message:'I use macOS and really want Entity X. Any idea when the macOS version will be available?' },
  { name:'Vikram Nair',    email:'vikram@example.com',   subject:'Amazing tool!', message:'Just wanted to say this is one of the most impressive student projects I have ever seen. The 5-model ensemble is brilliant.' },
];

const insertContact = db.prepare(`
  INSERT INTO contacts (name, email, subject, message, type, status, ip, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
sampleContacts.forEach((c, i) => {
  const d = new Date(Date.now() - i * 2 * 86400000);
  insertContact.run(c.name, c.email, c.subject, c.message, types[i % types.length], statuses[i % statuses.length], `192.168.1.${i+1}`, d.toISOString());
});
console.log('✔ Inserted 5 sample contacts');

/* ── Waitlist ── */
const waitlistData = [
  { email:'macos1@example.com', platform:'macos',     name:'Dev A' },
  { email:'macos2@example.com', platform:'macos',     name:'Dev B' },
  { email:'mob1@example.com',   platform:'mobile',    name:'User C' },
  { email:'mob2@example.com',   platform:'mobile',    name:'User D' },
  { email:'ext1@example.com',   platform:'extension', name:'User E' },
  { email:'lin1@example.com',   platform:'linux',     name:'User F' },
];
const insertWaitlist = db.prepare('INSERT OR IGNORE INTO waitlist (email, platform, name) VALUES (?,?,?)');
waitlistData.forEach(w => insertWaitlist.run(w.email, w.platform, w.name));
console.log('✔ Inserted 6 waitlist entries');

/* ── Page views ── */
const insertView = db.prepare(`INSERT INTO page_views (path, referer, user_agent, ip, session_id, created_at) VALUES (?,?,?,?,?,?)`);
for (let i = 0; i < 500; i++) {
  const d = new Date(Date.now() - Math.random() * 30 * 86400000);
  insertView.run('/', referers[r(referers.length)], agents[r(agents.length)], `10.${r(255)}.${r(255)}.${r(255)}`, `sess_${Math.random().toString(36).slice(2)}`, d.toISOString());
}
console.log('✔ Inserted 500 sample page views');

/* ── Events ── */
const eventTypes = ['download_click','github_click','section_view','cta_click'];
const insertEvent = db.prepare(`INSERT INTO events (event_type, element, page, session_id, ip, meta, created_at) VALUES (?,?,?,?,?,?,?)`);
for (let i = 0; i < 300; i++) {
  const d = new Date(Date.now() - Math.random() * 30 * 86400000);
  const et = eventTypes[r(eventTypes.length)];
  insertEvent.run(et, et, '/', `sess_${Math.random().toString(36).slice(2)}`, `10.${r(255)}.${r(255)}.${r(255)}`, '{}', d.toISOString());
}
console.log('✔ Inserted 300 sample events');

console.log('\n✅ Seed complete!');
db.close();

function r(n){ return Math.floor(Math.random()*n); }
