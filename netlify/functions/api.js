'use strict';

const https      = require('https');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const validator  = require('validator');

/* ── Supabase client ─────────────────────────────── */
let _db = null;
function db() {
  if (_db) return _db;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  _db = createClient(url, key, { auth: { persistSession: false } });
  return _db;
}

/* ── Nodemailer transport ────────────────────────── */
let _transport = null;
function transport() {
  if (_transport) return _transport;
  if (!process.env.SMTP_HOST) return null;
  _transport = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transport;
}
const FROM     = () => process.env.EMAIL_FROM   || 'Entity X <noreply@entityx.app>';
const NOTIFY   = () => process.env.EMAIL_NOTIFY || process.env.SMTP_USER || '';

async function sendMail(opts) {
  const t = transport();
  if (!t) { console.log('[mail]', opts.subject, '->', opts.to); return; }
  await t.sendMail({ from: FROM(), ...opts });
}

/* ── HTTP helpers ────────────────────────────────── */
function corsHeaders(event) {
  const allowed = (process.env.ALLOWED_ORIGINS || 'https://entityx.app,https://www.entityx.app').split(',');
  const origin  = event?.headers?.origin || '';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin':  allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, Authorization',
    'Vary': 'Origin',
  };
}

const respond  = (status, h, body) => ({ statusCode: status, headers: h, body: JSON.stringify(body) });
const ok       = (h, body)  => respond(200, h, body);
const bad      = (h, msg)   => respond(400, h, { error: msg });
const unauth   = (h)        => respond(401, h, { error: 'Unauthorized.' });
const notFound = (h)        => respond(404, h, { error: 'Not found.' });

function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); } catch { return {}; }
}
function getIP(event) {
  return (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

/* ── Admin auth ──────────────────────────────────── */
function isAdmin(event) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) return false;
  const provided = event.headers['x-admin-key'] ||
    (event.headers['authorization'] || '').replace('Bearer ', '');
  return provided === key;
}

/* ── GitHub release fetch ────────────────────────── */
function fetchGitHubRelease() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path:     '/repos/jayaprakash2207/ENTITY-X/releases/latest',
      method:   'GET',
      headers:  {
        'User-Agent': 'EntityX-Website/1.0',
        'Accept':     'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.end();
  });
}

/* ═══════════════════════════════════════════════════
   ROUTE HANDLERS
   ═══════════════════════════════════════════════════ */

async function handleHealth(h) {
  let dbOk = false;
  let dbError = '';
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    dbError = `env missing: URL=${!!supabaseUrl} KEY=${!!supabaseKey}`;
  } else {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/downloads?select=id&limit=1`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      dbOk = res.ok;
      if (!res.ok) dbError = `HTTP ${res.status}: ${await res.text()}`;
    } catch (e) {
      dbError = e.message;
    }
  }

  return respond(dbOk ? 200 : 503, h, {
    status:    dbOk ? 'ok' : 'degraded',
    service:   'entityx-website-backend',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    database:  dbOk ? 'connected' : 'error',
  });
}

/* ── Downloads ───────────────────────────────────── */
async function handleDownloadsLatest(h) {
  try {
    const { data: cached } = await db().from('release_cache')
      .select('*').order('fetched_at', { ascending: false }).limit(1).maybeSingle();

    if (cached && (Date.now() - new Date(cached.fetched_at).getTime()) < 3_600_000) {
      return ok(h, { ...cached, from_cache: true });
    }

    const release = await fetchGitHubRelease();
    const exe     = (release.assets || []).find(a => a.name.endsWith('.exe'));
    const data    = {
      version:       release.tag_name   || 'v1.5.0',
      tag_name:      release.tag_name   || 'v1.5.0',
      download_url:  exe?.browser_download_url || 'https://github.com/jayaprakash2207/ENTITY-X/releases/latest',
      size_bytes:    exe?.size          || null,
      release_notes: release.body       || '',
      published_at:  release.published_at || new Date().toISOString(),
    };

    await db().from('release_cache').insert(data);
    return ok(h, { ...data, from_cache: false });
  } catch (e) {
    console.error('[downloads/latest]', e.message);
    return ok(h, {
      version: 'v1.5.0', tag_name: 'v1.5.0',
      download_url: 'https://github.com/jayaprakash2207/ENTITY-X/releases/latest',
      size_bytes: null, release_notes: '', published_at: null, fallback: true,
    });
  }
}

async function handleDownloadsTrack(event, body, h) {
  const { platform = 'windows', version = 'latest', referer = '' } = body;
  const { error } = await db().from('downloads').insert({
    ip:         getIP(event),
    user_agent: (event.headers['user-agent'] || '').slice(0, 500),
    platform:   String(platform).slice(0, 50),
    version:    String(version).slice(0, 50),
    referer:    String(referer).slice(0, 500),
  });
  if (error) throw error;
  return ok(h, { ok: true, message: 'Download tracked.' });
}

async function handleDownloadsStats(h) {
  const supabase = db();
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const [
    { count: total },
    { count: today },
    { count: week },
    { data: allRows },
  ] = await Promise.all([
    supabase.from('downloads').select('*', { count: 'exact', head: true }),
    supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabase.from('downloads').select('platform'),
  ]);

  const byPlatform = {};
  (allRows || []).forEach(row => { byPlatform[row.platform] = (byPlatform[row.platform] || 0) + 1; });

  return ok(h, {
    total, today, week,
    by_platform: Object.entries(byPlatform).map(([platform, c]) => ({ platform, c })),
  });
}

/* ── Contact ─────────────────────────────────────── */
async function handleContactSubmit(event, body, h) {
  let { name, email, subject, message, type = 'general' } = body;

  if (!name || !email || !subject || !message)
    return bad(h, 'All fields are required.');

  name    = String(name).trim().slice(0, 100);
  email   = String(email).trim().toLowerCase();
  subject = String(subject).trim().slice(0, 200);
  message = String(message).trim().slice(0, 5000);
  type    = ['general', 'bug', 'feature', 'security'].includes(type) ? type : 'general';

  if (!validator.isEmail(email))   return bad(h, 'Invalid email address.');
  if (message.length < 10)         return bad(h, 'Message must be at least 10 characters.');

  const { data, error } = await db().from('contacts')
    .insert({ name, email, subject, message, type, ip: getIP(event) })
    .select('id').single();

  if (error) throw error;

  sendMail({
    to: NOTIFY(), replyTo: email,
    subject: `[EntityX Contact] ${type.toUpperCase()} — ${subject}`,
    text: `New contact: #${data.id}\nFrom: ${name} <${email}>\nType: ${type}\nSubject: ${subject}\n\n${message}`,
  }).catch(console.error);

  sendMail({
    to: email,
    subject: 'We received your message — Entity X',
    text: `Hi ${name},\n\nWe received your message about "${subject}".\nWe'll get back to you within 24–48 hours.\n\n— The Entity X Team`,
  }).catch(console.error);

  return ok(h, {
    ok: true, id: data.id,
    message: "Your message has been received. We'll get back to you within 24–48 hours.",
  });
}

/* ── Analytics ───────────────────────────────────── */
async function handlePageview(event, body, h) {
  const { path: pth = '/', referer = '', session_id = '' } = body;
  await db().from('page_views').insert({
    path:       String(pth).slice(0, 500),
    referer:    String(referer).slice(0, 500),
    user_agent: (event.headers['user-agent'] || '').slice(0, 500),
    ip:         getIP(event),
    session_id: String(session_id).slice(0, 64),
  });
  return ok(h, { ok: true });
}

async function handleTrackEvent(event, body, h) {
  const { event_type, element = '', page = '/', session_id = '', meta = {} } = body;
  const allowed = ['download_click','github_click','section_view','cta_click','nav_click','contact_open','waitlist_open','scroll_depth'];
  if (!allowed.includes(event_type)) return bad(h, 'Invalid event type.');

  await db().from('events').insert({
    event_type,
    element:    String(element).slice(0, 100),
    page:       String(page).slice(0, 200),
    session_id: String(session_id).slice(0, 64),
    ip:         getIP(event),
    meta:       JSON.stringify(meta),
  });
  return ok(h, { ok: true });
}

async function handleAnalyticsSummary(h) {
  const supabase   = db();
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const [
    { count: totalViews },
    { count: todayViews },
    { count: weekViews },
    { data: eventRows },
    { count: dlClicks },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabase.from('events').select('event_type'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'download_click'),
  ]);

  const eventCounts = {};
  (eventRows || []).forEach(e => { eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1; });
  const top_events = Object.entries(eventCounts)
    .map(([event_type, c]) => ({ event_type, c }))
    .sort((a, b) => b.c - a.c).slice(0, 10);

  return ok(h, {
    page_views:      { total: totalViews, today: todayViews, week: weekViews },
    download_clicks: dlClicks,
    top_events,
  });
}

/* ── Waitlist ─────────────────────────────────────── */
async function handleWaitlistJoin(event, body, h) {
  const PLATFORMS = ['macos', 'linux', 'mobile', 'extension'];
  let { email, platform, name = '' } = body;

  if (!email || !platform) return bad(h, 'Email and platform are required.');
  email    = String(email).trim().toLowerCase();
  platform = String(platform).trim().toLowerCase();
  name     = String(name).trim().slice(0, 100);

  if (!validator.isEmail(email))     return bad(h, 'Invalid email address.');
  if (!PLATFORMS.includes(platform)) return bad(h, `Platform must be one of: ${PLATFORMS.join(', ')}`);

  const { data: existing } = await db().from('waitlist')
    .select('id').eq('email', email).eq('platform', platform).maybeSingle();

  if (existing)
    return ok(h, { ok: true, message: "You're already on the waitlist for this platform!", already: true });

  const { error } = await db().from('waitlist').insert({ email, platform, name });
  if (error) throw error;

  const labels = { macos: 'macOS', linux: 'Linux', mobile: 'Mobile', extension: 'Browser Extension' };
  sendMail({
    to: email,
    subject: `You're on the Entity X ${labels[platform] || platform} waitlist!`,
    text: `Hi ${name || 'Friend'},\n\nYou're on the Entity X ${labels[platform] || platform} waitlist! We'll notify you when it's ready.\n\n→ Windows version available now: https://github.com/jayaprakash2207/ENTITY-X/releases/latest\n\n— The Entity X Team`,
  }).catch(console.error);

  return ok(h, { ok: true, message: `You're on the waitlist for Entity X on ${platform}! We'll notify you when it's ready.` });
}

async function handleWaitlistCount(h) {
  const { data, count: total } = await db().from('waitlist').select('platform', { count: 'exact' });
  const byPlatform = {};
  (data || []).forEach(row => { byPlatform[row.platform] = (byPlatform[row.platform] || 0) + 1; });
  return ok(h, {
    total: total || 0,
    by_platform: Object.entries(byPlatform).map(([platform, c]) => ({ platform, c })),
  });
}

/* ── Admin ───────────────────────────────────────── */
async function handleAdmin(route, method, event, body, query, h) {
  if (!isAdmin(event)) return unauth(h);

  const supabase = db();

  // GET /admin/dashboard
  if (route === '/admin/dashboard' && method === 'GET') {
    const todayStart  = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
    const weekStart   = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const thirtyStart = new Date(); thirtyStart.setDate(thirtyStart.getDate() - 30);

    const [
      { count: dl_total }, { count: dl_today }, { count: dl_week },
      { count: c_open },   { count: c_total },
      { count: wl_total },
      { count: pv_total }, { count: pv_today },
      { data: recentContacts },
      { data: dl30 },
      { data: allWl },
      { data: dlReferers },
    ] = await Promise.all([
      supabase.from('downloads').select('*', { count: 'exact', head: true }),
      supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
      supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      supabase.from('contacts').select('id, name, email, subject, type, status, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('downloads').select('created_at').gte('created_at', thirtyStart.toISOString()),
      supabase.from('waitlist').select('platform'),
      supabase.from('downloads').select('referer').neq('referer', ''),
    ]);

    const byDay = {};
    (dl30 || []).forEach(d => {
      const day = d.created_at.split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    const downloads_by_day = Object.entries(byDay)
      .map(([day, c]) => ({ day, c }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const wlByPlatform = {};
    (allWl || []).forEach(r => { wlByPlatform[r.platform] = (wlByPlatform[r.platform] || 0) + 1; });

    const refCounts = {};
    (dlReferers || []).forEach(r => { if (r.referer) refCounts[r.referer] = (refCounts[r.referer] || 0) + 1; });
    const top_referers = Object.entries(refCounts)
      .map(([referer, c]) => ({ referer, c }))
      .sort((a, b) => b.c - a.c).slice(0, 10);

    return ok(h, {
      stats: {
        downloads:  { total: dl_total, today: dl_today, week: dl_week },
        contacts:   { open: c_open, total: c_total },
        waitlist:   { total: wl_total, by_platform: Object.entries(wlByPlatform).map(([platform, c]) => ({ platform, c })) },
        page_views: { total: pv_total, today: pv_today },
      },
      charts:          { downloads_by_day },
      recent_contacts: recentContacts || [],
      top_referers,
    });
  }

  // GET /admin/contacts
  if (route === '/admin/contacts' && method === 'GET') {
    const { status, type, page = '1', limit = '20' } = query;
    const pg     = Math.max(1, parseInt(page));
    const lm     = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pg - 1) * lm;

    let q = supabase.from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + lm - 1);
    if (status) q = q.eq('status', status);
    if (type)   q = q.eq('type', type);

    const { data: contacts, count: total } = await q;
    return ok(h, { contacts: contacts || [], total, page: pg, pages: Math.ceil((total || 0) / lm) });
  }

  // PATCH /admin/contacts/:id
  const patchMatch = route.match(/^\/admin\/contacts\/(\d+)$/);
  if (patchMatch && method === 'PATCH') {
    const { status } = body;
    if (!['open', 'read', 'replied', 'closed'].includes(status))
      return bad(h, 'Invalid status.');
    await supabase.from('contacts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', parseInt(patchMatch[1]));
    return ok(h, { ok: true });
  }

  // GET /admin/waitlist
  if (route === '/admin/waitlist' && method === 'GET') {
    const { data: waitlist } = await supabase.from('waitlist')
      .select('*').order('created_at', { ascending: false });
    return ok(h, { waitlist: waitlist || [], total: (waitlist || []).length });
  }

  // GET /admin/downloads
  if (route === '/admin/downloads' && method === 'GET') {
    const { page = '1', limit = '50' } = query;
    const pg     = Math.max(1, parseInt(page));
    const lm     = Math.min(100, parseInt(limit));
    const offset = (pg - 1) * lm;
    const { data: downloads, count: total } = await supabase.from('downloads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + lm - 1);
    return ok(h, { downloads: downloads || [], total, page: pg });
  }

  return notFound(h);
}

/* ═══════════════════════════════════════════════════
   MAIN HANDLER
   ═══════════════════════════════════════════════════ */
exports.handler = async (event) => {
  const h = corsHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: h, body: '' };
  }

  // Parse original path from rawUrl (reliable with Netlify redirects)
  let pathname;
  try {
    pathname = new URL(event.rawUrl).pathname;
  } catch {
    pathname = event.path;
  }

  const route  = pathname.replace(/^\/api/, '') || '/';
  const method = event.httpMethod;
  const body   = parseBody(event);
  const query  = event.queryStringParameters || {};

  try {
    // Health
    if (route === '/health'             && method === 'GET')  return handleHealth(h);

    // Downloads
    if (route === '/downloads/latest'   && method === 'GET')  return handleDownloadsLatest(h);
    if (route === '/downloads/track'    && method === 'POST') return handleDownloadsTrack(event, body, h);
    if (route === '/downloads/stats'    && method === 'GET')  return handleDownloadsStats(h);

    // Contact
    if (route === '/contact'            && method === 'POST') return handleContactSubmit(event, body, h);
    if (route === '/contact/types'      && method === 'GET')  return ok(h, {
      types: [
        { value: 'general',  label: 'General Inquiry' },
        { value: 'bug',      label: 'Bug Report' },
        { value: 'feature',  label: 'Feature Request' },
        { value: 'security', label: 'Security Issue' },
      ],
    });

    // Analytics
    if (route === '/analytics/pageview' && method === 'POST') return handlePageview(event, body, h);
    if (route === '/analytics/event'    && method === 'POST') return handleTrackEvent(event, body, h);
    if (route === '/analytics/summary'  && method === 'GET')  return handleAnalyticsSummary(h);

    // Waitlist
    if (route === '/waitlist'           && method === 'POST') return handleWaitlistJoin(event, body, h);
    if (route === '/waitlist/count'     && method === 'GET')  return handleWaitlistCount(h);

    // Admin (all protected by ADMIN_API_KEY)
    if (route.startsWith('/admin')) return handleAdmin(route, method, event, body, query, h);

    return notFound(h);
  } catch (e) {
    console.error('[API Error]', route, e.message);
    return respond(500, h, { error: 'Internal server error.' });
  }
};
