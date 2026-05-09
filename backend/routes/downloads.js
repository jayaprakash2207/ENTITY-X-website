const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const db      = require('../config/database');
const https   = require('https');

const dlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Too many download requests.' },
});

/* ── Fetch latest release from GitHub API (cached 1hr) ── */
function fetchGitHubRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/jayaprakash2207/ENTITY-X/releases/latest',
      method: 'GET',
      headers: {
        'User-Agent': 'EntityX-Website/1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function getCachedRelease() {
  const row = db.prepare(`
    SELECT * FROM release_cache
    ORDER BY fetched_at DESC LIMIT 1
  `).get();
  if (!row) return null;
  const ageMs = Date.now() - new Date(row.fetched_at).getTime();
  if (ageMs > 60 * 60 * 1000) return null; // expired after 1 hour
  return row;
}

/* GET /api/downloads/latest — returns latest release info */
router.get('/latest', async (req, res) => {
  try {
    // Try cache first
    const cached = getCachedRelease();
    if (cached) {
      return res.json({
        version: cached.version,
        tag_name: cached.tag_name,
        download_url: cached.download_url,
        size_bytes: cached.size_bytes,
        release_notes: cached.release_notes,
        published_at: cached.published_at,
        from_cache: true,
      });
    }

    // Fetch from GitHub
    const release = await fetchGitHubRelease();
    const exeAsset = (release.assets || []).find(a => a.name.endsWith('.exe'));

    const data = {
      version: release.tag_name || 'v1.5.0',
      tag_name: release.tag_name || 'v1.5.0',
      download_url: exeAsset
        ? exeAsset.browser_download_url
        : `https://github.com/jayaprakash2207/ENTITY-X/releases/latest`,
      size_bytes: exeAsset ? exeAsset.size : null,
      release_notes: release.body || '',
      published_at: release.published_at || new Date().toISOString(),
    };

    // Cache it
    db.prepare(`
      INSERT INTO release_cache (version, tag_name, download_url, size_bytes, release_notes, published_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.version, data.tag_name, data.download_url, data.size_bytes, data.release_notes, data.published_at);

    res.json({ ...data, from_cache: false });
  } catch (err) {
    console.error('[Downloads] GitHub fetch failed:', err.message);
    // Return fallback
    res.json({
      version: 'v1.5.0',
      tag_name: 'v1.5.0',
      download_url: 'https://github.com/jayaprakash2207/ENTITY-X/releases/latest',
      size_bytes: null,
      release_notes: '',
      published_at: null,
      from_cache: false,
      fallback: true,
    });
  }
});

/* POST /api/downloads/track — log a download click */
router.post('/track', dlLimiter, (req, res) => {
  try {
    const ip         = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'] || '';
    const { platform = 'windows', version = 'latest', referer = '' } = req.body;

    db.prepare(`
      INSERT INTO downloads (ip, user_agent, platform, version, referer)
      VALUES (?, ?, ?, ?, ?)
    `).run(ip, user_agent, platform, version, referer);

    res.json({ ok: true, message: 'Download tracked.' });
  } catch (err) {
    console.error('[Downloads] Track error:', err.message);
    res.status(500).json({ error: 'Tracking failed.' });
  }
});

/* GET /api/downloads/stats — public stats */
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as c FROM downloads').get().c;
    const today = db.prepare(`
      SELECT COUNT(*) as c FROM downloads
      WHERE date(created_at) = date('now')
    `).get().c;
    const week = db.prepare(`
      SELECT COUNT(*) as c FROM downloads
      WHERE created_at >= datetime('now', '-7 days')
    `).get().c;
    const byPlatform = db.prepare(`
      SELECT platform, COUNT(*) as c FROM downloads GROUP BY platform
    `).all();

    res.json({ total, today, week, by_platform: byPlatform });
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable.' });
  }
});

module.exports = router;
