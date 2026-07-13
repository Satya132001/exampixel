// ── Shared image utilities ───────────────────────────────────────────────────

export function getTargetDimensions(sizeStr) {
  if (!sizeStr) return { w: 200, h: 230 };
  if (sizeStr === '3.5x4.5cm') return { w: 413, h: 531 };
  if (sizeStr.includes('cm')) {
    const [w, h] = sizeStr.replace('cm','').split('x').map(parseFloat);
    return { w: Math.round(w * 118), h: Math.round(h * 118) };
  }
  const [w, h] = sizeStr.split('x').map(Number);
  return { w: w || 200, h: h || 230 };
}

// ── HD Enhancement — multi-pass, clean output ────────────────────────────────
// Strategy:
//  1. Draw at 4x resolution for maximum detail
//  2. Apply gentle unsharp mask (industry standard)
//  3. Subtle brightness/contrast lift
//  4. Scale down to target size using CSS smoothing → clean final output
export function applyHDEnhance(ctx, tW, tH, sourceCanvas) {
  const SCALE = 2; // 2x internal resolution
  const hiW   = tW * SCALE;
  const hiH   = tH * SCALE;

  // ── Step 1: Upscale to 2x on a temp canvas ──
  const hiCanvas = document.createElement('canvas');
  hiCanvas.width  = hiW;
  hiCanvas.height = hiH;
  const hiCtx = hiCanvas.getContext('2d');
  hiCtx.imageSmoothingEnabled = true;
  hiCtx.imageSmoothingQuality = 'high';
  hiCtx.drawImage(sourceCanvas, 0, 0, hiW, hiH);

  // ── Step 2: Gentle brightness/saturation/contrast boost ──
  const id   = hiCtx.getImageData(0, 0, hiW, hiH);
  const data = id.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];

    // Slight saturation boost (makes skin tones pop)
    const avg = (r + g + b) / 3;
    const sat = 1.12;
    r = Math.min(255, avg + (r - avg) * sat);
    g = Math.min(255, avg + (g - avg) * sat);
    b = Math.min(255, avg + (b - avg) * sat);

    // Contrast (S-curve approximation)
    const contrast = 1.06;
    const mid = 128;
    r = Math.min(255, Math.max(0, (r - mid) * contrast + mid));
    g = Math.min(255, Math.max(0, (g - mid) * contrast + mid));
    b = Math.min(255, Math.max(0, (b - mid) * contrast + mid));

    // Tiny brightness lift
    data[i]   = Math.min(255, r + 5);
    data[i+1] = Math.min(255, g + 5);
    data[i+2] = Math.min(255, b + 5);
  }
  hiCtx.putImageData(id, 0, 0);

  // ── Step 3: Unsharp mask on hi-res canvas ──
  const blurC = document.createElement('canvas');
  blurC.width = hiW; blurC.height = hiH;
  const bCtx  = blurC.getContext('2d');
  bCtx.filter = 'blur(0.8px)';
  bCtx.drawImage(hiCanvas, 0, 0);
  const blurData = bCtx.getImageData(0, 0, hiW, hiH).data;

  const sharp   = hiCtx.getImageData(0, 0, hiW, hiH);
  const sd      = sharp.data;
  const amount  = 0.55; // moderate, not aggressive

  for (let i = 0; i < sd.length; i += 4) {
    sd[i]   = Math.min(255, Math.max(0, sd[i]   + amount * (sd[i]   - blurData[i])));
    sd[i+1] = Math.min(255, Math.max(0, sd[i+1] + amount * (sd[i+1] - blurData[i+1])));
    sd[i+2] = Math.min(255, Math.max(0, sd[i+2] + amount * (sd[i+2] - blurData[i+2])));
  }
  hiCtx.putImageData(sharp, 0, 0);

  // ── Step 4: Scale back down to target size (smooth) ──
  ctx.clearRect(0, 0, tW, tH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(hiCanvas, 0, 0, tW, tH);
}

// ── Photo quality analysis ────────────────────────────────────────────────────
export function checkPhotoQuality(img) {
  const canvas  = document.createElement('canvas');
  const MAX     = 300; // sample at reduced size for speed
  const ratio   = Math.min(MAX / img.width, MAX / img.height, 1);
  canvas.width  = Math.round(img.width  * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx     = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data    = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const W = canvas.width, H = canvas.height;

  // Average brightness
  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
  }
  const avgBrightness = totalBrightness / (data.length / 4);

  // Laplacian variance (blur detection)
  let variance = 0, count = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = (y * W + x) * 4;
      const lap =
        -data[((y-1)*W+x)*4] - data[(y*W+x-1)*4] +
        4 * data[idx] -
        data[(y*W+x+1)*4] - data[((y+1)*W+x)*4];
      variance += lap * lap;
      count++;
    }
  }
  variance = count > 0 ? variance / count : 0;

  const issues = [], tips = [];

  if (avgBrightness < 55) {
    issues.push('Photo is too dark');
    tips.push('Take photo in bright natural light');
  } else if (avgBrightness > 215) {
    issues.push('Photo is overexposed');
    tips.push('Avoid direct sunlight or flash');
  }

  if (variance < 80) {
    issues.push('Photo appears blurry');
    tips.push('Hold your phone steady or use portrait mode');
  }

  if (img.width < 100 || img.height < 100) {
    issues.push('Image resolution is too low');
    tips.push('Use a higher resolution photo');
  }

  return {
    ok:         issues.length === 0,
    issues,
    tips,
    brightness: Math.round(avgBrightness),
    sharpness:  Math.round(variance),
  };
}

export function downloadDataURL(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL; a.download = filename; a.click();
}
