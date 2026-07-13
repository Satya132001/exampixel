-- ============================================
-- EXAMPIXEL DATABASE SCHEMA
-- Sequential order for easy data management
-- ============================================

-- 1. USERS TABLE (for user accounts)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. EXAMS TABLE (exam types and specifications)
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  size VARCHAR(50) NOT NULL,           -- e.g., "3.5x4.5cm"
  dpi VARCHAR(50) NOT NULL,            -- e.g., "300 DPI"
  min_size VARCHAR(50) NOT NULL,       -- e.g., "50KB"
  max_size VARCHAR(50) NOT NULL,       -- e.g., "100KB"
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. IMAGE_HISTORY TABLE (track all processed images)
CREATE TABLE IF NOT EXISTS image_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  exam_id INTEGER REFERENCES exams(id) ON DELETE SET NULL,
  original_filename VARCHAR(255) NOT NULL,
  processed_filename VARCHAR(255) NOT NULL,
  processed_path VARCHAR(500),         -- /processed/filename.jpg
  file_size_kb INTEGER,
  image_type VARCHAR(50),              -- 'photo', 'signature', 'fingerprint'
  quality_percentage INTEGER,
  background_color VARCHAR(20),
  format VARCHAR(20),                  -- 'jpg', 'png', 'webp'
  is_enhanced BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PREMIUM_SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50),       -- 'monthly', 'yearly'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  amount_paid DECIMAL(10, 2),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE
);

-- 5. IMAGE_PROCESSING_LOGS TABLE (detailed processing info)
CREATE TABLE IF NOT EXISTS image_processing_logs (
  id SERIAL PRIMARY KEY,
  image_history_id INTEGER REFERENCES image_history(id) ON DELETE CASCADE,
  processing_time_ms INTEGER,          -- How long it took to process
  status VARCHAR(50),                  -- 'success', 'failed', 'pending'
  error_message TEXT,
  original_width INTEGER,
  original_height INTEGER,
  processed_width INTEGER,
  processed_height INTEGER,
  compression_ratio DECIMAL(5, 2),     -- Original size / Compressed size
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR FASTER QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_image_history_user ON image_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_history_exam ON image_history(exam_id);
CREATE INDEX IF NOT EXISTS idx_image_history_date ON image_history(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_premium_user ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_image ON image_processing_logs(image_history_id);

-- ============================================
-- CONSTRAINTS AND COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE exams IS 'Exam types with specifications';
COMMENT ON TABLE image_history IS 'All processed images with metadata';
COMMENT ON TABLE premium_subscriptions IS 'Premium subscription tracking';
COMMENT ON TABLE image_processing_logs IS 'Detailed logs for each image processing';
