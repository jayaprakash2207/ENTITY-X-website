const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

router.get('/', (req, res) => {
  let dbOk = false;
  try {
    db.prepare('SELECT 1').get();
    dbOk = true;
  } catch {}

  const status = dbOk ? 'ok' : 'degraded';
  res.status(dbOk ? 200 : 503).json({
    status,
    service: 'entityx-website-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: dbOk ? 'connected' : 'error',
    memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    node_version: process.version,
  });
});

module.exports = router;
