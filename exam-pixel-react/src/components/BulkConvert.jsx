import React, { useState, useRef } from 'react';
import { getTargetDimensions } from '../utils/imageUtils';

const ui = {
  en: {
    title:    'Bulk Convert',
    sub:      'Convert multiple photos for all exams at once — download as ZIP',
    upload:   'Upload Multiple Photos (up to 5)',
    process:  '⚡ Convert All',
    download: '⬇️ Download All as ZIP',
    processing:'Converting...',
    proNote:  '🔒 Premium — Unlock Bulk Convert',
    files:    'files selected',
    ready:    'Ready',
    tip:      '💡 All photos will be converted for the selected exam',
  },
  hi: {
    title:    'बल्क कन्वर्ट',
    sub:      'एक साथ कई फोटो कन्वर्ट करें — ZIP में डाउनलोड करें',
    upload:   'कई फोटो अपलोड करें (अधिकतम 5)',
    process:  '⚡ सभी कन्वर्ट करें',
    download: '⬇️ ZIP में डाउनलोड करें',
    processing:'कन्वर्ट हो रहा है...',
    proNote:  '🔒 प्रीमियम — बल्क कन्वर्ट अनलॉक करें',
    files:    'फ़ाइलें चुनी गई',
    ready:    'तैयार',
    tip:      '💡 सभी फोटो चुनी गई परीक्षा के लिए कन्वर्ट होंगी',
  }
};

function convertSingle(file, exam) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const { w, h } = getTargetDimensions(exam?.size);
        const canvas   = document.createElement('canvas');
        canvas.width   = w; canvas.height = h;
        const ctx      = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle  = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        const scale = Math.min(w / img.width, h / img.height);
        const sW = img.width * scale, sH = img.height * scale;
        ctx.drawImage(img, (w-sW)/2, (h-sH)/2, sW, sH);

        let q = 0.88, url = canvas.toDataURL('image/jpeg', q);
        const maxKB = parseInt(exam?.maxSize) || 50;
        while ((url.length * 0.75 / 1024) > maxKB && q > 0.2) {
          q -= 0.05; url = canvas.toDataURL('image/jpeg', q);
        }
        resolve({ name: file.name.replace(/\.[^.]+$/, '') + '_converted.jpg', dataURL: url });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function BulkConvert({ selectedExam, language = 'en', isPremium, onOpenPremium }) {
  const [files,      setFiles]      = useState([]);
  const [results,    setResults]    = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);
  const text    = ui[language] || ui.en;

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/')).slice(0, 5);
    setFiles(arr); setResults([]);
  };

  const processAll = async () => {
    if (!files.length || !selectedExam) return;
    setProcessing(true);
    const converted = await Promise.all(files.map(f => convertSingle(f, selectedExam)));
    setResults(converted);
    setProcessing(false);
  };

  const downloadZip = async () => {
    if (!results.length) return;
    // Dynamic import JSZip only when needed
    try {
      const JSZip = (await import('jszip')).default;
      const zip   = new JSZip();
      const folder = zip.folder(`ExamPixel_${(selectedExam?.name || 'exam').replace(/[\s/]+/g,'_')}`);
      results.forEach(r => {
        const base64 = r.dataURL.split(',')[1];
        folder.file(r.name, base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'ExamPixel_Bulk.zip'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: download individually if jszip not available
      results.forEach(r => {
        const a = document.createElement('a');
        a.href = r.dataURL; a.download = r.name; a.click();
      });
    }
  };

  if (!isPremium) {
    return (
      <div style={{ ...S.wrapper, textAlign: 'center', padding: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>{text.title}</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 18 }}>{text.sub}</div>
        <div style={S.lockBadge} onClick={onOpenPremium}>{text.proNote}</div>
      </div>
    );
  }

  return (
    <div style={S.wrapper}>
      <div style={S.titleRow}>
        <span style={{ fontSize: 22 }}>📦</span>
        <div>
          <div style={S.title}>{text.title}</div>
          <div style={S.sub}>{text.sub}</div>
        </div>
      </div>

      {/* Upload area */}
      <div style={S.dropzone}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#4f46e5'; }}
        onDragLeave={e => { e.currentTarget.style.borderColor='rgba(79,70,229,0.2)'; }}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); e.currentTarget.style.borderColor='rgba(79,70,229,0.2)'; }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#888' }}>
          {files.length > 0 ? `${files.length} ${text.files}` : text.upload}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={S.fileList}>
          {files.map((f, i) => (
            <div key={i} style={S.fileRow}>
              <span style={{ fontSize: 14 }}>📷</span>
              <span style={S.fileName}>{f.name}</span>
              <span style={S.fileSize}>{Math.round(f.size/1024)}KB</span>
              {results[i] && <span style={S.readyTag}>✅ {text.ready}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      {files.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {results.length === 0 ? (
            <button type="button" style={S.processBtn} onClick={processAll} disabled={processing || !selectedExam}>
              {processing ? text.processing : text.process}
            </button>
          ) : (
            <button type="button" style={S.downloadBtn} onClick={downloadZip}>{text.download}</button>
          )}
          <button type="button" style={S.resetBtn}
            onClick={() => { setFiles([]); setResults([]); }}>🔄 Reset</button>
        </div>
      )}

      {selectedExam && <div style={S.tip}>{text.tip}: <strong>{selectedExam.name}</strong></div>}
    </div>
  );
}

const S = {
  wrapper:  { background: 'rgba(255,255,255,0.96)', borderRadius: 20, border: '1px solid rgba(79,70,229,0.10)', padding: 24, fontFamily: 'Inter,sans-serif', boxShadow: '0 8px 32px rgba(79,70,229,0.07)' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  title:    { fontSize: 16, fontWeight: 800, color: '#1a1a2e' },
  sub:      { fontSize: 12, color: '#888', marginTop: 2 },
  dropzone: { border: '2px dashed rgba(79,70,229,0.2)', borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: 'rgba(79,70,229,0.02)' },
  fileList: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 },
  fileRow:  { display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9ff', borderRadius: 10, padding: '8px 12px' },
  fileName: { flex: 1, fontSize: 13, color: '#1a1a2e', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileSize: { fontSize: 11, color: '#aaa' },
  readyTag: { fontSize: 11, fontWeight: 700, color: '#10b981' },
  processBtn:  { flex: 1, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', border: 'none', borderRadius: 50, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  downloadBtn: { flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: 50, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  resetBtn:    { background: '#f0f0f8', color: '#888', border: 'none', borderRadius: 50, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  tip:         { fontSize: 12, color: '#aaa', marginTop: 12 },
  lockBadge:   { display: 'inline-block', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontSize: 13, fontWeight: 700, padding: '10px 22px', borderRadius: 50, cursor: 'pointer' },
};
