// backend/src/index.js
const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config();

// ── DB must load before routes ────────────────────────────────────────────
require('./config/db');

const imageRoutes = require('./routes/imageRoutes');
const userRoutes  = require('./routes/userRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────
// Render backend + Vercel frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,           // set on Render: https://exampixel.vercel.app
].filter(Boolean);                    // remove undefined

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve processed images as static files
app.use('/processed', express.static(path.join(__dirname, '../processed')));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/images', imageRoutes);
app.use('/api/users',  userRoutes);

// ── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const pool = require('./config/db');
  try {
    const result = await pool.query('SELECT NOW() AS time');
    res.json({
      status:   'OK',
      message:  'ExamPixel Backend running',
      db:       'connected',
      db_time:  result.rows[0].time,
      env:      process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', db: err.message });
  }
});

// ── Root ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name:    'ExamPixel Backend API',
    version: '1.0.0',
    status:  'running',
    endpoints: {
      health:  '/api/health',
      process: '/api/images/process',
      save:    '/api/images/save',
      history: '/api/images/history/:userId',
      register:'/api/users/register',
      login:   '/api/users/login',
    },
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ExamPixel backend running on port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
});
