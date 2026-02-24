// ═══════════════════════════════════════════════════════════════════
// Express App Setup - Middleware & Route Configuration
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const path = require('path');
const { config } = require('./config');

const cropRoutes = require('./routes/crop.route');
const locationRoutes = require('./routes/location.route');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server tools, same-origin requests and configured frontend URL.
    if (!origin || origin === config.FRONTEND_URL) {
      callback(null, true);
      return;
    }

    // Allow localhost variants for local static servers.
    const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localOriginPattern.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend public folder
app.use(express.static(path.join(__dirname, '../../frontend')));

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────
app.use(`${config.API_BASE_PATH}/crops`, cropRoutes);
app.use(`${config.API_BASE_PATH}/location`, locationRoutes);

// ── Serve Main Page ─────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = app;
