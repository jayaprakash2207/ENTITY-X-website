const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const db        = require('../config/database');
const mailer    = require('../services/mailer');

const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many waitlist requests.' },
});

const PLATFORMS = ['macos','linux','mobile','extension'];

/* POST /api/waitlist — join waitlist */
router.post('/', waitlistLimiter, async (req, res) => {
  try {
    let { email, platform, name = '' } = req.body;

    if (!email || !platform)
      return res.status(400).json({ error: 'Email and platform are required.' });

    email    = String(email).trim().toLowerCase();
    platform = String(platform).trim().toLowerCase();
    name     = String(name).trim().slice(0, 100);

    if (!validator.isEmail(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    if (!PLATFORMS.includes(platform))
      return res.status(400).json({ error: `Platform must be one of: ${PLATFORMS.join(', ')}` });

    // Check duplicate
    const existing = db.prepare('SELECT id FROM waitlist WHERE email=? AND platform=?').get(email, platform);
    if (existing)
      return res.json({ ok: true, message: 'You\'re already on the waitlist for this platform!', already: true });

    db.prepare('INSERT INTO waitlist (email, platform, name) VALUES (?,?,?)').run(email, platform, name);

    // Send confirmation
    mailer.sendWaitlistConfirmation({ email, name: name || 'Friend', platform })
      .catch(err => console.error('[Mailer] Waitlist confirm failed:', err.message));

    res.json({ ok: true, message: `You're on the waitlist for Entity X on ${platform}! We'll notify you when it's ready.` });
  } catch (err) {
    console.error('[Waitlist]', err.message);
    res.status(500).json({ error: 'Failed to join waitlist.' });
  }
});

/* GET /api/waitlist/count — public count per platform */
router.get('/count', (req, res) => {
  try {
    const counts = db.prepare('SELECT platform, COUNT(*) as c FROM waitlist GROUP BY platform').all();
    const total  = db.prepare('SELECT COUNT(*) as c FROM waitlist').get().c;
    res.json({ total, by_platform: counts });
  } catch {
    res.status(500).json({ error: 'Unavailable.' });
  }
});

module.exports = router;
