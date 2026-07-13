const multer = require('multer');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

const uploadMiddleware = upload.single('image');

const processImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const options = {
      width: parseInt(req.body.width) || 200,
      height: parseInt(req.body.height) || 230,
      format: req.body.format || 'jpeg',
      quality: parseInt(req.body.quality) || 85,
      background: req.body.background || '#ffffff',
      maxSizeKB: parseInt(req.body.maxSizeKB) || 50,
      enhance: req.body.enhance === 'true'
    };

    const result = await processImage(req.file.buffer, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveProcessedImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const processedDir = path.join(__dirname, '../../processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    const filename = `${uuidv4()}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const outputPath = path.join(processedDir, filename);

    fs.writeFileSync(outputPath, req.file.buffer);

    const stats = fs.statSync(outputPath);
    const fileSizeKB = Math.round(stats.size / 1024);
    const publicPath = `/processed/${filename}`;

    // Optional: link to a logged-in user's history
    const { userId, examName, docType } = req.body;
    if (userId) {
      try {
        await pool.query(
          `INSERT INTO saved_images (user_id, exam_name, doc_type, file_path, file_size_kb)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, examName || null, docType || null, publicPath, fileSizeKB]
        );
      } catch (dbErr) {
        // Don't fail the whole request if history-linking fails —
        // the file itself is still saved successfully.
        console.error('Could not link saved image to user history:', dbErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Image saved successfully',
      filename,
      path: publicPath,
      sizeKB: fileSizeKB
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Returns the saved-image history for a given user, most recent first.
const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const result = await pool.query(
      `SELECT id, exam_name, doc_type, file_path, file_size_kb, created_at
       FROM saved_images
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    res.json({ success: true, images: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadMiddleware,
  processImageController,
  saveProcessedImageController,
  getUserHistory,
};
