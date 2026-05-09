const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const db        = require('../config/database');

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many analytics events.' },
});

/* POST /api/analytics/pageview — track a page view */
router.post('/pageview', analyticsLimiter, (req, res) => {
  try {
    const ip         = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'] || '';
    const { path = '/', referer = '', session_id = '' } = req.body;

    db.prepare(`
      INSERT INTO page_views (path, referer, user_agent, ip, session_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(path.slice(0, 500), referer.slice(0, 500), user_agent.slice(0, 500), ip, session_id.slice(0, 64));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track.' });
  }
});

/* POST /api/analytics/event — track a UI event */
router.post('/event', analyticsLimiter, (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    let { event_type, element = '', page = '/', session_id = '', meta = {} } = req.body;

    const allowed_types = [
      'download_click', 'github_click', 'section_view',
      'cta_click', 'nav_click', 'contact_open', 'waitlist_open', 'scroll_depth',
    ];
    if (!allowed_types.includes(event_type))
      return res.status(400).json({ error: 'Invalid event type.' });

    db.prepare(`
      INSERT INTO events (event_type, element, page, session_id, ip, meta)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(event_type, element.slice(0,100), page.slice(0,200), session_id.slice(0,64), ip, JSON.stringify(meta));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track event.' });
  }
});

/* GET /api/analytics/summary — public summary stats */
router.get('/summary', (req, res) => {
  try {
    const totalViews  = db.prepare('SELECT COUNT(*) as c FROM page_views').get().c;
    const todayViews  = db.prepare(`SELECT COUNT(*) as c FROM page_views WHERE date(created_at)=date('now')`).get().c;
    const weekViews   = db.prepare(`SELECT COUNT(*) as c FROM page_views WHERE created_at >= datetime('now','-7 days')`).get().c;
    const topEvents   = db.prepare(`SELECT event_type, COUNT(*) as c FROM events GROUP BY event_type ORDER BY c DESC LIMIT 10`).all();
    const dlClicks    = db.prepare(`SELECT COUNT(*) as c FROM events WHERE event_type='download_click'`).get().c;

    res.json({
      page_views: { total: totalViews, today: todayViews, week: weekViews },
      download_clicks: dlClicks,
      top_events: topEvents,
    });
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable.' });
  }
});

module.exports = router;
