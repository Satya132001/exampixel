const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure processed folder exists
const processedDir = path.join(__dirname, '../../processed');
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

async function processImage(imageBuffer, options = {}) {
  const {
    width = 200,
    height = 230,
    format = 'jpeg',
    quality = 85,
    background = '#ffffff',
    maxSizeKB = 50,
    enhance = false
  } = options;

  const ext = format === 'jpeg' ? 'jpg' : format;
  const filename = `${uuidv4()}.${ext}`;
  const outputPath = path.join(processedDir, filename);

  let pipeline = sharp(imageBuffer);
  pipeline = pipeline.resize(width, height, {
    fit: 'contain',
    background: background === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : background,
    position: 'centre'
  });

  if (enhance) {
    pipeline = pipeline.sharpen({
      sigma: 1.5,
      m1: 1.0,
      m2: 2.0,
      x1: 2.0,
      y2: 10.0,
      y3: 20.0
    });
  }

  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else {
    pipeline = pipeline.jpeg({ quality });
  }

  await pipeline.toFile(outputPath);

  const stats = fs.statSync(outputPath);
  const fileSizeKB = Math.round(stats.size / 1024);

  return {
    success: true,
    filename,
    path: `/processed/${filename}`,
    width,
    height,
    format,
    quality,
    sizeKB: fileSizeKB
  };
}

module.exports = { processImage };