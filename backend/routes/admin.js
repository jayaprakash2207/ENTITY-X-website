const express   = require('express');
const router    = express.Router();
const db        = require('../config/database');
const adminAuth = require('../middleware/adminAuth');

/* All admin routes require auth */
router.use(adminAuth);

/* GET /api/admin/dashboard */
router.get('/dashboard', (req, res) => {
  try {
    const downloads_total  = db.prepare('SELECT COUNT(*) as c FROM downloads').get().c;
    const downloads_today  = db.prepare(`SELECT COUNT(*) as c FROM downloads WHERE date(created_at)=date('now')`).get().c;
    const downloads_week   = db.prepare(`SELECT COUNT(*) as c FROM downloads WHERE created_at>=datetime('now','-7 days')`).get().c;
    const contacts_open    = db.prepare(`SELECT COUNT(*) as c FROM contacts WHERE status='open'`).get().c;
    const contacts_total   = db.prepare('SELECT COUNT(*) as c FROM contacts').get().c;
    const waitlist_total   = db.prepare('SELECT COUNT(*) as c FROM waitlist').get().c;
    const pageviews_total  = db.prepare('SELECT COUNT(*) as c FROM page_views').get().c;
    const pageviews_today  = db.prepare(`SELECT COUNT(*) as c FROM page_views WHERE date(created_at)=date('now')`).get().c;

    const downloads_by_day = db.prepare(`
      SELECT date(created_at) as day, COUNT(*) as c
      FROM downloads WHERE created_at >= datetime('now','-30 days')
      GROUP BY day ORDER BY day ASC
    `).all();

    const recent_contacts = db.prepare(`
      SELECT id, name, email, subject, type, status, created_at
      FROM contacts ORDER BY created_at DESC LIMIT 10
    `).all();

    const waitlist_by_platform = db.prepare(
      'SELECT platform, COUNT(*) as c FROM waitlist GROUP BY platform'
    ).all();

    const top_referers = db.prepare(`
      SELECT referer, COUNT(*) as c FROM downloads
      WHERE referer != '' GROUP BY referer ORDER BY c DESC LIMIT 10
    `).all();

    res.json({
      stats: {
        downloads: { total: downloads_total, today: downloads_today, week: downloads_week },
        contacts:  { open: contacts_open, total: contacts_total },
        waitlist:  { total: waitlist_total, by_platform: waitlist_by_platform },
        page_views:{ total: pageviews_total, today: pageviews_today },
      },
      charts: { downloads_by_day },
      recent_contacts,
      top_referers,
    });
  } catch (err) {
    console.error('[Admin Dashboard]', err);
    res.status(500).json({ error: err.message });
  }
});

/* GET /api/admin/contacts */
router.get('/contacts', (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  let where = [], params = [];
  if (status) { where.push('status=?'); params.push(status); }
  if (type)   { where.push('type=?');   params.push(type); }
  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (parseInt(page)-1) * parseInt(limit);

  const rows  = db.prepare(`SELECT * FROM contacts ${whereStr} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
  const total = db.prepare(`SELECT COUNT(*) as c FROM contacts ${whereStr}`).get(...params).c;
  res.json({ contacts: rows, total, page: parseInt(page), pages: Math.ceil(total/parseInt(limit)) });
});

/* PATCH /api/admin/contacts/:id */
router.patch('/contacts/:id', (req, res) => {
  const { status } = req.body;
  const allowed = ['open','read','replied','closed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  db.prepare(`UPDATE contacts SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(status, req.params.id);
  res.json({ ok: true });
});

/* GET /api/admin/waitlist */
router.get('/waitlist', (req, res) => {
  const rows = db.prepare('SELECT * FROM waitlist ORDER BY created_at DESC').all();
  res.json({ waitlist: rows, total: rows.length });
});

/* GET /api/admin/downloads */
router.get('/downloads', (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page)-1)*parseInt(limit);
  const rows  = db.prepare('SELECT * FROM downloads ORDER BY created_at DESC LIMIT ? OFFSET ?').all(parseInt(limit), offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM downloads').get().c;
  res.json({ downloads: rows, total, page: parseInt(page) });
});

module.exports = router;
