const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const db        = require('../config/database');
const mailer    = require('../services/mailer');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact requests. Please wait 15 minutes.' },
});

/* POST /api/contact — submit a contact form */
router.post('/', contactLimiter, async (req, res) => {
  try {
    let { name, email, subject, message, type = 'general' } = req.body;

    /* ── Validation ── */
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: 'All fields are required.' });

    name    = String(name).trim().slice(0, 100);
    email   = String(email).trim().toLowerCase();
    subject = String(subject).trim().slice(0, 200);
    message = String(message).trim().slice(0, 5000);
    type    = ['general','bug','feature','security'].includes(type) ? type : 'general';

    if (!validator.isEmail(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    if (message.length < 10)
      return res.status(400).json({ error: 'Message must be at least 10 characters.' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    /* ── Save to DB ── */
    const result = db.prepare(`
      INSERT INTO contacts (name, email, subject, message, type, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, subject, message, type, ip);

    /* ── Send notification email (non-blocking) ── */
    mailer.sendContactNotification({ id: result.lastInsertRowid, name, email, subject, message, type })
      .catch(err => console.error('[Mailer] Notification failed:', err.message));

    /* ── Send confirmation to user (non-blocking) ── */
    mailer.sendContactConfirmation({ name, email, subject })
      .catch(err => console.error('[Mailer] Confirmation failed:', err.message));

    res.json({
      ok: true,
      id: result.lastInsertRowid,
      message: 'Your message has been received. We\'ll get back to you within 24–48 hours.',
    });
  } catch (err) {
    console.error('[Contact]', err.message);
    res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
});

/* GET /api/contact/types — available contact types */
router.get('/types', (req, res) => {
  res.json({
    types: [
      { value: 'general',  label: 'General Inquiry' },
      { value: 'bug',      label: 'Bug Report' },
      { value: 'feature',  label: 'Feature Request' },
      { value: 'security', label: 'Security Issue' },
    ],
  });
});

module.exports = router;
