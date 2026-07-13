const express = require('express');
const router = express.Router();
const {
  uploadMiddleware,
  processImageController,
  saveProcessedImageController,
  getUserHistory,
} = require('../controllers/imageController');

router.post('/process', uploadMiddleware, processImageController);
router.post('/save', uploadMiddleware, saveProcessedImageController);
router.get('/history/:userId', getUserHistory);

module.exports = router;
