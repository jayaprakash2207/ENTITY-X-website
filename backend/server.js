require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const db         = require('./config/database');
const downloadRoutes  = require('./routes/downloads');
const contactRoutes   = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes     = require('./routes/admin');
const waitlistRoutes  = require('./routes/waitlist');
const healthRoutes    = require('./routes/health');

const app  = express();
const PORT = process.env.PORT || 4000;

/* ── Security ── */
app.use(helmet({
  contentSecurityPolicy: false,  // frontend handles its own CSP
  crossOriginEmbedderPolicy: false,
}));

/* ── CORS ── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

/* ── Compression & parsing ── */
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── Logging ── */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ── Global rate limits ── */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

/* ── Serve static frontend ── */
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

/* ── API Routes ── */
app.use('/api/health',    healthRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/contact',   contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/waitlist',  waitlistRoutes);
app.use('/api/admin',     adminRoutes);

/* ── SPA fallback ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

/* ── Error handler ── */
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║       ENTITY X  —  Website Backend           ║
║       Running on http://localhost:${PORT}       ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
