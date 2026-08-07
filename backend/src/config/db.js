// backend/src/config/db.js
// ── Neon PostgreSQL + Render deployment ────────────────────────────────────
//
// Render pe sirf DATABASE_URL set karo — baaki sab automatically handle hoga.
// Local development ke liye bhi DATABASE_URL use karo (ya .env file mein set karo).
//
// .env example:
//   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set.');
  console.error('   Render pe: Settings → Environment → Add DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // ✅ SSL — Neon + Render ke liye required
  ssl: {
    rejectUnauthorized: false
  },

  // Connection pool settings (Neon free tier ke liye optimized)
  max: 5,                    // Neon free: max 5 concurrent connections
  min: 0,
  idleTimeoutMillis: 10000,  // 10s — Neon sleeps inactive connections
  connectionTimeoutMillis: 8000,
  allowExitOnIdle: true,
});

// ── Startup connection test ────────────────────────────────────────────────
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check your DATABASE_URL on Render dashboard.');
    return;
  }
  const host = new URL(process.env.DATABASE_URL).hostname;
  console.log('✅ PostgreSQL connected —', host);
  release();
});

// ── Graceful shutdown ─────────────────────────────────────────────────────
const shutdown = () => {
  pool.end(() => console.log('🔌 DB pool closed.'));
};
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);

module.exports = pool;
