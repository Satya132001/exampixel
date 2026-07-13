import React, { useState, useRef } from 'react';

const BG_COLORS = [
  { label: 'White',     value: '#ffffff', display: '#ffffff' },
  { label: 'Blue',      value: '#1a6fc4', display: '#1a6fc4' },
  { label: 'Light Blue',value: '#a8d4f5', display: '#a8d4f5' },
  { label: 'Gray',      value: '#f0f0f0', display: '#f0f0f0' },
  { label: 'Red',       value: '#cc0000', display: '#cc0000' },
];

const ui = {
  en: {
    title:      'AI Background Remover',
    sub:        'Remove background and replace with exam-required color',
    upload:     'Upload Photo',
    processing: 'Removing background...',
    bgColor:    'Background Color',
    download:   '⬇️ Download',
    tip:        '💡 Works best with clear front-facing photos',
    original:   'Original',
    result:     'Result',
    proNote:    '🔒 Premium Feature — Unlock AI Background Removal',
    tryFree:    'Try Free (Demo)',
  },
  hi: {
    title:      'AI बैकग्राउंड रिमूवर',
    sub:        'बैकग्राउंड हटाएं और परीक्षा के अनुसार रंग लगाएं',
    upload:     'फोटो अपलोड करें',
    processing: 'बैकग्राउंड हट रहा है...',
    bgColor:    'बैकग्राउंड रंग',
    download:   '⬇️ डाउनलोड करें',
    tip:        '💡 सीधी face wali photo mein best kaam karta hai',
    original:   'मूल',
    result:     'परिणाम',
    proNote:    '🔒 प्रीमियम फीचर — AI बैकग्राउंड रिमूवल अनलॉक करें',
    tryFree:    'फ्री ट्रायल',
  }
};

// Pure canvas-based bg removal simulation
// Uses color thresholding to remove near-white/near-uniform backgrounds
function removeBackgroundCanvas(img, bgColor) {
  const canvas  = document.createElement('canvas');
  canvas.width  = img.naturalWidth  || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data      = imageData.data;
  const W = canvas.width, H = canvas.height;

  // Sample corner pixels to estimate background color
  const corners = [
    [data[0], data[1], data[2]],
    [data[(W-1)*4], data[(W-1)*4+1], data[(W-1)*4+2]],
    [data[(H-1)*W*4], data[(H-1)*W*4+1], data[(H-1)*W*4+2]],
    [data[((H-1)*W+W-1)*4], data[((H-1)*W+W-1)*4+1], data[((H-1)*W+W-1)*4+2]],
  ];
  const avgBg = corners.reduce((acc, c) => [acc[0]+c[0], acc[1]+c[1], acc[2]+c[2]], [0,0,0])
    .map(v => v / 4);

  // Parse target bg color
  const hex = bgColor.replace('#','');
  const tr  = parseInt(hex.substring(0,2),16);
  const tg  = parseInt(hex.substring(2,4),16);
  const tb  = parseInt(hex.substring(4,6),16);
  const threshold = 55;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const diff = Math.sqrt(
      Math.pow(r - avgBg[0], 2) +
      Math.pow(g - avgBg[1], 2) +
      Math.pow(b - avgBg[2], 2)
    );
    if (diff < threshold) {
      data[i]   = tr;
      data[i+1] = tg;
      data[i+2] = tb;
      data[i+3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

export default function AIBackgroundRemover({ language = 'en' }) {
  const [original,   setOriginal]   = useState(null);
  const [result,     setResult]     = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bgColor,    setBgColor]    = useState('#ffffff');
  const fileRef = useRef(null);
  const text    = ui[language] || ui.en;

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setOriginal(e.target.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const process = () => {
    if (!original) return;
    setProcessing(true);
    const img = new Image();
    img.onload = () => {
      // Small delay for UX feedback
      setTimeout(() => {
        const url = removeBackgroundCanvas(img, bgColor);
        setResult(url);
        setProcessing(false);
      }, 800);
    };
    img.src = original;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'ExamPixel_BG_Removed.jpg';
    a.click();
  };

  const changeBg = (color) => {
    setBgColor(color);
    if (original) {
      const img = new Image();
      img.onload = () => {
        const url = removeBackgroundCanvas(img, color);
        setResult(url);
      };
      img.src = original;
    }
  };

  return (
    <div style={S.wrapper}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.titleRow}>
          <span style={S.icon}>🖼️</span>
          <div>
            <div style={S.title}>{text.title}</div>
            <div style={S.sub}>{text.sub}</div>
          </div>
        </div>
      </div>

      {/* Upload */}
      {!original ? (
        <div style={S.dropzone}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#4f46e5'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor='rgba(79,70,229,0.2)'; }}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); e.currentTarget.style.borderColor='rgba(79,70,229,0.2)'; }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div>
          <div style={S.dropText}>{text.upload}</div>
          <input ref={fileRef} type="file" accept="image/*" hidden
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div>
          {/* Preview row */}
          <div style={S.previewRow}>
            <div style={S.previewBox}>
              <div style={S.previewLabel}>{text.original}</div>
              <img src={original} alt="original" style={S.previewImg} />
            </div>
            <div style={{ fontSize: 24, color: '#c7c5f0', alignSelf: 'center' }}>→</div>
            <div style={S.previewBox}>
              <div style={S.previewLabel}>{text.result}</div>
              {result ? (
                <img src={result} alt="result" style={{ ...S.previewImg, background: bgColor }} />
              ) : (
                <div style={S.placeholder}>
                  {processing ? (
                    <div>
                      <div style={S.spinner} />
                      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{text.processing}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#aaa' }}>Click Process →</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BG color picker */}
          <div style={S.colorRow}>
            <span style={S.colorLabel}>{text.bgColor}:</span>
            {BG_COLORS.map(c => (
              <div key={c.value}
                title={c.label}
                style={{ ...S.colorDot,
                  background: c.display,
                  boxShadow: bgColor === c.value ? `0 0 0 3px #4f46e5` : 'none',
                  border: c.value === '#ffffff' ? '1.5px solid #e8eaf0' : 'none',
                }}
                onClick={() => changeBg(c.value)}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {!result && (
              <button type="button" style={S.processBtn} onClick={process} disabled={processing}>
                {processing ? '⏳ Processing...' : '✨ Remove Background'}
              </button>
            )}
            {result && (
              <>
                <button type="button" style={S.downloadBtn} onClick={download}>{text.download}</button>
                <button type="button" style={S.resetBtn}
                  onClick={() => { setOriginal(null); setResult(null); }}>🔄 New Photo</button>
              </>
            )}
          </div>

          <div style={S.tip}>{text.tip}</div>
        </div>
      )}
    </div>
  );
}

const S = {
  wrapper: {
    background: 'rgba(255,255,255,0.96)', borderRadius: 20,
    border: '1px solid rgba(79,70,229,0.10)', padding: 24,
    fontFamily: 'Inter,sans-serif', boxShadow: '0 8px 32px rgba(79,70,229,0.07)',
  },
  header:    { marginBottom: 18 },
  titleRow:  { display: 'flex', alignItems: 'center', gap: 12 },
  icon:      { fontSize: 28 },
  title:     { fontSize: 16, fontWeight: 800, color: '#1a1a2e' },
  sub:       { fontSize: 12, color: '#888', marginTop: 2 },
  proBadge:  {
    marginLeft: 'auto', background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 12px',
    borderRadius: 50, cursor: 'pointer',
  },
  dropzone:  {
    border: '2px dashed rgba(79,70,229,0.2)', borderRadius: 14, padding: '36px 20px',
    textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
    background: 'rgba(79,70,229,0.02)',
  },
  dropText:  { fontSize: 14, fontWeight: 600, color: '#888', marginTop: 8 },
  previewRow:{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' },
  previewBox:{ flex: 1, minWidth: 130, textAlign: 'center' },
  previewLabel:{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 },
  previewImg:{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 10, border: '1.5px solid #e8eaf0' },
  placeholder:{ height: 160, background: '#f8f9ff', borderRadius: 10, border: '1.5px dashed #e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  colorRow:  { display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  colorLabel:{ fontSize: 12, fontWeight: 600, color: '#888' },
  colorDot:  { width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', transition: 'box-shadow 0.2s' },
  processBtn:{ flex: 1, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', border: 'none', borderRadius: 50, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  downloadBtn:{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: 50, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  resetBtn:  { background: '#f0f0f8', color: '#888', border: 'none', borderRadius: 50, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  tip:       { fontSize: 12, color: '#aaa', marginTop: 12, textAlign: 'center' },
  spinner:   { width: 28, height: 28, border: '3px solid #e8eaf0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
};
