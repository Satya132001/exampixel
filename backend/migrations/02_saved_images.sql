-- backend/migrations/02_saved_images.sql
-- Run this once against your database to add photo-history support.

CREATE TABLE IF NOT EXISTS saved_images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(255),
  doc_type VARCHAR(50),
  file_path VARCHAR(500) NOT NULL,
  file_size_kb INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_images_user_id ON saved_images(user_id);
