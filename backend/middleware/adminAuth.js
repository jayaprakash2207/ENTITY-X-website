/**
 * Simple API-key based admin auth.
 * Set ADMIN_API_KEY in your .env file.
 * Pass it as:  Authorization: Bearer <key>
 *           or X-Admin-Key: <key>
 */
module.exports = function adminAuth(req, res, next) {
  const key = process.env.ADMIN_API_KEY;

  if (!key) {
    console.warn('[AdminAuth] ADMIN_API_KEY not set — admin routes disabled.');
    return res.status(503).json({ error: 'Admin interface not configured.' });
  }

  const provided =
    req.headers['x-admin-key'] ||
    (req.headers['authorization'] || '').replace('Bearer ', '');

  if (!provided || provided !== key) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  next();
};
