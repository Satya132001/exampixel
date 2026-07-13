import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// ── Exam aspect ratios ──────────────────────────────────────────────────────
const EXAM_RATIOS = {
  'SSC CGL / CHSL':        { w: 100, h: 120, label: '100×120 px' },
  'SSC MTS / GD':          { w: 100, h: 100, label: '100×100 px' },
  'Railway NTPC / GD':     { w: 350, h: 450, label: '3.5×4.5 cm' },
  'UPSC CSE':              { w: 300, h: 400, label: '300×400 px' },
  'IBPS PO / Clerk':       { w: 200, h: 200, label: '200×200 px' },
  'DSSSB':                 { w: 200, h: 230, label: '200×230 px' },
  'CTET / UPTET':          { w: 200, h: 250, label: '200×250 px' },
  'OSSC CGL':              { w: 150, h: 200, label: '150×200 px' },
  'OSSSC RI / ARI / Amin': { w: 150, h: 200, label: '150×200 px' },
  'OPSC OAS':              { w: 300, h: 400, label: '300×400 px' },
  'OSSSC PEO / Panchayat': { w: 150, h: 200, label: '150×200 px' },
  'UP Police Constable':   { w: 150, h: 200, label: '150×200 px' },
  'BPSC':                  { w: 150, h: 200, label: '150×200 px' },
  'MP Police Constable':   { w: 150, h: 200, label: '150×200 px' },
  'Rajasthan Police':      { w: 150, h: 200, label: '150×200 px' },
  'Signature':             { w: 300, h: 100, label: '300×100 px' },
};

function centerAspectCrop(mediaW, mediaH, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 82 }, aspect, mediaW, mediaH),
    mediaW, mediaH
  );
}

function getCroppedDataURL(image, crop, targetW, targetH, format, quality) {
  const pixelRatio = window.devicePixelRatio || 1;
  const canvas     = document.createElement('canvas');
  canvas.width     = targetW * pixelRatio;
  canvas.height    = targetH * pixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const scaleX = image.naturalWidth  / image.width;
  const scaleY = image.naturalHeight / image.height;

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, targetW, targetH
  );

  return canvas.toDataURL(format, quality);
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  wrapper: {
    background: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    border: '1px solid rgba(79,70,229,0.10)',
    padding: '32px',
    maxWidth: 900,
    margin: '0 auto',
    boxShadow: '0 12px 60px rgba(79,70,229,0.07)',
    fontFamily: "'Inter',sans-serif",
  },
  header:   { textAlign: 'center', marginBottom: 22 },
  title:    { fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', lineHeight: 1.6 },

  tabs: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 },
  tab: {
    padding: '8px 24px', borderRadius: 50,
    border: '1.5px solid #e8eaf0',
    background: 'rgba(255,255,255,0.8)',
    fontSize: 13, fontWeight: 600, color: '#888',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.22s',
  },
  tabActive: {
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    borderColor: 'transparent', color: 'white',
    boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
  },

  infoBar: {
    display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
    background: 'linear-gradient(135deg,#f8f9ff,#f0f2ff)',
    borderRadius: 14, padding: '12px 20px', marginBottom: 24,
    border: '1px solid rgba(79,70,229,0.08)',
  },
  infoChip:  { display: 'flex', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.7px' },
  infoVal:   { fontSize: 14, fontWeight: 700, color: '#4f46e5' },
  select: {
    border: '1.5px solid #e8eaf0', borderRadius: 8, padding: '5px 10px',
    fontSize: 13, fontWeight: 600, color: '#1a1a2e', background: 'white',
    cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
  },

  panel:   { display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' },
  left:    { flex: '1 1 320px', minWidth: 280 },
  right:   { flex: '0 0 230px', minWidth: 210, display: 'flex', flexDirection: 'column', gap: 14 },

  dropzone: {
    border: '2px dashed #c7c5f0', borderRadius: 20,
    padding: '52px 24px', textAlign: 'center',
    background: 'linear-gradient(135deg,#fafaff,#f5f3ff)',
    cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
  },
  dropIcon: { fontSize: 42, marginBottom: 12 },
  dropText: { fontSize: 15, fontWeight: 700, color: '#555', marginBottom: 6 },
  dropSub:  { fontSize: 12, color: '#aaa', marginBottom: 16 },
  uploadBtn:{
    display: 'inline-block',
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    color: 'white', fontSize: 13, fontWeight: 700,
    padding: '10px 28px', borderRadius: 50,
    boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
  },
  types:    { fontSize: 12, color: '#bbb', marginTop: 14 },

  changeBtn: {
    marginTop: 12, display: 'block', width: '100%', textAlign: 'center',
    background: 'none', border: '1.5px solid #e8eaf0', borderRadius: 50,
    padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#888',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
  },

  previewLabel: {
    fontSize: 11, fontWeight: 700, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center',
  },
  previewBox: {
    minHeight: 190, background: 'linear-gradient(135deg,#f8f9ff,#f0f2ff)',
    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(79,70,229,0.08)', overflow: 'hidden', padding: 10,
  },
  noPreview: { textAlign: 'center', padding: '20px 0' },
  previewMeta: { textAlign: 'center', fontSize: 11, color: '#aaa', fontWeight: 600 },

  downloadBtn: {
    display: 'block', width: '100%',
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    color: 'white', fontSize: 14, fontWeight: 800,
    padding: '13px 16px', borderRadius: 50, border: 'none',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 6px 24px rgba(79,70,229,0.32)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  examCard: {
    background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)',
    borderRadius: 14, padding: '14px 16px',
  },
  examCardTag:    { fontSize: 9, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 },
  examCardName:   { fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 },
  examCardDetail: { fontSize: 11, color: '#7c3aed' },

  tip: {
    background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
    border: '1.5px solid #fde68a', borderRadius: 12,
    padding: '10px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.6,
  },
};

// ── Component ───────────────────────────────────────────────────────────────
export default function ImageCropper({ selectedExam, language = 'en' }) {
  const [imgSrc,        setImgSrc]      = useState('');
  const [crop,          setCrop]        = useState();
  const [completedCrop, setCompleted]   = useState(null);
  const [previewURL,    setPreviewURL]  = useState('');
  const [format,        setFormat]      = useState('image/jpeg');
  const [activeType,    setType]        = useState('photo');
  const imgRef  = useRef(null);
  const fileRef = useRef(null);

  const ui = language === 'hi' ? {
    title:     'फोटो क्रॉप करें',
    sub:       'क्रॉप बॉक्स को खींचकर अपनी फोटो को सटीक तरीके से फ्रेम करें।',
    photo:     '📸 फोटो',
    sig:       '✍️ हस्ताक्षर',
    fmtLabel:  'फॉर्मेट',
    ratioLabel:'अनुपात',
    drag:      'खींचें और छोड़ें या क्लिक करें',
    types:     'JPG, PNG स्वीकार्य',
    upload:    'फ़ाइल चुनें',
    change:    '🔄 बदलें',
    preview:   'लाइव प्रीव्यू',
    noPreview: 'क्रॉप करें, प्रीव्यू देखें',
    download:  '⬇️ क्रॉप फोटो डाउनलोड करें',
    exam:      'चुनी गई परीक्षा',
    tip:       '💡 नीले हैंडल खींचें • अनुपात ऑटो-लॉक्ड है',
  } : {
    title:     'Crop Your Photo',
    sub:       'Drag the crop handles to perfectly frame your photo.',
    photo:     '📸 Photo',
    sig:       '✍️ Signature',
    fmtLabel:  'Format',
    ratioLabel:'Aspect Ratio',
    drag:      'Drag & Drop or Click to Upload',
    types:     'JPG, PNG supported',
    upload:    'Browse File',
    change:    '🔄 Change Image',
    preview:   'Live Preview',
    noPreview: 'Crop the image to see preview',
    download:  '⬇️ Download Cropped Photo',
    exam:      'Selected Exam',
    tip:       '💡 Drag the blue handles • Aspect ratio is auto-locked',
  };

  // Pick the right ratio
  const examKey  = activeType === 'signature'
    ? 'Signature'
    : (selectedExam?.name || 'SSC CGL / CHSL');
  const ratioData = EXAM_RATIOS[examKey] || EXAM_RATIOS['SSC CGL / CHSL'];
  const aspect    = ratioData.w / ratioData.h;

  // Re-centre crop when image or aspect changes
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  // Re-centre when tab switches
  useEffect(() => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    setCrop(centerAspectCrop(width, height, aspect));
    setCompleted(null);
    setPreviewURL('');
  }, [activeType, aspect]);

  // Live preview on every crop change
  useEffect(() => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) return;
    const url = getCroppedDataURL(
      imgRef.current,
      completedCrop,
      ratioData.w,
      ratioData.h,
      format,
      0.92
    );
    setPreviewURL(url);
  }, [completedCrop, format, ratioData]);

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    setCrop(undefined);
    setCompleted(null);
    setPreviewURL('');
    const reader = new FileReader();
    reader.onload = e => setImgSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const download = () => {
    if (!previewURL) return;
    const ext  = format === 'image/png' ? 'png' : 'jpg';
    const name = `ExamPixel_${(selectedExam?.name || 'photo').replace(/[\s/]+/g, '_')}_${activeType}_cropped.${ext}`;
    const a    = document.createElement('a');
    a.href = previewURL; a.download = name; a.click();
  };

  return (
    <div style={S.wrapper}>
      {/* Header */}
      <div style={S.header}>
        <h3 style={S.title}>{ui.title}</h3>
        <p style={S.subtitle}>{ui.sub}</p>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[['photo', ui.photo], ['signature', ui.sig]].map(([id, label]) => (
          <button key={id} type="button"
            style={{ ...S.tab, ...(activeType === id ? S.tabActive : {}) }}
            onClick={() => { setType(id); setImgSrc(''); setPreviewURL(''); }}>
            {label}
          </button>
        ))}
      </div>

      {/* Info bar — ratio + format */}
      <div style={S.infoBar}>
        <div style={S.infoChip}>
          <span style={S.infoLabel}>{ui.ratioLabel}</span>
          <span style={S.infoVal}>{ratioData.label}</span>
        </div>
        <div style={{ width: 1, height: 24, background: '#e8eaf0' }} />
        <div style={S.infoChip}>
          <span style={S.infoLabel}>{ui.fmtLabel}</span>
          <select value={format} onChange={e => setFormat(e.target.value)} style={S.select}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>
        {selectedExam && (
          <>
            <div style={{ width: 1, height: 24, background: '#e8eaf0' }} />
            <div style={S.infoChip}>
              <span style={S.infoLabel}>Exam</span>
              <span style={{ ...S.infoVal, color: '#1a1a2e', fontSize: 13 }}>{selectedExam.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Main panel */}
      <div style={S.panel}>

        {/* ── LEFT: upload / cropper ── */}
        <div style={S.left}>
          {!imgSrc ? (
            /* Drop zone */
            <div
              style={S.dropzone}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#f0effe'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = '#c7c5f0'; e.currentTarget.style.background = ''; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#c7c5f0';
                e.currentTarget.style.background  = '';
                handleFile(e.dataTransfer.files[0]);
              }}
            >
              <div style={S.dropIcon}>📤</div>
              <div style={S.dropText}>{ui.drag}</div>
              <div style={S.dropSub}>{ui.types}</div>
              <span style={S.uploadBtn}>{ui.upload}</span>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            /* Crop UI */
            <div>
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={c => setCompleted(c)}
                aspect={aspect}
                minWidth={30}
                style={{ maxWidth: '100%', borderRadius: 14, overflow: 'hidden', display: 'block' }}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop source"
                  onLoad={onImageLoad}
                  style={{ maxWidth: '100%', maxHeight: 420, display: 'block', borderRadius: 14 }}
                />
              </ReactCrop>

              {/* Tip */}
              <div style={{ ...S.tip, marginTop: 12 }}>{ui.tip}</div>

              <button type="button" style={S.changeBtn}
                onClick={() => { setImgSrc(''); setPreviewURL(''); setCrop(undefined); setCompleted(null); }}>
                {ui.change}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: live preview + download ── */}
        <div style={S.right}>
          <div style={S.previewLabel}>{ui.preview}</div>

          <div style={S.previewBox}>
            {previewURL ? (
              <img
                src={previewURL}
                alt="Cropped preview"
                style={{
                  maxWidth: '100%', maxHeight: 280,
                  borderRadius: 10, border: '2px solid #e8eaf0',
                  objectFit: 'contain',
                  boxShadow: '0 6px 28px rgba(79,70,229,0.12)',
                }}
              />
            ) : (
              <div style={S.noPreview}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✂️</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>{ui.noPreview}</div>
              </div>
            )}
          </div>

          {previewURL && (
            <>
              <div style={S.previewMeta}>
                {ratioData.w}×{ratioData.h}px &nbsp;·&nbsp; {format === 'image/png' ? 'PNG' : 'JPG'}
              </div>
              <button
                type="button"
                style={S.downloadBtn}
                onClick={download}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 24px rgba(79,70,229,0.32)'; }}
              >
                {ui.download}
              </button>
            </>
          )}

          {/* Exam info card */}
          {selectedExam && (
            <div style={S.examCard}>
              <div style={S.examCardTag}>{ui.exam}</div>
              <div style={S.examCardName}>{selectedExam.name}</div>
              <div style={S.examCardDetail}>{ratioData.label} • {selectedExam.dpi || 200} DPI</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
