const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    console.warn('[Mailer] SMTP not configured — emails will be logged to console only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

const FROM = process.env.EMAIL_FROM || 'Entity X <noreply@entityx.app>';
const NOTIFY_TO = process.env.EMAIL_NOTIFY || process.env.SMTP_USER || '';

/* ── Contact notification (sent to admin) ── */
async function sendContactNotification({ id, name, email, subject, message, type }) {
  const t = getTransporter();
  const body = `
New contact form submission on entityx.app

ID:      #${id}
Type:    ${type}
Name:    ${name}
Email:   ${email}
Subject: ${subject}

Message:
${message}

---
Reply directly to this email to respond to ${name}.
  `.trim();

  if (!t) { console.log('[Mailer] CONTACT NOTIFICATION:\n', body); return; }

  await t.sendMail({
    from: FROM, to: NOTIFY_TO,
    replyTo: email,
    subject: `[EntityX Contact] ${type.toUpperCase()} — ${subject}`,
    text: body,
  });
}

/* ── Contact confirmation (sent to user) ── */
async function sendContactConfirmation({ name, email, subject }) {
  const t = getTransporter();
  const body = `
Hi ${name},

Thank you for reaching out about "${subject}".

We've received your message and will get back to you within 24–48 hours.

In the meantime:
• Download Entity X: https://entityx.app
• GitHub: https://github.com/jayaprakash2207/ENTITY-X
• Report bugs: https://github.com/jayaprakash2207/ENTITY-X/issues

— The Entity X Team
  `.trim();

  if (!t) { console.log('[Mailer] CONTACT CONFIRMATION to', email, '\n', body); return; }

  await t.sendMail({
    from: FROM, to: email,
    subject: `We received your message — Entity X`,
    text: body,
  });
}

/* ── Waitlist confirmation ── */
async function sendWaitlistConfirmation({ email, name, platform }) {
  const t = getTransporter();
  const platformLabels = { macos:'macOS', linux:'Linux', mobile:'Mobile App', extension:'Browser Extension' };
  const label = platformLabels[platform] || platform;

  const body = `
Hi ${name},

You're on the waitlist for Entity X on ${label}! 🎉

We're working hard on bringing Entity X to more platforms. When ${label} is ready, you'll be the first to know.

While you wait, Entity X for Windows is available right now:
→ Download: https://github.com/jayaprakash2207/ENTITY-X/releases/latest
→ GitHub: https://github.com/jayaprakash2207/ENTITY-X

No Python. No API keys. No setup. Just install and use.

— The Entity X Team
  `.trim();

  if (!t) { console.log('[Mailer] WAITLIST CONFIRM to', email, '\n', body); return; }

  await t.sendMail({
    from: FROM, to: email,
    subject: `You're on the Entity X ${label} waitlist!`,
    text: body,
  });
}

module.exports = { sendContactNotification, sendContactConfirmation, sendWaitlistConfirmation };
