/**
 * WA Tools Pro Indonesia - Backend Server
 * Node.js + Express + Baileys (WhatsApp Web API)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const whatsappRoutes = require('./routes/whatsapp');
const analyticsRoutes = require('./routes/analytics');
const autoReplyRoutes = require('./routes/autoreply');
const broadcastRoutes = require('./routes/broadcast');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'wa-tools-pro-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// ─── Ensure data directory ────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/autoreply', autoReplyRoutes);
app.use('/api/broadcast', broadcastRoutes);

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard*', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 WA Tools Pro berjalan di http://localhost:${PORT}`);
  console.log(`📱 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🔧 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
