// src/config.js
//
// In local development, leave REACT_APP_API_URL unset — the CRA dev
// server's "proxy" setting in package.json already forwards /api/*
// calls to your local backend (http://localhost:5000).
//
// In production (Vercel), set the environment variable:
//   REACT_APP_API_URL = https://exampixel.onrender.com
// so the deployed frontend knows where the deployed backend lives.

export const API_BASE_URL = process.env.REACT_APP_API_URL || '';
