const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');
const userRoutes = require('./routes/userRoutes');

// ✅ IMPORT DATABASE CONNECTION
require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/processed', express.static(path.join(__dirname, '../processed')));

// Routes
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend running with PostgreSQL!',
    database: process.env.DB_NAME || 'exampixel'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'ExamPixel Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      process: '/api/images/process',
      history: '/api/history'
    }
  });
});